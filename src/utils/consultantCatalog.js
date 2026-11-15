import { getRegionName } from '../data/regionsData.js';
import { regionalMarket } from '../ai/knowledge/regionalMarket.js';
import { formatCatalogPrice, getRegionalCurrency, getRegionalProductPrice, normalizeCurrency } from './catalogPrice.js';
import { compactSku, matchCatalogCriteria, normalizeSearch, parseCatalogQuery } from './catalogSearch.js';
import { commercialTermsQuestion } from './consultantHelp.js';

const locations = [
  ['kz', /астан|\bastana\b/u, 'Астана'],
  ['almaty', /алмат|\balmaty\b/u],
  ['kz', /казахстан|қазақстан|\bkazakhstan\b/u],
  ['moscow', /москв|мәскеу|\bmoscow\b/u],
  ['siberia', /сибир|новосибирск|\b(siberia|novosibirsk)\b/u],
  ['uae', /оаэ|баә|дуба[йея]|\b(uae|dubai)\b/u],
  ['usa', /сша|ақш|\busa\b/u],
  ['china', /кита[йея]|қытай|\bchina\b/u]
];

const compare = /сравн|разниц|отлича|чем отлич|compare|difference|салыстыр|айырмаш/u;
const wholesale = /закуп|пробн[а-я]+\s+парти|перепрод|продавал|продаж|спрос|марж|оптом|рынок|рынка|сотрудничеств|market|wholesale|resell|sell[- ]through|assortment|partnership|trial order|ассортимент|көтерме|нарық|серіктестік/u;
const priceQuestion = /цен[ауые]|сто[ияи]|почем|дешев|дороже|бюджет|тенге|рублей|[₽₸]|price|cost|cheaper|budget|баға|арзан/u;
const stockQuestion = /налич|остат|склад|stock|availability|қойма/u;
const detailFields = [
  [/картридж|cartridge/u, /картридж|cartridge/u],
  [/аэратор|aerator/u, /аэратор|aerator/u],
  [/гарант|warranty|кепілдік/u, /гарант|warranty|кепілдік/u],
  [/излив|spout|шүмек/u, /излив|spout|шүмек/u, 'dimensions'],
  [/размер|габарит|высот|dimension|height|өлшем/u, /размер|габарит|высот|dimension|height|өлшем/u, 'dimensions'],
  [/монтаж|установ|install|орнат/u, /монтаж|установ|install|орнат/u, 'installType'],
  [/материал|корпус|material/u, /материал|корпус|material/u, 'material'],
];
const followUp = /^(?:а\s+|еще\b|еще |из них|перв[а-я]+|втор[а-я]+|трет[а-я]+|and\b|what about\b|the (first|second|third)|ал\s+)/u;
const ordinal = [/перв[а-я]+|\bfirst\b/u, /втор[а-я]+|\bsecond\b/u, /трет[а-я]+|\bthird\b/u];
const skuPattern = /(?<![\p{L}\p{N}])[a-z]+-?\s*\d+[a-z\d]*(?:-[a-z\d]+)*(?![\p{L}\p{N}])/gu;
const astanaSource = { title: 'БНС РК · 01–09.2026', url: 'https://stat.gov.kz/ru/industries/business-statistics/stat-inno-build/publications/348860/' };

