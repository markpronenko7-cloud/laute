import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  createExportWorkbook, 
  parseAndValidateExcelBuffer, 
  createErrorReportWorkbook,
  createWarehouseStockWorkbook,
  createAllWarehousesStockWorkbook,
  parseAndValidateWarehouseStockExcelBuffer
} from './excelService.js';
import {
  initAuthConfig,
  getAuthStatus,
  setInitialPassword,
  changeAdminPassword,
  authenticateWithPassword,
  validateSessionToken,
  destroySession,
  createDevSession
} from './securityService.js';
import {
  getPublishedContent,
  getDraftContent,
  saveDraftContent,
  publishDraftContent,
  discardDraftContent,
  rollbackContentToBackup,
  getCategories,
  saveCategories,
  getCustomPages,
  saveCustomPages,
  getContentBackups
} from './contentService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Paths
const DATA_DIR = path.resolve(__dirname, 'data');
const BACKUPS_DIR = path.resolve(DATA_DIR, 'backups');
const PRODUCTS_FILE = path.resolve(DATA_DIR, 'products.json');
const AUDIT_FILE = path.resolve(DATA_DIR, 'audit_log.json');
const WAREHOUSES_FILE = path.resolve(DATA_DIR, 'warehouses.json');
const STOCK_FILE = path.resolve(DATA_DIR, 'warehouse_stock.json');
const REGION_MAP_FILE = path.resolve(DATA_DIR, 'region_warehouse_map.json');
const PUBLIC_CATALOG_FILE = path.resolve(__dirname, '..', 'public', 'data', 'catalog.json');
const PUBLIC_WAREHOUSES_FILE = path.resolve(__dirname, '..', 'public', 'data', 'warehouses.json');
const PUBLIC_STOCK_FILE = path.resolve(__dirname, '..', 'public', 'data', 'warehouse_stock.json');
const PUBLIC_REGION_MAP_FILE = path.resolve(__dirname, '..', 'public', 'data', 'region_warehouse_map.json');
const UPLOAD_CATALOG_DIR = path.resolve(__dirname, '..', 'public', 'images', 'catalog');
const UPLOAD_MEDIA_DIR = path.resolve(__dirname, '..', 'public', 'images', 'uploads');


// Ensure directories exist
[DATA_DIR, BACKUPS_DIR, UPLOAD_CATALOG_DIR, UPLOAD_MEDIA_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Initialize security
initAuthConfig();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// URL rewriting for /laute/ prefix if requests arrive with base
app.use((req, res, next) => {
  if (req.url.startsWith('/laute/api/')) {
    req.url = req.url.replace('/laute/api/', '/api/');
  } else if (req.url === '/laute/api') {
    req.url = '/api';
  }
  if (req.url.startsWith('/laute/images/')) {
    req.url = req.url.replace('/laute/images/', '/images/');
  }
  next();
});

// Serve uploaded images statically
app.use('/images/catalog', express.static(UPLOAD_CATALOG_DIR));
app.use('/images/uploads', express.static(UPLOAD_MEDIA_DIR));
app.use('/laute/images/catalog', express.static(UPLOAD_CATALOG_DIR));
app.use('/laute/images/uploads', express.static(UPLOAD_MEDIA_DIR));

// Configure Multer for Excel in-memory and images on-disk
const memStorage = multer.memoryStorage();
const uploadExcel = multer({ storage: memStorage, limits: { fileSize: 30 * 1024 * 1024 } });

const mediaDiskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_MEDIA_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `media_${Date.now()}_${cleanName}${ext}`);
  }
});
const uploadMedia = multer({ 
  storage: mediaDiskStorage, 
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|webp|svg|gif|avif)$/i;
    if (file.originalname.match(allowed)) {
      cb(null, true);
    } else {
      cb(new Error('Разрешены только файлы изображений (JPG, PNG, WEBP, SVG, GIF, AVIF)'));
    }
  }
});

// In-memory cache for last validation errors (for error report download)
let lastValidationErrors = [];

// Helper functions for file storage
function readJson(file, defaultVal = []) {
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
  }
  return defaultVal;
}

