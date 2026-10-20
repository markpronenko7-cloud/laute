import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import XLSX from 'xlsx';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { build, transform } from 'esbuild';
import { createRequire } from 'node:module';
import { parseAndValidateExcelFile, applyExcelImport, createCatalogWorkbook, parseStockExcelClient } from '../src/utils/excelManager.js';
import { formatProductDisplay, classifyProductImages } from '../src/utils/imageHelper.js';
import { getPublishedPage, getEditableBlocks } from '../src/utils/pagePublication.js';
import { getNavigation, getNavTranslation, getPageSeo } from '../src/utils/contentSettings.js';
import { CATEGORY_NAMES } from '../src/data/catalogData.js';

const workbook = rows => {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Товары');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
};
const headings = ['Артикул (SKU) *', 'Название товара *', 'Категория *', 'Цена *'];

test('Excel: все категории и все поля проходят экспорт → новый импорт → обновление', async () => {
  const products = CATEGORY_NAMES.map((category, index) => ({
    article: `QA-FIELDS-${index}`, name: 'Тестовое изделие', category,
    subcategory: 'Подкатегория', collection: 'Коллекция', brand: 'Aloute',
    description: 'Описание', price: 123.45, currency: '₽', material: 'Латунь',
    color: 'Хром', finish: 'PVD', installType: 'Настенный', purpose: 'Для дома',
    dimensions: '100 мм', weight: '1.5 кг', volume: '0.01 м³', specs: 'Характеристики',
    photo1: 'https://example.com/product.jpg', photo2: 'https://example.com/second.jpg',
    photo3: 'https://example.com/third.jpg', status: index % 2 ? 'СКРЫТ' : 'АКТИВЕН',
    seoTitle: 'SEO заголовок', seoDesc: 'SEO описание', url: `/qa-${index}`,
    extraSpecs: 'Дополнительно', drawingUrl: 'https://example.com/drawing.png',
    boxUrl: 'https://example.com/box.png', cityStock: { Алматы: 7, Москва: 0 }
  }));
  assert.ok(products.length >= 14);
  const buffer = XLSX.write(createCatalogWorkbook(products), { type: 'buffer', bookType: 'xlsx' });
  for (const current of [[], products]) {
    const parsed = await parseAndValidateExcelFile(buffer, current);
    assert.equal(parsed.success, true, JSON.stringify(parsed.errors));
    const imported = applyExcelImport(current, parsed.validRows);
    assert.equal(imported.length, products.length);
    products.forEach((expected, i) => {
      for (const [key, value] of Object.entries(expected)) {
        assert.deepEqual(imported[i][key], value, `${expected.category}: ${key}`);
      }
    });
  }
});

test('Складской Excel: неверное количество отклоняется без округления и удаления символов', async () => {
  const originalReader = globalThis.FileReader;
  globalThis.FileReader = class {
    readAsArrayBuffer(buffer) { this.onload({ target: { result: buffer } }); }
  };
  try {
    const warehouses = [{ id: 'qa-wh', name: 'Тестовый склад' }];
    const products = [{ article: 'QA-1', name: 'Тест', category: 'Аэраторы' }];
    for (const heading of ['Количество', 'Тестовый склад']) {
      for (const qty of [-3, 1.5, '-3', '1.5', '12oops', '1e3', 'Infinity', '2147483648', '9007199254740992']) {
        const result = await parseStockExcelClient(workbook([['Артикул', heading], ['QA-1', qty]]), warehouses[0], products, [], warehouses);
        assert.equal(result.errorCount, 1, `${heading}: ${qty}`);
        assert.equal(result.validCount, 0, `${heading}: ${qty}`);
      }
      for (const qty of [0, 12, '12', '1 234', 2147483647]) {
        const result = await parseStockExcelClient(workbook([['Артикул', heading], ['QA-1', qty]]), warehouses[0], products, [], warehouses);
        assert.equal(result.errorCount, 0, `${heading}: ${qty}`);
        assert.equal(result.diffList[0].newQuantity, Number(String(qty).replace(/\s/g, '')));
      }
      const blank = await parseStockExcelClient(workbook([['Артикул', heading], ['QA-1', '']]), warehouses[0], products, [], warehouses);
      assert.equal(blank.validCount, 0);
    }
    const branches = ['Алматы', 'Новосибирск', 'Москва', 'Китай'].map((name, i) => ({id: `wh-${i}`, name}));
    const existingStock = branches.map(w => ({warehouseId: w.id, sku: 'QA-1', quantity: 3}));
    const matrix = await parseStockExcelClient(workbook([['Артикул', ...branches.map(w => w.name)], ['QA-1', 4, 5, 6, 7]]), branches[0], products, existingStock, branches);
    assert.equal(matrix.warehouseId, 'all');
    assert.deepEqual(matrix.diffList.map(d => [d.warehouseId, d.oldQuantity, d.diff]), branches.map((w, i) => [w.id, 3, i + 1]));
  } finally {
    if (originalReader === undefined) delete globalThis.FileReader;
    else globalThis.FileReader = originalReader;
  }
});

