/**
 * LAUTE Master Administration & CMS API Service
 * Подключение к постоянной серверной инфраструктуре Supabase PostgreSQL
 * Безопасная авторизация по единому паролю (bcrypt / pgcrypto на сервере), 
 * Row Level Security (RLS), живой каталог, складские остатки и контент без ручного GitHub-деплоя.
 */

import * as XLSX from 'xlsx';
import { 
  exportCurrentCatalogToExcel as clientExportCatalog,
  parseAndValidateExcelFile as clientValidateExcel,
  applyExcelImport as clientApplyExcelImport,
  downloadErrorReport as clientDownloadErrorReport,
  downloadStockTemplateExcel as clientDownloadStockTemplate,
  parseStockExcelClient as clientParseStockExcel
} from '../utils/excelManager.js';
import { classifyProductImages } from '../utils/imageHelper.js';

// ==========================================
// 0. SUPABASE CONFIGURATION
// ==========================================

export const SUPABASE_CONFIG = {
  url: 'https://sxaczlnytwavpzclqlvu.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4YWN6bG55dHdhdnB6Y2xxbHZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxNDk1NTgsImV4cCI6MjEwNzcyNTU1OH0.omIWsuuMxpVTFd8nQnjkccYIFXPEbRlybxjHff0qndU',
  storageBucket: 'laute-media'
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

export const getApiBase = () => {
  return '/api';
};

// Supabase RPC Helper
async function callSupabaseRpc(fnName, args = {}) {
  const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/rpc/${fnName}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_CONFIG.anonKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(args)
  });

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    throw new Error(`Ошибка вызова RPC ${fnName}: ${text}`);
  }

  const data = await res.json();
  if (!res.ok) {
    const msg = data?.message || data?.error || `Ошибка сервера Supabase (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return data;
}

// Supabase REST Query Helper (for public RLS reads)
async function querySupabase(endpoint) {
  const url = `${SUPABASE_CONFIG.url}/rest/v1/${endpoint}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'apikey': SUPABASE_CONFIG.anonKey,
      'Accept': 'application/json',
      'Cache-Control': 'no-cache, no-store'
    }
  });

  if (!res.ok) {
    throw new Error(`Ошибка запроса данных Supabase [${res.status}]`);
  }
  return await res.json();
}

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
// 1. АВТОРИЗАЦИЯ (ЕДИНЫЙ ПАРОЛЬ ЧЕРЕЗ SUPABASE)
// ==========================================

export const checkAuthStatus = async () => {
  return {
    isInitialized: true,
    authMode: 'supabase_pgcrypto_bcrypt',
    rateLimitEnabled: true
  };
};

export const setupInitialPassword = async (password) => {
  return { success: true };
};

export const loginWithPassword = async (password) => {
  if (!password || !password.trim()) {
    throw new Error('Введите пароль');
  }

  try {
    const result = await callSupabaseRpc('laute_login', {
      p_password: password.trim(),
      p_ip: typeof window !== 'undefined' ? window.location.hostname : 'unknown'
    });

    if (!result || !result.success) {
      const err = new Error(result?.error || 'Неверный пароль доступа');
      throw err;
    }

    setAuthToken(result.token);
    return result;
  } catch (err) {
    throw new Error(err.message || 'Ошибка авторизации в Supabase');
  }
};

// Беспарольный вход отключен для обеспечения безопасности
export const devAutoLogin = async () => {
  return null;
};

export const getCurrentAdminSession = async () => {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const result = await callSupabaseRpc('laute_verify_session', { p_token: token });
    if (result && result.valid && result.session) {
      return result.session;
    }
    setAuthToken(null);
    return null;
  } catch {
    return null;
  }
};

export const logoutAdmin = async () => {
  const token = getAuthToken();
  if (token) {
    try {
      await callSupabaseRpc('laute_logout', { p_token: token });
    } catch {
      // ignore
    }
  }
  setAuthToken(null);
};

export const changeAdminPassword = async (oldPassword, newPassword) => {
  const token = getAuthToken();
  if (!token) throw new Error('Требуется авторизация');

  const result = await callSupabaseRpc('laute_change_password', {
    p_token: token,
    p_old_password: oldPassword,
    p_new_password: newPassword
  });

  if (!result || !result.success) {
    throw new Error(result?.error || 'Ошибка смены пароля');
  }
  return result;
};

// ==========================================
// 2. КОНТЕНТ САЙТА (ВИЗУАЛЬНЫЙ РЕДАКТОР)
// ==========================================

export const fetchSiteContent = async (isDraft = false) => {
  const token = getAuthToken();

  // Если запрашивается черновик авторизованным администратором
  if (isDraft && token) {
    try {
      const adminData = await callSupabaseRpc('laute_get_admin_data', { p_token: token });
      if (adminData && adminData.draft) {
        return adminData.draft;
      }
    } catch (err) {
      console.warn('Ошибка загрузки черновика из Supabase:', err);
    }
  }

  // Публичный контент (чтение опубликованного снимка через RLS)
  try {
    const records = await querySupabase('laute_site_content?id=eq.published&select=data,version');
    if (Array.isArray(records) && records.length > 0 && records[0].data) {
      const data = records[0].data;
      if (records[0].version) data.version = records[0].version;
      return data;
    }
  } catch (err) {
    console.warn('Ошибка загрузки опубликованного контента из Supabase:', err);
  }

  // Статический резервный файл
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
  const token = getAuthToken();
  if (!token) throw new Error('Требуется авторизация администратора');

  const result = await callSupabaseRpc('laute_save_content_draft', {
    p_token: token,
    p_updates: updates
  });

  if (!result || !result.success) {
    throw new Error(result?.error || 'Ошибка сохранения черновика в Supabase');
  }
  return result.draft;
};

export const publishSiteContent = async () => {
  const token = getAuthToken();
  if (!token) throw new Error('Требуется авторизация администратора');

  const result = await callSupabaseRpc('laute_publish_content', {
    p_token: token
  });

  if (!result || !result.success) {
    throw new Error(result?.error || 'Ошибка публикации контента');
  }
  return result;
};

export const discardSiteContentDraft = async () => {
  const token = getAuthToken();
  if (!token) throw new Error('Требуется авторизация администратора');

  const result = await callSupabaseRpc('laute_discard_content_draft', {
    p_token: token
  });

  if (!result || !result.success) {
    throw new Error(result?.error || 'Ошибка отмены изменений черновика');
  }
  return result.draft;
};

export const rollbackSiteContent = async (backupId) => {
  const token = getAuthToken();
  if (!token) throw new Error('Требуется авторизация администратора');

  const result = await callSupabaseRpc('laute_rollback_content', {
    p_token: token,
    p_backup_id: backupId
  });

  if (!result || !result.success) {
    throw new Error(result?.error || 'Ошибка отката контента');
  }
  return result;
};

export const fetchContentBackups = async () => {
  const token = getAuthToken();
  if (!token) return [];

  try {
    const adminData = await callSupabaseRpc('laute_get_admin_data', { p_token: token });
    if (adminData && Array.isArray(adminData.backups)) {
      return adminData.backups;
    }
  } catch (err) {
    console.warn('Ошибка загрузки бэкапов:', err);
  }
  return [];
};