function writeJson(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing ${file}:`, err);
  }
}

function syncPublicCatalog(products) {
  try {
    const dir = path.dirname(PUBLIC_CATALOG_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(PUBLIC_CATALOG_FILE, JSON.stringify(products, null, 2), 'utf8');
  } catch (err) {
    console.error('Error syncing public catalog:', err);
  }
}

function createBackupSnapshot(products, description, sessionId) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupId = `catalog_${timestamp}`;
  const backupPath = path.resolve(BACKUPS_DIR, `${backupId}.json`);

  const snapshot = {
    backupId,
    timestamp: new Date().toISOString(),
    description,
    sessionId: sessionId || 'Система',
    productsCount: products.length,
    products
  };

  fs.writeFileSync(backupPath, JSON.stringify(snapshot, null, 2), 'utf8');
  return backupId;
}

function addAuditLog(entry) {
  const logs = readJson(AUDIT_FILE, []);
  const newLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    ...entry
  };
  logs.unshift(newLog);
  // Keep last 400 entries
  if (logs.length > 400) logs.length = 400;
  writeJson(AUDIT_FILE, logs);
  return newLog;
}

// Client IP extractor helper
function getClientIp(req) {
  return req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
}

// Authentication verification middleware
function verifyAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Требуется авторизация администратора LAUTE' });
  }

  const token = authHeader.split(' ')[1];
  const session = validateSessionToken(token);

  if (!session) {
    return res.status(401).json({ error: 'Сессия истекла или недействительна. Введите пароль снова.' });
  }

  req.session = session;
  req.token = token;
  next();
}

// ==========================================
// 1. HEALTH & AUTH ROUTES (SINGLE PASSWORD)
// ==========================================

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    serverTime: new Date().toISOString(), 
    service: 'LAUTE Master CMS & Catalog Backend' 
  });
});

// Check auth status (initialized or first-time setup needed)
app.get('/api/auth/status', (req, res) => {
  res.json(getAuthStatus());
});

// Local Development Passwordless Login (STRICTLY localhost / 127.0.0.1 in development)
app.get('/api/auth/dev-auto-login', (req, res) => {
  const ip = getClientIp(req);
  const host = req.headers.host || '';
  const isLocalIp = ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1' || ip === 'localhost';
  const isLocalHost = host.startsWith('localhost') || host.startsWith('127.0.0.1');
  const isDevEnv = process.env.NODE_ENV !== 'production';

  // Strict check: ONLY localhost in non-production environment
  if (!isLocalIp || !isLocalHost || !isDevEnv) {
    return res.status(403).json({
      success: false,
      error: 'Беспарольный вход разрешён исключительно в локальной среде разработки (localhost).'
    });
  }

  const result = createDevSession(ip);
  addAuditLog({
    action: 'DEV_LOGIN',
    actionTitle: 'Локальный вход сотрудника (без пароля)',
    summary: `Авторизована локальная сессия разработки ${result.session.id}`,
    sessionId: result.session.id,
    details: `IP: ${ip}, Host: ${host}`
  });

  res.json({
    success: true,
    token: result.token,
    session: result.session,
    devMode: true
  });
});

// First-time setup (only if not yet initialized)
app.post('/api/auth/setup', (req, res) => {
  try {
    const { password } = req.body;
    setInitialPassword(password);
    addAuditLog({
      action: 'SECURITY_SETUP',
      actionTitle: 'Первоначальная установка пароля администратора',
      summary: 'Мастер-пароль успешно установлен и захеширован через scrypt',
      details: 'Режим первоначальной настройки заблокирован'
    });
    res.json({ success: true, message: 'Пароль администратора успешно установлен!' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Single-password login
app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  const ip = getClientIp(req);

  if (!password || !password.trim()) {
    return res.status(400).json({ error: 'Введите пароль' });
  }

  const result = authenticateWithPassword(password.trim(), ip);

  if (!result.success) {
    addAuditLog({
      action: 'LOGIN_FAILED',
      actionTitle: 'Неудачная попытка входа',
      summary: `Неверный ввод пароля с IP ${ip}`,
      details: result.error
    });
    return res.status(result.status || 401).json({ error: result.error, needsSetup: result.needsSetup });
  }

  addAuditLog({
    action: 'LOGIN_SUCCESS',
    actionTitle: 'Успешный вход в панель управления',
    summary: `Авторизована сессия ${result.session.id}`,
    sessionId: result.session.id,
    details: `IP: ${ip}`
  });

  res.json({
    success: true,
    token: result.token,
    session: result.session
  });
});

// Check current session
app.get('/api/auth/me', verifyAuth, (req, res) => {
  res.json({
    session: {
      id: req.session.sessionId,
      role: 'admin',
      title: 'Администратор LAUTE',
      createdAt: req.session.createdAt
    }
  });
});

// Logout
app.post('/api/auth/logout', verifyAuth, (req, res) => {
  destroySession(req.token);
  addAuditLog({
    action: 'LOGOUT',
    actionTitle: 'Выход из панели управления',
    summary: `Сессия ${req.session.sessionId} завершена`,
    sessionId: req.session.sessionId
  });
  res.json({ success: true });
});

// Change admin password
app.post('/api/auth/change-password', verifyAuth, (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    changeAdminPassword(oldPassword, newPassword);
    addAuditLog({
      action: 'PASSWORD_CHANGED',
      actionTitle: 'Смена пароля администратора',
      summary: 'Мастер-пароль успешно изменён. Старые сессии аннулированы.',
      sessionId: req.session.sessionId
    });
    res.json({ success: true, message: 'Пароль администратора успешно изменён!' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 2. CONTENT & CMS ROUTES (VISUAL EDITOR)
// ==========================================

// Get site content (public gets published; authenticated with ?draft=true gets draft)
app.get('/api/content', (req, res) => {
  const isDraftRequested = req.query.draft === 'true';

  if (isDraftRequested) {
    // Check if token valid
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (validateSessionToken(token)) {
        return res.json(getDraftContent());
      }
    }
  }

  res.json(getPublishedContent());
});

// Save draft content
app.put('/api/content/draft', verifyAuth, (req, res) => {
  const updates = req.body;
  if (!updates || typeof updates !== 'object') {
    return res.status(400).json({ error: 'Некорректные данные контента' });
  }

  const updatedDraft = saveDraftContent(updates, req.session.sessionId);

  addAuditLog({
    action: 'CONTENT_DRAFT_SAVE',
    actionTitle: 'Сохранён черновик контента сайта',
    summary: 'Изменения сохранены в черновике (не опубликованы на витрине)',
    sessionId: req.session.sessionId
  });

  res.json({ success: true, draft: updatedDraft });
});

// Publish draft content to live site
app.post('/api/content/publish', verifyAuth, (req, res) => {
  try {
    const result = publishDraftContent(req.session.sessionId);

    addAuditLog({
      action: 'CONTENT_PUBLISH',
      actionTitle: 'Публикация контента на сайт',
      summary: `Контент сайта обновлен до версии ${result.version}. Создан снимок отката: ${result.backupId}`,
      sessionId: req.session.sessionId,
      backupId: result.backupId
    });

    res.json(result);
  } catch (err) {
    console.error('Content publish error:', err);
    res.status(500).json({ error: `Ошибка при публикации: ${err.message}` });
  }
});

// Discard draft changes
app.post('/api/content/discard', verifyAuth, (req, res) => {
  const resetDraft = discardDraftContent();

  addAuditLog({
    action: 'CONTENT_DRAFT_DISCARD',
    actionTitle: 'Отмена изменений черновика',
    summary: 'Все неопубликованные изменения сброшены к опубликованной версии',
    sessionId: req.session.sessionId
  });

  res.json({ success: true, draft: resetDraft });
});

// Rollback content to previous backup
app.post('/api/content/rollback', verifyAuth, (req, res) => {
  const { backupId } = req.body;
  if (!backupId) {
    return res.status(400).json({ error: 'Укажите ID резервной копии контента' });
  }

  try {
    const result = rollbackContentToBackup(backupId, req.session.sessionId);

    addAuditLog({
      action: 'CONTENT_ROLLBACK',
      actionTitle: `Откат контента к ${backupId}`,
      summary: `Контент восстановлен к версии ${result.restoredVersion}`,
      sessionId: req.session.sessionId,
      backupId
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List content backups
app.get('/api/content/backups', verifyAuth, (req, res) => {
  res.json({ backups: getContentBackups() });
});

// ==========================================
// 3. PAGES & CATEGORIES ROUTES
// ==========================================

// Custom Pages
app.get('/api/pages', (req, res) => {
  res.json({ pages: getCustomPages() });
});

app.post('/api/pages', verifyAuth, (req, res) => {
  const { title, slug, description, blocks } = req.body;
  if (!title || !slug) {
    return res.status(400).json({ error: 'Укажите заголовок и URL slug страницы' });
  }

  const pages = getCustomPages();
  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9_-]/g, '-');

  if (pages.some(p => p.slug === cleanSlug)) {
    return res.status(400).json({ error: `Страница с адресом "${cleanSlug}" уже существует` });
  }

  const newPage = {
    id: `page-${Date.now()}`,
    title,
    slug: cleanSlug,
    description: description || '',
    status: 'ОПУБЛИКОВАН',
    template: 'info',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    blocks: Array.isArray(blocks) ? blocks : [
      { id: 'b1', type: 'hero', title: title, subtitle: description || '' },
      { id: 'b2', type: 'text', content: 'Содержимое страницы...' }
    ]
  };

  pages.push(newPage);
  saveCustomPages(pages);

  addAuditLog({
    action: 'PAGE_CREATE',
    actionTitle: `Создана страница "${title}"`,
    summary: `URL: /${cleanSlug}`,
    sessionId: req.session.sessionId
  });

  res.json({ success: true, page: newPage });
});

app.put('/api/pages/:id', verifyAuth, (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const pages = getCustomPages();

  const idx = pages.findIndex(p => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Страница не найдена' });
  }

  pages[idx] = {
    ...pages[idx],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  saveCustomPages(pages);

  addAuditLog({
    action: 'PAGE_UPDATE',
    actionTitle: `Обновлена страница "${pages[idx].title}"`,
    summary: `URL: /${pages[idx].slug}`,
    sessionId: req.session.sessionId
  });

  res.json({ success: true, page: pages[idx] });
});

app.delete('/api/pages/:id', verifyAuth, (req, res) => {
  const { id } = req.params;
  const pages = getCustomPages();

  const idx = pages.findIndex(p => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Страница не найдена' });
  }

  const removed = pages.splice(idx, 1)[0];
  saveCustomPages(pages);

  addAuditLog({
    action: 'PAGE_DELETE',
    actionTitle: `Удалена страница "${removed.title}"`,
    summary: `URL: /${removed.slug}`,
    sessionId: req.session.sessionId
  });

  res.json({ success: true });
});

// Categories
app.get('/api/categories', (req, res) => {
  res.json({ categories: getCategories() });
});

app.put('/api/categories', verifyAuth, (req, res) => {
  const { categories } = req.body;
  if (!Array.isArray(categories)) {
    return res.status(400).json({ error: 'Ожидается массив категорий' });
  }

  saveCategories(categories);

  addAuditLog({
    action: 'CATEGORIES_UPDATE',
    actionTitle: 'Обновлена структура категорий товаров',
    summary: `Всего категорий: ${categories.length}`,
    sessionId: req.session.sessionId
  });

  res.json({ success: true, categories });
});

// ==========================================
// 4. PRODUCTS CATALOG ROUTES
// ==========================================

app.get('/api/products', (req, res) => {
  const products = readJson(PRODUCTS_FILE, []);
  const includeHidden = req.query.includeHidden !== 'false';
  if (!includeHidden) {
    const activeOnly = products.filter(p => p.status !== 'СКРЫТ');
    return res.json({ products: activeOnly });
  }
  res.json({ products });
});

app.post('/api/products', verifyAuth, (req, res) => {
  const newProd = req.body;
  if (!newProd.article || !newProd.name || !newProd.category || !newProd.price) {
    return res.status(400).json({ error: 'Обязательные поля: Артикул, Название, Категория, Цена' });
  }

  const products = readJson(PRODUCTS_FILE, []);
  const cleanArticle = String(newProd.article).trim();
  if (products.some(p => p.article.trim().toUpperCase() === cleanArticle.toUpperCase())) {
    return res.status(400).json({ error: `Товар с артикулом "${cleanArticle}" уже существует в каталоге!` });
  }

  const backupId = createBackupSnapshot(products, `Создание товара ${cleanArticle}`, req.session.sessionId);

  const productToSave = {
    ...newProd,
    article: cleanArticle,
    price: Number(newProd.price),
    currency: newProd.currency || '₸',
    status: newProd.status || 'АКТИВЕН',
    updatedAt: new Date().toISOString(),
    updatedSessionId: req.session.sessionId
  };

  products.unshift(productToSave);
  writeJson(PRODUCTS_FILE, products);
  syncPublicCatalog(products);

  addAuditLog({
    action: 'PRODUCT_CREATE',
    actionTitle: `Добавлен товар ${cleanArticle}`,
    summary: `Создана карточка товара "${productToSave.name}" (${productToSave.price} ${productToSave.currency})`,
    details: `Категория: ${productToSave.category}`,
    sessionId: req.session.sessionId,
    backupId
  });

  res.json({ success: true, product: productToSave, backupId });
});

app.put('/api/products/:sku', verifyAuth, (req, res) => {
  const { sku } = req.params;
  const updates = req.body;
  const products = readJson(PRODUCTS_FILE, []);

  const idx = products.findIndex(p => p.article.trim().toUpperCase() === sku.trim().toUpperCase());
  if (idx === -1) {
    return res.status(404).json({ error: `Товар с артикулом "${sku}" не найден` });
  }

  const oldProduct = products[idx];
  const backupId = createBackupSnapshot(products, `Редактирование товара ${sku}`, req.session.sessionId);

  const updatedProduct = {
    ...oldProduct,
    ...updates,
    article: oldProduct.article, // SKU is immutable
    price: updates.price !== undefined ? Number(updates.price) : oldProduct.price,
    updatedAt: new Date().toISOString(),
    updatedSessionId: req.session.sessionId
  };

  products[idx] = updatedProduct;
  writeJson(PRODUCTS_FILE, products);
  syncPublicCatalog(products);

  const diffs = [];
  if (oldProduct.price !== updatedProduct.price) {
    diffs.push(`Цена: ${oldProduct.price} -> ${updatedProduct.price}`);
  }
  if (oldProduct.status !== updatedProduct.status) {
    diffs.push(`Статус: ${oldProduct.status} -> ${updatedProduct.status}`);
  }
  if (oldProduct.name !== updatedProduct.name) {
    diffs.push(`Название: "${oldProduct.name}" -> "${updatedProduct.name}"`);
  }

  addAuditLog({
    action: 'PRODUCT_UPDATE',
    actionTitle: `Обновлен товар ${sku}`,
    summary: diffs.length > 0 ? diffs.join('; ') : 'Характеристики и описание обновлены',
    details: `Товар: ${updatedProduct.name}`,
    sessionId: req.session.sessionId,
    backupId
  });

  res.json({ success: true, product: updatedProduct, backupId });
});

app.patch('/api/products/:sku/status', verifyAuth, (req, res) => {
  const { sku } = req.params;
  const { status } = req.body;
  const products = readJson(PRODUCTS_FILE, []);

  const prod = products.find(p => p.article.trim().toUpperCase() === sku.trim().toUpperCase());
  if (!prod) {
    return res.status(404).json({ error: `Товар ${sku} не найден` });
  }

  const targetStatus = status || (prod.status === 'СКРЫТ' ? 'АКТИВЕН' : 'СКРЫТ');
  const backupId = createBackupSnapshot(products, `Изменение статуса ${sku} -> ${targetStatus}`, req.session.sessionId);

  prod.status = targetStatus;
  prod.updatedAt = new Date().toISOString();
  prod.updatedSessionId = req.session.sessionId;

  writeJson(PRODUCTS_FILE, products);
  syncPublicCatalog(products);

  addAuditLog({
    action: 'STATUS_CHANGE',
    actionTitle: targetStatus === 'СКРЫТ' ? `Скрыт товар ${sku}` : `Возвращен в каталог ${sku}`,
    summary: `Товар "${prod.name}" переведен в статус "${targetStatus}"`,
    sessionId: req.session.sessionId,
    backupId
  });

  res.json({ success: true, product: prod, backupId });
});

app.delete('/api/products/:sku', verifyAuth, (req, res) => {
  const { sku } = req.params;
  const products = readJson(PRODUCTS_FILE, []);

  const idx = products.findIndex(p => p.article.trim().toUpperCase() === sku.trim().toUpperCase());
  if (idx === -1) {
    return res.status(404).json({ error: `Товар ${sku} не найден` });
  }

  const removed = products[idx];
  const backupId = createBackupSnapshot(products, `Удаление товара ${sku}`, req.session.sessionId);

  products.splice(idx, 1);
  writeJson(PRODUCTS_FILE, products);
  syncPublicCatalog(products);

  addAuditLog({
    action: 'PRODUCT_DELETE',
    actionTitle: `Удален товар ${sku}`,
    summary: `Товар "${removed.name}" удален из базы каталога`,
    sessionId: req.session.sessionId,
    backupId
  });

  res.json({ success: true, backupId });
});

// ==========================================
// 5. EXCEL IMPORT & EXPORT
// ==========================================

// Download Template
app.get('/api/excel/template', (req, res) => {
  const templatePath = path.resolve(__dirname, '..', 'LAUTE_Catalog.xlsx');
  if (fs.existsSync(templatePath)) {
    res.setHeader('Content-Disposition', 'attachment; filename="LAUTE_Catalog.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return fs.createReadStream(templatePath).pipe(res);
  }
  res.status(404).json({ error: 'Файл шаблона не найден на сервере' });
});

// Export Current Catalog
app.get('/api/excel/export', async (req, res) => {
  try {
    const products = readJson(PRODUCTS_FILE, []);
    const workbook = await createExportWorkbook(products);
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `LAUTE_Catalog_Export_${dateStr}.xlsx`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Error generating export Excel:', err);
    res.status(500).json({ error: 'Ошибка генерации Excel-выгрузки' });
  }
});

// Validate Excel file
app.post('/api/excel/validate', verifyAuth, uploadExcel.single('file'), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'Файл Excel не передан' });
    }

    const currentProducts = readJson(PRODUCTS_FILE, []);
    const result = await parseAndValidateExcelBuffer(req.file.buffer, currentProducts);

    lastValidationErrors = result.errors || [];
    res.json(result);
  } catch (err) {
    console.error('Validation error:', err);
    res.status(500).json({
      success: false,
      summary: { toAdd: 0, toUpdate: 0, unchanged: 0, toHide: 0, toDelete: 0, errorsCount: 1 },
      errors: [{ row: '-', article: '-', message: `Ошибка структуры Excel-файла: ${err.message}` }],
      diffs: [],
      validRows: []
    });
  }
});

// Commit confirmed Excel import
app.post('/api/excel/commit', verifyAuth, (req, res) => {
  const { validRows } = req.body;
  if (!validRows || !Array.isArray(validRows) || validRows.length === 0) {
    return res.status(400).json({ error: 'Нет подтвержденных строк для применения' });
  }

  const products = readJson(PRODUCTS_FILE, []);
  const backupId = createBackupSnapshot(
    products, 
    `Импорт Excel (${validRows.length} позиций)`, 
    req.session.sessionId
  );

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
      // Update existing product
      const existing = productMap.get(upperSku);
      const updated = {
        ...existing,
        name: row.name !== undefined ? row.name : existing.name,
        category: row.category !== undefined ? row.category : existing.category,
        subcategory: row.subcategory !== undefined ? row.subcategory : existing.subcategory,
        collection: row.collection !== undefined ? row.collection : existing.collection,
        brand: row.brand !== undefined ? row.brand : existing.brand,
        description: row.description !== undefined ? row.description : existing.description,
        price: row.price !== undefined ? Number(row.price) : existing.price,
        currency: row.currency || existing.currency || '₸',
        material: row.material !== undefined ? row.material : existing.material,
        color: row.color !== undefined ? row.color : existing.color,
        finish: row.finish !== undefined ? row.finish : existing.finish,
        installType: row.installType !== undefined ? row.installType : existing.installType,
        purpose: row.purpose !== undefined ? row.purpose : existing.purpose,
        dimensions: row.dimensions !== undefined ? row.dimensions : existing.dimensions,
        weight: row.weight !== undefined ? row.weight : existing.weight,
        volume: row.volume !== undefined ? row.volume : existing.volume,
        specs: row.specs !== undefined ? row.specs : existing.specs,
        photo1: row.photo1 || existing.photo1,
        photo2: row.photo2 || existing.photo2,
        photo3: row.photo3 || existing.photo3,
        status: row.status || existing.status,
        seoTitle: row.seoTitle !== undefined ? row.seoTitle : existing.seoTitle,
        seoDesc: row.seoDesc !== undefined ? row.seoDesc : existing.seoDesc,
        url: row.url !== undefined ? row.url : existing.url,
        extraSpecs: row.extraSpecs !== undefined ? row.extraSpecs : existing.extraSpecs,
        updatedAt: new Date().toISOString(),
        updatedSessionId: req.session.sessionId
      };

      if (updated.status === 'СКРЫТ' && existing.status !== 'СКРЫТ') {
        hiddenCount++;
      } else {
        updatedCount++;
      }
      productMap.set(upperSku, updated);
    } else {
      // Add new product
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
        material: row.material || 'Первичная латунь CW617N (евростандарт)',
        color: row.color || 'Хром глянец',
        finish: row.finish || 'Гальванический хром',
        installType: row.installType || 'Врезной на мойку / умывальник',
        purpose: row.purpose || row.category,
        dimensions: row.dimensions || '',
        weight: row.weight || '',
        volume: row.volume || '',
        specs: row.specs || '',
        photo1: row.photo1 || 'images/cat_laute_brand.jpg',
        photo2: row.photo2 || '',
        photo3: row.photo3 || '',
        cityStock: { 'Алматы': 10, 'Астана': 5, 'Новосибирск': 10, 'Москва': 15 },
        status: row.status || 'АКТИВЕН',
        seoTitle: row.seoTitle || `${row.name} — купить LAUTE`,
        seoDesc: row.seoDesc || `${row.name}: немецкие стандарты качества LAUTE.`,
        url: row.url || `/catalog#${row.article.trim()}`,
        extraSpecs: row.extraSpecs || '',
        updatedAt: new Date().toISOString(),
        updatedSessionId: req.session.sessionId
      };
      productMap.set(upperSku, newProduct);
      addedCount++;
    }
  });

  // CRITICAL: Items NOT present in uploaded Excel are preserved!
  const finalProducts = Array.from(productMap.values());

  writeJson(PRODUCTS_FILE, finalProducts);
  syncPublicCatalog(finalProducts);

  addAuditLog({
    action: 'EXCEL_IMPORT',
    actionTitle: 'Успешный импорт Excel-каталога',
    summary: `Добавлено: +${addedCount}, Обновлено: ${updatedCount}, Скрыто: ${hiddenCount}, Удалено: ${deletedCount}. Всего: ${finalProducts.length}`,
    details: `Создана точка отката: ${backupId}`,
    sessionId: req.session.sessionId,
    backupId
  });

  res.json({
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
  });
});