const copy = {
  ru: {
    compare: 'Сравнение по карточкам LAUTE', found: 'Подбор по каталогу LAUTE', single: 'По карточке LAUTE',
    options: 'Чтобы выбрать между ними, проверьте тип монтажа и размеры по чертежу в карточке.',
    noMatches: 'В опубликованном каталоге не нашлось модели, которая подтверждённо соответствует этим условиям.',
    unknownSku: 'В опубликованном каталоге не найден артикул',
    needCompare: 'С какой моделью сравнить? Можно указать артикул или модель из последней подборки.',
    needProduct: 'Какой артикул или тип изделия вас интересует?',
    price: 'Цена', noPrice: 'Цена по запросу', wholesalePrice: 'Цена по аккаунту',
    stock: 'Остаток', noStock: 'Количество на выбранном складе не указано.',
    privateStock: 'Точные складские остатки доступны после входа в кабинет партнёра.',
    market: place => `Для пробной закупки в регионе «${place}» я бы начал с этой подборки.`,
    marketLimits: 'Доступных данных о продажах по моделям, сезонности и марже нет. Для теста беру активные позиции по вашему запросу, отдаю приоритет подтверждённому наличию и выбираю модели около середины доступных цен в каждой категории.',
    marketNext: 'Перед закупкой уточните срок поставки и цену, а на пробной партии измерьте продажи и маржу с учётом доставки.',
    astana: 'По данным БНС РК, за январь–сентябрь 2026 года в Астане ввели 3,05 млн м² жилья (+3,4% год к году). Это контекст для рынка ремонта и строительства.',
    cheaper: 'Варианты с подтверждённой ценой, начиная с меньшей', priceScope: place => `Регион цен: ${place}.`,
    incompatibleBudget: 'Для проверки этого бюджета нужна цена в той же валюте. Выберите соответствующий регион каталога.',
    noSpec: 'В карточке это значение не указано.',
  },
  en: {
    compare: 'Comparison from the LAUTE catalog', found: 'These LAUTE models match your request', single: 'From the LAUTE product card',
    options: 'Check installation and dimensions in the product drawings before choosing.',
    noMatches: 'No published model has verified specifications that match these requirements.',
    unknownSku: 'SKU missing from the published catalog',
    needCompare: 'Which model should I compare it with? You can give a SKU or refer to the last shortlist.',
    needProduct: 'Which SKU or type of product are you looking for?',
    price: 'Price', noPrice: 'Price on request', wholesalePrice: 'Account price',
    stock: 'Stock', noStock: 'The selected warehouse has no published quantity.',
    privateStock: 'Sign in to the partner portal for exact warehouse quantities.',
    market: place => `For a trial order in ${place}, I would start with this shortlist.`,
    marketLimits: 'I have no accessible SKU-level sales, seasonality or margin data. This list uses active models that meet your criteria, prioritizing confirmed stock and prices near the middle of each category.',
    marketNext: 'Confirm pricing and delivery, then track sell-through and margin after shipping on a trial order.',
    astana: 'Kazakhstan’s Bureau of National Statistics reports 3.05 million m² of housing completed in Astana in Jan–Sep 2026 (+3.4% year over year). This gives context on construction activity.',
    cheaper: 'Options with confirmed prices, lowest first', priceScope: place => `Pricing region: ${place}.`,
    incompatibleBudget: 'To check that budget, choose a catalog region with prices in the same currency.',
    noSpec: 'The product card does not list this specification.',
  },
  kz: {
    compare: 'LAUTE каталогы бойынша салыстыру', found: 'Сұрауыңызға сәйкес LAUTE үлгілері', single: 'LAUTE карточкасы бойынша',
    options: 'Таңдау алдында карточкадағы сызбадан монтаж түрі мен өлшемін тексеріңіз.',
    noMatches: 'Жария каталогтан осы талаптарға сай расталған үлгі табылмады.',
    unknownSku: 'Жария каталогтан артикул табылмады',
    needCompare: 'Қай үлгімен салыстырайын? Артикулын немесе алдыңғы тізімдегі үлгіні айтыңыз.',
    needProduct: 'Қай артикул немесе өнім түрі қажет?',
    price: 'Бағасы', noPrice: 'Бағасы сұрау бойынша', wholesalePrice: 'Аккаунттағы баға',
    stock: 'Қалдық', noStock: 'Таңдалған қоймадағы саны көрсетілмеген.',
    privateStock: 'Қоймадағы нақты қалдықтар серіктес кабинетінде қолжетімді.',
    market: place => `«${place}» өңірінде сынақ үшін осы үлгілерден бастауға болады.`,
    marketLimits: 'Үлгілердің сатылымы, маусымдылығы мен маржасы туралы дерек қолжетімсіз. Талапқа сай белсенді үлгілердің ішінде қоймада бар және бағасы санаттың орта шамасына жақын тауарларға басымдық беремін.',
    marketNext: 'Баға мен жеткізу мерзімін нақтылап, сынақ партиясының сатылымы мен жеткізуден кейінгі маржасын өлшеңіз.',
    astana: 'ҰСБ дерегі бойынша, 2026 жылғы қаңтар–қыркүйекте Астанада 3,05 млн м² тұрғын үй пайдалануға берілді (бір жылда +3,4%).',
    cheaper: 'Бағасы расталған үлгілер, төмен бағадан бастап', priceScope: place => `Баға өңірі: ${place}.`,
    incompatibleBudget: 'Бюджетті тексеру үшін бағасы сол валютада көрсетілген өңірді таңдаңыз.',
    noSpec: 'Бұл сипаттама карточкада көрсетілмеген.',
  }
};

