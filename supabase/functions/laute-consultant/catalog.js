import { compactSku, searchCatalog } from '../../../src/utils/catalogSearch.js';
import { getRegionalCurrency, getRegionalProductPrice } from '../../../src/utils/catalogPrice.js';
import { getRegionConfig, REGIONS_CONFIG } from '../../../src/data/regionsData.js';
import { regionalMarket } from '../../../src/ai/knowledge/regionalMarket.js';

const departments = {
  kitchen_faucet: 'Кухонные смесители',
  basin_faucet: 'Смесители для раковины',
  bath_faucet: 'Смесители для ванны',
  shower_system: 'Душевые системы и гарнитуры',
  shower_accessory: 'Душевые шланги и лейки',
  bidet: 'Биде и гигиенический душ',
  kitchen_sink: 'Кухонные мойки',
  shower_cabin: 'Бюджетные душевые кабины',
  cartridge: 'Картриджи',
};
const defaultAssortment = ['basin_faucet', 'kitchen_faucet', 'shower_system'];
const regions = REGIONS_CONFIG.map(region => region.id);
const publicFields = 'article,name,category,subcategory,collection,description,price,currency,material,color,finish,install_type,dimensions,specs,extra_specs,status';
const site = 'https://markpronenko7-cloud.github.io/laute/';
const localText = (value, limit) => typeof value === 'string' ? value.trim().slice(0, limit) : '';

export const publicSources = {
  company: { title: 'LAUTE · О компании', url: site + 'company' },
  service: { title: 'LAUTE · Сервис', url: site + 'service' },
  partners: { title: 'LAUTE · Партнёрам', url: site + 'partners' },
  contacts: { title: 'LAUTE · Контакты', url: site + 'contacts' },
};

export const lookupTool = {
  type: 'function',
  name: 'lookup_laute',
  description: 'Look up current public LAUTE catalog facts and official contacts. For product questions, business assortment, comparison, price, availability, specifications or specific models, query here before answering. For follow-ups, resolve references from the conversation and pass the actual SKUs. Provide concise search phrases with key attributes, preferably in Russian. A list of queries can search different features or categories.',
  strict: true,
  parameters: {
    type: 'object',
    additionalProperties: false,
    required: ['purpose', 'region', 'city', 'departments', 'queries', 'articles', 'budget', 'budget_currency'],
    properties: {
      purpose: { type: 'string', enum: ['assortment', 'product', 'contacts'] },
      region: { type: 'string', enum: ['site', ...regions], description: 'Use the actual region requested. Astana is kz, Almaty is almaty. Use site if unspecified.' },
      city: { type: 'string', description: 'Requested city if it is known. Otherwise use an empty string.' },
      departments: { type: 'array', items: { type: 'string', enum: Object.keys(departments) } },
      queries: { type: 'array', items: { type: 'string' }, description: 'Up to three short catalog search phrases. Use [] for a broad assortment.' },
      articles: { type: 'array', items: { type: 'string' }, description: 'Product SKUs mentioned by the user or referred to from conversation.' },
      budget: { type: ['number', 'null'], description: 'Maximum per-unit amount if stated, not the total purchase budget.' },
      budget_currency: { type: ['string', 'null'], enum: ['RUB', 'KZT', 'USD', 'AED', 'CNY', null] },
    },
  },
};

export async function loadPublicCatalog({ url, anonKey, fetcher, signal }) {
  const products = [];
  for (let offset = 0; ; offset += 500) {
    const params = new URLSearchParams({
      select: publicFields, status: 'neq.СКРЫТ', order: 'article.asc', limit: '500', offset: String(offset),
    });
    const response = await fetcher(url + '/rest/v1/laute_products?' + params, {
      headers: { apikey: anonKey, Authorization: 'Bearer ' + anonKey }, signal,
    });
    if (!response.ok) throw new Error('public_catalog_unavailable');
    const records = await response.json();
    if (!Array.isArray(records)) throw new Error('invalid_catalog_response');
    products.push(...records.filter(p => p.article && p.status !== 'СКРЫТ').map(p => ({
      article: p.article, name: p.name, collection: p.collection, category: p.category, subcategory: p.subcategory,
      color: p.color, finish: p.finish, material: p.material, dimensions: p.dimensions,
      installType: p.install_type, description: p.description, specs: p.specs, extraSpecs: p.extra_specs,
      price: p.price, currency: p.currency,
    })));
    if (records.length < 500) return products;
  }
}