// Download Error Report
app.get('/api/excel/error-report', async (req, res) => {
  try {
    const workbook = await createErrorReportWorkbook(lastValidationErrors);
    res.setHeader('Content-Disposition', 'attachment; filename="LAUTE_Import_Errors.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Error generating error report:', err);
    res.status(500).json({ error: 'Ошибка генерации отчёта об ошибках' });
  }
});

// ==========================================
// 5.5. WAREHOUSES & STOCK MANAGEMENT (НОВЫЙ РАЗДЕЛ)
// ==========================================

function syncPublicWarehouses(warehouses) {
  try {
    const dir = path.dirname(PUBLIC_WAREHOUSES_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(PUBLIC_WAREHOUSES_FILE, JSON.stringify(warehouses, null, 2), 'utf8');
  } catch (err) {
    console.error('Error syncing public warehouses:', err);
  }
}

function syncPublicStock(stock) {
  try {
    const dir = path.dirname(PUBLIC_STOCK_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(PUBLIC_STOCK_FILE, JSON.stringify(stock, null, 2), 'utf8');
  } catch (err) {
    console.error('Error syncing public stock:', err);
  }
}

function syncPublicRegionMap(mapping) {
  try {
    const dir = path.dirname(PUBLIC_REGION_MAP_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(PUBLIC_REGION_MAP_FILE, JSON.stringify(mapping, null, 2), 'utf8');
  } catch (err) {
    console.error('Error syncing public region map:', err);
  }
}

// Alias for audit logging
const logAudit = addAuditLog;

// 1. Get all warehouses
app.get('/api/warehouses', (req, res) => {
  const warehouses = readJson(WAREHOUSES_FILE, []);
  res.json({ warehouses });
});

// 2. Create warehouse
app.post('/api/warehouses', verifyAuth, (req, res) => {
  try {
    const { name, country, city, address, isActive } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Наименование склада обязательно' });
    }

    const warehouses = readJson(WAREHOUSES_FILE, []);
    const cleanName = name.trim();
    if (warehouses.some(w => w.name.toLowerCase() === cleanName.toLowerCase())) {
      return res.status(400).json({ error: `Склад с названием "${cleanName}" уже существует` });
    }

    const id = cleanName.toLowerCase().replace(/[^a-z0-9а-яё]/gi, '_').replace(/_+/g, '_') + '_' + Date.now().toString(36);
    const newWarehouse = {
      id,
      name: cleanName,
      country: country?.trim() || 'Казахстан',
      city: city?.trim() || cleanName,
      address: address?.trim() || '',
      isActive: isActive !== false,
      priority: warehouses.length + 1,
      updatedAt: new Date().toISOString()
    };

    warehouses.push(newWarehouse);
    writeJson(WAREHOUSES_FILE, warehouses);
    syncPublicWarehouses(warehouses);

    logAudit({
      action: 'WAREHOUSE_CREATE',
      actionTitle: `Создан склад "${cleanName}"`,
      summary: `Добавлен новый склад в систему: ${cleanName} (${newWarehouse.country})`,
      sessionId: req.session.sessionId
    });

    res.json({ success: true, warehouse: newWarehouse });
  } catch (err) {
    console.error('Error creating warehouse:', err);
    res.status(500).json({ error: 'Ошибка создания склада' });
  }
});

// 3. Update warehouse
app.put('/api/warehouses/:id', verifyAuth, (req, res) => {
  try {
    const { id } = req.params;
    const { name, country, city, address, isActive, priority } = req.body;

    const warehouses = readJson(WAREHOUSES_FILE, []);
    const idx = warehouses.findIndex(w => w.id === id);
    if (idx === -1) {
      return res.status(400).json({ error: 'Склад не найден' });
    }

    const current = warehouses[idx];
    const oldName = current.name;
    const updated = {
      ...current,
      name: name !== undefined ? name.trim() : current.name,
      country: country !== undefined ? country.trim() : current.country,
      city: city !== undefined ? city.trim() : current.city,
      address: address !== undefined ? address.trim() : current.address,
      isActive: isActive !== undefined ? Boolean(isActive) : current.isActive,
      priority: priority !== undefined ? Number(priority) : current.priority,
      updatedAt: new Date().toISOString()
    };

    warehouses[idx] = updated;
    writeJson(WAREHOUSES_FILE, warehouses);
    syncPublicWarehouses(warehouses);

    logAudit({
      action: 'WAREHOUSE_UPDATE',
      actionTitle: `Обновлен склад "${updated.name}"`,
      summary: `Изменены параметры склада: ${oldName} -> ${updated.name}`,
      sessionId: req.session.sessionId
    });

    res.json({ success: true, warehouse: updated });
  } catch (err) {
    console.error('Error updating warehouse:', err);
    res.status(500).json({ error: 'Ошибка обновления склада' });
  }
});

// 4. Delete warehouse (with stock check)
app.delete('/api/warehouses/:id', verifyAuth, (req, res) => {
  try {
    const { id } = req.params;
    const warehouses = readJson(WAREHOUSES_FILE, []);
    const target = warehouses.find(w => w.id === id);
    if (!target) {
      return res.status(404).json({ error: 'Склад не найден' });
    }

    if (warehouses.length <= 1) {
      return res.status(400).json({ error: 'Нельзя удалить единственный оставшийся склад' });
    }

    const stock = readJson(STOCK_FILE, []);
    const nonZeroStock = stock.filter(s => s.warehouseId === id && Number(s.quantity) > 0);
    if (nonZeroStock.length > 0) {
      return res.status(400).json({ 
        error: `Нельзя удалить склад "${target.name}": на нем числятся ненулевые остатки по ${nonZeroStock.length} позициям. Сначала обнулите или переместите остатки.` 
      });
    }

    const updatedWarehouses = warehouses.filter(w => w.id !== id);
    const updatedStock = stock.filter(s => s.warehouseId !== id);

    writeJson(WAREHOUSES_FILE, updatedWarehouses);
    writeJson(STOCK_FILE, updatedStock);
    syncPublicWarehouses(updatedWarehouses);
    syncPublicStock(updatedStock);

    logAudit({
      action: 'WAREHOUSE_DELETE',
      actionTitle: `Удален склад "${target.name}"`,
      summary: `Склад ${target.name} удален из системы`,
      sessionId: req.session.sessionId
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting warehouse:', err);
    res.status(500).json({ error: 'Ошибка удаления склада' });
  }
});

// 4.5. Get region-to-warehouse mapping
app.get('/api/region-warehouse-map', (req, res) => {
  try {
    const defaultMap = {
      siberia: 'novosibirsk',
      kz: 'almaty',
      almaty: 'almaty',
      moscow: 'moscow',
      china: 'china',
      uae: null,
      usa: null
    };
    const mapping = readJson(REGION_MAP_FILE, defaultMap);
    res.json({ mapping });
  } catch (err) {
    console.error('Error fetching region-warehouse map:', err);
    res.status(500).json({ error: 'Ошибка получения таблицы соответствия регионов и складов' });
  }
});

// Update region-to-warehouse mapping
app.put('/api/region-warehouse-map', verifyAuth, (req, res) => {
  try {
    const { mapping } = req.body;
    if (!mapping || typeof mapping !== 'object') {
      return res.status(400).json({ error: 'Некорректная структура таблицы соответствий' });
    }
    writeJson(REGION_MAP_FILE, mapping);
    syncPublicRegionMap(mapping);
    logAudit({
      action: 'UPDATE_REGION_WAREHOUSE_MAP',
      actionTitle: 'Обновлена таблица соответствия регионов складам LAUTE',
      summary: 'Сохранены правила привязки регионов к складам по умолчанию',
      sessionId: req.session?.sessionId
    });
    res.json({ success: true, mapping });
  } catch (err) {
    console.error('Error saving region-warehouse map:', err);
    res.status(500).json({ error: 'Ошибка сохранения таблицы соответствия регионов и складов' });
  }
});

// 5. Get stock entries
app.get('/api/stock', (req, res) => {
  try {
    const { warehouseId, sku } = req.query;
    let stock = readJson(STOCK_FILE, []);

    if (warehouseId) {
      stock = stock.filter(s => s.warehouseId === warehouseId);
    }
    if (sku) {
      stock = stock.filter(s => s.sku === sku);
    }

    res.json({ stock });
  } catch (err) {
    console.error('Error fetching stock:', err);
    res.status(500).json({ error: 'Ошибка получения складских остатков' });
  }
});

// 6. Update single stock entry
app.put('/api/stock', verifyAuth, (req, res) => {
  try {
    const { warehouseId, sku, quantity } = req.body;
    if (!warehouseId || !sku) {
      return res.status(400).json({ error: 'Не указан склад или артикул' });
    }

    const qtyNumber = quantity === null || quantity === '' ? null : Math.max(0, parseInt(quantity, 10) || 0);
    const warehouses = readJson(WAREHOUSES_FILE, []);
    const targetWh = warehouses.find(w => w.id === warehouseId);
    if (!targetWh) {
      return res.status(400).json({ error: 'Указанный склад не существует' });
    }

    const stock = readJson(STOCK_FILE, []);
    const idx = stock.findIndex(s => s.warehouseId === warehouseId && s.sku === sku);
    const now = new Date().toISOString();

    let updatedItem;
    if (idx !== -1) {
      updatedItem = {
        ...stock[idx],
        quantity: qtyNumber,
        updatedAt: now,
        updatedBy: req.session?.role || 'Сотрудник'
      };
      stock[idx] = updatedItem;
    } else {
      updatedItem = {
        warehouseId,
        sku,
        quantity: qtyNumber,
        updatedAt: now,
        updatedBy: req.session?.role || 'Сотрудник'
      };
      stock.push(updatedItem);
    }

    writeJson(STOCK_FILE, stock);
    syncPublicStock(stock);

    // Sync cityStock in products if matching city
    const products = readJson(PRODUCTS_FILE, []);
    const pIdx = products.findIndex(p => p.article === sku);
    if (pIdx !== -1 && targetWh.name) {
      if (!products[pIdx].cityStock) products[pIdx].cityStock = {};
      products[pIdx].cityStock[targetWh.name] = qtyNumber ?? 0;
      writeJson(PRODUCTS_FILE, products);
      syncPublicCatalog(products);
    }

    logAudit({
      action: 'STOCK_UPDATE',
      actionTitle: `Остаток ${sku} на складе ${targetWh.name}`,
      summary: `Изменено количество товара ${sku} на складе ${targetWh.name}: ${qtyNumber ?? 'не указано'} шт.`,
      sessionId: req.session.sessionId
    });

    res.json({ success: true, stockItem: updatedItem });
  } catch (err) {
    console.error('Error updating stock item:', err);
    res.status(500).json({ error: 'Ошибка обновления остатка' });
  }
});

// 7. Bulk update stock entries
app.post('/api/stock/bulk', verifyAuth, (req, res) => {
  try {
    const { warehouseId, items } = req.body;
    if (!warehouseId || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Некорректные параметры обновления остатков' });
    }

    const warehouses = readJson(WAREHOUSES_FILE, []);
    const targetWh = warehouses.find(w => w.id === warehouseId);
    if (!targetWh) {
      return res.status(400).json({ error: 'Склад не найден' });
    }

    const stock = readJson(STOCK_FILE, []);
    const stockMap = new Map();
    stock.forEach((s, i) => stockMap.set(`${s.warehouseId}::${s.sku}`, i));

    const now = new Date().toISOString();
    items.forEach(item => {
      const sku = item.sku;
      const qtyNumber = item.quantity === null || item.quantity === '' ? null : Math.max(0, parseInt(item.quantity, 10) || 0);
      const key = `${warehouseId}::${sku}`;

      if (stockMap.has(key)) {
        const idx = stockMap.get(key);
        stock[idx] = {
          ...stock[idx],
          quantity: qtyNumber,
          updatedAt: now,
          updatedBy: req.session?.role || 'Сотрудник'
        };
      } else {
        stock.push({
          warehouseId,
          sku,
          quantity: qtyNumber,
          updatedAt: now,
          updatedBy: req.session?.role || 'Сотрудник'
        });
        stockMap.set(key, stock.length - 1);
      }
    });

    writeJson(STOCK_FILE, stock);
    syncPublicStock(stock);

    logAudit({
      action: 'STOCK_BULK_UPDATE',
      actionTitle: `Массовое сохранение остатков (${targetWh.name})`,
      summary: `Обновлены остатки для ${items.length} товаров на складе ${targetWh.name}`,
      sessionId: req.session.sessionId
    });

    res.json({ success: true, count: items.length });
  } catch (err) {
    console.error('Error bulk updating stock:', err);
    res.status(500).json({ error: 'Ошибка массового сохранения остатков' });
  }
});

// 8. Download Warehouse Stock Template (Mode A single or Mode B all warehouses)
app.get('/api/stock/excel/template', async (req, res) => {
  try {
    const warehouseId = req.query.warehouseId || 'almaty';
    const isAllMode = warehouseId === 'all' || req.query.mode === 'all';
    const warehouses = readJson(WAREHOUSES_FILE, []);
    const products = readJson(PRODUCTS_FILE, []);
    const stock = readJson(STOCK_FILE, []);

    let workbook;
    let filename;

    if (isAllMode) {
      workbook = await createAllWarehousesStockWorkbook(warehouses, products, stock);
      filename = 'LAUTE_Stock_Template_ALL_WAREHOUSES.xlsx';
    } else {
      const warehouse = warehouses.find(w => w.id === warehouseId) || warehouses[0] || { id: 'almaty', name: 'Алматы' };
      workbook = await createWarehouseStockWorkbook(warehouse, products, stock);
      filename = `LAUTE_Stock_Template_${warehouse.id}.xlsx`;
    }

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Error generating stock template:', err);
    res.status(500).json({ error: 'Ошибка генерации шаблона остатков' });
  }
});

// 9. Export Warehouse Stock (Mode A single or Mode B all warehouses)
app.get('/api/stock/excel/export', async (req, res) => {
  try {
    const warehouseId = req.query.warehouseId || 'almaty';
    const isAllMode = warehouseId === 'all' || req.query.mode === 'all';
    const warehouses = readJson(WAREHOUSES_FILE, []);
    const products = readJson(PRODUCTS_FILE, []);
    const stock = readJson(STOCK_FILE, []);
    const dateStr = new Date().toISOString().slice(0, 10);

    let workbook;
    let filename;

    if (isAllMode) {
      workbook = await createAllWarehousesStockWorkbook(warehouses, products, stock);
      filename = `LAUTE_Stock_ALL_WAREHOUSES_${dateStr}.xlsx`;
    } else {
      const warehouse = warehouses.find(w => w.id === warehouseId) || warehouses[0] || { id: 'almaty', name: 'Алматы' };
      workbook = await createWarehouseStockWorkbook(warehouse, products, stock);
      filename = `LAUTE_Stock_${warehouse.id}_${dateStr}.xlsx`;
    }

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Error exporting stock:', err);
    res.status(500).json({ error: 'Ошибка экспорта остатков' });
  }
});

// 10. Validate Warehouse Stock Excel File (Supports Mode A and Mode B)
app.post('/api/stock/excel/validate', verifyAuth, uploadExcel.single('file'), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'Файл Excel не передан' });
    }

    const warehouseId = req.body.warehouseId || req.query.warehouseId || 'all';
    const warehouses = readJson(WAREHOUSES_FILE, []);
    const warehouse = warehouses.find(w => w.id === warehouseId) || warehouses[0];

    const currentProducts = readJson(PRODUCTS_FILE, []);
    const currentStock = readJson(STOCK_FILE, []);

    const result = await parseAndValidateWarehouseStockExcelBuffer(
      req.file.buffer,
      warehouse,
      currentProducts,
      currentStock,
      warehouses
    );

    res.json(result);
  } catch (err) {
    console.error('Error validating stock Excel:', err);
    res.status(400).json({ error: err.message || 'Ошибка валидации Excel-файла остатков' });
  }
});

