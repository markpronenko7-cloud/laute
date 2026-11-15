import assert from 'node:assert/strict';
import test from 'node:test';
import { researchRegionalMarket } from '../src/ai/actions/marketResearch.js';
import { catalogRoute, collectionKey, searchCatalog } from '../src/utils/catalogSearch.js';

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
  assert.deepEqual(articles(searchCatalog(products, 'Мне нужен бежевый смеситель для кухни', 'smart')), ['TRUMP193B-6']);
  assert.deepEqual(articles(searchCatalog(products, 'graphite kitchen mixer', 'smart')), ['LINK003BY-5']);
  assert.deepEqual(searchCatalog(products, 'gold kitchen mixer', 'smart'), []);
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
