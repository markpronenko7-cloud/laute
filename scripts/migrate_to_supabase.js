import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = 'https://sxaczlnytwavpzclqlvu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4YWN6bG55dHdhdnB6Y2xxbHZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxNDk1NTgsImV4cCI6MjEwNzcyNTU1OH0.omIWsuuMxpVTFd8nQnjkccYIFXPEbRlybxjHff0qndU';

const DATA_DIR = path.resolve(__dirname, '..', 'server', 'data');
const BACKUP_DIR = path.resolve(__dirname, '..', 'server', 'data', 'backups', `pre_supabase_${Date.now()}`);

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function readJson(fileName, defaultVal = []) {
  const filePath = path.resolve(DATA_DIR, fileName);
  if (fs.existsSync(filePath)) {
    // Backup first
    fs.copyFileSync(filePath, path.resolve(BACKUP_DIR, fileName));
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  return defaultVal;
}

async function callRpc(fnName, args) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fnName}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(args)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`RPC ${fnName} failed [${res.status}]: ${errText}`);
  }

  return await res.json();
}

async function runMigration() {
  console.log('📦 Начинаем безопасную миграцию данных LAUTE в Supabase...');
  console.log(`📁 Резервная копия локальных файлов сохранена в: ${BACKUP_DIR}`);

  // 1. Login to get token
  console.log('🔑 Авторизация в Supabase...');
  const password = process.env.LAUTE_ADMIN_PASSWORD || process.argv[2] || '';
  const loginRes = await callRpc('laute_login', { p_password: password });
  if (!loginRes.success || !loginRes.token) {
    throw new Error(`Ошибка авторизации: ${loginRes.error}`);
  }
  const token = loginRes.token;
  console.log(`✅ Авторизован токен: ${token.slice(0, 10)}...`);

  // 2. Warehouses
  const warehouses = readJson('warehouses.json', []);
  console.log(`🏢 Перенос складов (${warehouses.length})...`);
  await callRpc('laute_save_warehouses', { p_token: token, p_warehouses: warehouses });
  console.log('✅ Склады сохранены в Supabase');

  // 3. Stock
  const stock = readJson('warehouse_stock.json', []);
  console.log(`📊 Перенос остатков (${stock.length})...`);
  await callRpc('laute_save_stock', { p_token: token, p_stocks: stock });
  console.log('✅ Остатки сохранены в Supabase');

  // 4. Region Map
  const regionMap = readJson('region_warehouse_map.json', {});
  console.log('🗺️ Перенос карты регионов...');
  await callRpc('laute_save_region_map', { p_token: token, p_mapping: regionMap });
  console.log('✅ Карта регионов сохранена в Supabase');

  // 5. Categories
  const categories = readJson('categories.json', []);
  console.log(`📑 Перенос категорий (${categories.length})...`);
  await callRpc('laute_save_categories', { p_token: token, p_categories: categories });
  console.log('✅ Категории сохранены в Supabase');

  // 6. Custom Pages
  const pages = readJson('custom_pages.json', []);
  console.log(`📄 Перенос страниц (${pages.length})...`);
  await callRpc('laute_save_custom_pages', { p_token: token, p_pages: pages });
  console.log('✅ Страницы сохранены в Supabase');

  // 7. Products Catalog
  const products = readJson('products.json', []);
  console.log(`📦 Перенос каталога товаров (${products.length})...`);
  const prodRes = await callRpc('laute_save_products_batch', {
    p_token: token,
    p_products: products,
    p_backup_desc: 'Первоначальная миграция каталога в Supabase'
  });
  console.log(`✅ Каталог товаров сохранен в Supabase (${prodRes.count} товаров)`);

  // 8. Site Content (Draft & Publish)
  const content = readJson('content.json', {});
  console.log('📝 Перенос и публикация контента сайта...');
  await callRpc('laute_save_content_draft', { p_token: token, p_updates: content });
  const pubRes = await callRpc('laute_publish_content', { p_token: token });
  console.log(`✅ Контент опубликован в Supabase, версия: ${pubRes.version}`);

  console.log('\n🎉 ВСЕ ДАННЫЕ УСПЕШНО МИГРИРОВАНЫ В SUPABASE!');
}

runMigration().catch(err => {
  console.error('❌ Ошибка миграции:', err);
  process.exit(1);
});