// 11. Commit Warehouse Stock Changes (Supports Mode A and Mode B)
app.post('/api/stock/excel/commit', verifyAuth, (req, res) => {
  try {
    const { warehouseId, diffList, mode } = req.body; // mode: 'partial' (default) | 'replace'
    if (!Array.isArray(diffList)) {
      return res.status(400).json({ error: 'Некорректные данные для подтверждения обновления остатков' });
    }

    const warehouses = readJson(WAREHOUSES_FILE, []);
    const stock = readJson(STOCK_FILE, []);
    const now = new Date().toISOString();
    const stockMap = new Map();
    stock.forEach((s, i) => stockMap.set(`${s.warehouseId}::${s.sku}`, i));

    const updatedWarehouseSet = new Set();
    const updatedSkuSet = new Set();

    diffList.forEach(item => {
      const targetWhId = item.warehouseId || warehouseId;
      const sku = item.sku;
      const qtyNumber = Math.max(0, parseInt(item.newQuantity, 10) || 0);
      const key = `${targetWhId}::${sku}`;

      updatedWarehouseSet.add(targetWhId);
      updatedSkuSet.add(`${targetWhId}::${sku}`);

      if (stockMap.has(key)) {
        const idx = stockMap.get(key);
        stock[idx] = {
          ...stock[idx],
          quantity: qtyNumber,
          updatedAt: now,
          updatedBy: req.session?.role || 'Импорт Excel'
        };
      } else {
        stock.push({
          warehouseId: targetWhId,
          sku,
          quantity: qtyNumber,
          updatedAt: now,
          updatedBy: req.session?.role || 'Импорт Excel'
        });
        stockMap.set(key, stock.length - 1);
      }
    });

    // In 'replace' mode, zero out SKUs on affected warehouse(s) that were NOT in the Excel file
    if (mode === 'replace') {
      stock.forEach((s, idx) => {
        if (updatedWarehouseSet.has(s.warehouseId) && !updatedSkuSet.has(`${s.warehouseId}::${s.sku}`)) {
          stock[idx] = {
            ...s,
            quantity: 0,
            updatedAt: now,
            updatedBy: 'Полная замена Excel (обнуление)'
          };
        }
      });
    }

    writeJson(STOCK_FILE, stock);
    syncPublicStock(stock);

    // Sync cityStock in catalog products for active warehouses
    const products = readJson(PRODUCTS_FILE, []);
    let productsModified = false;
    products.forEach((prod, pIdx) => {
      if (!prod.cityStock) prod.cityStock = {};
      warehouses.forEach(wh => {
        const itemStock = stock.find(s => s.warehouseId === wh.id && s.sku === prod.article);
        if (itemStock && wh.name) {
          prod.cityStock[wh.name] = itemStock.quantity ?? 0;
          productsModified = true;
        }
      });
    });
    if (productsModified) {
      writeJson(PRODUCTS_FILE, products);
      syncPublicCatalog(products);
    }

    const whSummaryName = warehouseId === 'all' 
      ? 'Все склады' 
      : (warehouses.find(w => w.id === warehouseId)?.name || warehouseId);

    logAudit({
      action: 'STOCK_EXCEL_IMPORT',
      actionTitle: `Импорт Excel остатков (${whSummaryName})`,
      summary: `Применено обновление остатков из Excel для (${whSummaryName}): ${diffList.length} позиций (${mode === 'replace' ? 'полная замена' : 'частичное обновление'})`,
      sessionId: req.session.sessionId
    });

    res.json({ success: true, updatedCount: diffList.length, mode, warehousesAffected: updatedWarehouseSet.size });
  } catch (err) {
    console.error('Error committing stock changes:', err);
    res.status(500).json({ error: 'Ошибка сохранения изменений остатков' });
  }
});

