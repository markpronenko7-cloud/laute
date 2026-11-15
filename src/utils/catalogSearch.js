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
const concepts = [
  ['kitchen', /\bkitchens?\b|кух(?:он|н)[а-я]*|асүй|ас\s+үй/gu],
  ['basin', /\b(basin|washbasin|vanity)\b|раковин[а-я]*|умывальник[а-я]*|қолжуғыш/gu],
  ['bath', /\b(bathtub|bath)\b|ванн[а-я]*/gu],
  ['shower system', /\b(shower\s+systems?|rain\s+shower)\b|душев[а-я]+\s+систем[а-я]*|тропическ[а-я]+\s+душ|душ\s+жүйес[іи]/gu],
  ['shower cabin', /\b(shower\s+(cabin|enclosure)s?)\b|душев[а-я]+\s+кабин[а-я]*|душ\s+кабинасы/gu],
  ['graphite', /\bgraphite\b|графит[а-я]*/gu],
  ['beige', /\bbeige\b|бежев[а-я]*|сарғыш/gu],
  ['gold', /\b(gold|golden)\b|золот[а-я]*|алтын/gu],
  ['black', /\bblack\b|черн[а-я]*|қара/gu],
  ['chrome', /\bchrome\b|хром[а-я]*/gu],
  ['filter', /\b(filter|filtered|purified)\b|фильтр[а-я]*|питьев[а-я]*|сүзгі/gu],
  ['pullout', /\b(pull[\s-]?out|pull[\s-]?down)\b|выдвижн[а-я]*/gu],
  ['thermostat', /\bthermostat(?:ic)?\b|термостат[а-я]*/gu],
];
const stopWords = new Set('a an the for with and please show me find want need mixer mixers tap taps faucet faucets мне нужен нужна нужны ищу покажи найди для со с под и смеситель смесителя смесители смесителей керек үшін араластырғыш'.split(' '));

const fields = product => [
  product.article, product.name, product.category, product.subcategory, product.collection,
  collectionName(product.collection), product.description, product.specs, product.extraSpecs,
  product.color, product.finish, product.material, product.purpose, product.installType
].map(normalizeSearch).filter(Boolean);

const words = value => value.match(/[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*/gu) || [];
const compactSku = value => normalizeSearch(value).replace(/[\s-]+/g, '');

export function searchCatalog(products, value, mode = 'standard') {
  const query = normalizeSearch(value);
  if (!query) return products;

  const queryConcepts = [];
  let remainder = query;
  if (mode === 'smart') {
    for (const [, pattern] of concepts) {
      if (query.match(pattern)) {
        queryConcepts.push(pattern);
        remainder = remainder.replace(pattern, ' ');
      }
    }
  }
  const terms = words(remainder).filter(word => mode !== 'smart' || !stopWords.has(word));
  const matches = [];
  for (const product of products) {
    const article = normalizeSearch(product.article);
    if (article && compactSku(article) === compactSku(query)) {
      matches.push({ product, score: 10 });
      continue;
    }
    const productFields = fields(product);
    const text = productFields.join(' ');
    const exactField = productFields.some(field => field.includes(query));
    const matchesTerms = terms.every(term => text.includes(term));
    const matchesConcepts = queryConcepts.every(pattern => text.match(pattern));
    if (exactField || ((terms.length || queryConcepts.length) && matchesTerms && matchesConcepts)) {
      matches.push({ product, score: article.startsWith(query) ? 5 : exactField ? 3 : 1 });
    }
  }
  return matches.sort((a, b) => b.score - a.score).map(match => match.product);
}
