import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  createExportWorkbook, 
  parseAndValidateExcelBuffer, 
  createErrorReportWorkbook 
} from './excelService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Paths
const DATA_DIR = path.resolve(__dirname, 'data');
const BACKUPS_DIR = path.resolve(DATA_DIR, 'backups');
const PRODUCTS_FILE = path.resolve(DATA_DIR, 'products.json');
const USERS_FILE = path.resolve(DATA_DIR, 'users.json');
const AUDIT_FILE = path.resolve(DATA_DIR, 'audit_log.json');
const PUBLIC_CATALOG_FILE = path.resolve(__dirname, '..', 'public', 'data', 'catalog.json');
const UPLOAD_DIR = path.resolve(__dirname, '..', 'public', 'images', 'catalog');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(BACKUPS_DIR)) fs.mkdirSync(BACKUPS_DIR, { recursive: true });
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded images statically
app.use('/images/catalog', express.static(UPLOAD_DIR));

// Configure Multer for Excel in-memory and images on-disk
const memStorage = multer.memoryStorage();
const uploadExcel = multer({ storage: memStorage, limits: { fileSize: 25 * 1024 * 1024 } });

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `prod_${Date.now()}_${cleanName}${ext}`);
  }
});
const uploadImage = multer({ storage: diskStorage, limits: { fileSize: 10 * 1024 * 1024 } });

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

function createBackupSnapshot(products, description, author) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupId = `backup_${timestamp}`;
  const backupPath = path.resolve(BACKUPS_DIR, `${backupId}.json`);

  const snapshot = {
    backupId,
    timestamp: new Date().toISOString(),
    description,
    author: author || 'Система',
    productsCount: products.length,
    products
  };

  fs.writeFileSync(backupPath, JSON.stringify(snapshot, null, 2), 'utf8');
  return backupId;
}

function addAuditLog(entry) {
  const logs = readJson(AUDIT_FILE, []);
  const newLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
    ...entry
  };
  logs.unshift(newLog);
  // Keep last 300 entries
  if (logs.length > 300) logs.length = 300;
  writeJson(AUDIT_FILE, logs);
  return newLog;
}

// In-memory sessions / token store
const activeSessions = new Map();

function verifyAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Требуется авторизация сотрудника LAUTE' });
  }
  const token = authHeader.split(' ')[1];
  const session = activeSessions.get(token);
  if (!session) {
    return res.status(401).json({ error: 'Сессия истекла или недействительна. Войдите снова.' });
  }
  req.user = session.user;
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Недостаточно прав. Действие доступно только Администратору.' });
  }
  next();
}

// ==========================================
// ROUTES
// ==========================================

// 1. Health & Info
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString(), service: 'LAUTE Catalog Management API' });
});

