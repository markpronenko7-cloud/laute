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

export const getHeaders = () => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const resolveMediaUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('//') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }
  const baseUrl = import.meta.env.BASE_URL || '/';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const cleanPath = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
  return `${cleanBase}${cleanPath}`;
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
  if (data?.success === false) {
    throw new Error(data.error || data.message || `Операция ${fnName} отклонена сервером`);
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

const canonicalJson = value => JSON.stringify(value, (_, v) => v && typeof v === 'object' && !Array.isArray(v)
  ? Object.fromEntries(Object.keys(v).sort().map(k => [k, v[k]])) : v);
const sameJson = (a, b) => canonicalJson(a) === canonicalJson(b);
const containsSavedFields = (actual, expected) => Object.entries(expected).every(([key, value]) =>
  value === undefined || (value && typeof value === 'object' && !Array.isArray(value)
    ? actual?.[key] && containsSavedFields(actual[key], value)
    : sameJson(actual?.[key], value)));

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
    authMode: 'supabase',
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
      p_ip: null
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
  if (isDraft === true || isDraft === 'draft') {
    if (!token) throw new Error('Требуется авторизация администратора');
    const adminData = await callSupabaseRpc('laute_get_admin_data', { p_token: token });
    if (adminData && adminData.draft) return adminData.draft;
    throw new Error('Не удалось загрузить сохранённый черновик');
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
  for (const setting of Object.values(updates.buttons || {})) {
    if (setting.action === 'link' && (!setting.link?.trim() || !/^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(setting.link.trim()))) throw new Error('Укажи корректную ссылку для кнопки: /catalog, #блок или https://…');
  }
  const token = getAuthToken();
  if (!token) throw new Error('Требуется авторизация администратора');

  const result = await callSupabaseRpc('laute_save_content_draft', {
    p_token: token,
    p_updates: updates
  });

  if (!result || !result.success) {
    throw new Error(result?.error || 'Ошибка сохранения черновика в Supabase');
  }
  const saved = await fetchSiteContent(true);
  if (!containsSavedFields(saved, updates)) throw new Error('Черновик записан, но проверка содержимого не совпала. Обнови данные перед повтором.');
  return saved;
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
  const records = await querySupabase('laute_site_content?id=eq.published&select=data,version');
  if (!records?.[0]?.data) throw new Error('Публикация выполнена, но не удалось перечитать контент. Обнови страницу.');
  if (result.content && !containsSavedFields(records[0].data, result.content)) throw new Error('Публичная версия не совпала с опубликованной. Обнови страницу и проверь результат.');
  return { ...result, content: { ...records[0].data, version: records[0].version || result.version, hasUnpublishedChanges: false } };
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
  const records = await querySupabase('laute_site_content?id=eq.published&select=data,version');
  return { ...result, content: records?.[0]?.data ? { ...records[0].data, version: records[0].version } : null };
};

export const fetchContentBackups = async () => {
  const token = getAuthToken();
  if (!token) return [];

  try {
    const adminData = await callSupabaseRpc('laute_get_admin_data', { p_token: token });
    if (adminData && Array.isArray(adminData.backups)) {
      return normalizeBackups(adminData.backups).filter(b => b.backup_type === 'content_publish' || b.backup_type === 'content_restore');
    }
  } catch (err) {
    console.warn('Ошибка загрузки бэкапов:', err);
  }
  return [];
};

// ==========================================
// 3. СТРАНИЦЫ И КАТЕГОРИИ
// ==========================================

export const fetchCustomPages = async (strict = false) => {
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
    if (strict) throw err;
    console.warn('Ошибка загрузки страниц из Supabase:', err);
  }

  if (strict) throw new Error('Не удалось прочитать страницы с сервера');

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

async function saveAndVerifyPages(pages) {
  await callSupabaseRpc('laute_save_custom_pages', { p_token: getAuthToken(), p_pages: pages });
  const saved = await fetchCustomPages(true);
  if (!sameJson(saved, pages)) throw new Error('Запись страниц не подтверждена. Обнови список и проверь результат.');
  return saved;
}

export const createCustomPage = async (pageData) => {
  const token = getAuthToken();
  if (!token) throw new Error('Требуется авторизация администратора');

  const pages = await fetchCustomPages(true);
  const cleanSlug = (pageData.slug || '').toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  if (!cleanSlug || !pageData.title?.trim()) throw new Error('Заполни название и адрес страницы');

  if (pages.some(p => p.slug === cleanSlug)) {
    throw new Error(`Страница с адресом "${cleanSlug}" уже существует`);
  }

  const newPage = {
    id: `page-${Date.now()}`,
    title: pageData.title,
    slug: cleanSlug,
    description: pageData.description || '',
    status: 'ЧЕРНОВИК',
    template: pageData.template || 'info',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    blocks: Array.isArray(pageData.blocks) ? pageData.blocks : [
      { id: 'b1', type: 'hero', title: pageData.title, subtitle: pageData.description || '' },
      { id: 'b2', type: 'text', content: 'Содержимое страницы...' }
    ]
  };

  pages.push(newPage);
  await saveAndVerifyPages(pages);
  return newPage;
};

export const updateCustomPage = async (id, pageData) => {
  const token = getAuthToken();
  if (!token) throw new Error('Требуется авторизация администратора');

  const pages = await fetchCustomPages(true);
  const idx = pages.findIndex(p => p.id === id);
  if (idx === -1) throw new Error('Страница не найдена');

  const cleanSlug = (pageData.slug ?? pages[idx].slug ?? '').toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  if (!cleanSlug || !(pageData.title ?? pages[idx].title)?.trim()) throw new Error('Заполни название и адрес страницы');
  if (pages.some(p => p.id !== id && p.slug === cleanSlug)) throw new Error(`Страница с адресом "${cleanSlug}" уже существует`);

  const old = pages[idx];
  const snapshot = pageData.status === 'ЧЕРНОВИК'
    ? old.published || (old.status === 'ОПУБЛИКОВАН' ? JSON.parse(JSON.stringify({ ...old, published: undefined })) : null)
    : null;
  pages[idx] = {
    ...pages[idx],
    ...pageData,
    published: snapshot,
    slug: cleanSlug,
    route: `/${cleanSlug}`,
    updatedAt: new Date().toISOString()
  };

  await saveAndVerifyPages(pages);
  return pages[idx];
};

export const deleteCustomPage = async (id) => {
  const token = getAuthToken();
  if (!token) throw new Error('Требуется авторизация администратора');

  const pages = await fetchCustomPages(true);
  const filtered = pages.filter(p => p.id !== id);
  await saveAndVerifyPages(filtered);
  return true;
};

export const duplicateCustomPage = async (id) => {
  const token = getAuthToken();
  if (!token) throw new Error('Требуется авторизация администратора');

  const pages = await fetchCustomPages(true);
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
    status: 'ЧЕРНОВИК',
    published: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    blocks: source.blocks ? source.blocks.map(b => ({ ...b, id: `blk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` })) : []
  };

  pages.push(duplicatedPage);
  await saveAndVerifyPages(pages);
  return duplicatedPage;
};

