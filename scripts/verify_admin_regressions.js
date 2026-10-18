import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import XLSX from 'xlsx';
import { build, transform } from 'esbuild';
import { createRequire } from 'node:module';
import { parseAndValidateExcelFile, applyExcelImport, createCatalogWorkbook } from '../src/utils/excelManager.js';
import { formatProductDisplay, classifyProductImages } from '../src/utils/imageHelper.js';
import { getNavigation, getNavTranslation, getPageSeo } from '../src/utils/contentSettings.js';

const workbook = rows => {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Товары');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
};
const headings = ['Артикул (SKU) *', 'Название товара *', 'Категория *', 'Цена *'];

test('CMS: подписи, видимость, локализация меню и обе схемы SEO', () => {
  const content = {
    navigation: [{ id: 'nav-catalog', route: 'catalog', label: 'Наш каталог', isVisible: false }, { id: 'nav-company', route: 'company', label: 'О нас' }],
    translations: { kz: { nav: { about: 'Біз туралы' } }, kk: { 'nav_nav-catalog': 'Каталог KZ' }, en: { nav: { about: 'About us' } } },
    seo: { pages: { company: { title: 'Прежний SEO', description: 'Описание' } }, about: { title: 'Сохранённый SEO' } }
  };
  assert.equal(getNavigation(content, 'ru', {}).find(p => p.route === 'company').label, 'О нас');
  assert.ok(!getNavigation(content, 'ru', {}).some(p => p.route === 'catalog'));
  assert.equal(getNavigation(content, 'kz', {}).find(p => p.route === 'company').label, 'Біз туралы');
  assert.equal(getNavTranslation(content, 'kz', content.navigation[0]), 'Каталог KZ');
  assert.equal(getPageSeo(content, 'company').title, 'Сохранённый SEO');
  assert.equal(getPageSeo(content, 'about').description, 'Описание');
  assert.equal(getNavigation({}, 'ru', {}).length, 7);
});

test('Категория Excel управляет типом изделия независимо от старого названия', async () => {
  const cases = [
    ['Смесители для ванны', 'Смеситель для ванны'],
    ['Универсальные смесители (ванна/раковина)', 'Универсальный смеситель'],
    ['Кухонные смесители', 'Смеситель для кухни'],
    ['Смесители для раковины', 'Смеситель для раковины'],
    ['Смесители для душа', 'Смеситель для душа'],
    ['Душевые системы и гарнитуры', 'Душевая система'],
    ...['Биде и гигиенический душ', 'Кухонные мойки', 'Картриджи', 'Аэраторы', 'Душевые шланги и лейки', 'Изливы для смесителей', 'Диверторы и эксцентрики', 'Бюджетные душевые кабины', 'Новая категория'].map(c => [c, 'Изделие'])
  ];
  for (const [category, title] of cases) {
    const name = title === 'Изделие' ? 'Изделие' : 'Смеситель для раковины';
    const parsed = await parseAndValidateExcelFile(workbook([headings, ['TEST-1', name, category, 100]]));
    assert.equal(parsed.success, true);
    const [product] = applyExcelImport([], parsed.validRows);
    assert.equal(product.category, category);
    assert.ok(formatProductDisplay(product).title.startsWith(title), category);
  }
});

test('Excel: точные колонки, все дополнительные поля, чертёж и отсутствие сброса остатков', async () => {
  const existing = { article: 'TEST-1', name: 'Изделие', category: 'Картриджи', price: 100, currency: '₽', brand: 'Aloute', url: '/custom-product', status: 'АКТИВЕН', cityStock: { Алматы: 7 }, photo1: 'images/item.jpg', description: 'До', specs: 'До' };
  const rows = [
    ['', 'SEO-описание', ...headings, 'Описание', 'Технические характеристики', 'Подкатегория', 'Статус товара', 'Статус действия', 'Чертёж', 'Упаковка', 'Вес (кг)', 'Дополнительные характеристики'],
    ['', 'SEO', 'TEST-1', 'Изделие', 'Картриджи', 100, 'После', 'Новые характеристики', '35 мм', 'АКТИВЕН', 'ОБНОВИТЬ', 'https://example.com/drawing.png', 'https://example.com/box.png', '1.5', 'Детали']
  ];
  const parsed = await parseAndValidateExcelFile(workbook(rows), [existing]);
  assert.equal(parsed.success, true, JSON.stringify(parsed.errors));
  assert.equal(parsed.summary.toUpdate, 1);
  const [product] = applyExcelImport([existing], parsed.validRows);
  assert.equal(product.description, 'После');
  assert.equal(product.seoDesc, 'SEO');
  assert.equal(product.specs, 'Новые характеристики');
  assert.equal(product.weight, '1.5');
  assert.equal(product.extraSpecs, 'Детали');
  assert.equal(product.drawingUrl, 'https://example.com/drawing.png');
  assert.equal(product.boxUrl, 'https://example.com/box.png');
  assert.deepEqual(product.cityStock, { Алматы: 7 });
  assert.equal(product.photo1, existing.photo1);
  assert.equal(product.brand, existing.brand);
  assert.equal(product.currency, existing.currency);
  assert.equal(product.url, existing.url);
});