function parseBudget(query) {
  const match = query.match(/(?:до|не дороже|бюджет|under|up to|budget)\s+(\d+(?: \d{3})*)(?:\s*(тыс\.?|[kк]))?\s*(₽|руб[а-я]*|rub|₸|тенге|kzt|usd|aed|cny|\$)?(?=\s|$|[.,!?])/u);
  if (!match) return null;
  if (/^\s*(?:мм|см|mm|cm|литр|bar|бар)(?![\p{L}])/u.test(query.slice(match.index + match[0].length))) return null;
  const currency = match[3]?.startsWith('руб') ? 'RUB' : match[3] === 'тенге' ? 'KZT' : normalizeCurrency(match[3]);
  const limit = Number(match[1].replaceAll(' ', '')) * (match[2] ? 1000 : 1);
  return Number.isFinite(limit) && limit > 0 ? { limit, currency, phrase: match[0] } : null;
}

function productFacts(product, requested, labels) {
  if (requested.length) {
    const specs = String(product.specs || '').split(/\n|;\s+(?=[^;:]+:)/u);
    const details = requested.flatMap(([, key, field]) => {
      const matches = specs.filter(line => line.includes(':') && key.test(normalizeSearch(line.split(':')[0])));
      return matches.length ? matches : [(field && product[field]) || labels.noSpec];
    });
    return [...new Set(details)].join(' · ');
  }
  return [product.subcategory, product.color || product.finish, product.material,
    product.installType, product.dimensions].filter(Boolean).join(' · ');
}