export const fetchPageVersions = async () => {
  const token = getAuthToken();
  if (!token) throw new Error('Требуется авторизация');
  const data = await callSupabaseRpc('laute_get_admin_data', { p_token: token });
  return normalizeBackups(data.backups || []).filter(b => b.backup_type === 'pages_update' || b.backup_type === 'pages_restore');
};

export const rollbackPagesVersion = async (backupId) => {
  await callSupabaseRpc('laute_restore_backup', { p_token: getAuthToken(), p_backup_id: backupId, p_scope: 'pages' });
  return await fetchCustomPages();
};

export const fetchCategories = async (strict = false) => {
  try {
    const records = await querySupabase('laute_categories?id=eq.current&select=categories');
    if (Array.isArray(records) && records.length > 0 && Array.isArray(records[0].categories)) {
      return records[0].categories;
    }
  } catch (err) {
    if (strict) throw err;
    console.warn('Ошибка загрузки категорий из Supabase:', err);
  }

  if (strict) throw new Error('Не удалось прочитать категории с сервера');
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/categories.json?t=${Date.now()}`);
    if (res.ok) return await res.json();
  } catch {
    // fallback
  }
  return [];
};

// Product categories use the category name as their key. Preserve every linked SKU.
export const saveCategories = async (categories) => {
  const token = getAuthToken();
  if (!token) throw new Error('Требуется авторизация администратора');
  const previous = await fetchCategories(true);
  const clean = categories.map(({ originalName, ...c }, i) => ({ ...c, name: c.name.trim(), order: i + 1 }));
  const names = clean.map(c => c.name.toLocaleLowerCase());
  if (names.some(n => !n) || new Set(names).size !== names.length) throw new Error('Названия категорий должны быть заполнены и не повторяться');
  const products = await fetchProducts(true, true);
  const originals = [...previous, ...categories.filter(c => c.originalName && !previous.some(p => p.id === c.id)).map(c => ({ ...c, name: c.originalName }))];
  const renamed = new Map(originals.flatMap(old => {
    const next = clean.find(c => c.id === old.id);
    if (!next && products.some(p => p.category === old.name)) throw new Error('Сначала перенеси товары из удаляемой категории');
    return next && next.name !== old.name ? [[old.name, next.name]] : [];
  }));
  const linked = products.filter(p => renamed.has(p.category));
  if (linked.length) await callSupabaseRpc('laute_import_products', {
    p_token: token, p_products: linked.map(p => ({ ...p, category: renamed.get(p.category) })), p_deleted_skus: []
  });
  try {
    await callSupabaseRpc('laute_save_categories', { p_token: token, p_categories: clean });
    const saved = await fetchCategories(true);
    if (!sameJson(saved, clean)) throw new Error('Сохранение категорий не подтверждено чтением');
    const actual = await fetchProducts(true, true);
    if (linked.some(p => actual.find(a => a.article === p.article)?.category !== renamed.get(p.category))) throw new Error('Не удалось подтвердить связи товаров');
    return saved;
  } catch (error) {
    try {
      if (linked.length) await callSupabaseRpc('laute_import_products', { p_token: token, p_products: linked, p_deleted_skus: [] });
      await callSupabaseRpc('laute_save_categories', { p_token: token, p_categories: previous });
    } catch {
      throw new Error('Сохранение прервано. Не удалось подтвердить восстановление связей. Обнови каталог и проверь категории перед повтором.');
    }
    throw error;
  }
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
    imageSlotsExplicit: raw.imageSlotsExplicit ?? p.imageSlotsExplicit,
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
    imageSlotsExplicit: raw.imageSlotsExplicit ?? p.imageSlotsExplicit ?? false,
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
    photo1: p.photo1 ?? raw.photo1 ?? '',
    photo2: p.photo2 ?? raw.photo2 ?? '',
    photo3: p.photo3 ?? raw.photo3 ?? '',
    drawingUrl: p.drawing_url ?? p.drawingUrl ?? raw.drawingUrl ?? '',
    boxUrl: p.box_url ?? p.boxUrl ?? raw.boxUrl ?? '',
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

export const fetchProducts = async (includeHidden = true, strict = false) => {
  try {
    const filter = includeHidden ? '' : 'status=neq.СКРЫТ&';
    const records = [];
    for (let offset = 0; ; offset += 1000) {
      const page = await querySupabase(`laute_products?${filter}select=*&order=updated_at.desc,article.asc&limit=1000&offset=${offset}`);
      if (!Array.isArray(page)) throw new Error('Некорректный ответ каталога');
      records.push(...page);
      if (page.length < 1000) break;
    }

    if (Array.isArray(records)) {
      const normalized = records.map(normalizeProduct);
      if (typeof window !== 'undefined') {
        localStorage.setItem('laute_products', JSON.stringify(normalized));
        localStorage.setItem('laute_products_loaded_from_backend', 'true');
      }
      return normalized;
    }
  } catch (err) {
    if (strict) throw err;
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

  const saved = (await fetchProducts(true, true)).find(p => p.article === productData.article);
  if (!saved || !containsSavedFields(saved, productData)) throw new Error('Создание товара не подтверждено повторным чтением');
  return saved;
};

export const updateProduct = async (sku, updates) => {
  const token = getAuthToken();
  if (!token) throw new Error('Требуется авторизация администратора');

  const existing = (await fetchProducts(true, true)).find(p => p.article === sku);
  if (!existing) throw new Error('Товар не найден. Обнови каталог перед сохранением.');
  const productToSave = {
    ...existing,
    ...updates,
    ...(['photo1', 'photo2', 'photo3', 'drawingUrl', 'boxUrl'].some(k => Object.hasOwn(updates, k)) ? { imageSlotsExplicit: true } : {}),
    article: sku
  };

  const result = await callSupabaseRpc('laute_save_product', {
    p_token: token,
    p_product: productToSave
  });

  if (!result || !result.success) {
    throw new Error(result?.error || 'Ошибка обновления товара в Supabase');
  }

  const saved = (await fetchProducts(true, true)).find(p => p.article === sku);
  if (!saved || !containsSavedFields(saved, Object.fromEntries(Object.entries(updates).filter(([key]) => !['updatedAt', 'raw_data', 'additionalPhotos', 'drawingPhotos', 'allPhotos', 'imageSlotsExplicit'].includes(key))))) throw new Error('Сохранение товара не подтверждено. Обнови каталог и проверь изменения.');
  return saved;
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
  const headers = {
    'apikey': SUPABASE_CONFIG.anonKey,
    'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
    'Content-Type': 'application/json'
  };

  let storageItems = [];
  try {
    const res = await fetch(`${SUPABASE_CONFIG.url}/storage/v1/object/list/${SUPABASE_CONFIG.storageBucket}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ prefix: '', limit: 200 })
    });

    if (res.ok) {
      const objects = await res.json();
      if (Array.isArray(objects)) {
        storageItems = objects.map(o => ({
          name: o.name,
          url: `${SUPABASE_CONFIG.url}/storage/v1/object/public/${SUPABASE_CONFIG.storageBucket}/${o.name}`,
          size: o.metadata?.size || 0,
          modified: o.updated_at || o.created_at || new Date().toISOString(),
          isStorage: true
        }));
      }
    } else {
      console.warn(`Supabase storage list returned HTTP ${res.status}`);
    }
  } catch (err) {
    console.warn('Supabase storage list error:', err);
  }

  // Фирменные фотографии LAUTE из базового репозитория
  const brandAssets = [
    { name: 'hero-slide-1.jpg', url: 'images/hero/hero-slide-1.jpg', size: 654841, modified: '2026-03-01T00:00:00Z', isBrand: true },
    { name: 'hero-slide-2.jpg', url: 'images/hero/hero-slide-2.jpg', size: 767215, modified: '2026-03-01T00:00:00Z', isBrand: true },
    { name: 'hero-slide-3.jpg', url: 'images/hero/hero-slide-3.jpg', size: 713731, modified: '2026-03-01T00:00:00Z', isBrand: true },
    { name: 'hero-slide-4.jpg', url: 'images/hero/hero-slide-4.jpg', size: 840681, modified: '2026-03-01T00:00:00Z', isBrand: true },
    { name: 'hero-slide-5.jpg', url: 'images/hero/hero-slide-5.jpg', size: 735010, modified: '2026-03-01T00:00:00Z', isBrand: true },
    { name: 'hero-slide-6.jpg', url: 'images/hero/hero-slide-6.jpg', size: 673763, modified: '2026-03-01T00:00:00Z', isBrand: true },
    { name: 'cat_kitchen.png', url: 'images/cat_kitchen.png', size: 1791211, modified: '2026-03-01T00:00:00Z', isBrand: true },
    { name: 'cat_bath.png', url: 'images/cat_bath.png', size: 1385357, modified: '2026-03-01T00:00:00Z', isBrand: true },
    { name: 'cat_shower.png', url: 'images/cat_shower.png', size: 1943322, modified: '2026-03-01T00:00:00Z', isBrand: true },
    { name: 'cat_german_line.png', url: 'images/cat_german_line.png', size: 1636480, modified: '2026-03-01T00:00:00Z', isBrand: true },
    { name: 'cat_sinks.png', url: 'images/cat_sinks.png', size: 349649, modified: '2026-03-01T00:00:00Z', isBrand: true },
    { name: 'cat_accessories.png', url: 'images/cat_accessories.png', size: 936940, modified: '2026-03-01T00:00:00Z', isBrand: true },
    { name: 'cat_laute_brand.jpg', url: 'images/cat_laute_brand.jpg', size: 100295, modified: '2026-03-01T00:00:00Z', isBrand: true },
    { name: 'brass_eccentric_macro.jpg', url: 'images/brass_eccentric_macro.jpg', size: 773262, modified: '2026-03-01T00:00:00Z', isBrand: true },
    { name: 'eco_aluminum_macro.jpg', url: 'images/eco_aluminum_macro.jpg', size: 579528, modified: '2026-03-01T00:00:00Z', isBrand: true },
    { name: 'sus304_steel_macro.jpg', url: 'images/sus304_steel_macro.jpg', size: 778383, modified: '2026-03-01T00:00:00Z', isBrand: true },
    { name: 'sedal_cartridge_macro.jpg', url: 'images/sedal_cartridge_macro.jpg', size: 705361, modified: '2026-03-01T00:00:00Z', isBrand: true },
    { name: 'pvd_finish_macro.jpg', url: 'images/pvd_finish_macro.jpg', size: 557617, modified: '2026-03-01T00:00:00Z', isBrand: true }
  ];

  // Сначала настоящие файлы из облачного хранилища, затем базовые фирменные ассеты
  const combined = [...storageItems];
  brandAssets.forEach(b => {
    if (!combined.some(c => c.name === b.name)) {
      combined.push(b);
    }
  });

  return combined;
};

