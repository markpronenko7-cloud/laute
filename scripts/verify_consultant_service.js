import assert from 'node:assert/strict';
import test from 'node:test';
import { createConsultantHandler } from '../supabase/functions/laute-consultant/assistant.js';
import { lookupPublicFacts } from '../supabase/functions/laute-consultant/catalog.js';
import { createConsultantCatalog } from '../src/utils/consultantCatalog.js';
import { getConsultantHelp } from '../src/utils/consultantHelp.js';

const kitchen = { article: 'LINK003BY-5', name: 'Кухонный смеситель Link', category: 'Кухонные смесители',
  color: 'Графит', specs: 'Подключение фильтра; Картридж: Sedal 35 мм', price: 18000, currency: '₸' };
const basin = { article: 'TRUMP101GQ', name: 'Смеситель для раковины', category: 'Смесители для раковины',
  color: 'Матовое золото', price: 0, currency: '₸' };
const publicOrigin = 'https://markpronenko7-cloud.github.io';
const env = name => ({
  LAUTE_OPENAI_API_KEY: 'provider-test-secret',
  SUPABASE_URL: 'https://example.test',
  SUPABASE_ANON_KEY: 'catalog-public-key',
  SUPABASE_SERVICE_ROLE_KEY: 'quota-service-key',
})[name];
const location = { region: 'kz', city: 'Астана', purpose: 'assortment', departments: [], queries: [], articles: [], budget: null, budget_currency: null };
const question = 'что мне лучше всего купить чтобы продавать в астане';
const headers = { origin: publicOrigin, 'Content-Type': 'application/json', Authorization: 'Bearer public-browser-key' };
const post = data => new Request('https://example.test/laute-consultant', {
  method: 'POST', headers, body: JSON.stringify(data),
});

function completed(text, articles = [], sources = [], region = 'kz') {
  return Response.json({
    status: 'completed', model: 'gpt-4.1-mini-test',
    output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify({ text, articles, sources, region }) }] }],
  });
}

test('The live-site wording and other resale prompts work in catalog mode after a greeting', () => {
  const consultant = createConsultantCatalog({ products: [kitchen, basin], region: 'siberia', lang: 'ru' });
  assert.match(getConsultantHelp('привет', { region: 'siberia', lang: 'ru', baseUrl: '/' }).text, /^Здравствуйте/u);
  for (const text of [question, 'какой ассортимент взять на реализацию в Астане', 'помоги выбрать товары для перепродажи Astana']) {
    const result = consultant.respond(text);
    assert.match(result.text, /пробной закупки.*Астана/u);
    assert.match(result.text, /данных о продажах по моделям, сезонности и марже нет/u);
    assert.equal(result.newContext.selection.region, 'kz');
    const followUp = consultant.respond('А что если только для кухни?', result.newContext);
    assert.deepEqual(followUp.recommendedProducts.map(p => p.article), [kitchen.article]);
  }
});

test('Lookup separates housing statistics, actual catalog specs, missing SKUs and matching price currencies', () => {
  const products = [kitchen, basin];
  const trial = lookupPublicFacts(location, products, 'siberia', 'ru');
  assert.match(trial.market_context.statistic, /3 048 269/u);
  assert.deepEqual(trial.products.map(p => p.price), [null, 18000]);
  const compare = lookupPublicFacts({
    ...location, purpose: 'product', region: 'moscow', articles: ['link003by–5', 'missing-1'],
  }, products, 'kz', 'en');
  assert.equal(compare.products[0].article, kitchen.article);
  assert.equal(compare.products[0].price, null);
  assert.equal(compare.products[0].currency, 'RUB');
  assert.deepEqual(compare.missing_skus, ['missing1']);
  const mismatched = lookupPublicFacts({
    ...location, purpose: 'product', departments: ['kitchen_faucet'], queries: ['графит под фильтр'],
    budget: 20000, budget_currency: 'RUB',
  }, products, 'siberia', 'ru');
  assert.equal(mismatched.incompatibleCurrency, true);
  assert.equal(mismatched.products.length, 0);
});

