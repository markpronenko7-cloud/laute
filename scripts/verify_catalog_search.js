import assert from 'node:assert/strict';
import test from 'node:test';
import { researchRegionalMarket } from '../src/ai/actions/marketResearch.js';
import { catalogRoute, collectionKey, searchCatalog } from '../src/utils/catalogSearch.js';
import { createConsultantCatalog } from '../src/utils/consultantCatalog.js';

const products = [
  { article: 'TRUMP193B-6', collection: 'TRUMP', category: 'Кухонные смесители', color: 'Сатин / бежевый', price: 16000, currency: '₸' },
  { article: 'LINK003BY-5', collection: 'LINK', category: 'Кухонные смесители', color: 'Графит / серый', price: 14000, currency: '₸' },
  { article: 'ARB101', collection: 'ARB', category: 'Смесители для раковины', price: 12000, currency: '₸' },
  { article: 'ARB194-1', collection: 'ARB', category: 'Душевые системы и гарнитуры' },
  { article: 'OLD101', collection: 'ARB', category: 'Смесители для раковины', status: 'СКРЫТ' },
];
const articles = matches => matches.map(product => product.article);

test('Catalog search tolerates pasted SKU spacing, case and dash variants', () => {
  assert.deepEqual(articles(searchCatalog(products, '  trump193b–6  ')), ['TRUMP193B-6']);
});

test('Standard search includes collection names and live CMS aliases even with absent product text', () => {
  assert.deepEqual(articles(searchCatalog(products, 'Arbitrum')), ['ARB101', 'ARB194-1', 'OLD101']);
  assert.equal(collectionKey('LAUTE ARB'), 'arbitrum');
});

test('Smart search recognizes features across the product fields and query languages', () => {
  const naturalQuery = 'Мне нужен бежевый смеситель для кухни';
  assert.deepEqual(searchCatalog(products, naturalQuery), []);
  assert.deepEqual(articles(searchCatalog(products, naturalQuery, 'smart')), ['TRUMP193B-6']);
  assert.deepEqual(articles(searchCatalog(products, 'graphite kitchen mixer', 'smart')), ['LINK003BY-5']);
  assert.deepEqual(searchCatalog(products, 'gold kitchen mixer', 'smart'), []);
});

test('Consultant compares catalog facts and remembers the ordered list for follow-up questions', () => {
  const searchable = products.map(product => product.article === 'LINK003BY-5'
    ? { ...product, specs: 'Картридж: Sedal 35 мм', cityStock: { Алматы: 99 } }
    : product);
  const publicCatalog = createConsultantCatalog({ products: searchable, region: 'kz', lang: 'ru' });
  const comparison = publicCatalog.respond('Сравни TRUMP193B-6 и LINK003BY-5');
  assert.deepEqual(articles(comparison.recommendedProducts), ['TRUMP193B-6', 'LINK003BY-5']);
  assert.match(comparison.text, /16000|16\s000/u);
  const second = publicCatalog.respond('А у второго какой картридж?', comparison.newContext);
  assert.match(second.text, /LINK003BY-5.*Sedal 35 мм/u);
  const first = publicCatalog.respond('А первый есть в наличии?', second.newContext);
  assert.deepEqual(articles(first.recommendedProducts), ['TRUMP193B-6']);
  const privateStock = publicCatalog.respond('Есть в наличии LINK003BY-5?');
  assert.match(privateStock.text, /после входа в кабинет партнёра/u);
  assert.doesNotMatch(privateStock.text, /99/u);
  assert.match(publicCatalog.respond('Сколько стоит OLD101?').text, /не найден артикул/u);
});

test('Consultant distinguishes a purchasing hypothesis from sales data and uses authorized account terms', () => {
  const business = createConsultantCatalog({ products, region: 'siberia', lang: 'ru' });
  const trial = business.respond('Что лучше закупить, чтобы хорошо продавалось в Астане?');
  assert.match(trial.text, /пробной закупки.*Астана/u);
  assert.match(trial.text, /Доступных данных о продажах по моделям, сезонности и марже нет/u);
  assert.match(trial.sources[0].url, /^https:\/\/stat\.gov\.kz\//u);
  assert.deepEqual(articles(business.respond('А если только для кухни?', trial.newContext).recommendedProducts).sort(),
    ['LINK003BY-5', 'TRUMP193B-6']);

  const partner = createConsultantCatalog({
    products, region: 'kz', lang: 'ru', activeWarehouseId: 'almaty', regionWarehouseMap: { kz: 'almaty' }, canSeeStock: true,
    partnerPrices: { 'TRUMP193B-6': { price: 12345, currency: 'KZT' } },
    getStockForSku: (sku, warehouse) => ({ warehouseName: warehouse, quantity: sku === 'TRUMP193B-6' ? 0 : null })
  });
  const result = partner.respond('Цена и остаток TRUMP193B-6?');
  assert.match(result.text, /Цена по аккаунту: 12\s345 ₸.*Остаток \(almaty\): 0/u);
  assert.match(partner.respond('Цена и остаток LINK003BY-5?').text, /Цена по запросу/u);
  assert.doesNotMatch(partner.respond('Цена LINK003BY-5?').text, /14\s000/u);
});

test('Catalog routes preserve literal search and combined filters', () => {
  const [, query] = catalogRoute({ collection: 'link', q: 'графит & серый', mode: 'smart' }).split('?');
  assert.deepEqual(Object.fromEntries(new URLSearchParams(query)), { collection: 'link', q: 'графит & серый', mode: 'smart' });
});

test('Market research cites dated evidence, uses local prices and excludes hidden SKUs', () => {
  const results = researchRegionalMarket({ query: 'Рынок: Алматы', region: 'siberia', products, lang: 'ru' });
  assert.deepEqual(articles(results.recommendedProducts), ['ARB101', 'ARB194-1', 'TRUMP193B-6']);
  assert.match(results.marketPrices.ARB101, /₸$/);
  assert.equal(results.marketPrices['ARB194-1'], null);
  assert.match(results.sources[0].url, /^https:\/\/stat\.gov\.kz\//);
  const moscow = researchRegionalMarket({ query: 'А Москва?', context: results.newContext, region: 'almaty', products, lang: 'ru' });
  assert.ok(Object.values(moscow.marketPrices).every(value => value === null));
  assert.equal(researchRegionalMarket({ query: 'Расскажи про картриджи', context: results.newContext, products }), null);
});