// 2. Auth: Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Укажите рабочий e-mail и пароль' });
  }

  const users = readJson(USERS_FILE, []);
  const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

  if (!user || user.password !== password.trim()) {
    return res.status(401).json({ error: 'Неверный логин или пароль сотрудника' });
  }

  const token = `tok_${user.role}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const userProfile = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    title: user.title
  };

  activeSessions.set(token, { user: userProfile, createdAt: Date.now() });

  // Update last login in users file
  user.lastLogin = new Date().toISOString();
  writeJson(USERS_FILE, users);

  addAuditLog({
    user: user.name,
    userEmail: user.email,
    action: 'LOGIN',
    actionTitle: 'Вход сотрудника в панель управления',
    summary: `Сотрудник ${user.name} (${user.title}) авторизовался в системе`,
    details: `Роль: ${user.role}`
  });

  res.json({
    success: true,
    token,
    user: userProfile
  });
});

// 3. Auth: Current User Profile
app.get('/api/auth/me', verifyAuth, (req, res) => {
  res.json({ user: req.user });
});

// 4. Staff Management (Admin only)
app.get('/api/users', verifyAuth, requireAdmin, (req, res) => {
  const users = readJson(USERS_FILE, []);
  const sanitized = users.map(u => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    title: u.title,
    createdAt: u.createdAt,
    lastLogin: u.lastLogin
  }));
  res.json({ users: sanitized });
});

app.post('/api/users', verifyAuth, requireAdmin, (req, res) => {
  const { email, password, name, role, title } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Все поля обязательны' });
  }
  const users = readJson(USERS_FILE, []);
  if (users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
    return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    email: email.trim(),
    password: password.trim(),
    name: name.trim(),
    role: role === 'admin' ? 'admin' : 'editor',
    title: title || (role === 'admin' ? 'Администратор' : 'Редактор каталога'),
    createdAt: new Date().toISOString(),
    lastLogin: null
  };

  users.push(newUser);
  writeJson(USERS_FILE, users);

  addAuditLog({
    user: req.user.name,
    userEmail: req.user.email,
    action: 'USER_ADD',
    actionTitle: 'Создан новый аккаунт сотрудника',
    summary: `Добавлен сотрудник: ${newUser.name} (${newUser.email}) с ролью ${newUser.role}`,
    details: ''
  });

  res.json({ success: true, user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role, title: newUser.title } });
});

// 5. Products: List
app.get('/api/products', (req, res) => {
  const products = readJson(PRODUCTS_FILE, []);
  // Support query param ?includeHidden=false for public storefront
  const includeHidden = req.query.includeHidden !== 'false';
  if (!includeHidden) {
    const activeOnly = products.filter(p => p.status !== 'СКРЫТ');
    return res.json({ products: activeOnly });
  }
  res.json({ products });
});

// 6. Products: Add Single Product
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

  const backupId = createBackupSnapshot(products, `Создание товара ${cleanArticle}`, req.user.name);

  const productToSave = {
    ...newProd,
    article: cleanArticle,
    price: Number(newProd.price),
    currency: newProd.currency || '₸',
    status: newProd.status || 'АКТИВЕН',
    updatedAt: new Date().toISOString(),
    updatedBy: req.user.name
  };

  products.unshift(productToSave);
  writeJson(PRODUCTS_FILE, products);
  syncPublicCatalog(products);

  addAuditLog({
    user: req.user.name,
    userEmail: req.user.email,
    action: 'PRODUCT_CREATE',
    actionTitle: `Добавлен товар ${cleanArticle}`,
    summary: `Создана карточка товара "${productToSave.name}" (${productToSave.price} ${productToSave.currency})`,
    details: `Категория: ${productToSave.category}`,
    backupId
  });

  res.json({ success: true, product: productToSave, backupId });
});

// 7. Products: Update Single Product
app.put('/api/products/:sku', verifyAuth, (req, res) => {
  const { sku } = req.params;
  const updates = req.body;
  const products = readJson(PRODUCTS_FILE, []);

  const idx = products.findIndex(p => p.article.trim().toUpperCase() === sku.trim().toUpperCase());
  if (idx === -1) {
    return res.status(404).json({ error: `Товар с артикулом "${sku}" не найден` });
  }

  const oldProduct = products[idx];
  const backupId = createBackupSnapshot(products, `Редактирование товара ${sku}`, req.user.name);

  const updatedProduct = {
    ...oldProduct,
    ...updates,
    article: oldProduct.article, // SKU is immutable via update
    price: updates.price !== undefined ? Number(updates.price) : oldProduct.price,
    updatedAt: new Date().toISOString(),
    updatedBy: req.user.name
  };

  products[idx] = updatedProduct;
  writeJson(PRODUCTS_FILE, products);
  syncPublicCatalog(products);

  // Detect diff
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
    user: req.user.name,
    userEmail: req.user.email,
    action: 'PRODUCT_UPDATE',
    actionTitle: `Обновлен товар ${sku}`,
    summary: diffs.length > 0 ? diffs.join('; ') : 'Характеристики и описание обновлены',
    details: `Товар: ${updatedProduct.name}`,
    backupId
  });

  res.json({ success: true, product: updatedProduct, backupId });
});

// 8. Products: Toggle Status (Hide / Show)
app.patch('/api/products/:sku/status', verifyAuth, (req, res) => {
  const { sku } = req.params;
  const { status } = req.body; // 'АКТИВЕН' or 'СКРЫТ'
  const products = readJson(PRODUCTS_FILE, []);

  const prod = products.find(p => p.article.trim().toUpperCase() === sku.trim().toUpperCase());
  if (!prod) {
    return res.status(404).json({ error: `Товар ${sku} не найден` });
  }

  const targetStatus = status || (prod.status === 'СКРЫТ' ? 'АКТИВЕН' : 'СКРЫТ');
  const backupId = createBackupSnapshot(products, `Изменение статуса ${sku} -> ${targetStatus}`, req.user.name);

  prod.status = targetStatus;
  prod.updatedAt = new Date().toISOString();
  prod.updatedBy = req.user.name;

  writeJson(PRODUCTS_FILE, products);
  syncPublicCatalog(products);

  addAuditLog({
    user: req.user.name,
    userEmail: req.user.email,
    action: 'STATUS_CHANGE',
    actionTitle: targetStatus === 'СКРЫТ' ? `Скрыт товар ${sku}` : `Возвращен в каталог ${sku}`,
    summary: `Товар "${prod.name}" переведен в статус "${targetStatus}"`,
    details: '',
    backupId
  });

  res.json({ success: true, product: prod, backupId });
});

// 9. Products: Delete Single Product
app.delete('/api/products/:sku', verifyAuth, (req, res) => {
  const { sku } = req.params;
  const products = readJson(PRODUCTS_FILE, []);

  const idx = products.findIndex(p => p.article.trim().toUpperCase() === sku.trim().toUpperCase());
  if (idx === -1) {
    return res.status(404).json({ error: `Товар ${sku} не найден` });
  }

  const removed = products[idx];
  const backupId = createBackupSnapshot(products, `Удаление товара ${sku}`, req.user.name);

  products.splice(idx, 1);
  writeJson(PRODUCTS_FILE, products);
  syncPublicCatalog(products);

  addAuditLog({
    user: req.user.name,
    userEmail: req.user.email,
    action: 'PRODUCT_DELETE',
    actionTitle: `Удален товар ${sku}`,
    summary: `Товар "${removed.name}" удален из базы каталога`,
    details: `Создана резервная копия: ${backupId}`,
    backupId
  });

  res.json({ success: true, backupId });
});

// 10. Image Upload
app.post('/api/upload', verifyAuth, uploadImage.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Файл изображения не передан' });
  }
  const relativePath = `images/catalog/${req.file.filename}`;
  res.json({
    success: true,
    url: relativePath,
    filename: req.file.filename
  });
});

// 11. Excel: Download Template
app.get('/api/excel/template', (req, res) => {
  const templatePath = path.resolve(__dirname, '..', 'LAUTE_Catalog.xlsx');
  if (fs.existsSync(templatePath)) {
    res.setHeader('Content-Disposition', 'attachment; filename="LAUTE_Catalog.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return fs.createReadStream(templatePath).pipe(res);
  }
  res.status(404).json({ error: 'Файл шаблона не найден на сервере' });
});

// 12. Excel: Export Current Live Catalog
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

// 13. Excel: Pre-validate Uploaded File
app.post('/api/excel/validate', verifyAuth, uploadExcel.single('file'), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'Файл Excel не передан' });
    }

    const currentProducts = readJson(PRODUCTS_FILE, []);
    const result = await parseAndValidateExcelBuffer(req.file.buffer, currentProducts);

    // Save errors for report download
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

// 14. Excel: Commit Confirmed Import
app.post('/api/excel/commit', verifyAuth, (req, res) => {
  const { validRows } = req.body;
  if (!validRows || !Array.isArray(validRows) || validRows.length === 0) {
    return res.status(400).json({ error: 'Нет подтвержденных строк для применения' });
  }

  const products = readJson(PRODUCTS_FILE, []);
  const backupId = createBackupSnapshot(
    products, 
    `Импорт Excel (${validRows.length} позиций)`, 
    req.user.name
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
      // Обновление существующего товара
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
        updatedBy: req.user.name
      };

      if (updated.status === 'СКРЫТ' && existing.status !== 'СКРЫТ') {
        hiddenCount++;
      } else {
        updatedCount++;
      }
      productMap.set(upperSku, updated);
    } else {
      // Добавление нового товара
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
        material: row.material || 'Первичная латунь CW617N',
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
        updatedBy: req.user.name
      };
      productMap.set(upperSku, newProduct);
      addedCount++;
    }
  });

  // ВАЖНО: товары, которых не было в Excel, НЕ удаляются!
  const finalProducts = Array.from(productMap.values());

  writeJson(PRODUCTS_FILE, finalProducts);
  syncPublicCatalog(finalProducts);

  addAuditLog({
    user: req.user.name,
    userEmail: req.user.email,
    action: 'EXCEL_IMPORT',
    actionTitle: 'Успешный импорт Excel-каталога',
    summary: `Добавлено: +${addedCount}, Обновлено: ${updatedCount}, Скрыто: ${hiddenCount}, Удалено: ${deletedCount}. Всего в каталоге: ${finalProducts.length}`,
    details: `Применено из файла. Создана точка отката: ${backupId}`,
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

// 15. Excel: Download Error Report
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

// 16. Audit Log & Backups History
app.get('/api/history', verifyAuth, (req, res) => {
  const logs = readJson(AUDIT_FILE, []);
  
  // Also scan backups folder
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
            author: content.author,
            productsCount: content.productsCount
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch (err) {
    console.error('Error reading backups directory:', err);
  }

  res.json({ logs, backups });
});

// 17. History: Rollback to Backup (Admin only)
app.post('/api/history/rollback', verifyAuth, requireAdmin, (req, res) => {
  const { backupId } = req.body;
  if (!backupId) {
    return res.status(400).json({ error: 'Укажите ID резервной копии для восстановления' });
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

    // Create a new backup of current state before rollback!
    const currentProducts = readJson(PRODUCTS_FILE, []);
    createBackupSnapshot(currentProducts, `Авто-снимок перед откатом к ${backupId}`, req.user.name);

    // Apply restored products
    writeJson(PRODUCTS_FILE, backupContent.products);
    syncPublicCatalog(backupContent.products);

    addAuditLog({
      user: req.user.name,
      userEmail: req.user.email,
      action: 'ROLLBACK',
      actionTitle: `Откат каталога к снимку ${backupId}`,
      summary: `Каталог восстановлен к состоянию от ${backupContent.timestamp || backupId}. Позиций: ${backupContent.products.length}`,
      details: `Восстановлено сотрудником: ${req.user.name}`,
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

// Start Express server
app.listen(PORT, () => {
  console.log(`🚀 LAUTE Catalog Management Backend запущен на http://localhost:${PORT}`);
  console.log(`📁 Хранилище: ${DATA_DIR}`);
});