test('Складской Excel: отказ сервера сохраняет предпросмотр и не сообщает об успехе', async () => {
  const source = fs.readFileSync('src/pages/AdminPage.jsx', 'utf8');
  const start = source.indexOf('const handleCommitStockExcel = async () => {');
  assert.ok(start >= 0);
  const end = source.indexOf('\n  };', start);
  const handler = source.slice(start, end + '\n  };'.length);
  for (const fail of [true, false]) {
    const notices = [], modals = [], previews = [], busy = [], loads = [], commits = [];
    const state = {
      isDemoMode: false,
      stockExcelDiff: { warehouseId: 'all', diffList: [{ sku: 'QA', newQuantity: 7 }] },
      stockExcelMode: 'partial', stockExcelReplaceAgreed: false, selectedWarehouseId: 'qa-wh',
      showNotice: (...args) => notices.push(args), setIsStockExcelConfirming: value => busy.push(value),
      setIsStockExcelModalOpen: value => modals.push(value), setStockExcelDiff: value => previews.push(value),
      loadStockData: async id => loads.push(id),
      commitStockExcelImport: async (...args) => { commits.push(args); if (fail) throw new Error('Сессия истекла'); }
    };
    await new Function(...Object.keys(state), `${handler}; return handleCommitStockExcel();`)(...Object.values(state));
    assert.deepEqual(busy, [true, false]);
    assert.equal(commits[0][0], 'all');
    if (fail) {
      assert.deepEqual(notices, [['Сессия истекла', 'error']]);
      assert.deepEqual(modals, []);
      assert.deepEqual(previews, []);
      assert.deepEqual(loads, []);
    } else {
      assert.match(notices[0][0], /успешно/);
      assert.deepEqual(modals, [false]);
      assert.deepEqual(previews, [null]);
      assert.deepEqual(loads, ['qa-wh']);
    }
  }
});

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
    } else if (endpoint?.startsWith('laute_custom_pages?')) data = [{ pages: [] }];
    else if (endpoint?.startsWith('laute_products?')) data = products;
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
    products.push({ article: 'LEGACY-UNTOUCHED', name: 'Старый товар без категории', price: 10 });
    await api.commitExcelImport([{ article: 'X', name: 'Изделие', category: 'Картриджи', price: 150, actionStatus: 'ОБНОВИТЬ' }]);
    const importCall = calls.findLast(c => c.endpoint === 'rpc/laute_import_products');
    assert.deepEqual(importCall.args.p_products.map(p => p.article), ['X']);
    assert.deepEqual(importCall.args.p_deleted_skus, []);
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


test('Явное основное фото CMS сохраняет выбранный слот независимо от имени файла', () => {
  const product = { article: 'ETH103D', imageSlotsExplicit: true, photo1: 'images/new-box-photo.jpg', photo2: 'images/old.jpg', photo3: 'images/third.jpg', drawingUrl: 'images/plan.jpg' };
  const gallery = classifyProductImages(product, '/laute/');
  assert.equal(gallery.mainPhoto, '/laute/images/new-box-photo.jpg');
  assert.deepEqual(gallery.additionalPhotos, ['/laute/images/old.jpg', '/laute/images/third.jpg']);
  assert.deepEqual(gallery.drawingPhotos, ['/laute/images/plan.jpg']);
  assert.equal(classifyProductImages({ ...product, photo1: gallery.mainPhoto }, '/laute/').mainPhoto, gallery.mainPhoto);
});