function summary(product, region, match) {
  return {
    article: product.article, category: product.category, match,
    name: localText(product.name, 180), subcategory: localText(product.subcategory, 140),
    color: localText(product.color || product.finish, 90), material: localText(product.material, 100),
    install_type: localText(product.installType, 130), dimensions: localText(product.dimensions, 220),
    specs: localText(product.specs, 1500), notes: localText(product.extraSpecs, 200),
    price: getRegionalProductPrice(product, region), currency: getRegionalCurrency(region),
  };
}

export function lookupPublicFacts(args, products, siteRegion, lang) {
  const region = regions.includes(args.region) ? args.region : siteRegion;
  const regionInfo = getRegionConfig(region);
  const currency = getRegionalCurrency(region);
  const budget = typeof args.budget === 'number' && args.budget > 0 ? args.budget : null;
  const incompatibleCurrency = budget !== null && args.budget_currency && args.budget_currency !== currency;
  const mode = args.purpose;
  const location = localText(args.city, 60);
  const groups = Array.isArray(args.departments) ? args.departments.filter(id => Object.hasOwn(departments, id)).slice(0, 5) : [];
  const requested = Array.isArray(args.articles) ? [...new Set(args.articles.filter(a => typeof a === 'string').map(compactSku))].slice(0, 8) : [];
  const queries = Array.isArray(args.queries) ? args.queries.map(q => localText(q, 120)).filter(Boolean).slice(0, 3) : [];
  const records = new Map(products.map(p => [compactSku(p.article), p]));
  const results = new Map();
  for (const sku of requested) {
    const product = records.get(sku);
    if (product) results.set(product.article, summary(product, region, 'exact_sku'));
  }
  const pool = products.filter(p => {
    const price = getRegionalProductPrice(p, region);
    return (!groups.length || groups.some(id => p.category === departments[id])) &&
      (budget === null || (!incompatibleCurrency && price !== null && price <= budget));
  });
  const ranges = !queries.length && !requested.length && mode !== 'contacts'
    ? (groups.length ? groups : mode === 'assortment' ? defaultAssortment : []) : [];
  const append = (matches, match) => {
    for (const p of matches) if (!results.has(p.article)) results.set(p.article, summary(p, region, match));
  };
  for (const query of queries) append(searchCatalog(pool, query, 'smart').slice(0, 4), 'matches_query');
  for (const group of ranges) {
    const category = pool.filter(p => p.category === departments[group]);
    const prices = category.map(p => getRegionalProductPrice(p, region)).filter(p => p !== null).sort((a, b) => a - b);
    const median = prices[Math.floor(prices.length / 2)];
    const distance = p => Math.abs((getRegionalProductPrice(p, region) ?? Infinity) - median);
    if (prices.length) category.sort((a, b) => distance(a) - distance(b));
    append(category.slice(0, 2), 'category_sample');
  }
  if (mode !== 'contacts' && !results.size && groups.length && queries.length) {
    append(pool.slice(0, 3), 'category_only_attributes_unverified');
  }
  const index = lang === 'en' ? 2 : lang === 'kz' ? 1 : 0;
  const market = mode === 'assortment' ? regionalMarket[region] : null;
  const astana = mode === 'assortment' && region === 'kz' && /астан|astana/iu.test(location);
  const stats = astana ? ['В Астане ввели 3 048 269 м² жилья, +3,4% год к году. Данные за январь–сентябрь 2026.', '2026 жылғы қаңтар–қыркүйекте Астанада 3 048 269 м² тұрғын үй пайдалануға берілді, бір жылда +3,4%.', 'Astana completed 3,048,269 m² of housing in Jan–Sep 2026, +3.4% year on year.'][index]
    : market ? market.period[index] + '. ' + market.metric[index] : null;
  return {
    region, location, currency, incompatibleCurrency: Boolean(incompatibleCurrency),
    products: [...results.values()].slice(0, 10),
    missing_skus: requested.filter(sku => !records.has(sku)),
    market_context: stats ? { source_id: 'market_' + region, statistic: stats, refers_to: 'construction, not SKU-level sales' } : null,
    regional_source: market && { title: market.source + ' · ' + market.period[index], url: market.url },
    contacts: mode === 'contacts' ? { name: regionInfo.names[lang], sales: regionInfo.primaryEmail, service: regionInfo.serviceEmail, phone: regionInfo.primaryPhone } : null,
    data_availability: 'No private stock, negotiated prices, sales by SKU, seasonality, conversion rates, margins, or competitor data in this tool.',
  };
}