test('Excel: ошибочные цены, дубли и явное удаление без потери других товаров', async () => {
  for (const price of ['-10', '12oops', '10.2.3']) {
    const parsed = await parseAndValidateExcelFile(workbook([headings, ['X', 'Изделие', 'Аэраторы', price]]));
    assert.equal(parsed.success, false, price);
  }
  const duplicate = await parseAndValidateExcelFile(workbook([headings, ['X', 'A', 'B', 10], ['x', 'A', 'B', 10]]));
  assert.equal(duplicate.success, false);
  const items = [{ article: 'A' }, { article: 'B' }];
  assert.deepEqual(applyExcelImport(items, [{ article: 'a', actionStatus: 'УДАЛИТЬ' }]).map(p => p.article), ['B']);
});

test('Официальный шаблон читается браузерным импортом', async () => {
  const result = await parseAndValidateExcelFile(fs.readFileSync(new URL('../LAUTE_Catalog.xlsx', import.meta.url)));
  assert.equal(result.success, true);
  assert.equal(result.validRows.length, 12);
});

test('Фото, выбранное сотрудником, имеет приоритет над встроенными картинками SKU', () => {
  for (const article of ['ETH103D', 'ETH163GQ', 'A0163', 'R0101F']) {
    const image = 'https://example.com/new-product.jpg';
    const drawing = 'https://example.com/technical.jpg';
    const classified = classifyProductImages({ article, photo1: image, photo2: drawing, drawingUrl: drawing });
    assert.equal(classified.mainPhoto, image, article);
    assert.deepEqual(classified.drawingPhotos, [drawing]);
    assert.ok(!classified.additionalPhotos.includes(drawing));
  }
});

test('Экспорт → повторный импорт сохраняет все поля и остатки', async () => {
  const product = { article: 'CUSTOM-1', name: 'Аэратор', category: 'Аэраторы', price: 25, status: 'СКРЫТ', drawingUrl: 'https://example.com/drawing.png', boxUrl: 'https://example.com/box.png', cityStock: { Алматы: 7, Москва: 2 } };
  const exported = XLSX.write(createCatalogWorkbook([product]), { type: 'buffer', bookType: 'xlsx' });
  const parsed = await parseAndValidateExcelFile(exported, [product]);
  assert.equal(parsed.success, true);
  const [after] = applyExcelImport([product], parsed.validRows);
  assert.equal(after.status, 'СКРЫТ');
  assert.equal(after.drawingUrl, product.drawingUrl);
  assert.equal(after.boxUrl, product.boxUrl);
  assert.deepEqual(after.cityStock, product.cityStock);
});