// ==========================================
// 6. MEDIA MANAGER ROUTES
// ==========================================

app.get('/api/media', verifyAuth, (req, res) => {
  try {
    const files = [];

    const scanDir = (dirPath, publicPrefix) => {
      if (!fs.existsSync(dirPath)) return;
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif', '.avif'].includes(ext)) {
            const fullPath = path.join(dirPath, entry.name);
            const stats = fs.statSync(fullPath);
            files.push({
              name: entry.name,
              url: `${publicPrefix}/${entry.name}`,
              size: stats.size,
              createdAt: stats.birthtime || stats.mtime,
              directory: publicPrefix
            });
          }
        }
      }
    };

    scanDir(UPLOAD_MEDIA_DIR, 'images/uploads');
    scanDir(UPLOAD_CATALOG_DIR, 'images/catalog');
    scanDir(path.resolve(__dirname, '..', 'public', 'images'), 'images');
    scanDir(path.resolve(__dirname, '..', 'public', 'images', 'collections'), 'images/collections');
    scanDir(path.resolve(__dirname, '..', 'public', 'images', 'hero'), 'images/hero');

    files.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ files });
  } catch (err) {
    console.error('Error listing media:', err);
    res.status(500).json({ error: 'Ошибка чтения медиафайлов' });
  }
});

