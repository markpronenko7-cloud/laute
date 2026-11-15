const collections = { arb: 'Arbitrum', arbitrum: 'Arbitrum', leo: 'Leo', link: 'Link', trump: 'Trump', sky: 'SKY' };

export const normalizeSearch = value => String(value ?? '').normalize('NFKC').toLowerCase()
  .replaceAll('ё', 'е').replace(/[‐‑‒–—]/g, '-').trim().replace(/\s+/g, ' ');

export function collectionName(value) {
  const name = String(value ?? '').trim().replace(/^laute\s+/i, '');
  const key = normalizeSearch(name);
  return Object.hasOwn(collections, key) ? collections[key] : name;
}

export const collectionKey = value => normalizeSearch(collectionName(value));

export function catalogRoute(filters = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? 'catalog?' + query : 'catalog';
}

// Prefixes cover common Russian/Kazakh inflections and catalog terms used across languages.
const categories = [
  ['kitchen', /\bkitchens?\b|кухн[а-я]*|кухон[а-я]*|асүй|ас\s+үй/gu],
  ['basin', /\b(basin|washbasin|vanity)\b|раковин[а-я]*|умывальник[а-я]*|қолжуғыш/gu],
  ['bath', /\b(bathtub|bath)\b|ванн[а-я]*/gu],
  ['shower system', /\b(shower\s+systems?|rain\s+shower)\b|душев[а-я]+\s+систем[а-я]*|тропическ[а-я]+\s+душ|душ\s+жүйес[іи]|душев[а-я]+\s+гарнитур[а-я]*/gu],
  ['shower cabin', /\b(shower\s+(cabin|enclosure)s?)\b|душев[а-я]+\s+кабин[а-я]*|душ\s+кабинасы/gu],
];
const finishes = [
  ['graphite', /\bgraphite\b|графит[а-я]*/gu],
  ['beige', /\bbeige\b|бежев[а-я]*|сарғыш/gu],
  ['gold', /\b(gold|golden)\b|золот[а-я]*|алтын/gu],
  ['black', /\bblack\b|черн[а-я]*|қара/gu],
  ['chrome', /\bchrome\b|хром[а-я]*/gu],
  ['satin', /\bsatin\b|сатин[а-я]*/gu],
  ['matte', /\b(matte|matt)\b|матов[а-я]*|күңгірт/gu],
];
const features = [
  ['filter', /\b(filter|filtered|purified)\b|фильтр[а-я]*|питьев[а-я]*|сүзгі/gu],
  ['pullout', /\b(pull[\s-]?out|pull[\s-]?down)\b|выдвиж(?:н|ен)[а-я]*|вытяжн[а-я]*/gu],
  ['flexible', /\bflexible\s+(spout|neck)\b|гибк[а-я]+\s+(?:высок[а-я]+\s+)?излив[а-я]*/gu],
  ['wall', /\bwall[\s-]?mount(?:ed)?\b|настенн[а-я]*|на\s+стен[ауеы]/gu],
  ['thermostat', /\bthermostat(?:ic)?\b|термостат[а-я]*/gu],
];
const stopWords = new Set('a an the for with and please show me find want need mixer mixers tap taps faucet faucets мне нужен нужна нужны ищу хочу покажи подбери предложи посоветуй пожалуйста найди вариант варианты модель модели кран краны для со с под в и или есть какой какие где смеситель смесителя смесители смесителей керек үшін араластырғыш'.split(' '));

const words = value => value.match(/[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*/gu) || [];
export const compactSku = value => normalizeSearch(value).replace(/[\s-]+/g, '');
const textOf = (...values) => values.map(normalizeSearch).filter(Boolean).join(' ');

export function parseCatalogQuery(value) {
  let remainder = normalizeSearch(value);
  const groups = [categories, finishes, features].map(group => group.reduce((chosen, [id, pattern]) => {
    if (!remainder.match(pattern)) return chosen;
    remainder = remainder.replace(pattern, ' ');
    return [...chosen, id];
  }, []));
  return {
    categories: groups[0], finishes: groups[1], features: groups[2],
    terms: words(remainder).filter(term => !stopWords.has(term))
  };
}

export function matchCatalogCriteria(products, criteria) {
  const matchesGroup = (definitions, requested, text) => requested.every(id =>
    text.match(definitions.find(([key]) => key === id)[1]));

  return products.filter(product => {
    const department = textOf(product.category || product.name);
    const finish = textOf(product.color, product.finish, product.name);
    const technical = textOf(product.name, product.subcategory, product.specs, product.extraSpecs, product.installType);
    if (!matchesGroup(categories, criteria.categories, department) ||
        !matchesGroup(finishes, criteria.finishes, finish) ||
        !matchesGroup(features, criteria.features, technical)) return false;

    const text = textOf(product.article, product.name, product.category, product.subcategory, product.collection,
      collectionName(product.collection), product.description, product.specs, product.extraSpecs,
      product.color, product.finish, product.material, product.installType, product.dimensions);
    return criteria.terms.every(term => text.includes(term));
  });
}

export function searchCatalog(products, value, mode = 'standard') {
  const query = normalizeSearch(value);
  if (!query) return products;

  const criteria = mode === 'smart' ? parseCatalogQuery(query) : null;
  const semanticMatches = criteria && Object.values(criteria).some(group => group.length)
    ? new Set(matchCatalogCriteria(products, criteria)) : new Set();
  const literalTerms = words(query);
  const matches = [];
  for (const product of products) {
    const article = normalizeSearch(product.article);
    const literal = [article, product.name, product.collection, collectionName(product.collection)]
      .some(field => normalizeSearch(field).includes(query));
    const names = textOf(article, product.name, product.collection, collectionName(product.collection));
    const matchNames = literalTerms.length > 1 && literalTerms.every(term => names.includes(term));
    const score = article && compactSku(article) === compactSku(query) ? 10
      : article.startsWith(query) ? 5 : literal ? 3 : matchNames ? 2 : semanticMatches.has(product) ? 1 : 0;
    if (score) matches.push({ product, score });
  }
  return matches.sort((a, b) => b.score - a.score).map(match => match.product);
}