test('CMS: серверные отказы, частичное обновление, пустые списки и долговременное чтение', async () => {
  const compiled = await build({ entryPoints: ['src/services/adminApi.js'], bundle: true, packages: 'external', write: false, format: 'cjs', platform: 'node', logLevel: 'silent', define: { 'import.meta.env.BASE_URL': '"/laute/"' } });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', compiled.outputFiles[0].text)(createRequire(import.meta.url), module, module.exports);
  const api = module.exports;
  const cache = new Map([['laute_admin_token', 'test-session']]);
  globalThis.window = {};
  globalThis.localStorage = { getItem: k => cache.get(k) ?? null, setItem: (k, v) => cache.set(k, v), removeItem: k => cache.delete(k) };
  let reject = false;
  let draft = { hero: { title: 'Сохранённый текст' }, order_inquiries: [] };
  let published = { hero: { title: 'Публичный текст' } };
  let products = [{ article: 'X', name: 'Изделие', category: 'Картриджи', price: 100, raw_data: { description: 'Описание', specs: 'Характеристики' } }];
  let stocks = [];
  const calls = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options = {}) => {
    if (String(url).startsWith('/api/')) return new Response('{}', { status: 404, headers: { 'content-type': 'application/json' } });
    const endpoint = String(url).split('/rest/v1/')[1];
    const args = options.body ? JSON.parse(options.body) : {};
    calls.push({ endpoint, args });
    let data;
    if (endpoint?.startsWith('rpc/')) {
      const fn = endpoint.slice(4);
      if (reject) data = { success: false, error: 'Сессия истекла' };
      else if (fn === 'laute_get_admin_data') data = { draft: structuredClone(draft) };
      else if (fn === 'laute_save_content_draft') { draft = structuredClone(args.p_updates); data = { success: true, draft: structuredClone(draft) }; }
      else if (fn === 'laute_publish_content') { published = structuredClone(draft); data = { success: true, version: '1.0.2' }; }
      else if (fn === 'laute_save_product') { products = [{ ...args.p_product }]; data = { success: true }; }
      else data = { success: true };
    } else if (endpoint?.startsWith('laute_products?')) data = products;
    else if (endpoint?.startsWith('laute_warehouse_stock?')) data = stocks;
    else if (endpoint?.startsWith('laute_site_content?')) data = [{ data: structuredClone(published) }];
    else data = [];
    return new Response(JSON.stringify(data), { headers: { 'content-type': 'application/json' } });
  };
  try {
    assert.deepEqual(await api.fetchWarehouses(), []);
    assert.deepEqual(await api.fetchWarehouseStock(), []);
    assert.equal((await api.fetchSiteContent('published')).hero.title, 'Публичный текст');
    await api.saveSiteContentDraft({ hero: { title: 'Новый текст' } });
    cache.delete('laute_site_content');
    assert.equal((await api.fetchSiteContent('draft')).hero.title, 'Новый текст');
    const publication = await api.publishSiteContent();
    assert.equal(publication.content.hero.title, 'Новый текст');
    assert.equal(publication.content.hasUnpublishedChanges, false);
    assert.equal((await api.fetchSiteContent(false)).hero.title, 'Новый текст');
    await api.updateProduct('X', { price: 150 });
    assert.equal(products[0].name, 'Изделие');
    assert.equal(products[0].specs, 'Характеристики');
    await api.saveBulkStock([{ warehouseId: 'almaty', sku: 'X', quantity: 7 }]);
    assert.deepEqual(calls.at(-1).args.p_stocks, [{ warehouseId: 'almaty', sku: 'X', quantity: 7 }]);
    await assert.rejects(api.saveStockItem('almaty', 'X', -2), /целым/);
    stocks = [{ warehouse_id: 'almaty', sku: 'X', quantity: 7 }, { warehouse_id: 'moscow', sku: 'Y', quantity: 8 }];
    await api.commitStockExcelImport('all', [{ warehouseId: 'almaty', sku: 'X', newQuantity: 9 }], 'replace');
    assert.deepEqual(calls.at(-1).args.p_stocks, [{ warehouseId: 'almaty', sku: 'X', quantity: 9 }, { warehouseId: 'moscow', sku: 'Y', quantity: 0 }]);
    await api.commitStockExcelImport('almaty', [{ sku: 'X', newQuantity: 9 }], 'replace');
    assert.deepEqual(calls.at(-1).args.p_stocks, [{ warehouseId: 'almaty', sku: 'X', quantity: 9 }]);
    reject = true;
    await assert.rejects(api.createCustomPage({ title: 'Тест', slug: 'test' }), /Сессия истекла/);
    await assert.rejects(api.createWarehouse({ name: 'Склад', city: 'Алматы' }), /Сессия истекла/);
    await assert.rejects(api.saveTerritoryRules([]), /Сессия истекла/);
    await assert.rejects(api.deleteOrderInquiryInAdmin('X'), /Сессия истекла/);
    await assert.rejects(api.fetchSiteContent('draft'), /Сессия истекла/);
    await assert.rejects(api.commitExcelImport([{ article: 'X', actionStatus: 'УДАЛИТЬ' }]), /Сессия истекла/);
  } finally {
    globalThis.fetch = originalFetch;
    delete globalThis.window;
    delete globalThis.localStorage;
  }
});

test('Медиасервис: проверка сессии до Storage и защищённая загрузка', async () => {
  const source = fs.readFileSync(new URL('../supabase/functions/admin-media/index.ts', import.meta.url), 'utf8');
  const compiled = await transform(source, { loader: 'ts', format: 'cjs' });
  let handler;
  let valid = false;
  const calls = [];
  const fakeFetch = async (url, options) => {
    calls.push({ url, options });
    if (url.includes('/rpc/')) return Response.json({ valid });
    return Response.json({ success: true });
  };
  new Function('Deno', 'fetch', compiled.code)({ env: { get: name => ({ SUPABASE_URL: 'https://example.supabase.co', SUPABASE_ANON_KEY: 'public-key', SUPABASE_SERVICE_ROLE_KEY: 'server-secret' }[name]) }, serve: fn => { handler = fn; } }, fakeFetch);
  assert.equal((await handler(new Request('https://example.com/'))).status, 401);
  assert.equal(calls.length, 0);
  assert.equal((await handler(new Request('https://example.com/', { headers: { origin: 'https://untrusted.example', 'x-laute-token': 'test' } }))).status, 403);
  assert.equal((await handler(new Request('https://example.com/', { headers: { 'x-laute-token': 'expired' } }))).status, 401);
  assert.equal(calls.length, 1);
  valid = true;
  const form = new FormData();
  form.append('file', new File(['image'], 'qa.png', { type: 'image/png' }));
  const response = await handler(new Request('https://example.com/', { method: 'POST', headers: { 'x-laute-token': 'valid' }, body: form }));
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.success, true);
  assert.ok(result.url.startsWith('https://example.supabase.co/storage/v1/object/public/laute-media/'));
  assert.equal(calls.at(-1).options.headers.Authorization, 'Bearer server-secret');
  assert.ok(!JSON.stringify(result).includes('server-secret'));
});
