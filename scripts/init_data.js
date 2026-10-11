import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DEFAULT_PRODUCTS } from '../src/data/catalogData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const enrichedProducts = DEFAULT_PRODUCTS.map((p, idx) => ({
  ...p,
  subcategory: p.subcategory || (p.category.includes('Кухонные') ? 'С поворотным изливом' : p.category.includes('Душевые') ? 'Душевая колонна' : 'Стандарт'),
  collection: p.collection || 'LAUTE Master Line',
  brand: p.brand || 'LAUTE',
  material: p.material || 'Первичная латунь CW617N (евростандарт)',
  color: p.color || 'Хром глянец',
  finish: p.finish || 'Гальванический хром',
  installType: p.installType || (p.category.includes('ванны') ? 'Настенный наружный монтаж' : 'Врезной на мойку / умывальник'),
  purpose: p.purpose || p.category,
  seoTitle: p.seoTitle || `${p.name} — купить от официального производителя LAUTE`,
  seoDesc: p.seoDesc || `${p.name}: европейское качество LAUTE, латунь CW617N, заводская гарантия 5 лет.`,
  url: p.url || `/catalog#${p.article}`,
  updatedAt: new Date().toISOString(),
  updatedBy: 'Система (первичная загрузка)'
}));

const serverDataDir = path.resolve(__dirname, '..', 'server', 'data');
const backupsDir = path.resolve(serverDataDir, 'backups');
const publicDataDir = path.resolve(__dirname, '..', 'public', 'data');

if (!fs.existsSync(serverDataDir)) fs.mkdirSync(serverDataDir, { recursive: true });
if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });
if (!fs.existsSync(publicDataDir)) fs.mkdirSync(publicDataDir, { recursive: true });

fs.writeFileSync(path.resolve(serverDataDir, 'products.json'), JSON.stringify(enrichedProducts, null, 2), 'utf8');
fs.writeFileSync(path.resolve(publicDataDir, 'catalog.json'), JSON.stringify(enrichedProducts, null, 2), 'utf8');

const initialLog = [
  {
    id: 'log-init-01',
    timestamp: new Date().toISOString(),
    user: 'Иван Смирнов',
    userEmail: 'admin@laute.com',
    action: 'INIT',
    actionTitle: 'Первичная инициализация каталога',
    summary: `Загружено ${enrichedProducts.length} базовых номенклатурных позиций LAUTE`,
    details: 'Сформирована эталонная структура базы данных в соответствии с регламентом LAUTE.'
  }
];

fs.writeFileSync(path.resolve(serverDataDir, 'audit_log.json'), JSON.stringify(initialLog, null, 2), 'utf8');
console.log('✅ Данные каталога инициализированы:', enrichedProducts.length, 'товаров');
