/**
 * LAUTE Master Administration & CMS API Service
 * Взаимодействие с backend-сервером LAUTE (/api)
 * Безопасная авторизация по единому паролю, серверный контент и Excel
 */

export const getApiBase = () => {
  if (typeof window !== 'undefined') {
    const storedApi = localStorage.getItem('laute_api_url');
    if (storedApi) return storedApi.replace(/\/$/, '') + '/api';

    if (window.LAUTE_CONFIG?.apiUrl) {
      return window.LAUTE_CONFIG.apiUrl.replace(/\/$/, '') + '/api';
    }
  }
  return '/api';
};

export const setCustomApiUrl = (url) => {
  if (typeof window === 'undefined') return;
  if (url) localStorage.setItem('laute_api_url', url.trim());
  else localStorage.removeItem('laute_api_url');
};

export const getCustomApiUrl = () => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('laute_api_url') || '';
};

// Сессионный токен администратора
export const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('laute_admin_token');
};

export const setAuthToken = (token) => {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem('laute_admin_token', token);
  else localStorage.removeItem('laute_admin_token');
};

const authHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

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

// ==========================================
// 1. АВТОРИЗАЦИЯ (ЕДИНЫЙ ПАРОЛЬ)
// ==========================================

export const checkAuthStatus = async () => {
  try {
    const res = await fetch(`${getApiBase()}/auth/status`);
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend offline:', err);
  }
  return { isInitialized: true, isBackendOffline: true };
};

export const setupInitialPassword = async (password) => {
  const res = await fetch(`${getApiBase()}/auth/setup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Ошибка установки пароля');
  }
  return data;
};

export const loginWithPassword = async (password) => {
  let res;
  try {
    res = await fetch(`${getApiBase()}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
  } catch (netErr) {
    throw new Error('Сервер бэкенда недоступен. Проверьте подключение к серверу LAUTE.');
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    if (typeof window !== 'undefined' && window.location.hostname.includes('github.io')) {
      throw new Error('GitHub Pages является статическим хостингом и не выполняет серверный Node.js код. Для безопасной проверки пароля на живом сайте требуется запущенный backend-сервер.');
    }
    throw new Error('Сервер вернул ответ в формате HTML вместо JSON. Убедитесь, что сервер LAUTE запущен на порту 3001.');
  }

  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error || 'Неверный пароль доступа');
    err.status = res.status;
    err.needsSetup = data.needsSetup;
    throw err;
  }

  setAuthToken(data.token);
  return data;
};

// Временный беспарольный вход для локальной разработки (localhost)
export const devAutoLogin = async () => {
  if (typeof window !== 'undefined') {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isLocal) return null;
  }

  try {
    const res = await fetch(`${getApiBase()}/auth/dev-auto-login`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.token) {
        setAuthToken(data.token);
        return data.session;
      }
    }
  } catch (err) {
    console.warn('Dev auto-login request failed:', err);
  }
  return null;
};

export const getCurrentAdminSession = async () => {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const res = await fetch(`${getApiBase()}/auth/me`, {
      headers: { ...authHeaders() }
    });
    if (!res.ok) {
      setAuthToken(null);
      return null;
    }
    const data = await res.json();
    return data.session;
  } catch {
    return null;
  }
};

export const logoutAdmin = async () => {
  try {
    await fetch(`${getApiBase()}/auth/logout`, {
      method: 'POST',
      headers: { ...authHeaders() }
    });
  } catch {
    // ignore network errors on logout
  }
  setAuthToken(null);
};

export const changeAdminPassword = async (oldPassword, newPassword) => {
  const res = await fetch(`${getApiBase()}/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders()
    },
    body: JSON.stringify({ oldPassword, newPassword })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Ошибка смены пароля');
  }
  return data;
};

// ==========================================
// 2. КОНТЕНТ САЙТА (ВИЗУАЛЬНЫЙ РЕДАКТОР)
// ==========================================

export const fetchSiteContent = async (isDraft = false) => {
  try {
    const url = `${getApiBase()}/content${isDraft ? '?draft=true' : ''}`;
    const res = await fetch(url, {
      headers: { ...authHeaders() }
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Network offline or fallback to public file
  }

  try {
    const fallbackRes = await fetch(`${import.meta.env.BASE_URL}data/content.json?t=${Date.now()}`);
    if (fallbackRes.ok) {
      return await fallbackRes.json();
    }
  } catch {
    // fallback
  }

  return null;
};

export const saveSiteContentDraft = async (updates) => {
  const res = await fetch(`${getApiBase()}/content/draft`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders()
    },
    body: JSON.stringify(updates)
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка сохранения черновика');
  return data.draft;
};

export const publishSiteContent = async () => {
  const res = await fetch(`${getApiBase()}/content/publish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders()
    }
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка публикации контента');
  return data;
};