async function callMediaService(method, body) {
  const token = getAuthToken();
  if (!token) throw new Error('Требуется авторизация администратора');
  const headers = { apikey: SUPABASE_CONFIG.anonKey, Authorization: 'Bearer ' + SUPABASE_CONFIG.anonKey, 'x-laute-token': token };
  if (body && !(body instanceof FormData)) headers['Content-Type'] = 'application/json';
  const response = await fetch(SUPABASE_CONFIG.url + '/functions/v1/admin-media', { method, headers, body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined });
  const data = await response.json().catch(() => null);
  if (!response.ok || data?.success === false) throw new Error(data?.error || 'Медиасервис недоступен. Повтори попытку.');
  return data;
}

export const uploadMediaFiles = async (fileList) => {
  if (!fileList?.length) throw new Error('Не выбраны файлы для загрузки');
  const uploaded = [];
  const errors = [];
  for (const file of fileList) {
    try {
      const form = new FormData();
      form.append('file', file);
      uploaded.push(await callMediaService('POST', form));
    } catch (err) { errors.push(file.name + ': ' + err.message); }
  }
  if (errors.length) throw new Error('Загружено: ' + uploaded.length + '. Ошибки: ' + errors.join('; '));
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
  if (!filename) throw new Error('Не указано имя файла для удаления');

  await callMediaService('DELETE', { name: filename.split('/').pop() });

  return true;
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

  const currentProducts = await fetchProducts(true, true);

  // 1. Обрабатываем строки с явным статусом УДАЛИТЬ через Supabase
  const deletedSkus = validRows
    .filter(r => r.actionStatus === 'УДАЛИТЬ')
    .map(r => r.article);

  // 2. Применяем изменения (товары, отсутствующие в Excel, НЕ удаляются)
  const updatedProducts = clientApplyExcelImport(currentProducts, validRows);

  // 3. Сохраняем пакет товаров в Supabase
  const result = await callSupabaseRpc('laute_import_products', {
    p_token: token,
    p_products: updatedProducts,
    p_deleted_skus: deletedSkus
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

const normalizeBackups = (backups) => backups.map(b => ({ ...b, backupId: b.backupId || b.id, timestamp: b.timestamp || b.created_at, sessionId: b.sessionId || b.session_id }));

export const fetchHistory = async () => {
  const token = getAuthToken();
  if (!token) return { logs: [], backups: [] };

  try {
    const adminData = await callSupabaseRpc('laute_get_admin_data', { p_token: token });
    return {
      logs: adminData.logs || [],
      backups: normalizeBackups(adminData.backups || []).filter(b => ['catalog_batch', 'catalog_import', 'catalog_restore', 'product_update'].includes(b.backup_type))
    };
  } catch (err) {
    console.warn('Ошибка загрузки истории из Supabase:', err);
    return { logs: [], backups: [] };
  }
};

export const rollbackToBackup = async (backupId) => {
  return await callSupabaseRpc('laute_restore_backup', { p_token: getAuthToken(), p_backup_id: backupId, p_scope: 'catalog' });
};

export const checkSystemDiagnostics = async () => {
  const token = getAuthToken();

  const results = {
    checkedAt: new Date().toISOString(),
    database: { status: 'checking', label: 'Supabase PostgreSQL', latencyMs: null, details: '' },
    storage: { status: 'checking', label: 'Supabase Storage (laute-media)', latencyMs: null, details: '' },
    backend: { status: 'checking', label: 'Серверный API', latencyMs: null, details: '' },
    auth: { status: 'ok', label: 'Авторизация администратора', details: token ? 'Токен активен' : 'Демо / ознакомительный режим' }
  };

  // 1. Реальная проверка подключения к Supabase PostgreSQL (REST API)
  try {
    const dbStart = Date.now();
    const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/laute_site_content?id=eq.published&select=id`, {
      headers: {
        'apikey': SUPABASE_CONFIG.anonKey,
        'Accept': 'application/json'
      }
    });
    results.database.latencyMs = Date.now() - dbStart;
    if (res.ok) {
      results.database.status = 'connected';
      results.database.details = 'PostgreSQL REST RLS (Подключено)';
    } else {
      results.database.status = 'unavailable';
      results.database.details = `Ошибка HTTP ${res.status}`;
    }
  } catch (err) {
    results.database.status = 'unavailable';
    results.database.details = err.message || 'Сетевая ошибка';
  }

  // 2. Реальная проверка доступности облачного бакета Supabase Storage
  try {
    const stStart = Date.now();
    const res = await fetch(`${SUPABASE_CONFIG.url}/storage/v1/object/list/${SUPABASE_CONFIG.storageBucket}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_CONFIG.anonKey,
        'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prefix: '', limit: 1 })
    });
    results.storage.latencyMs = Date.now() - stStart;
    if (res.ok) {
      results.storage.status = 'connected';
      results.storage.details = 'Облачный бакет laute-media доступен';
    } else {
      results.storage.status = 'unavailable';
      results.storage.details = `Ошибка HTTP ${res.status}`;
    }
  } catch (err) {
    results.storage.status = 'unavailable';
    results.storage.details = err.message || 'Сетевая ошибка';
  }

  // 3. Реальная проверка Node.js backend vs статический хостинг (GitHub Pages)
  try {
    const beStart = Date.now();
    const res = await fetch(`${getApiBase()}/health`, { signal: AbortSignal.timeout(2000) });
    results.backend.latencyMs = Date.now() - beStart;
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      results.backend.status = 'connected';
      results.backend.details = `Node.js Express сервер активен (аптайм ${Math.floor((data.uptime || 0) / 60)} мин.)`;
    } else {
      results.backend.status = 'static_mode';
      results.backend.details = 'Статический хостинг (GitHub Pages) — прямая синхронизация с Supabase';
    }
  } catch {
    results.backend.status = 'static_mode';
    results.backend.details = 'Статический хостинг (GitHub Pages) — прямая синхронизация с Supabase';
  }

  return results;
};