app.post('/api/media/upload', verifyAuth, uploadMedia.array('files', 15), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Файлы для загрузки не переданы' });
    }

    const uploaded = req.files.map(f => ({
      name: f.filename,
      url: `images/uploads/${f.filename}`,
      size: f.size
    }));

    addAuditLog({
      action: 'MEDIA_UPLOAD',
      actionTitle: `Загрузка медиа (${uploaded.length} файлов)`,
      summary: uploaded.map(u => u.name).join(', '),
      sessionId: req.session.sessionId
    });

    res.json({ success: true, files: uploaded });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/media/:filename', verifyAuth, (req, res) => {
  const { filename } = req.params;
  const safeFilename = path.basename(filename);

  let targetPath = path.resolve(UPLOAD_MEDIA_DIR, safeFilename);
  if (!fs.existsSync(targetPath)) {
    targetPath = path.resolve(UPLOAD_CATALOG_DIR, safeFilename);
  }

  if (fs.existsSync(targetPath)) {
    fs.unlinkSync(targetPath);
    addAuditLog({
      action: 'MEDIA_DELETE',
      actionTitle: `Удален файл ${safeFilename}`,
      summary: `Файл удален из хранилища медиа`,
      sessionId: req.session.sessionId
    });
    return res.json({ success: true });
  }

  res.status(404).json({ error: 'Файл не найден' });
});