export const discardSiteContentDraft = async () => {
  const res = await fetch(`${getApiBase()}/content/discard`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders()
    }
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка отмены изменений черновика');
  return data.draft;
};

export const rollbackSiteContent = async (backupId) => {
  const res = await fetch(`${getApiBase()}/content/rollback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders()
    },
    body: JSON.stringify({ backupId })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка отката контента');
  return data;
};

export const fetchContentBackups = async () => {
  try {
    const res = await fetch(`${getApiBase()}/content/backups`, {
      headers: authHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      return data.backups || [];
    }
  } catch {
    // fallback
  }
  return [];
};

// ==========================================
// 3. СТРАНИЦЫ И КАТЕГОРИИ
// ==========================================

export const fetchCustomPages = async () => {
  try {
    const res = await fetch(`${getApiBase()}/pages`);
    if (res.ok) {
      const data = await res.json();
      return data.pages || [];
    }
  } catch {
    // fallback
  }
  return [];
};

export const createCustomPage = async (pageData) => {
  const res = await fetch(`${getApiBase()}/pages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders()
    },
    body: JSON.stringify(pageData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка создания страницы');
  return data.page;
};

export const updateCustomPage = async (id, pageData) => {
  const res = await fetch(`${getApiBase()}/pages/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders()
    },
    body: JSON.stringify(pageData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка обновления страницы');
  return data.page;
};

export const deleteCustomPage = async (id) => {
  const res = await fetch(`${getApiBase()}/pages/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() }
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Ошибка удаления страницы');
  }
  return true;
};

export const fetchCategories = async () => {
  try {
    const res = await fetch(`${getApiBase()}/categories`);
    if (res.ok) {
      const data = await res.json();
      return data.categories || [];
    }
  } catch {
    // fallback
  }
  return [];
};

export const saveCategories = async (categories) => {
  const res = await fetch(`${getApiBase()}/categories`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders()
    },
    body: JSON.stringify({ categories })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка сохранения категорий');
  return data.categories;
};

// ==========================================
// 4. ТОВАРЫ КАТАЛОГА
// ==========================================