export const fetchSystemSettings = async () => {
  const diag = await checkSystemDiagnostics();
  return {
    status: diag.database.status === 'connected' ? 'ok' : 'degraded',
    database: `Supabase PostgreSQL (${diag.database.status === 'connected' ? 'Подключено' : 'Недоступно'})`,
    projectRegion: 'eu-west-1 (Frankfurt)',
    security: 'bcrypt / pgcrypto + Row Level Security (RLS)',
    storage: `Supabase Media Storage (${diag.storage.status === 'connected' ? 'Подключено' : 'Недоступно'})`,
    backendMode: diag.backend.status === 'connected' ? 'Локальный Node.js API' : 'Статический хостинг (GitHub Pages)',
    diagnostics: diag
  };
};

export const downloadFullSystemBackup = async () => {
  const [products, pages, categories, content, warehouses, stock, regionMap, draft, orders] = await Promise.all([
    fetchProducts(true),
    fetchCustomPages(),
    fetchCategories(),
    fetchSiteContent(false),
    fetchWarehouses(),
    fetchWarehouseStock(),
    fetchRegionWarehouseMap(),
    fetchSiteContent(true),
    fetchOrderInquiries()
  ]);

  const fullBackup = {
    exportedAt: new Date().toISOString(),
    system: 'LAUTE International Master Platform',
    products,
    pages,
    categories,
    content,
    warehouses,
    stock,
    regionMap,
    draft,
    orders
  };

  const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
  triggerBlobDownload(blob, `LAUTE_FULL_BACKUP_${new Date().toISOString().slice(0, 10)}.json`);
  return true;
};