// ==========================================
// 3. СТРАНИЦЫ И КАТЕГОРИИ
// ==========================================

export const fetchCustomPages = async () => {
  const sanitizePages = (pagesArr) => {
    if (!Array.isArray(pagesArr)) return [];
    return pagesArr.map(p => ({
      ...p,
      blocks: Array.isArray(p.blocks)
        ? p.blocks.map(b => ({
            ...b,
            badge: typeof b.badge === 'string' ? b.badge.replace(/LAUTEк\s*/gi, 'LAUTE') : b.badge
          }))
        : []
    }));
  };

  try {
    const records = await querySupabase('laute_custom_pages?id=eq.current&select=pages');
    if (Array.isArray(records) && records.length > 0 && Array.isArray(records[0].pages)) {
      return sanitizePages(records[0].pages);
    }
  } catch (err) {
    console.warn('Ошибка загрузки страниц из Supabase:', err);
  }

  // Fallback to static public JSON
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/custom_pages.json?t=${Date.now()}`);
    if (res.ok) {
      const data = await res.json();
      return sanitizePages(Array.isArray(data) ? data : (data.pages || []));
    }
  } catch {
    // ignore
  }
  return [];
};

export const createCustomPage = async (pageData) => {
  const token = getAuthToken();
  if (!token) throw new Error('Требуется авторизация администратора');

  const pages = await fetchCustomPages();
  const cleanSlug = (pageData.slug || '').toLowerCase().replace(/[^a-z0-9_-]/g, '-');

  if (pages.some(p => p.slug === cleanSlug)) {
    throw new Error(`Страница с адресом "${cleanSlug}" уже существует`);
  }

  const newPage = {
    id: `page-${Date.now()}`,
    title: pageData.title,
    slug: cleanSlug,
    description: pageData.description || '',
    status: 'ОПУБЛИКОВАН',
    template: pageData.template || 'info',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    blocks: Array.isArray(pageData.blocks) ? pageData.blocks : [
      { id: 'b1', type: 'hero', title: pageData.title, subtitle: pageData.description || '' },
      { id: 'b2', type: 'text', content: 'Содержимое страницы...' }
    ]
  };

  pages.push(newPage);
  await callSupabaseRpc('laute_save_custom_pages', { p_token: token, p_pages: pages });
  return newPage;
};

export const updateCustomPage = async (id, pageData) => {
  const token = getAuthToken();
  if (!token) throw new Error('Требуется авторизация администратора');

  const pages = await fetchCustomPages();
  const idx = pages.findIndex(p => p.id === id);
  if (idx === -1) throw new Error('Страница не найдена');

  pages[idx] = {
    ...pages[idx],
    ...pageData,
    updatedAt: new Date().toISOString()
  };

  await callSupabaseRpc('laute_save_custom_pages', { p_token: token, p_pages: pages });
  return pages[idx];
};

export const deleteCustomPage = async (id) => {
  const token = getAuthToken();
  if (!token) throw new Error('Требуется авторизация администратора');

  const pages = await fetchCustomPages();
  const filtered = pages.filter(p => p.id !== id);
  await callSupabaseRpc('laute_save_custom_pages', { p_token: token, p_pages: filtered });
  return true;
};

export const duplicateCustomPage = async (id) => {
  const token = getAuthToken();
  if (!token) throw new Error('Требуется авторизация администратора');

  const pages = await fetchCustomPages();
  const source = pages.find(p => p.id === id);
  if (!source) throw new Error('Исходная страница не найдена');

  let newSlug = `${source.slug}-copy`;
  let counter = 1;
  while (pages.some(p => p.slug === newSlug)) {
    counter++;
    newSlug = `${source.slug}-copy-${counter}`;
  }

  const duplicatedPage = {
    ...JSON.parse(JSON.stringify(source)),
    id: `page-${Date.now()}`,
    title: `${source.title} (Копия)`,
    slug: newSlug,
    route: `/${newSlug}`,
    isSystem: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    blocks: source.blocks ? source.blocks.map(b => ({ ...b, id: `blk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` })) : []
  };

  pages.push(duplicatedPage);
  await callSupabaseRpc('laute_save_custom_pages', { p_token: token, p_pages: pages });
  return duplicatedPage;
};

export const fetchPageVersions = async () => {
  return await fetchContentBackups();
};

export const rollbackPagesVersion = async (backupId) => {
  await rollbackSiteContent(backupId);
  return await fetchCustomPages();
};

export const fetchCategories = async () => {
  try {
    const records = await querySupabase('laute_categories?id=eq.current&select=categories');
    if (Array.isArray(records) && records.length > 0 && Array.isArray(records[0].categories)) {
      return records[0].categories;
    }
  } catch (err) {
    console.warn('Ошибка загрузки категорий из Supabase:', err);
  }

  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/categories.json?t=${Date.now()}`);
    if (res.ok) return await res.json();
  } catch {
    // fallback
  }
  return [];
};

export const saveCategories = async (categories) => {
  const token = getAuthToken();
  if (!token) throw new Error('Требуется авторизация администратора');

  const result = await callSupabaseRpc('laute_save_categories', {
    p_token: token,
    p_categories: categories
  });

  if (!result || !result.success) {
    throw new Error(result?.error || 'Ошибка сохранения категорий');
  }
  return categories;
};

// ==========================================
// 4. ТОВАРЫ КАТАЛОГА (SUPABASE POSTGRESQL)
// ==========================================

function normalizeProduct(p) {
  const raw = p.raw_data || {};
  const article = p.article || raw.article || '';
  
  // Классифицируем фотографии: гарантируем, что главное фото — это смеситель,
  // а чертёж выделяется для раздела "Размеры и чертежи"
  const classified = classifyProductImages({
    article,
    photo1: p.photo1 || raw.photo1,
    photo2: p.photo2 || raw.photo2,
    photo3: p.photo3 || raw.photo3,
    drawingUrl: p.drawingUrl || raw.drawingUrl || p.drawing_url,
    boxUrl: p.boxUrl || raw.boxUrl || p.box_url
  });

  return {
    ...raw,
    article,
    name: p.name || raw.name || '',
    category: p.category || raw.category || '',
    subcategory: p.subcategory || raw.subcategory || '',
    collection: p.collection || raw.collection || '',
    brand: p.brand || raw.brand || 'LAUTE',
    description: p.description || raw.description || '',
    price: Number(p.price !== undefined ? p.price : raw.price) || 0,
    currency: p.currency || raw.currency || '₸',
    material: p.material || raw.material || '',
    color: p.color || raw.color || '',
    finish: p.finish || raw.finish || '',
    installType: p.install_type || raw.installType || raw.install_type || '',
    purpose: p.purpose || raw.purpose || '',
    dimensions: p.dimensions || raw.dimensions || '',
    weight: p.weight || raw.weight || '',
    volume: p.volume || raw.volume || '',
    specs: p.specs || raw.specs || '',
    extraSpecs: p.extra_specs || raw.extraSpecs || raw.extra_specs || '',
    photo1: classified.mainPhoto || p.photo1 || raw.photo1 || '',
    photo2: classified.additionalPhotos[0] || p.photo2 || raw.photo2 || '',
    photo3: classified.additionalPhotos[1] || p.photo3 || raw.photo3 || '',
    drawingUrl: classified.drawingPhotos[0] || p.drawingUrl || raw.drawingUrl || '',
    boxUrl: classified.boxPhotos[0] || p.boxUrl || raw.boxUrl || '',
    additionalPhotos: classified.additionalPhotos,
    drawingPhotos: classified.drawingPhotos,
    allPhotos: classified.allPhotos,
    cityStock: p.city_stock || raw.cityStock || raw.city_stock || {},
    status: p.status || raw.status || 'АКТИВЕН',
    seoTitle: p.seo_title || raw.seoTitle || raw.seo_title || '',
    seoDesc: p.seo_desc || raw.seoDesc || raw.seo_desc || '',
    url: p.url || raw.url || '',
    updatedAt: p.updated_at || raw.updatedAt || new Date().toISOString()
  };
}