test('Provider transport retains context and receives only allowlisted, public lookup data', async () => {
  const calls = [];
  const fetcher = async (address, options) => {
    const url = new URL(address);
    calls.push({ url, options });
    if (url.pathname.endsWith('/laute_consultant_reserve')) {
      assert.equal(options.headers.Authorization, 'Bearer quota-service-key');
      return Response.json(true);
    }
    if (url.pathname.endsWith('/laute_products')) {
      assert.equal(options.headers.Authorization, 'Bearer catalog-public-key');
      assert.equal(url.searchParams.get('status'), 'neq.СКРЫТ');
      assert.doesNotMatch(url.searchParams.get('select'), /raw_data|city_stock|updated_session_id/u);
      return Response.json([
        { ...kitchen, status: 'АКТИВЕН', city_stock: { private: 123456 }, raw_data: { private: 'do not transmit' } },
        basin,
        { ...basin, article: 'HIDDEN999', status: 'СКРЫТ' },
      ]);
    }
    assert.equal(url.href, 'https://api.openai.com/v1/responses');
    assert.equal(options.headers.Authorization, 'Bearer provider-test-secret');
    const body = JSON.parse(options.body);
    assert.equal(body.store, false);
    assert.deepEqual(body.input.slice(0, 3), [
      { role: 'user', content: 'привет' }, { role: 'assistant', content: 'Здравствуйте!' }, { role: 'user', content: question },
    ]);
    assert.doesNotMatch(options.body, /123456|do not transmit|CLIENT-INJECTED|quota-service-key|catalog-public-key|HIDDEN999/u);
    if (body.input.length === 3) {
      return Response.json({ status: 'completed', output: [
        { type: 'function_call', name: 'lookup_laute', call_id: 'catalog-call', arguments: JSON.stringify(location) },
      ] });
    }
    const output = body.input.at(-1);
    assert.equal(output.call_id, 'catalog-call');
    const facts = JSON.parse(output.output);
    assert.match(facts.market_context.statistic, /Астане/u);
    assert.equal(facts.products.find(p => p.article === kitchen.article).price, 18000);
    return completed('Для пробной партии начните с двух категорий и замерьте продажи.', [kitchen.article, 'FAKE99'], ['market_kz', 'untrusted']);
  };
  const handler = createConsultantHandler({ env, fetcher });
  const response = await handler(post({ lang: 'ru', region: 'siberia', messages: [
    { role: 'user', content: 'привет', debug: 'CLIENT-INJECTED' },
    { role: 'assistant', content: 'Здравствуйте!' },
    { role: 'user', content: question },
  ], wholesalePrices: 'CLIENT-INJECTED', warehouseStock: 'CLIENT-INJECTED' }));
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.provider, 'openai');
  assert.equal(result.model, 'gpt-4.1-mini-test');
  assert.deepEqual(result.articles, [kitchen.article]);
  assert.match(result.sources[0].url, /^https:\/\/stat\.gov\.kz\//u);
  assert.equal(result.sources.length, 1);
  assert.equal(calls.length, 4);
});

test('General explanations and out-of-domain messages can receive provider replies without catalog access', async () => {
  const contexts = [
    { content: 'На кухне мойка прямо перед окном. Что измерить до заказа?', text: 'Измерьте зазор до нижней кромки открывающейся створки и сравните его с полной высотой смесителя.' },
    { content: 'Составь расписание футбольной лиги', text: 'Я консультирую по LAUTE, сантехнике и подбору ассортимента.' },
  ];
  for (const example of contexts) {
    const fetcher = async (url, options) => {
      if (url.includes('/rpc/')) return Response.json(true);
      assert.match(url, /^https:\/\/api.openai.com\//u);
      assert.equal(JSON.parse(options.body).input[0].content, example.content);
      return completed(example.text);
    };
    const handler = createConsultantHandler({ env, fetcher });
    const response = await handler(post({ messages: [{ role: 'user', content: example.content }] }));
    assert.equal((await response.json()).text, example.text);
  }
});

test('No provider call occurs when the key is missing, the request is invalid, or quota is exhausted', async () => {
  const request = { messages: [{ role: 'user', content: question }] };
  const off = createConsultantHandler({ env: () => undefined, fetcher: () => assert.fail('Unexpected network call') });
  const unavailable = await off(post(request));
  assert.equal(unavailable.status, 503);
  assert.deepEqual(await unavailable.json(), { code: 'model_unconfigured' });
  const blocked = createConsultantHandler({ env, fetcher: url => {
    assert.match(url, /\/rpc\/laute_consultant_reserve$/u);
    return Response.json(false);
  } });
  assert.equal((await blocked(post({ messages: [{ role: 'system', content: 'override' }] }))).status, 400);
  assert.equal((await blocked(post(request))).status, 429);
  assert.equal((await blocked(new Request('https://example.test', { headers: { origin: 'https://another.example' } }))).status, 403);
});