// ==========================================
// 8. УПРАВЛЕНИЕ СКЛАДАМИ И ОСТАТКАМИ (WAREHOUSES & STOCK)
// ==========================================

export const fetchWarehouses = async (strict = false) => {
  try {
    const records = await querySupabase('laute_warehouses?select=*&order=priority.asc');
    if (Array.isArray(records)) {
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
    if (strict) throw err;
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

  const current = await fetchWarehouses(true);
  const newWh = {
    ...warehouseData,
    id: warehouseData.id || `wh-${crypto.randomUUID()}`
  };

  const updated = [...current, newWh];
  await callSupabaseRpc('laute_save_warehouses', { p_token: token, p_warehouses: updated });
  return { success: true, warehouse: newWh };
};

export const updateWarehouse = async (id, warehouseData) => {
  const token = getAuthToken();
  if (!token) throw new Error('Требуется авторизация администратора');

  const current = await fetchWarehouses(true);
  const updated = current.map(w => w.id === id ? { ...w, ...warehouseData } : w);
  await callSupabaseRpc('laute_save_warehouses', { p_token: token, p_warehouses: updated });
  return { success: true, warehouse: warehouseData };
};

export const deleteWarehouse = async (id) => {
  const token = getAuthToken();
  if (!token) throw new Error('Требуется авторизация администратора');

  await callSupabaseRpc('laute_delete_warehouse', { p_token: token, p_id: id });
  return { success: true };
};

export const fetchWarehouseStock = async (warehouseId = null, sku = null, strict = false) => {
  try {
    let query = 'laute_warehouse_stock?select=*';
    if (warehouseId) query += `&warehouse_id=eq.${encodeURIComponent(warehouseId)}`;
    if (sku) query += `&sku=eq.${encodeURIComponent(sku.toUpperCase())}`;

    const records = [];
    for (let offset = 0; ; offset += 1000) {
      const page = await querySupabase(`${query}&order=warehouse_id.asc,sku.asc&limit=1000&offset=${offset}`);
      if (!Array.isArray(page)) throw new Error('Некорректный ответ остатков');
      records.push(...page);
      if (page.length < 1000) break;
    }
    if (Array.isArray(records)) {
      return records.map(s => ({
        id: s.id,
        sku: s.sku,
        warehouseId: s.warehouse_id,
        quantity: s.quantity,
        updatedAt: s.updated_at
      }));
    }
  } catch (err) {
    if (strict) throw err;
    console.warn('Ошибка загрузки остатков из Supabase:', err);
  }

  // Fallback to static public JSON
  try {
    const staticRes = await fetch(`${import.meta.env.BASE_URL}data/warehouse_stock.json?t=${Date.now()}`);
    if (staticRes.ok) {
      const allStock = await staticRes.json();
      return allStock.filter(s => (!warehouseId || s.warehouseId === warehouseId) && (!sku || s.sku?.toUpperCase() === sku.toUpperCase()));
    }
  } catch {
    // fallback
  }

  return [];
};

const stockQuantity = (quantity) => {
  const value = Number(quantity);
  if (!Number.isInteger(value) || value < 0 || value > 2147483647) throw new Error('Остаток должен быть неотрицательным целым числом');
  return value;
};

export const saveStockItem = async (warehouseId, sku, quantity) => {
  const token = getAuthToken();
  if (!token) throw new Error('Требуется авторизация администратора');

  const result = await callSupabaseRpc('laute_save_stock', {
    p_token: token,
    p_stocks: [{ warehouseId, sku, quantity: stockQuantity(quantity) }]
  });

  if (!result || !result.success) {
    throw new Error(result?.error || 'Ошибка сохранения остатка в Supabase');
  }

  return { success: true, warehouseId, sku, quantity };
};

export const saveBulkStock = async (warehouseId, items) => {
  const token = getAuthToken();
  if (!token) throw new Error('Требуется авторизация администратора');

  if (Array.isArray(warehouseId)) {
    items = warehouseId;
    warehouseId = null;
  }
  if (!Array.isArray(items)) throw new Error('Некорректный список остатков');
  const formatted = items.map(i => ({
    warehouseId: i.warehouseId || warehouseId,
    sku: i.sku,
    quantity: stockQuantity(i.quantity)
  }));
  if (formatted.some(i => !i.warehouseId || !i.sku)) throw new Error('Укажи склад и артикул для каждого остатка');

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
  if (!Array.isArray(diffList)) throw new Error('Некорректный список изменений остатков');

  // 1. Попытка отправки на локальный/серверный backend API
  try {
    const res = await fetch(`${getApiBase()}/stock/excel/commit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ warehouseId, diffList, mode })
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, count: diffList.length, mode, ...data };
    }
  } catch {
    // В статическом режиме переходим к прямому сохранению в Supabase
  }

  // 2. Формируем позиции для сохранения
  const itemsToSave = diffList.map(d => ({
    warehouseId: d.warehouseId || warehouseId,
    sku: d.sku,
    quantity: stockQuantity(d.newQuantity)
  }));

  // При полной замене остатков склада (replace) обнуляем неуказанные артикулы этого склада
  if (mode === 'replace') {
      const allCurrentStock = await fetchWarehouseStock(null, null, true);
      const updatedSkus = new Set(diffList.map(d => `${d.warehouseId || warehouseId}::${d.sku}`));
      allCurrentStock.forEach(s => {
        const wh = s.warehouseId || warehouseId;
        if ((warehouseId === 'all' || wh === warehouseId) && !updatedSkus.has(`${wh}::${s.sku}`)) {
          itemsToSave.push({
            warehouseId: wh,
            sku: s.sku,
            quantity: 0
          });
        }
      });
  }

  const result = await callSupabaseRpc('laute_save_stock', {
    p_token: token,
    p_stocks: itemsToSave
  });

  if (!result || !result.success) {
    throw new Error(result?.error || 'Ошибка сохранения остатков Excel в Supabase');
  }

  // Обновляем локальный кэш остатков
  if (typeof window !== 'undefined') {
    try {
      const currentSaved = JSON.parse(localStorage.getItem('laute_warehouse_stock') || '[]');
      const stockMap = new Map();
      if (Array.isArray(currentSaved)) {
        currentSaved.forEach(s => stockMap.set(`${s.warehouseId}::${s.sku}`, s));
      }
      itemsToSave.forEach(it => {
        stockMap.set(`${it.warehouseId}::${it.sku}`, {
          warehouseId: it.warehouseId,
          sku: it.sku,
          quantity: it.quantity,
          updatedAt: new Date().toISOString()
        });
      });
      localStorage.setItem('laute_warehouse_stock', JSON.stringify(Array.from(stockMap.values())));
    } catch {
      // ignore
    }
  }

  return { success: true, count: itemsToSave.length, mode };
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

const MAIL_INBOX = 'markpronenko7@gmail.com';

async function sendInquiryEmail(subject, message, customerName, customerEmail) {
  const payload = {
    _subject: subject,
    name: customerName || 'Посетитель сайта LAUTE',
    message,
    _url: typeof window !== 'undefined' ? window.location.href : 'https://markpronenko7-cloud.github.io/laute/'
  };
  if (customerEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    payload.email = customerEmail;
  }
  let response;
  try {
    response = await fetch(`https://formsubmit.co/ajax/${MAIL_INBOX}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000)
    });
  } catch {
    throw new Error('Не удалось отправить заявку по электронной почте. Попробуйте ещё раз или напишите на markpronenko7@gmail.com.');
  }

  const result = await response.json().catch(() => null);
  if (result?.success === false || result?.success === 'false') {
    if (/activat/i.test(result.message || '')) {
      throw new Error('Для доставки заявок нужно подтвердить письмо FormSubmit в ящике markpronenko7@gmail.com. Заявка пока не отправлена; данные формы сохранены.');
    }
  }
  if (!response.ok || (result?.success !== true && result?.success !== 'true')) {
    throw new Error('Почтовый сервис не подтвердил приём заявки. Попробуйте ещё раз или напишите на markpronenko7@gmail.com.');
  }
  return true;
}

export const submitLeadInquiry = async (leadData) => {
  const payload = {
    ...leadData,
    id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString()
  };

  const details = Object.entries(payload)
    .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
    .join('\n');
  await sendInquiryEmail(
    `Обращение с сайта LAUTE — ${payload.source || 'форма'}`,
    details,
    payload.name || payload.fullName || payload.contactPerson,
    payload.email
  );

  // Локальная копия сохраняется только после подтверждения приёма почтовым сервисом.
  if (typeof window !== 'undefined') {
    try {
      const existing = JSON.parse(localStorage.getItem('laute_leads_log') || '[]');
      existing.unshift(payload);
      localStorage.setItem('laute_leads_log', JSON.stringify(existing.slice(0, 100)));
    } catch {
      // ignore
    }
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

  const currentDraft = await fetchSiteContent('draft');
  await saveSiteContentDraft({ ...currentDraft, territoryManagers: sanitizedRules });
  if (typeof window !== 'undefined') {
    localStorage.setItem(TERRITORY_RULES_STORAGE_KEY, JSON.stringify(sanitizedRules));
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

  // 7. Локальный сервер может сохранить заказ и отправить письмо, если он запущен.
  let serverSaved = false;
  let emailAccepted = false;
  if (typeof window === 'undefined' || !window.location.hostname.endsWith('github.io')) {
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
            emailAccepted = serverResult.order.emailNotification.sent === true;
          }
        }
      }
    } catch {
      // Локальный Node.js API может быть не запущен.
    }
  }

  if (!emailAccepted) {
    const lines = [
      `Заявка: ${orderRecord.inquiryNumber}`,
      `Дата: ${orderRecord.createdAt}`,
      `Имя: ${cleanName}`,
      `Контакт: ${cleanContact}`,
      `Город: ${cleanCity}`,
      `Комментарий: ${cleanComment || 'Без комментария'}`,
      `Менеджер: ${routing.managerName || 'Не назначен'}`,
      `Территория: ${routing.territoryName || 'Не определена'}`,
      '',
      ...normalizedItems.map((item, index) => `${index + 1}. ${item.article} — ${item.title} — ${item.quantity} шт. — ${item.lineSubtotal == null ? 'Цена по запросу' : `${item.lineSubtotal} ₽`}`),
      '',
      `Итого по известным ценам: ${totalKnownAmount} ₽`
    ];
    await sendInquiryEmail(
      `Заявка ${orderRecord.inquiryNumber} — ${cleanCity}`,
      lines.join('\n'),
      cleanName,
      cleanContact
    );
    emailAccepted = true;
    orderRecord.emailNotification = {
      sent: false,
      status: 'accepted_by_email_service',
      recipientEmail: MAIL_INBOX,
      copyTo: null,
      dispatchedAt: null
    };
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

  // 9. Локальная копия для восстановления в браузере отправителя.
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
    emailAccepted,
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

  const result = await callSupabaseRpc('laute_get_orders', { p_token: token });
  const orders = Array.isArray(result?.orders) ? result.orders : [];
  try { localStorage.setItem(ORDER_INQUIRIES_STORAGE_KEY, JSON.stringify(orders)); } catch { /* cache only */ }
  return orders;
};

/**
 * Назначение менеджера или изменение статуса заявки в админ-панели
 */
export const updateOrderInquiryInAdmin = async (inquiryNumber, patch) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Требуется авторизация администратора');
  }

  const result = await callSupabaseRpc('laute_update_order', { p_token: token, p_number: inquiryNumber, p_patch: patch });
  return result;
};

/**
 * Удаление заявки (например, очистка тестовой заявки администратором)
 */
export const deleteOrderInquiryInAdmin = async (inquiryNumber) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Требуется авторизация администратора');
  }

  return callSupabaseRpc('laute_delete_order', { p_token: token, p_number: inquiryNumber });
};