export function createConsultantCatalog({ products, region, regionWarehouseMap, activeWarehouseId, canSeeStock, partnerPrices, getStockForSku, lang }) {
  const labels = copy[lang] || copy.ru;
  const active = products.filter(product => product.article && product.status !== 'СКРЫТ');
  const bySku = new Map(active.map(product => [compactSku(product.article), product]));
  const getPrice = (product, target) => partnerPrices
    ? partnerPrices[product.article]?.price ?? null : getRegionalProductPrice(product, target);
  const getCurrency = (product, target) => partnerPrices
    ? normalizeCurrency(partnerPrices[product.article]?.currency) : getRegionalCurrency(target);
  const getStock = (product, target) => canSeeStock
    ? getStockForSku(product.article, (target === region ? activeWarehouseId : regionWarehouseMap[target]) ?? null)
    : null;

  return {
    respond(message, context = {}) {
      const query = normalizeSearch(message);
      if (commercialTermsQuestion.test(query)) return null;
      const previous = context.selection || {};
      const inherited = (previous.articles?.map(article => bySku.get(compactSku(article))) || []).filter(Boolean);
      const where = locations.find(([, pattern]) => pattern.test(query));
      const comparing = compare.test(query);
      const askingPrice = priceQuestion.test(query);
      const askingStock = stockQuestion.test(query);
      const definition = /что такое|что это такое|what (is|are)\b|деген не/u.test(query);
      const details = definition ? [] : detailFields.filter(([pattern]) => pattern.test(query));
      const budget = parseBudget(query);
      const referenced = ordinal.map((pattern, i) => pattern.test(query) ? inherited[i] : null).filter(Boolean);
      const skuTokens = [...query.matchAll(skuPattern)].map(match => match[0])
        .filter(value => !/^(?:sus|cw|al|ip)\s*\d+$/iu.test(value));
      const exact = [...new Set([...skuTokens.map(value => bySku.get(compactSku(value))).filter(Boolean), ...referenced])];
      const missing = skuTokens.filter(value => !bySku.has(compactSku(value)));
      const continuing = followUp.test(query);
      const target = where?.[0] || (continuing || askingPrice || askingStock ? previous.region : null) || region;
      const place = where
        ? where[2] && lang !== 'ru' && lang !== 'kz' ? 'Astana' : where[2] || getRegionName(target, lang)
        : target === previous.region && previous.city || getRegionName(target, lang);
      const criteria = parseCatalogQuery(budget ? query.replace(budget.phrase, ' ') : query);
      criteria.terms = criteria.terms.filter(term => !locations.some(([, pattern]) => pattern.test(term)));
      const collectionTerms = criteria.terms.filter(term => active.some(p =>
        normalizeSearch(p.collection).replace(/^laute\s+/u, '') === term));
      const hasCriteria = criteria.categories.length || criteria.finishes.length || criteria.features.length || collectionTerms.length;
      const business = wholesale.test(query) || (previous.business && (continuing || !!where) &&
        !exact.length && !comparing && !askingPrice && !askingStock && (!details.length || hasCriteria));
      const searchRequest = /^(?:подбер|посовет|покаж|ищу|мне нуж|нуж|хочу|найди|какие|есть ли|find\b|show\b|i need|looking for|recommend|маған)/u.test(query);
      if (!(business || comparing || exact.length || missing.length || askingPrice || askingStock ||
        (hasCriteria && (followUp.test(query) || searchRequest || criteria.terms.length <= 1)) ||
        (details.length && inherited.length))) return null;

      const current = {
        categories: criteria.categories.length ? criteria.categories : (continuing || business && previous.business ? previous.criteria?.categories || [] : []),
        finishes: criteria.finishes.length ? criteria.finishes : (continuing ? previous.criteria?.finishes || [] : []),
        features: criteria.features.length ? criteria.features : (continuing ? previous.criteria?.features || [] : []),
        terms: collectionTerms.length ? collectionTerms : (continuing ? previous.criteria?.terms || [] : [])
      };
      const newContext = articles => ({ ...context, selection: { articles, criteria: current, business, region: target, city: place } });
      const response = (text, matches = [], sources = []) => ({
        text, recommendedProducts: matches, sources,
        newContext: newContext((referenced.length || !matches.length) && previous.articles
          ? previous.articles : matches.map(product => product.article))
      });

      if (budget?.currency && budget.currency !== getRegionalCurrency(target)) return response(labels.incompatibleBudget);
      if (missing.length) return response(`${labels.unknownSku}: ${missing.map(sku => sku.toUpperCase()).join(', ')}.`);
      const cheapest = /дешев|доступнее|cheaper|lowest price|арзан/u.test(query);
      const matched = matchCatalogCriteria(active, current);
      let models = exact.length ? exact
        : inherited.length && !hasCriteria && !business ? inherited
        : hasCriteria || business ? matched : [];
      if (comparing && exact.length === 1) models = [...new Set([...exact, ...inherited])];
      if (budget || cheapest) models = models.filter(product => {
        const price = getPrice(product, target);
        return price > 0 && (!budget || price <= budget.limit);
      }).sort((a, b) => getPrice(a, target) - getPrice(b, target));
      if (comparing && models.length < 2) return response(labels.needCompare);
      if (!models.length) return response(hasCriteria || budget || cheapest || business ? labels.noMatches : labels.needProduct);

      if (business && !exact.length && !cheapest) {
        const groups = [...new Set(models.map(product => product.category))];
        const categories = current.categories.length ? groups : [
          'Смесители для раковины', 'Кухонные смесители', 'Душевые системы и гарнитуры'
        ].filter(category => groups.includes(category));
        const shortlist = categories.flatMap(category => {
          const group = models.filter(product => product.category === category);
          const prices = group.map(p => getPrice(p, target)).filter(p => p > 0).sort((a, b) => a - b);
          const middle = prices[Math.floor(prices.length / 2)];
          const rank = p => getPrice(p, target) > 0 ? Math.abs(getPrice(p, target) - middle) : Infinity;
          return group.sort((a, b) => Number(getStock(b, target)?.quantity > 0) - Number(getStock(a, target)?.quantity > 0)
            || rank(a) - rank(b) || a.article.localeCompare(b.article)).slice(0, categories.length === 1 ? 3 : 1);
        });
        if (shortlist.length) models = shortlist;
      }

      models = models.slice(0, 3);
      const lines = models.map(product => {
        const value = getPrice(product, target);
        const currency = getCurrency(product, target);
        const price = value > 0 && currency
          ? `${partnerPrices ? labels.wholesalePrice : labels.price}: ${formatCatalogPrice(value, currency)}` : labels.noPrice;
        const stock = getStock(product, target);
        const quantity = stock?.quantity != null ? `${labels.stock} (${stock.warehouseName}): ${stock.quantity}` : '';
        const specificDetails = (exact.length || !hasCriteria) && !comparing && !business ? details : [];
        return [product.article, productFacts(product, specificDetails, labels), price, quantity].filter(Boolean).join(' — ');
      });
      const heading = comparing ? labels.compare : business ? labels.market(place)
        : cheapest ? labels.cheaper : models.length === 1 ? labels.single : labels.found;
      const isAstanaMarket = business && ['Астана', 'Astana'].includes(place);
      const market = business && regionalMarket[target];
      const locale = lang === 'en' ? 2 : lang === 'kz' ? 1 : 0;
      const marketFact = isAstanaMarket ? labels.astana : market && `${market.period[locale]}. ${market.metric[locale]}`;
      const sources = isAstanaMarket ? [astanaSource] : market ? [{ title: market.source, url: market.url }] : [];
      return response([
        heading,
        !partnerPrices ? labels.priceScope(place) : '',
        marketFact,
        business ? labels.marketLimits : '',
        lines.join('\n'),
        askingStock && !canSeeStock ? labels.privateStock : '',
        askingStock && canSeeStock && models.every(p => getStock(p, target)?.quantity == null) ? labels.noStock : '',
        business ? labels.marketNext : comparing ? labels.options : ''
      ].filter(Boolean).join('\n\n'), models, sources);
    }
  };
}