export const fetchProducts = async (includeHidden = true) => {
  try {
    const res = await fetch(`${getApiBase()}/products?includeHidden=${includeHidden}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.products) && data.products.length > 0) {
        localStorage.setItem('laute_products', JSON.stringify(data.products));
        return data.products;
      }
    }
  } catch {
    // fallback
  }

  try {
    const saved = localStorage.getItem('laute_products');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }

    const staticRes = await fetch(`${import.meta.env.BASE_URL}data/catalog.json?t=${Date.now()}`);
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
  const res = await fetch(`${getApiBase()}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders()
    },
    body: JSON.stringify(productData)
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка добавления товара');
  return data.product;
};

export const updateProduct = async (sku, updates) => {
  const res = await fetch(`${getApiBase()}/products/${encodeURIComponent(sku)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders()
    },
    body: JSON.stringify(updates)
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка обновления товара');
  return data.product;
};

export const toggleProductStatus = async (sku, status) => {
  const res = await fetch(`${getApiBase()}/products/${encodeURIComponent(sku)}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders()
    },
    body: JSON.stringify({ status })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка изменения статуса товара');
  return data.product;
};

export const deleteProduct = async (sku) => {
  const res = await fetch(`${getApiBase()}/products/${encodeURIComponent(sku)}`, {
    method: 'DELETE',
    headers: { ...authHeaders() }
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка удаления товара');
  return data;
};

// ==========================================
// 5. МЕДИАМЕНЕДЖЕР
// ==========================================

export const fetchMediaList = async () => {
  const res = await fetch(`${getApiBase()}/media`, {
    headers: { ...authHeaders() }
  });
  if (!res.ok) throw new Error('Ошибка загрузки списка медиа');
  const data = await res.json();
  return data.files || [];
};

export const uploadMediaFiles = async (fileList) => {
  const formData = new FormData();
  for (let i = 0; i < fileList.length; i++) {
    formData.append('files', fileList[i]);
  }

  const res = await fetch(`${getApiBase()}/media/upload`, {
    method: 'POST',
    headers: { ...authHeaders() },
    body: formData
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка загрузки файлов');
  return data.files;
};

export const uploadSingleImage = async (file) => {
  const files = await uploadMediaFiles([file]);
  if (files && files.length > 0) {
    return files[0];
  }
  throw new Error('Файл не был сохранён сервером');
};

export const deleteMediaFile = async (filename) => {
  const res = await fetch(`${getApiBase()}/media/${encodeURIComponent(filename)}`, {
    method: 'DELETE',
    headers: { ...authHeaders() }
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Ошибка удаления файла');
  }
  return true;
};

// ==========================================
// 6. EXCEL ИМПОРТ И ЭКСПОРТ
// ==========================================

export const downloadExcelTemplate = async () => {
  try {
    const res = await fetch(`${getApiBase()}/excel/template`);
    if (res.ok) {
      const blob = await res.blob();
      triggerBlobDownload(blob, 'LAUTE_Catalog.xlsx');
      return true;
    }
  } catch (err) {
    console.error('Download template error:', err);
  }

  // Fallback to local file link
  const link = document.createElement('a');
  link.href = `${import.meta.env.BASE_URL}LAUTE_Catalog.xlsx`;
  link.download = 'LAUTE_Catalog.xlsx';
  link.click();
  return true;
};

export const exportCurrentCatalog = async () => {
  const res = await fetch(`${getApiBase()}/excel/export`, {
    headers: { ...authHeaders() }
  });

  if (!res.ok) throw new Error('Ошибка выгрузки каталога');
  const blob = await res.blob();
  const dateStr = new Date().toISOString().slice(0, 10);
  triggerBlobDownload(blob, `LAUTE_Catalog_Export_${dateStr}.xlsx`);
  return true;
};

export const validateExcelFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${getApiBase()}/excel/validate`, {
    method: 'POST',
    headers: { ...authHeaders() },
    body: formData
  });

  const data = await res.json();
  if (!res.ok && !data.errors) {
    throw new Error(data.error || 'Ошибка обработки Excel-файла');
  }
  return data;
};

export const commitExcelImport = async (validRows) => {
  const res = await fetch(`${getApiBase()}/excel/commit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders()
    },
    body: JSON.stringify({ validRows })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка применения импорта Excel');
  return data;
};

export const downloadErrorReport = async () => {
  const res = await fetch(`${getApiBase()}/excel/error-report`, {
    headers: { ...authHeaders() }
  });
  if (!res.ok) throw new Error('Отчёт об ошибках не найден');
  const blob = await res.blob();
  triggerBlobDownload(blob, 'LAUTE_Import_Errors.xlsx');
  return true;
};

// ==========================================
// 7. ИСТОРИЯ, БЭКАПЫ И НАСТРОЙКИ
// ==========================================

export const fetchHistory = async () => {
  const res = await fetch(`${getApiBase()}/history`, {
    headers: { ...authHeaders() }
  });
  if (!res.ok) throw new Error('Ошибка загрузки истории изменений');
  return await res.json();
};

export const rollbackToBackup = async (backupId) => {
  const res = await fetch(`${getApiBase()}/history/rollback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders()
    },
    body: JSON.stringify({ backupId })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка восстановления из резервной копии');
  return data;
};

export const fetchSystemSettings = async () => {
  const res = await fetch(`${getApiBase()}/settings/system`, {
    headers: { ...authHeaders() }
  });
  if (!res.ok) throw new Error('Ошибка получения системной информации');
  return await res.json();
};

export const downloadFullSystemBackup = async () => {
  const res = await fetch(`${getApiBase()}/settings/export-all`, {
    headers: { ...authHeaders() }
  });
  if (!res.ok) throw new Error('Ошибка генерации полного бэкапа');
  const blob = await res.blob();
  const dateStr = new Date().toISOString().slice(0, 10);
  triggerBlobDownload(blob, `LAUTE_FULL_BACKUP_${dateStr}.json`);
  return true;
};