test('Черновик страницы оставляет прежнюю опубликованную версию доступной', () => {
  const published = { id: 'p', slug: 'before', status: 'ОПУБЛИКОВАН', blocks: [{ title: 'До' }] };
  assert.equal(getPublishedPage({ ...published, slug: 'after', status: 'ЧЕРНОВИК', blocks: [{ title: 'После' }], published }), published);
  assert.equal(getPublishedPage({ status: 'ЧЕРНОВИК' }), null);
  assert.equal(getPublishedPage({ isSystem: true, status: 'ОПУБЛИКОВАН' }), null);
  assert.equal(getPublishedPage({ isSystem: true, useBuilder: true, status: 'ОПУБЛИКОВАН' }).useBuilder, true);
});

test('Категории: связанные товары, повторное чтение и восстановление после отказа', async () => {
  const compiled = await build({ entryPoints: ['src/services/adminApi.js'], bundle: true, packages: 'external', write: false, format: 'cjs', platform: 'node', logLevel: 'silent', define: { 'import.meta.env.BASE_URL': '"/laute/"' } });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', compiled.outputFiles[0].text)(createRequire(import.meta.url), module, module.exports);
  const api = module.exports;
  const originalFetch = globalThis.fetch;
  globalThis.window = {};
  globalThis.localStorage = { getItem: key => key === 'laute_admin_token' ? 'test' : null, setItem() {} };
  let categories = [{ id: 'c', name: 'До' }];
  let products = [{ article: 'X', name: 'Товар', category: 'До', photo1: 'images/first.jpg', photo2: 'images/second.jpg', price: 10 }];
  let failMetadata = false;
  let ignoreWrite = false;
  let pages = [{ id: 'p', title: 'До', slug: 'before', status: 'ОПУБЛИКОВАН', blocks: [] }];
  globalThis.fetch = async (url, options = {}) => {
    const endpoint = String(url).split('/rest/v1/')[1];
    const args = options.body ? JSON.parse(options.body) : {};
    let result = { success: true };
    if (endpoint.startsWith('laute_categories?')) result = [{ categories }];
    if (endpoint.startsWith('laute_products?')) result = products;
    if (endpoint.startsWith('laute_custom_pages?')) result = [{ pages }];
    if (endpoint === 'rpc/laute_import_products') products = args.p_products;
    if (endpoint === 'rpc/laute_save_categories') {
      if (failMetadata) { failMetadata = false; result = { success: false, error: 'Metadata failed' }; }
      else categories = args.p_categories;
    }
    if (endpoint === 'rpc/laute_save_product' && !ignoreWrite) products = [args.p_product];
    if (endpoint === 'rpc/laute_save_custom_pages') pages = args.p_pages;
    return Response.json(structuredClone(result));
  };
  try {
    await api.saveCategories([{ id: 'c', name: 'После' }]);
    assert.equal(products[0].category, 'После');
    assert.equal(categories[0].name, 'После');
    failMetadata = true;
    await assert.rejects(api.saveCategories([{ id: 'c', name: 'Отказ' }]), /Metadata failed/);
    assert.equal(products[0].category, 'После');
    assert.equal(categories[0].name, 'После');
    await assert.rejects(api.saveCategories([]), /перенеси/);
    const photo = await api.updateProduct('X', { photo1: 'images/chosen-box.jpg' });
    assert.equal(photo.photo1, 'images/chosen-box.jpg');
    assert.equal(photo.photo2, 'images/second.jpg');
    assert.equal(classifyProductImages(photo, '/laute/').mainPhoto, '/laute/images/chosen-box.jpg');
    ignoreWrite = true;
    await assert.rejects(api.updateProduct('X', { photo1: 'images/not-saved.jpg' }), /не подтверждено/);
    await api.updateCustomPage('p', { title: 'После', slug: 'after', status: 'ЧЕРНОВИК' });
    assert.equal(getPublishedPage(pages[0]).title, 'До');
    await api.updateCustomPage('p', { status: 'ОПУБЛИКОВАН' });
    assert.equal(getPublishedPage(pages[0]).title, 'После');
    const nativeBlock={id:'native-home-technologies',type:'system_section',route:'home',section:'home-technologies',nativeEdits:{'homepage-24':{ru:{text:'PVD сохранён'}}}};
    await api.updateCustomPage('p',{blocks:[nativeBlock],status:'ЧЕРНОВИК'});
    assert.deepEqual((await api.fetchCustomPages(true))[0].blocks[0].nativeEdits,nativeBlock.nativeEdits);
    assert.ok(!getPublishedPage(pages[0]).blocks[0]?.nativeEdits);
    await api.updateCustomPage('p',{status:'ОПУБЛИКОВАН'});
    assert.deepEqual(getPublishedPage(pages[0]).blocks[0].nativeEdits,nativeBlock.nativeEdits);
    await assert.rejects(api.updateCustomPage('p',{blocks:[{nativeEdits:{x:{ru:{link:'javascript:alert(1)'}}}}]}),/корректную ссылку/);
    await assert.rejects(api.saveSiteContentDraft({ buttons: { x: { action: 'link', link: 'javascript:alert(1)' } } }), /корректную ссылку/);
  } finally {
    globalThis.fetch = originalFetch;
    delete globalThis.window;
    delete globalThis.localStorage;
  }
});