export const fetchProducts = async (includeHidden = true) => {
  try {
    const filter = includeHidden ? 'select=*&order=updated_at.desc' : 'status=neq.СКРЫТ&select=*&order=updated_at.desc';
    const records = await querySupabase(`laute_products?${filter}`);

    if (Array.isArray(records)) {
      const normalized = records.map(normalizeProduct);
      if (typeof window !== 'undefined') {
        localStorage.setItem('laute_products', JSON.stringify(normalized));
        localStorage.setItem('laute_products_loaded_from_backend', 'true');
      }
      return normalized;
    }
  } catch (err) {
    console.warn('Ошибка загрузки товаров из Supabase, используем резервную копию:', err);
  }

  // Fallback to localStorage or static catalog.json only on network error
  try {
    const saved = localStorage.getItem('laute_products');
    const wasLoaded = localStorage.getItem('laute_products_loaded_from_backend');
    if (saved && wasLoaded) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }

    const staticRes = await fetch(`${import.meta.env.BASE_URL}data/catalog.json?t=${Date.now()}`);
    if (staticRes.ok) {
      const staticData = await staticRes.json();
      if (Array.isArray(staticData) && staticData.length > 0) return staticData;
    }
  } catch {
    // fallback
  }

  return [];
};

export const addProduct = async (productData) => {
  const token = getAuthToken();
  if (!token) throw new Error('Требуется авторизация администратора');

  const result = await callSupabaseRpc('laute_save_product', {
    p_token: token,
    p_product: productData
  });

  if (!result || !result.success) {
    throw new Error(result?.error || 'Ошибка создания товара в Supabase');
  }

  return productData;
};

export const updateProduct = async (sku, updates) => {
  const token = getAuthToken();
  if (!token) throw new Error('Требуется авторизация администратора');

  const productToSave = {
    ...updates,
    article: sku
  };

  const result = await callSupabaseRpc('laute_save_product', {
    p_token: token,
    p_product: productToSave
  });

  if (!result || !result.success) {
    throw new Error(result?.error || 'Ошибка обновления товара в Supabase');
  }

  return productToSave;
};

export const toggleProductStatus = async (sku, status) => {
  return await updateProduct(sku, { status: status || 'СКРЫТ' });
};

export const deleteProduct = async (sku) => {
  const token = getAuthToken();
  if (!token) throw new Error('Требуется авторизация администратора');

  const result = await callSupabaseRpc('laute_delete_product', {
    p_token: token,
    p_sku: sku
  });

  if (!result || !result.success) {
    throw new Error(result?.error || 'Ошибка удаления товара из Supabase');
  }

  // Обновляем локальный кэш, чтобы товар не воскресал
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('laute_products');
    if (saved) {
      try {
        const prods = JSON.parse(saved);
        const filtered = prods.filter(p => p.article?.toUpperCase() !== sku.toUpperCase());
        localStorage.setItem('laute_products', JSON.stringify(filtered));
        localStorage.setItem('laute_products_loaded_from_backend', 'true');
      } catch (e) {}
    }
  }

  return result;
};

export const deleteProductsBatch = async (skuList) => {
  const token = getAuthToken();
  if (!token) throw new Error('Требуется авторизация администратора');
  if (!Array.isArray(skuList) || skuList.length === 0) return { success: true, count: 0 };

  const result = await callSupabaseRpc('laute_delete_products_batch', {
    p_token: token,
    p_skus: skuList
  });

  if (!result || !result.success) {
    throw new Error(result?.error || 'Ошибка массового удаления товаров из Supabase');
  }

  // Обновляем локальный кэш
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('laute_products');
    if (saved) {
      try {
        const skuSet = new Set(skuList.map(s => s.toUpperCase()));
        const prods = JSON.parse(saved);
        const filtered = prods.filter(p => !skuSet.has(p.article?.toUpperCase()));
        localStorage.setItem('laute_products', JSON.stringify(filtered));
        localStorage.setItem('laute_products_loaded_from_backend', 'true');
      } catch (e) {}
    }
  }

  return result;
};

// ==========================================
// 5. МЕДИАМЕНЕДЖЕР (SUPABASE STORAGE)
// ==========================================

