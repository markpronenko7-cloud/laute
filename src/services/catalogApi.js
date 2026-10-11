/**
 * LAUTE Catalog Management API Client
 * Взаимодействие с backend-сервером на Node.js/Express (/api)
 * с полной поддержкой автономного режима для GitHub Pages (Static SPA).
 */

import { 
  createExportWorkbook, 
  parseAndValidateExcelBuffer, 
  createErrorReportWorkbook 
} from '../utils/excelService';

const API_BASE = '/api';

// Токен сессии сотрудника
export const getAuthToken = () => localStorage.getItem('laute_admin_token');
export const setAuthToken = (token) => {
  if (token) localStorage.setItem('laute_admin_token', token);
  else localStorage.removeItem('laute_admin_token');
};

const authHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Хранилище последних ошибок валидации для отчёта
let cachedValidationErrors = [];

// Helper for Blob download in browser
function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// 1. АВТОРИЗАЦИЯ
export const loginEmployee = async (email, password) => {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (res.ok) {
      const data = await res.json();
      setAuthToken(data.token);
      return data;
    }
  } catch {
    // Network offline or GitHub Pages static host
  }

  // Fallback авторизация (работает напрямую на GitHub Pages)
  if (email.toLowerCase().includes('admin') && password === 'laute_admin_2026!') {
    const demoAdmin = {
      success: true,
      token: 'static_admin_token_' + Date.now(),
      user: {
        id: 'usr-admin-01',
        email: 'admin@laute.com',
        name: 'Иван Смирнов',
        role: 'admin',
        title: 'Главный администратор каталога'
      }
    };
    setAuthToken(demoAdmin.token);
    return demoAdmin;
  } else if (email.toLowerCase().includes('editor') && password === 'laute_editor_2026!') {
    const demoEditor = {
      success: true,
      token: 'static_editor_token_' + Date.now(),
      user: {
        id: 'usr-editor-02',
        email: 'editor@laute.com',
        name: 'Елена Васильева',
        role: 'editor',
        title: 'Контент-редактор номенклатуры'
      }
    };
    setAuthToken(demoEditor.token);
    return demoEditor;
  }
  throw new Error('Неверный логин или пароль сотрудника');
};

export const getCurrentUser = async () => {
  const token = getAuthToken();
  if (!token) return null;
  if (token.startsWith('static_') || token.startsWith('local_')) {
    return token.includes('admin') 
      ? { id: 'usr-admin-01', email: 'admin@laute.com', name: 'Иван Смирнов', role: 'admin', title: 'Главный администратор каталога' }
      : { id: 'usr-editor-02', email: 'editor@laute.com', name: 'Елена Васильева', role: 'editor', title: 'Контент-редактор номенклатуры' };
  }
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...authHeaders() }
    });
    if (!res.ok) {
      setAuthToken(null);
      return null;
    }
    const data = await res.json();
    return data.user;
  } catch {
    // If backend offline but token present
    return token.includes('admin') 
      ? { id: 'usr-admin-01', email: 'admin@laute.com', name: 'Иван Смирнов', role: 'admin', title: 'Главный администратор каталога' }
      : { id: 'usr-editor-02', email: 'editor@laute.com', name: 'Елена Васильева', role: 'editor', title: 'Контент-редактор номенклатуры' };
  }
};

export const logoutEmployee = () => {
  setAuthToken(null);
};

// 2. ТОВАРЫ
export const fetchProducts = async (includeHidden = true) => {
  try {
    const res = await fetch(`${API_BASE}/products?includeHidden=${includeHidden}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.products) && data.products.length > 0) {
        localStorage.setItem('laute_products', JSON.stringify(data.products));
        return data.products;
      }
    }
  } catch {
    // Network error
  }

  // Fallback to localStorage or static public file
  try {
    const saved = localStorage.getItem('laute_products');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }

    const basePath = window.location.pathname.includes('/laute') ? '/laute/data/catalog.json' : '/data/catalog.json';
    const staticRes = await fetch(basePath);
    if (staticRes.ok) {
      const staticData = await staticRes.json();
      if (Array.isArray(staticData) && staticData.length > 0) {
        localStorage.setItem('laute_products', JSON.stringify(staticData));
        return staticData;
      }
    }
  } catch {
    // fallback
  }

  return [];
};

export const addProduct = async (productData) => {
  try {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(productData)
    });
    if (res.ok) return await res.json();
  } catch {
    // Offline fallback
  }

  // Client-side execution
  const current = await fetchProducts(true);
  const cleanArticle = String(productData.article).trim();
  if (current.some(p => p.article.trim().toUpperCase() === cleanArticle.toUpperCase())) {
    throw new Error(`Товар с артикулом "${cleanArticle}" уже существует в каталоге!`);
  }

  const newProd = {
    ...productData,
    article: cleanArticle,
    price: Number(productData.price),
    currency: productData.currency || '₸',
    status: productData.status || 'АКТИВЕН',
    updatedAt: new Date().toISOString(),
    updatedBy: 'Панель управления'
  };

  const updated = [newProd, ...current];
  localStorage.setItem('laute_products', JSON.stringify(updated));

  // Log to audit
  const logs = JSON.parse(localStorage.getItem('laute_audit_log') || '[]');
  logs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: 'Сотрудник LAUTE',
    userEmail: 'employee@laute.com',
    action: 'PRODUCT_CREATE',
    actionTitle: `Создан товар ${cleanArticle}`,
    summary: `Добавлен товар "${newProd.name}" (${newProd.price} ${newProd.currency})`
  });
  localStorage.setItem('laute_audit_log', JSON.stringify(logs.slice(0, 100)));

  return { success: true, product: newProd };
};

export const updateProduct = async (sku, updates) => {
  try {
    const res = await fetch(`${API_BASE}/products/${encodeURIComponent(sku)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(updates)
    });
    if (res.ok) return await res.json();
  } catch {
    // Offline fallback
  }

  const current = await fetchProducts(true);
  const idx = current.findIndex(p => p.article.trim().toUpperCase() === sku.trim().toUpperCase());
  if (idx === -1) throw new Error(`Товар с артикулом "${sku}" не найден`);

  const updatedItem = {
    ...current[idx],
    ...updates,
    price: updates.price !== undefined ? Number(updates.price) : current[idx].price,
    updatedAt: new Date().toISOString()
  };

  current[idx] = updatedItem;
  localStorage.setItem('laute_products', JSON.stringify(current));
  return { success: true, product: updatedItem };
};