test('Конструктор основных страниц сохраняет рабочие каталог, формы и корзину', () => {
  const page = { isSystem: true, slug: 'catalog', title: 'Каталог', blocks: [{ type: 'hero' }] };
  assert.equal(getEditableBlocks(page)[0].type, 'system_section');
  assert.deepEqual(getEditableBlocks(page).map(b=>b.section), ['catalog-1','catalog-2','catalog-3']);
  assert.equal(getEditableBlocks(page)[0].route, 'catalog');
  assert.equal(getEditableBlocks({ ...page, useBuilder: true }).length, 4);
  assert.equal(getEditableBlocks({ ...page, useBuilder: true, blocks: [{ type: 'system_page', isVisible: false, route: 'wrong' }] })[0].isVisible, true);
  assert.equal(getEditableBlocks({ ...page, useBuilder: true, blocks: [{ type: 'system_page', nativeIntro: { h1: 'Сохранённый заголовок' } }] })[0].nativeIntro.h1, 'Сохранённый заголовок');
});


test('Все секции главной доступны, включая нижние блоки, а контакты сохраняют настоящие карточки', () => {
  const home = getEditableBlocks({ isSystem: true, slug: 'home', blocks: [] });
  assert.deepEqual(home.map(b=>b.section), ['home-hero','home-collections','home-technologies','home-partners','home-service-preview','home-b2b-lead-form']);
  const contacts=[{ id:'contacts-card', type:'contact_cards',items:[{phone:'+123'}] }];
  assert.deepEqual(getEditableBlocks({isSystem:true,slug:'contacts',blocks:contacts}), contacts);
  const edited={...home[2],nativeEdits:{'homepage-24':{ru:{text:'PVD после сохранения'}}}};
  assert.deepEqual(getEditableBlocks({isSystem:true,slug:'home',useBuilder:true,blocks:[edited]}),[edited]);
});

test('Визуальные поля: опубликованные текст, фото и язык отображаются из сохранённых значений', async () => {
  const compiled=await build({entryPoints:['src/components/builder/NativeContent.jsx'],bundle:true,packages:'external',write:false,format:'cjs',platform:'node',logLevel:'silent',define:{'import.meta.env.BASE_URL':'"/laute/"'},plugins:[{name:'mock-context',setup(b){b.onResolve({filter:/context\/AppContext$/},()=>({path:'app-context',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:"export const useApp = () => ({lang: globalThis.__cmsTestLang || 'ru', siteContent: {}, navigateTo() {}});",loader:'js'}));}}]});
  const module={exports:{}};new Function('require','module','exports',compiled.outputFiles[0].text)(createRequire(import.meta.url),module,module.exports);
  const {EditableNode,NativeContentScope,EditableSection}=module.exports;
  const render=child=>renderToStaticMarkup(React.createElement(NativeContentScope.Provider,{value:{section:'home-technologies',blockId:'native-home-technologies',edits:{title:{ru:{text:'Сохранённый PVD'}},photo:{ru:{src:'images/chosen.jpg',alt:'Новое фото'}}}}},child));
  assert.match(render(React.createElement(EditableNode,{as:'h3',editKey:'title'},'Исходный PVD')),/Сохранённый PVD/);
  assert.match(render(React.createElement(EditableNode,{as:'img',kind:'image',editKey:'photo',src:'images/old.jpg'})),/src="\/laute\/images\/chosen.jpg"/);
  assert.doesNotMatch(render(React.createElement(EditableNode,{as:'h3',editKey:'title'},'Исходный PVD')),/data-native-field/);
  assert.equal(render(React.createElement(EditableSection,{sectionKey:'home-partners'},'Чужая секция')),'');
  globalThis.__cmsTestLang='en';
  try { assert.match(render(React.createElement(EditableNode,{as:'h3',editKey:'title'},'Original PVD')),/Original PVD/); }
  finally {delete globalThis.__cmsTestLang;}
});