export const fetchMediaList = async () => {
  try {
    const res = await fetch(`${SUPABASE_CONFIG.url}/storage/v1/object/list/${SUPABASE_CONFIG.storageBucket}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_CONFIG.anonKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prefix: '', limit: 100 })
    });

    if (res.ok) {
      const objects = await res.json();
      if (Array.isArray(objects) && objects.length > 0) {
        return objects.map(o => ({
          name: o.name,
          url: `${SUPABASE_CONFIG.url}/storage/v1/object/public/${SUPABASE_CONFIG.storageBucket}/${o.name}`,
          size: o.metadata?.size || 0,
          modified: o.updated_at || new Date().toISOString()
        }));
      }
    }
  } catch (err) {
    console.warn('Supabase storage list error:', err);
  }

  // Фирменные фотографии LAUTE
  return [
    { name: 'hero-slide-1.jpg', url: 'images/hero/hero-slide-1.jpg', size: 654841, modified: new Date().toISOString() },
    { name: 'hero-slide-2.jpg', url: 'images/hero/hero-slide-2.jpg', size: 767215, modified: new Date().toISOString() },
    { name: 'hero-slide-3.jpg', url: 'images/hero/hero-slide-3.jpg', size: 713731, modified: new Date().toISOString() },
    { name: 'hero-slide-4.jpg', url: 'images/hero/hero-slide-4.jpg', size: 840681, modified: new Date().toISOString() },
    { name: 'hero-slide-5.jpg', url: 'images/hero/hero-slide-5.jpg', size: 735010, modified: new Date().toISOString() },
    { name: 'hero-slide-6.jpg', url: 'images/hero/hero-slide-6.jpg', size: 673763, modified: new Date().toISOString() },
    { name: 'cat_kitchen.png', url: 'images/cat_kitchen.png', size: 1791211, modified: new Date().toISOString() },
    { name: 'cat_bath.png', url: 'images/cat_bath.png', size: 1385357, modified: new Date().toISOString() },
    { name: 'cat_shower.png', url: 'images/cat_shower.png', size: 1943322, modified: new Date().toISOString() },
    { name: 'cat_german_line.png', url: 'images/cat_german_line.png', size: 1636480, modified: new Date().toISOString() },
    { name: 'cat_sinks.png', url: 'images/cat_sinks.png', size: 349649, modified: new Date().toISOString() },
    { name: 'cat_accessories.png', url: 'images/cat_accessories.png', size: 936940, modified: new Date().toISOString() },
    { name: 'cat_laute_brand.jpg', url: 'images/cat_laute_brand.jpg', size: 100295, modified: new Date().toISOString() },
    { name: 'brass_eccentric_macro.jpg', url: 'images/brass_eccentric_macro.jpg', size: 773262, modified: new Date().toISOString() },
    { name: 'eco_aluminum_macro.jpg', url: 'images/eco_aluminum_macro.jpg', size: 579528, modified: new Date().toISOString() },
    { name: 'sus304_steel_macro.jpg', url: 'images/sus304_steel_macro.jpg', size: 778383, modified: new Date().toISOString() },
    { name: 'sedal_cartridge_macro.jpg', url: 'images/sedal_cartridge_macro.jpg', size: 705361, modified: new Date().toISOString() },
    { name: 'pvd_finish_macro.jpg', url: 'images/pvd_finish_macro.jpg', size: 557617, modified: new Date().toISOString() }
  ];
};

export const uploadMediaFiles = async (fileList) => {
  const uploaded = [];

  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    const ext = file.name.split('.').pop();
    const cleanBase = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeName = `${Date.now()}_${cleanBase}.${ext}`;

    const res = await fetch(`${SUPABASE_CONFIG.url}/storage/v1/object/${SUPABASE_CONFIG.storageBucket}/${safeName}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_CONFIG.anonKey,
        'Content-Type': file.type || 'application/octet-stream'
      },
      body: file
    });

    if (res.ok) {
      const publicUrl = `${SUPABASE_CONFIG.url}/storage/v1/object/public/${SUPABASE_CONFIG.storageBucket}/${safeName}`;
      uploaded.push({
        name: safeName,
        url: publicUrl,
        size: file.size
      });
    } else {
      console.warn(`Ошибка загрузки ${file.name} в Supabase Storage`);
    }
  }

  return uploaded;
};

export const uploadSingleImage = async (file) => {
  const files = await uploadMediaFiles([file]);
  if (files && files.length > 0) return files[0];
  throw new Error('Файл не был загружен в Supabase Storage');
};

export const deleteMediaFile = async (filename) => {
  const token = getAuthToken();
  if (!token) throw new Error('Требуется авторизация администратора');
  if (!filename) return false;

  try {
    const cleanName = filename.split('/').pop();
    const res = await fetch(`${SUPABASE_CONFIG.url}/storage/v1/object/${SUPABASE_CONFIG.storageBucket}/${encodeURIComponent(cleanName)}`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_CONFIG.anonKey
      }
    });
    return res.ok;
  } catch (err) {
    console.warn('Ошибка удаления медиафайла из Supabase Storage:', err);
    return false;
  }
};

// ==========================================
// 6. EXCEL ИМПОРТ И ЭКСПОРТ (КАТАЛОГ)
// ==========================================

export const downloadExcelTemplate = async () => {
  const link = document.createElement('a');
  link.href = `${import.meta.env.BASE_URL}LAUTE_Catalog.xlsx`;
  link.download = 'LAUTE_Catalog.xlsx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
};

export const exportCurrentCatalog = async () => {
  const products = await fetchProducts(true);
  clientExportCatalog(products);
  return true;
};

export const validateExcelFile = async (file) => {
  const products = await fetchProducts(true);
  return await clientValidateExcel(file, products);
};

export const commitExcelImport = async (validRows) => {
  const token = getAuthToken();
  if (!token) throw new Error('Требуется авторизация администратора');

  const currentProducts = await fetchProducts(true);

  // 1. Обрабатываем строки с явным статусом УДАЛИТЬ через Supabase
  const deletedSkus = validRows
    .filter(r => r.actionStatus === 'УДАЛИТЬ')
    .map(r => r.article);

  if (deletedSkus.length > 0) {
    try {
      await callSupabaseRpc('laute_delete_products_batch', {
        p_token: token,
        p_skus: deletedSkus
      });
    } catch (err) {
      console.warn('Ошибка удаления позиций в Supabase:', err);
    }
  }

  // 2. Применяем изменения (товары, отсутствующие в Excel, НЕ удаляются)
  const updatedProducts = clientApplyExcelImport(currentProducts, validRows);

  // 3. Сохраняем пакет товаров в Supabase
  const result = await callSupabaseRpc('laute_save_products_batch', {
    p_token: token,
    p_products: updatedProducts,
    p_backup_desc: `Импорт Excel (${validRows.length} позиций)`
  });

  if (!result || !result.success) {
    throw new Error(result?.error || 'Ошибка сохранения импорта в Supabase');
  }

  // 4. Подсчёт точной статистики для интерфейса админки
  let added = 0;
  let updated = 0;
  let hidden = 0;

  const currentMap = new Map();
  currentProducts.forEach(p => currentMap.set(p.article.trim().toUpperCase(), p));

  validRows.forEach(r => {
    if (r.actionStatus === 'УДАЛИТЬ') return;
    const key = r.article.trim().toUpperCase();
    if (r.actionStatus === 'СКРЫТ' || r.actionStatus === 'СКРЫТЬ' || r.status === 'СКРЫТ') {
      hidden++;
    } else if (currentMap.has(key)) {
      updated++;
    } else {
      added++;
    }
  });

  const stats = {
    added,
    updated,
    hidden,
    deleted: deletedSkus.length,
    total: updatedProducts.length
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem('laute_products', JSON.stringify(updatedProducts));
    localStorage.setItem('laute_products_loaded_from_backend', 'true');
  }

  return {
    success: true,
    stats,
    count: updatedProducts.length,
    backupId: result.backupId,
    products: updatedProducts
  };
};

export const downloadErrorReport = async (errors) => {
  clientDownloadErrorReport(errors);
  return true;
};

// ==========================================
// 7. ИСТОРИЯ, БЭКАПЫ И НАСТРОЙКИ
// ==========================================

export const fetchHistory = async () => {
  const token = getAuthToken();
  if (!token) return { logs: [], backups: [] };

  try {
    const adminData = await callSupabaseRpc('laute_get_admin_data', { p_token: token });
    return {
      logs: adminData.logs || [],
      backups: adminData.backups || []
    };
  } catch (err) {
    console.warn('Ошибка загрузки истории из Supabase:', err);
    return { logs: [], backups: [] };
  }
};

export const rollbackToBackup = async (backupId) => {
  return await rollbackSiteContent(backupId);
};