export const toggleProductStatus = async (sku, status) => {
  try {
    const res = await fetch(`${API_BASE}/products/${encodeURIComponent(sku)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ status })
    });
    if (res.ok) return await res.json();
  } catch {
    // Offline fallback
  }

  const current = await fetchProducts(true);
  const prod = current.find(p => p.article.trim().toUpperCase() === sku.trim().toUpperCase());
  if (!prod) throw new Error(`Товар ${sku} не найден`);

  prod.status = status || (prod.status === 'СКРЫТ' ? 'АКТИВЕН' : 'СКРЫТ');
  prod.updatedAt = new Date().toISOString();
  localStorage.setItem('laute_products', JSON.stringify(current));
  return { success: true, product: prod };
};

export const deleteProduct = async (sku) => {
  try {
    const res = await fetch(`${API_BASE}/products/${encodeURIComponent(sku)}`, {
      method: 'DELETE',
      headers: { ...authHeaders() }
    });
    if (res.ok) return await res.json();
  } catch {
    // Offline fallback
  }

  const current = await fetchProducts(true);
  const filtered = current.filter(p => p.article.trim().toUpperCase() !== sku.trim().toUpperCase());
  localStorage.setItem('laute_products', JSON.stringify(filtered));
  return { success: true };
};

// 3. ЗАГРУЗКА ИЗОБРАЖЕНИЯ
export const uploadImageFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: { ...authHeaders() },
      body: formData
    });
    if (res.ok) return await res.json();
  } catch {
    // Fallback to Base64 in browser
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve({ success: true, url: e.target.result, filename: file.name });
    };
    reader.readAsDataURL(file);
  });
};

// 4. EXCEL ОПЕРАЦИИ
export const validateExcelFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/excel/validate`, {
      method: 'POST',
      headers: { ...authHeaders() },
      body: formData
    });
    if (res.ok) {
      const data = await res.json();
      cachedValidationErrors = data.errors || [];
      return data;
    }
  } catch {
    // Fallback directly in browser using excelService
  }

  const current = await fetchProducts(true);
  const buffer = await file.arrayBuffer();
  const result = await parseAndValidateExcelBuffer(buffer, current);
  cachedValidationErrors = result.errors || [];
  return result;
};