// ==========================================
// 7. HISTORY & ROLLBACK ROUTES
// ==========================================

app.get('/api/history', verifyAuth, (req, res) => {
  const logs = readJson(AUDIT_FILE, []);

  // Scan backups folder
  let backups = [];
  try {
    const files = fs.readdirSync(BACKUPS_DIR);
    backups = files
      .filter(f => f.endsWith('.json'))
      .map(f => {
        try {
          const content = JSON.parse(fs.readFileSync(path.resolve(BACKUPS_DIR, f), 'utf8'));
          return {
            backupId: content.backupId || f.replace('.json', ''),
            timestamp: content.timestamp,
            description: content.description,
            sessionId: content.sessionId || 'Система',
            productsCount: content.productsCount
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch (err) {
    console.error('Error reading backups:', err);
  }

  res.json({ logs, backups });
});

app.post('/api/history/rollback', verifyAuth, (req, res) => {
  const { backupId } = req.body;
  if (!backupId) {
    return res.status(400).json({ error: 'Укажите ID резервной копии каталога' });
  }

  const backupFilePath = path.resolve(BACKUPS_DIR, `${backupId}.json`);
  if (!fs.existsSync(backupFilePath)) {
    return res.status(404).json({ error: `Файл резервной копии ${backupId} не найден на сервере` });
  }

  try {
    const backupContent = JSON.parse(fs.readFileSync(backupFilePath, 'utf8'));
    if (!backupContent.products || !Array.isArray(backupContent.products)) {
      return res.status(500).json({ error: 'Поврежденная структура файла резервной копии' });
    }

    // Backup current state first
    const currentProducts = readJson(PRODUCTS_FILE, []);
    createBackupSnapshot(currentProducts, `Авто-снимок перед откатом к ${backupId}`, req.session.sessionId);

    // Apply restored products
    writeJson(PRODUCTS_FILE, backupContent.products);
    syncPublicCatalog(backupContent.products);

    addAuditLog({
      action: 'ROLLBACK',
      actionTitle: `Откат каталога к снимку ${backupId}`,
      summary: `Каталог восстановлен к состоянию от ${backupContent.timestamp || backupId}. Позиций: ${backupContent.products.length}`,
      sessionId: req.session.sessionId,
      backupId
    });

    res.json({
      success: true,
      restoredCount: backupContent.products.length,
      products: backupContent.products
    });
  } catch (err) {
    console.error('Error during rollback:', err);
    res.status(500).json({ error: `Ошибка при восстановлении: ${err.message}` });
  }
});

// ==========================================
// 8. SETTINGS & SYSTEM BACKUP
// ==========================================

app.get('/api/settings/system', verifyAuth, (req, res) => {
  const products = readJson(PRODUCTS_FILE, []);
  const pages = getCustomPages();
  const categories = getCategories();
  const content = getPublishedContent();
  const draft = getDraftContent();

  res.json({
    productsCount: products.length,
    activeProductsCount: products.filter(p => p.status !== 'СКРЫТ').length,
    hiddenProductsCount: products.filter(p => p.status === 'СКРЫТ').length,
    pagesCount: pages.length + 7, // 7 main pages + custom
    categoriesCount: categories.length,
    siteVersion: content.version || '1.0.0',
    lastPublishedAt: content.lastPublishedAt,
    hasUnpublishedChanges: Boolean(draft.hasUnpublishedChanges),
    serverUptime: process.uptime(),
    nodeVersion: process.version
  });
});

// Full system JSON export
app.get('/api/settings/export-all', verifyAuth, (req, res) => {
  const products = readJson(PRODUCTS_FILE, []);
  const pages = getCustomPages();
  const categories = getCategories();
  const content = getPublishedContent();
  const draft = getDraftContent();

  const fullBackup = {
    backupDate: new Date().toISOString(),
    version: content.version || '1.0.0',
    products,
    pages,
    categories,
    content,
    draft
  };

  const filename = `LAUTE_FULL_BACKUP_${new Date().toISOString().slice(0, 10)}.json`;
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(fullBackup, null, 2));
});

export { app };

// Start Express server if run standalone (or explicitly requested)
const isDirectRun = Boolean(process.argv[1] && (
  process.argv[1].endsWith('server/index.js') || 
  process.argv[1].endsWith('server\\index.js') ||
  process.argv[1].endsWith('index.js')
));

if (process.env.VITE_EMBEDDED !== 'true' && (isDirectRun || process.env.RUN_STANDALONE_SERVER === 'true' || !process.env.VITE)) {
  app.listen(PORT, () => {
    console.log(`🚀 LAUTE Master Administration Server запущен на http://localhost:${PORT}`);
    console.log(`🔒 Авторизация: scrypt-хеширование с защитой от перебора (rate limiting)`);
    console.log(`📁 Хранилище данных: ${DATA_DIR}`);
  });
}