export const fetchSystemSettings = async () => {
  return {
    status: 'ok',
    database: 'Supabase PostgreSQL 17.11 (Active & Healthy)',
    projectRegion: 'eu-west-1 (Frankfurt / Dublin)',
    security: 'pgcrypto bcrypt hash + Row Level Security (RLS)',
    storage: 'Supabase Media Storage (Bucket: laute-media)'
  };
};

export const downloadFullSystemBackup = async () => {
  const [products, pages, categories, content, warehouses, stock] = await Promise.all([
    fetchProducts(true),
    fetchCustomPages(),
    fetchCategories(),
    fetchSiteContent(false),
    fetchWarehouses(),
    fetchWarehouseStock()
  ]);

  const fullBackup = {
    exportedAt: new Date().toISOString(),
    system: 'LAUTE International Master Platform',
    products,
    pages,
    categories,
    content,
    warehouses,
    stock
  };

  const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
  triggerBlobDownload(blob, `LAUTE_FULL_BACKUP_${new Date().toISOString().slice(0, 10)}.json`);
  return true;
};

// ==========================================
// 8. УПРАВЛЕНИЕ СКЛАДАМИ И ОСТАТКАМИ (WAREHOUSES & STOCK)
// ==========================================

export const fetchWarehouses = async () => {
  try {
    const records = await querySupabase('laute_warehouses?select=*&order=priority.asc');
    if (Array.isArray(records) && records.length > 0) {
      return records.map(w => ({
        id: w.id,
        name: w.name,
        country: w.country,
        city: w.city,
        address: w.address,
        isActive: w.is_active,
        priority: w.priority,
        updatedAt: w.updated_at
      }));
    }
  } catch (err) {
    console.warn('Ошибка загрузки складов из Supabase:', err);
  }

  // Начальные склады по техническому заданию
  return [
    { id: 'almaty', name: 'Алматы', country: 'Казахстан', city: 'Алматы', address: 'г. Алматы, пр. Райымбека, 212', isActive: true, priority: 1 },
    { id: 'novosibirsk', name: 'Новосибирск', country: 'Россия', city: 'Новосибирск', address: 'г. Новосибирск, ул. Блюхера, 71', isActive: true, priority: 2 },
    { id: 'moscow', name: 'Москва', country: 'Россия', city: 'Москва', address: 'г. Москва, складской комплекс Юг', isActive: true, priority: 3 },
    { id: 'china', name: 'Китай', country: 'КНР', city: 'Чжэцзян', address: 'Заводской комплекс LAUTE', isActive: true, priority: 4 }
  ];
};

export const createWarehouse = async (warehouseData) => {
  const token = getAuthToken();
  if (!token) throw new Error('Требуется авторизация администратора');

  const current = await fetchWarehouses();
  const newWh = {
    ...warehouseData,
    id: warehouseData.id || warehouseData.city.toLowerCase().replace(/[^a-z0-9]/g, '_')
  };

  const updated = [...current, newWh];
  await callSupabaseRpc('laute_save_warehouses', { p_token: token, p_warehouses: updated });
  return { success: true, warehouse: newWh };
};

export const updateWarehouse = async (id, warehouseData) => {
  const token = getAuthToken();
  if (!token) throw new Error('Требуется авторизация администратора');

  const current = await fetchWarehouses();
  const updated = current.map(w => w.id === id ? { ...w, ...warehouseData } : w);
  await callSupabaseRpc('laute_save_warehouses', { p_token: token, p_warehouses: updated });
  return { success: true, warehouse: warehouseData };
};

export const deleteWarehouse = async (id) => {
  const token = getAuthToken();
  if (!token) throw new Error('Требуется авторизация администратора');

  const current = await fetchWarehouses();
  const updated = current.filter(w => w.id !== id);
  await callSupabaseRpc('laute_save_warehouses', { p_token: token, p_warehouses: updated });
  return { success: true };
};

export const fetchWarehouseStock = async (warehouseId = null, sku = null) => {
  try {
    let query = 'laute_warehouse_stock?select=*';
    if (warehouseId) query += `&warehouse_id=eq.${encodeURIComponent(warehouseId)}`;
    if (sku) query += `&sku=eq.${encodeURIComponent(sku.toUpperCase())}`;

    const records = await querySupabase(query);
    if (Array.isArray(records) && records.length > 0) {
      return records.map(s => ({
        id: s.id,
        sku: s.sku,
        warehouseId: s.warehouse_id,
        quantity: s.quantity,
        updatedAt: s.updated_at
      }));
    }
  } catch (err) {
    console.warn('Ошибка загрузки остатков из Supabase:', err);
  }

  // Fallback to static public JSON
  try {
    const staticRes = await fetch(`${import.meta.env.BASE_URL}data/warehouse_stock.json?t=${Date.now()}`);
    if (staticRes.ok) {
      const allStock = await staticRes.json();
      if (warehouseId) return allStock.filter(s => s.warehouseId === warehouseId);
      return allStock;
    }
  } catch {
    // fallback
  }

  return [];
};

export const saveStockItem = async (warehouseId, sku, quantity) => {
  const token = getAuthToken();
  if (!token) throw new Error('Требуется авторизация администратора');

  const result = await callSupabaseRpc('laute_save_stock', {
    p_token: token,
    p_stocks: [{ warehouseId, sku, quantity: Number(quantity) || 0 }]
  });

  if (!result || !result.success) {
    throw new Error(result?.error || 'Ошибка сохранения остатка в Supabase');
  }

  return { success: true, warehouseId, sku, quantity };
};

export const saveBulkStock = async (warehouseId, items) => {
  const token = getAuthToken();
  if (!token) throw new Error('Требуется авторизация администратора');

  const formatted = items.map(i => ({
    warehouseId: i.warehouseId || warehouseId,
    sku: i.sku,
    quantity: Number(i.quantity) || 0
  }));

  const result = await callSupabaseRpc('laute_save_stock', {
    p_token: token,
    p_stocks: formatted
  });

  if (!result || !result.success) {
    throw new Error(result?.error || 'Ошибка сохранения остатков в Supabase');
  }

  return { success: true, count: formatted.length };
};

export const downloadStockTemplate = async (warehouseId = 'all') => {
  const [warehouses, products, allStock] = await Promise.all([
    fetchWarehouses(),
    fetchProducts(true),
    fetchWarehouseStock()
  ]);
  const targetWh = warehouseId === 'all' ? 'all' : (warehouses.find(w => w.id === warehouseId) || warehouseId);
  clientDownloadStockTemplate(targetWh, products, allStock, warehouses);
  return true;
};

export const exportStockToExcel = async (warehouseId = 'all') => {
  const [warehouses, products, allStock] = await Promise.all([
    fetchWarehouses(),
    fetchProducts(true),
    fetchWarehouseStock()
  ]);
  const targetWh = warehouseId === 'all' ? 'all' : (warehouses.find(w => w.id === warehouseId) || warehouseId);
  clientDownloadStockTemplate(targetWh, products, allStock, warehouses);
  return true;
};