export const commitExcelImport = async (validRows) => {
  try {
    const res = await fetch(`${API_BASE}/excel/commit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ validRows })
    });
    if (res.ok) return await res.json();
  } catch {
    // Fallback directly in browser
  }

  const products = await fetchProducts(true);
  const productMap = new Map();
  products.forEach(p => productMap.set(p.article.trim().toUpperCase(), p));

  let addedCount = 0;
  let updatedCount = 0;
  let hiddenCount = 0;
  let deletedCount = 0;

  validRows.forEach(row => {
    const upperSku = row.article.trim().toUpperCase();

    if (row.action === 'УДАЛИТЬ' || row.isDelete) {
      if (productMap.has(upperSku)) {
        productMap.delete(upperSku);
        deletedCount++;
      }
      return;
    }

    if (productMap.has(upperSku)) {
      const existing = productMap.get(upperSku);
      const updated = {
        ...existing,
        name: row.name !== undefined ? row.name : existing.name,
        category: row.category !== undefined ? row.category : existing.category,
        price: row.price !== undefined ? Number(row.price) : existing.price,
        currency: row.currency || existing.currency || '₸',
        description: row.description !== undefined ? row.description : existing.description,
        specs: row.specs !== undefined ? row.specs : existing.specs,
        dimensions: row.dimensions !== undefined ? row.dimensions : existing.dimensions,
        weight: row.weight !== undefined ? row.weight : existing.weight,
        photo1: row.photo1 || existing.photo1,
        status: row.status || existing.status,
        updatedAt: new Date().toISOString()
      };
      if (updated.status === 'СКРЫТ' && existing.status !== 'СКРЫТ') hiddenCount++;
      else updatedCount++;
      productMap.set(upperSku, updated);
    } else {
      const newProduct = {
        article: row.article.trim(),
        name: row.name,
        category: row.category,
        subcategory: row.subcategory || 'Стандарт',
        collection: row.collection || 'LAUTE Master Line',
        brand: row.brand || 'LAUTE',
        description: row.description || '',
        price: Number(row.price),
        currency: row.currency || '₸',
        dimensions: row.dimensions || '',
        weight: row.weight || '',
        specs: row.specs || '',
        photo1: row.photo1 || 'images/cat_laute_brand.jpg',
        status: row.status || 'АКТИВЕН',
        updatedAt: new Date().toISOString()
      };
      productMap.set(upperSku, newProduct);
      addedCount++;
    }
  });

  const finalProducts = Array.from(productMap.values());
  localStorage.setItem('laute_products', JSON.stringify(finalProducts));

  const backupId = `backup_${Date.now()}`;
  const backups = JSON.parse(localStorage.getItem('laute_backups') || '[]');
  backups.unshift({
    backupId,
    timestamp: new Date().toISOString(),
    description: `Импорт Excel (${validRows.length} строк)`,
    author: 'Сотрудник LAUTE',
    productsCount: finalProducts.length,
    products: finalProducts
  });
  localStorage.setItem('laute_backups', JSON.stringify(backups.slice(0, 20)));

  return {
    success: true,
    backupId,
    stats: {
      added: addedCount,
      updated: updatedCount,
      hidden: hiddenCount,
      deleted: deletedCount,
      total: finalProducts.length
    },
    products: finalProducts
  };
};

export const downloadExcelTemplate = () => {
  const staticPath = window.location.pathname.includes('/laute') ? '/laute/LAUTE_Catalog.xlsx' : '/LAUTE_Catalog.xlsx';
  const link = document.createElement('a');
  link.href = staticPath;
  link.download = 'LAUTE_Catalog.xlsx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportCurrentCatalog = async () => {
  try {
    const products = await fetchProducts(true);
    const workbook = await createExportWorkbook(products);
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const dateStr = new Date().toISOString().slice(0, 10);
    triggerBlobDownload(blob, `LAUTE_Catalog_Export_${dateStr}.xlsx`);
  } catch (err) {
    console.error('Export error:', err);
    window.open('/laute/LAUTE_Catalog.xlsx', '_blank');
  }
};

export const downloadErrorReport = async () => {
  if (cachedValidationErrors.length === 0) {
    alert('Нет ошибок для выгрузки отчёта.');
    return;
  }
  try {
    const workbook = await createErrorReportWorkbook(cachedValidationErrors);
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    triggerBlobDownload(blob, 'LAUTE_Import_Errors.xlsx');
  } catch (err) {
    console.error('Error report error:', err);
  }
};

// 5. ИСТОРИЯ И ОТКАТ
export const fetchHistory = async () => {
  try {
    const res = await fetch(`${API_BASE}/history`, {
      headers: { ...authHeaders() }
    });
    if (res.ok) return await res.json();
  } catch {
    // Offline fallback
  }

  const logs = JSON.parse(localStorage.getItem('laute_audit_log') || '[]');
  const backups = JSON.parse(localStorage.getItem('laute_backups') || '[]');
  return { logs, backups };
};

export const rollbackToBackup = async (backupId) => {
  try {
    const res = await fetch(`${API_BASE}/history/rollback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ backupId })
    });
    if (res.ok) return await res.json();
  } catch {
    // Offline fallback
  }

  const backups = JSON.parse(localStorage.getItem('laute_backups') || '[]');
  const found = backups.find(b => b.backupId === backupId);
  if (!found || !Array.isArray(found.products)) {
    throw new Error('Резервная копия не найдена');
  }

  localStorage.setItem('laute_products', JSON.stringify(found.products));
  return { success: true, restoredCount: found.products.length, products: found.products };
};

// 6. УПРАВЛЕНИЕ СОТРУДНИКАМИ
export const fetchStaffUsers = async () => {
  try {
    const res = await fetch(`${API_BASE}/users`, {
      headers: { ...authHeaders() }
    });
    if (res.ok) {
      const data = await res.json();
      return data.users;
    }
  } catch {
    // Offline fallback
  }

  return [
    { id: 'usr-admin-01', email: 'admin@laute.com', name: 'Иван Смирнов', role: 'admin', title: 'Главный администратор каталога', lastLogin: new Date().toISOString() },
    { id: 'usr-editor-02', email: 'editor@laute.com', name: 'Елена Васильева', role: 'editor', title: 'Контент-редактор номенклатуры', lastLogin: new Date().toISOString() }
  ];
};

export const createStaffUser = async (userData) => {
  try {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(userData)
    });
    if (res.ok) {
      const data = await res.json();
      return data.user;
    }
  } catch {
    // Offline fallback
  }

  return {
    id: `usr-${Date.now()}`,
    ...userData,
    createdAt: new Date().toISOString()
  };
};