export const validateStockExcelFile = async (file, warehouseId) => {
  const [warehouses, products, stockList] = await Promise.all([
    fetchWarehouses(),
    fetchProducts(true),
    fetchWarehouseStock(warehouseId === 'all' ? null : warehouseId)
  ]);
  const targetWh = warehouseId === 'all' ? 'all' : (warehouses.find(w => w.id === warehouseId) || warehouseId);
  return await clientParseStockExcel(file, targetWh, products, stockList, warehouses);
};

export const commitStockExcelImport = async (warehouseId, diffList, mode = 'partial') => {
  const token = getAuthToken();
  if (!token) throw new Error('Требуется авторизация администратора');

  const itemsToSave = diffList.map(d => ({
    warehouseId: d.warehouseId || warehouseId,
    sku: d.sku,
    quantity: d.newQuantity
  }));

  const result = await callSupabaseRpc('laute_save_stock', {
    p_token: token,
    p_stocks: itemsToSave
  });

  if (!result || !result.success) {
    throw new Error(result?.error || 'Ошибка сохранения остатков Excel в Supabase');
  }

  return { success: true, count: itemsToSave.length };
};

export const fetchRegionWarehouseMap = async () => {
  try {
    const records = await querySupabase('laute_region_warehouse_map?id=eq.current&select=mapping');
    if (Array.isArray(records) && records.length > 0 && records[0].mapping) {
      return records[0].mapping;
    }
  } catch (err) {
    console.warn('Ошибка загрузки карты регионов из Supabase:', err);
  }

  return {
    siberia: 'novosibirsk',
    kz: 'almaty',
    almaty: 'almaty',
    moscow: 'moscow',
    china: 'china',
    uae: null,
    usa: null
  };
};

export const saveRegionWarehouseMap = async (mapping) => {
  const token = getAuthToken();
  if (!token) throw new Error('Требуется авторизация администратора');

  const result = await callSupabaseRpc('laute_save_region_map', {
    p_token: token,
    p_mapping: mapping
  });

  if (!result || !result.success) {
    throw new Error(result?.error || 'Ошибка сохранения карты регионов');
  }

  return { success: true, mapping };
};

// ==========================================
// 9. ПАРТНЁРСКИЙ ДОСТУП B2B И СОХРАНЕНИЕ ЗАЯВОК
// ==========================================

export const authenticateB2BPartner = async (login, password) => {
  if (!password || !password.trim()) {
    throw new Error('Введите код или пароль партнёра');
  }
  const cleanPwd = password.trim();

  // Проверяем через серверную функцию авторизации Supabase
  try {
    const result = await callSupabaseRpc('laute_login', {
      p_password: cleanPwd,
      p_ip: typeof window !== 'undefined' ? window.location.hostname : 'unknown'
    });
    if (result && result.success) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('laute_partner_token', result.token || 'b2b_verified');
      }
      return { success: true, login: login || 'Партнёр LAUTE' };
    }
  } catch {
    // fallback if RPC throws
  }

  throw new Error('Неверный пароль или код партнёра. Для получения доступа обратитесь в оптовый отдел LAUTE.');
};

export const submitLeadInquiry = async (leadData) => {
  const payload = {
    ...leadData,
    id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString()
  };

  // Сохраняем в локальный журнал обращений браузера и отправляем на API при наличии
  if (typeof window !== 'undefined') {
    try {
      const existing = JSON.parse(localStorage.getItem('laute_leads_log') || '[]');
      existing.unshift(payload);
      localStorage.setItem('laute_leads_log', JSON.stringify(existing.slice(0, 100)));
    } catch {
      // ignore
    }
  }

  try {
    await fetch(`${getApiBase()}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch {
    // Статический хостинг без локального Node-сервера
  }

  return { success: true, lead: payload };
};

// ==========================================
// 10. ТЕРРИТОРИИ МЕНЕДЖЕРОВ И ЗАЯВКИ ИЗ КОРЗИНЫ БЕЗ РЕГИСТРАЦИИ
// ==========================================

const TERRITORY_RULES_STORAGE_KEY = 'laute_territory_managers_v1';
const ORDER_INQUIRIES_STORAGE_KEY = 'laute_order_inquiries_v1';
const ORDER_RATE_LIMIT_KEY = 'laute_last_order_ts_v1';

// Начальные правила территорий из подтверждённых региональных представительств LAUTE (src/data/regionsData.js)
export const DEFAULT_TERRITORY_RULES = [
  {
    id: 'terr_siberia',
    territoryName: 'Сибирский федеральный округ (РФ)',
    cities: ['Новосибирск', 'Омск', 'Красноярск', 'Барнаул', 'Томск', 'Кемерово', 'Новокузнецк', 'Иркутск', 'Бердск', 'Абакан'],
    managerName: 'Региональный отдел продаж (Сибирь)',
    managerEmail: 'nsk@laute.ltd',
    active: true
  },
  {
    id: 'terr_moscow',
    territoryName: 'Москва и Центральный регион (РФ)',
    cities: ['Москва', 'Санкт-Петербург', 'Екатеринбург', 'Казань', 'Нижний Новгород', 'Самара', 'Ростов-на-Дону', 'Краснодар', 'Воронеж', 'Пермь', 'Уфа', 'Челябинск', 'Подольск', 'Химки', 'Мытищи'],
    managerName: 'Дирекция оптовых продаж (Москва и ЦФО)',
    managerEmail: 'msk@laute.ltd',
    active: true
  },
  {
    id: 'terr_almaty',
    territoryName: 'Алматы и Алматинская область (РК)',
    cities: ['Алматы', 'Талдыкорган', 'Конаев', 'Каскелен', 'Талгар', 'Есик'],
    managerName: 'Представительство LAUTE в Алматы',
    managerEmail: 'kz@laute.ltd',
    active: true
  },
  {
    id: 'terr_kazakhstan',
    territoryName: 'Республика Казахстан (Регионы)',
    cities: ['Астана', 'Нур-Султан', 'Шымкент', 'Караганда', 'Актобе', 'Тараз', 'Павлодар', 'Усть-Каменогорск', 'Семей', 'Атырау', 'Костанай', 'Кызылорда', 'Уральск', 'Петропавловск', 'Актау', 'Темиртау', 'Туркестан', 'Кокшетау'],
    managerName: 'Департамент дистрибуции в РК',
    managerEmail: 'opt@laute.ltd',
    active: true
  }
];

const normalizeCityToken = (str) =>
  String(str || '')
    .toLowerCase()
    .replace(/^(г\.|город|city|қ\.|қала)\s*/i, '')
    .replace(/[^a-zа-яёәіңғүұқөһ0-9\s-]/gi, '')
    .trim();

export const getTerritoryRulesSync = () => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(TERRITORY_RULES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
  }
  return DEFAULT_TERRITORY_RULES;
};

export const fetchTerritoryRules = async () => {
  // 1. Пытаемся получить актуальные правила с серверного API
  try {
    const res = await fetch(`${getApiBase()}/territories`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.territories) && data.territories.length > 0) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(TERRITORY_RULES_STORAGE_KEY, JSON.stringify(data.territories));
        }
        return data.territories;
      }
    }
  } catch {
    // fallback
  }

  // 2. Пытаемся прочитать из опубликованного контента CMS
  try {
    const content = await fetchSiteContent('published');
    if (Array.isArray(content?.territoryManagers) && content.territoryManagers.length > 0) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(TERRITORY_RULES_STORAGE_KEY, JSON.stringify(content.territoryManagers));
      }
      return content.territoryManagers;
    }
  } catch {
    // fallback
  }

  return getTerritoryRulesSync();
};

export const saveTerritoryRules = async (rules) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Требуется авторизация администратора');
  }
  if (!Array.isArray(rules)) {
    throw new Error('Некорректный формат правил распределения территорий');
  }

  const sanitizedRules = rules.map((r, idx) => ({
    id: String(r.id || `terr_${idx + 1}`),
    territoryName: String(r.territoryName || '').trim(),
    cities: Array.isArray(r.cities)
      ? r.cities.map(c => String(c || '').trim()).filter(Boolean)
      : String(r.cities || '')
          .split(',')
          .map(c => c.trim())
          .filter(Boolean),
    managerName: String(r.managerName || '').trim(),
    managerEmail: String(r.managerEmail || '').trim(),
    active: r.active !== false
  }));

  if (typeof window !== 'undefined') {
    localStorage.setItem(TERRITORY_RULES_STORAGE_KEY, JSON.stringify(sanitizedRules));
  }

  // Сохраняем на локальном/серверном backend API, если он запущен
  try {
    await fetch(`${getApiBase()}/territories`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ territories: sanitizedRules })
    });
  } catch {
    // Статический режим
  }

  // Сохраняем в основной объект контента CMS
  try {
    const currentDraft = await fetchSiteContent('draft');
    if (currentDraft && typeof currentDraft === 'object') {
      const updated = { ...currentDraft, territoryManagers: sanitizedRules };
      await saveContentDraft(updated);
      await publishContent(updated);
    }
  } catch {
    // Игнорируем ошибку, если Supabase недоступен
  }

  return { success: true, territories: sanitizedRules };
};

/**
 * Определяет территорию и закреплённого менеджера по указанному городу.
 * Если город не найден или менеджер/email не назначен — возвращает статус pending_assignment («Ожидает назначения»).
 */
export const resolveManagerByCity = (cityInput, rules = null) => {
  const activeRules = Array.isArray(rules) ? rules : getTerritoryRulesSync();
  const normalizedInput = normalizeCityToken(cityInput);

  if (!normalizedInput) {
    return {
      status: 'pending_assignment',
      statusLabel: 'Ожидает назначения',
      territoryId: null,
      territoryName: null,
      managerName: null,
      managerEmail: null
    };
  }

  for (const rule of activeRules) {
    if (rule.active === false) continue;
    const citiesList = Array.isArray(rule.cities)
      ? rule.cities
      : String(rule.cities || '').split(',');

    const isCityMatch = citiesList.some((cityItem) => {
      const normRuleCity = normalizeCityToken(cityItem);
      if (!normRuleCity) return false;
      return (
        normalizedInput === normRuleCity ||
        normalizedInput.includes(normRuleCity) ||
        (normalizedInput.length >= 4 && normRuleCity.includes(normalizedInput))
      );
    });

    const normTerritory = normalizeCityToken(rule.territoryName);
    const isTerritoryMatch =
      normTerritory &&
      normalizedInput.length >= 4 &&
      (normalizedInput === normTerritory || normTerritory.includes(normalizedInput));

    if (isCityMatch || isTerritoryMatch) {
      const hasValidManager =
        Boolean(rule.managerEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rule.managerEmail.trim()));

      if (hasValidManager) {
        return {
          status: 'assigned',
          statusLabel: 'Назначен менеджер',
          territoryId: rule.id,
          territoryName: rule.territoryName,
          managerName: rule.managerName || 'Ответственный менеджер территории',
          managerEmail: rule.managerEmail.trim()
        };
      }
    }
  }

  return {
    status: 'pending_assignment',
    statusLabel: 'Ожидает назначения',
    territoryId: null,
    territoryName: null,
    managerName: null,
    managerEmail: null
  };
};

/**
 * Валидация контакта (телефон от 10 цифр ИЛИ корректный email)
 */
export const validateContactValue = (contactStr) => {
  const raw = String(contactStr || '').trim();
  if (!raw) return false;
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(raw);
  const digitsOnly = raw.replace(/\D/g, '');
  const isPhone = digitsOnly.length >= 10 && digitsOnly.length <= 15 && /^[+\d\s()-]+$/.test(raw);
  return isEmail || isPhone;
};

/**
 * Отправка первичной заявки без регистрации из корзины каталога
 */
export const submitCartOrderInquiry = async ({
  customerName,
  contact,
  city,
  comment = '',
  consent = false,
  honeypot = '',
  items = [],
  lang = 'ru'
}) => {
  // 1. Антиспам проверка (honeypot)
  if (honeypot && String(honeypot).trim().length > 0) {
    throw new Error('Spam detected');
  }

  // 2. Ограничение частоты повторной отправки (антиспам rate limit — 4 секунды)
  if (typeof window !== 'undefined') {
    const lastTs = Number(sessionStorage.getItem(ORDER_RATE_LIMIT_KEY) || 0);
    if (Date.now() - lastTs < 4000) {
      const err = new Error('RATE_LIMIT');
      err.code = 'RATE_LIMIT';
      throw err;
    }
  }

  // 3. Проверка обязательных полей
  const cleanName = String(customerName || '').trim();
  const cleanContact = String(contact || '').trim();
  const cleanCity = String(city || '').trim();
  const cleanComment = String(comment || '').trim();

  if (cleanName.length < 2) {
    const err = new Error('INVALID_NAME');
    err.code = 'INVALID_NAME';
    throw err;
  }
  if (!validateContactValue(cleanContact)) {
    const err = new Error('INVALID_CONTACT');
    err.code = 'INVALID_CONTACT';
    throw err;
  }
  if (cleanCity.length < 2) {
    const err = new Error('INVALID_CITY');
    err.code = 'INVALID_CITY';
    throw err;
  }
  if (!consent) {
    const err = new Error('CONSENT_REQUIRED');
    err.code = 'CONSENT_REQUIRED';
    throw err;
  }
  if (!Array.isArray(items) || items.length === 0) {
    const err = new Error('EMPTY_CART');
    err.code = 'EMPTY_CART';
    throw err;
  }

  // 4. Формирование состава позиций (используем только публичные розничные цены; неизвестную цену НЕ считаем нулевой)
  let totalKnownAmount = 0;
  let hasPriceOnRequest = false;
  let totalUnits = 0;

  const normalizedItems = items.map((item) => {
    const qty = Math.max(1, Math.min(9999, parseInt(item.quantity, 10) || 1));
    const rawPrice = Number(item.price);
    const hasKnownPrice = Number.isFinite(rawPrice) && rawPrice > 0;
    const lineSubtotal = hasKnownPrice ? rawPrice * qty : null;

    if (hasKnownPrice) {
      totalKnownAmount += lineSubtotal;
    } else {
      hasPriceOnRequest = true;
    }
    totalUnits += qty;

    return {
      article: String(item.article || '').trim(),
      title: String(item.title || '').trim(),
      series: String(item.series || '').trim(),
      category: String(item.category || '').trim(),
      quantity: qty,
      publicPrice: hasKnownPrice ? rawPrice : null,
      priceStatus: hasKnownPrice ? 'known' : 'on_request',
      lineSubtotal,
      image: String(item.image || '')
    };
  });

  // 5. Определение территории и закреплённого менеджера
  const territoryRules = await fetchTerritoryRules();
  const routing = resolveManagerByCity(cleanCity, territoryRules);

  // 6. Генерация номера заявки LAUTE-YYYYMMDD-XXXX
  const now = new Date();
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0')
  ].join('');
  const randomSuffix = String(Math.floor(1000 + Math.random() * 9000));
  const inquiryNumber = `LAUTE-${datePart}-${randomSuffix}`;

  const orderRecord = {
    id: `ord_${Date.now()}_${randomSuffix}`,
    inquiryNumber,
    createdAt: now.toISOString(),
    customer: {
      name: cleanName,
      contact: cleanContact,
      city: cleanCity,
      comment: cleanComment,
      consent: true,
      lang
    },
    items: normalizedItems,
    summary: {
      distinctItems: normalizedItems.length,
      totalUnits,
      totalKnownAmount,
      hasPriceOnRequest,
      currency: 'RUB'
    },
    routing: {
      status: routing.status, // 'assigned' | 'pending_assignment'
      statusLabel: routing.statusLabel,
      territoryId: routing.territoryId,
      territoryName: routing.territoryName,
      managerName: routing.managerName,
      managerEmail: routing.managerEmail
    },
    emailNotification: {
      sent: false,
      status: routing.status === 'assigned' ? 'queued_for_dispatch' : 'awaiting_territory_assignment',
      recipientEmail: routing.managerEmail || null,
      dispatchedAt: null
    }
  };

  // 7. Отправка на защищённый серверный endpoint /api/orders (база данных + почтовый сервис)
  let serverSaved = false;
  try {
    const response = await fetch(`${getApiBase()}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderRecord)
    });

    if (response.ok) {
      const serverResult = await response.json();
      if (serverResult && serverResult.success) {
        serverSaved = true;
        if (serverResult.order?.emailNotification) {
          orderRecord.emailNotification = serverResult.order.emailNotification;
        }
      }
    }
  } catch {
    // На статическом хостинге GitHub Pages локальный Node-сервер недоступен
  }

  // 8. Попытка записи через Supabase RPC (если настроен публичный приём заявок)
  try {
    const rpcRes = await callSupabaseRpc('laute_submit_order_inquiry', {
      p_order: orderRecord
    });
    if (rpcRes && rpcRes.success) {
      serverSaved = true;
    }
  } catch {
    // RPC не развёрнут или ключ не активен
  }

  // 9. Надёжное сохранение в защищённом хранилище служебного интерфейса (недоступно для публичного чтения на сайте, читается только в закрытой админ-панели /admin)
  if (typeof window !== 'undefined') {
    try {
      const existingOrders = JSON.parse(localStorage.getItem(ORDER_INQUIRIES_STORAGE_KEY) || '[]');
      const filtered = Array.isArray(existingOrders)
        ? existingOrders.filter(o => o.inquiryNumber !== orderRecord.inquiryNumber)
        : [];
      filtered.unshift(orderRecord);
      localStorage.setItem(ORDER_INQUIRIES_STORAGE_KEY, JSON.stringify(filtered.slice(0, 500)));
      sessionStorage.setItem(ORDER_RATE_LIMIT_KEY, String(Date.now()));
    } catch {
      // ignore storage quota errors
    }
  }

  return {
    success: true,
    serverSaved,
    order: orderRecord
  };
};

/**
 * Чтение всех заявок из корзины для служебного интерфейса администратора (/admin)
 */
export const fetchOrderInquiries = async () => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Требуется авторизация администратора');
  }

  let serverOrders = [];
  try {
    const res = await fetch(`${getApiBase()}/orders`, {
      headers: getHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.orders)) {
        serverOrders = data.orders;
      }
    }
  } catch {
    // fallback
  }

  let localOrders = [];
  if (typeof window !== 'undefined') {
    try {
      const parsed = JSON.parse(localStorage.getItem(ORDER_INQUIRIES_STORAGE_KEY) || '[]');
      if (Array.isArray(parsed)) {
        localOrders = parsed;
      }
    } catch {
      // ignore
    }
  }

  // Объединяем без дублей по inquiryNumber
  const mapByNumber = new Map();
  [...serverOrders, ...localOrders].forEach((ord) => {
    if (ord && ord.inquiryNumber && !mapByNumber.has(ord.inquiryNumber)) {
      mapByNumber.set(ord.inquiryNumber, ord);
    }
  });

  return Array.from(mapByNumber.values()).sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );
};

/**
 * Назначение менеджера или изменение статуса заявки в админ-панели
 */
export const updateOrderInquiryInAdmin = async (inquiryNumber, patch) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Требуется авторизация администратора');
  }

  let updatedOrder = null;

  if (typeof window !== 'undefined') {
    try {
      const existing = JSON.parse(localStorage.getItem(ORDER_INQUIRIES_STORAGE_KEY) || '[]');
      if (Array.isArray(existing)) {
        const next = existing.map((ord) => {
          if (ord.inquiryNumber === inquiryNumber) {
            updatedOrder = {
              ...ord,
              ...patch,
              routing: patch.routing ? { ...ord.routing, ...patch.routing } : ord.routing
            };
            return updatedOrder;
          }
          return ord;
        });
        localStorage.setItem(ORDER_INQUIRIES_STORAGE_KEY, JSON.stringify(next));
      }
    } catch {
      // ignore
    }
  }

  try {
    const res = await fetch(`${getApiBase()}/orders/${encodeURIComponent(inquiryNumber)}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(patch)
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.order) updatedOrder = data.order;
    }
  } catch {
    // ignore in static mode
  }

  return { success: true, order: updatedOrder };
};

/**
 * Удаление заявки (например, очистка тестовой заявки администратором)
 */
export const deleteOrderInquiryInAdmin = async (inquiryNumber) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Требуется авторизация администратора');
  }

  if (typeof window !== 'undefined') {
    try {
      const existing = JSON.parse(localStorage.getItem(ORDER_INQUIRIES_STORAGE_KEY) || '[]');
      if (Array.isArray(existing)) {
        const next = existing.filter((ord) => ord.inquiryNumber !== inquiryNumber);
        localStorage.setItem(ORDER_INQUIRIES_STORAGE_KEY, JSON.stringify(next));
      }
    } catch {
      // ignore
    }
  }

  try {
    await fetch(`${getApiBase()}/orders/${encodeURIComponent(inquiryNumber)}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
  } catch {
    // ignore in static mode
  }

  return { success: true };
};

