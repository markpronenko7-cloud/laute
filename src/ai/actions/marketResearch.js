import { getRegionName } from '../../data/regionsData.js';
import { formatCatalogPrice, getRegionalCurrency, getRegionalProductPrice } from '../../utils/catalogPrice.js';
import { normalizeSearch } from '../../utils/catalogSearch.js';
import { regionalMarket } from '../knowledge/regionalMarket.js';

const marketIntent = /^(рынок|нарық|market)\s*:|рынок|рынк[а-я]+|коммерческ[а-я]+\s+потенциал|для перепродажи|анализ.*сотрудничеств|нарық|серіктестік.*талда|market\s+(research|analysis)|wholesale assortment|analy[sz]e partnership/u;
const regions = {
  almaty: /алмат|almaty/u,
  kz: /казахстан|қазақстан|астан|astana|kazakhstan/u,
  moscow: /москв|мәскеу|moscow/u,
  siberia: /сибир|сібір|новосибирск|siberia|novosibirsk/u,
  uae: /оаэ|баә|дуба[йея]|\buae\b|dubai/u,
  usa: /сша|ақш|соединенн[а-я]+ штат|\busa\b|united states/u,
  china: /кита[йея]|қытай|\bchina\b/u,
};
const categories = {
  kitchen: [/кух[онн]|кухн|асүй|kitchen/u, 'Кухонные смесители', 'Асүй араластырғыштары', 'Kitchen mixers', 'Кухонные смесители'],
  basin: [/раковин|умывальник|қолжуғыш|basin/u, 'Смесители для раковины', 'Қолжуғыш араластырғыштары', 'Basin mixers', 'Смесители для раковины'],
  bath: [/ванн|bath mixers?|ванна/u, 'Смесители для ванны', 'Ванна араластырғыштары', 'Bath mixers', 'Смесители для ванны'],
  shower: [/душев[а-я]+\s+систем|душ\s+жүйе|shower system/u, 'Душевые системы', 'Душ жүйелері', 'Shower systems', 'Душевые системы и гарнитуры'],
};

const copy = {
  ru: {
    title: 'Подбор для теста ассортимента',
    method: 'Строительная статистика — ориентир масштаба рынка. Для подбора беру активные модели LAUTE из выбранной категории. При наличии местных цен начинаю с середины ценового диапазона каталога.',
    missing: 'Для части предложений в региональной валюте цена отсутствует. Уточните цену и поставку перед заказом.',
    empty: 'В этой выборке пока нет подходящих активных моделей с указанными условиями.',
    validate: 'Для оценки закупки сравните местные розничные цены, полную себестоимость с доставкой и продажи пробной партии.',
    prompt: 'Рынок',
  },
  kz: {
    title: 'Сынақ ассортиментін таңдау',
    method: 'Құрылыс статистикасы нарық ауқымын көрсетеді. Таңдалған санаттағы белсенді LAUTE модельдерін қараймын. Жергілікті баға болса, алдымен каталогтағы орташа баға сегментін ұсынамын.',
    missing: 'Кейбір ұсыныстардың өңір валютасындағы бағасы берілмеген. Тапсырыс алдында баға мен жеткізуді нақтылаңыз.',
    empty: 'Осы шарттарға сай белсенді модель әзірге табылмады.',
    validate: 'Сатып алуды бағалау үшін жергілікті бөлшек бағаларды, жеткізуді қосқандағы шығынды және сынақ партиясының сатылымын салыстырыңыз.',
    prompt: 'Нарық',
  },
  en: {
    title: 'Assortment to test',
    method: 'Construction statistics provide market context. The shortlist draws from active LAUTE models in the selected category, prioritizing the middle of the catalog price range where local prices are available.',
    missing: 'Some shortlisted models lack a price in the regional currency. Confirm prices and delivery before ordering.',
    empty: 'No active catalog models match these criteria yet.',
    validate: 'To evaluate an order, compare local retail prices, landed costs and sell-through on a trial order.',
    prompt: 'Market',
  },
};

export function researchRegionalMarket({ query, context, products, region, lang }) {
  const text = normalizeSearch(query);
  const explicitRegion = Object.keys(regions).find(id => regions[id].test(text));
  const category = Object.keys(categories).find(id => categories[id][0].test(text));
  const explicitMarket = marketIntent.test(text);
  if (!explicitMarket && !(context?.marketRegion && explicitRegion && text.length < 48)) return null;

  const marketRegion = explicitRegion || context?.marketRegion || region;
  const market = regionalMarket[marketRegion] || regionalMarket.siberia;
  const idx = lang === 'en' ? 2 : lang === 'kz' ? 1 : 0;
  const labels = copy[lang] || copy.ru;
  const currency = getRegionalCurrency(marketRegion);
  const regionLabel = getRegionName(marketRegion, lang);
  const selectedCategories = category ? [category] : market.categories;

  const candidates = selectedCategories.flatMap(id => {
    const group = products
      .filter(p => p.status !== 'СКРЫТ' && p.article && p.category === categories[id][4])
      .map(product => ({ product, price: getRegionalProductPrice(product, marketRegion) }));
    const prices = group.map(item => item.price).filter(price => price !== null).sort((a, b) => a - b);
    const median = prices[Math.floor(prices.length / 2)];
    group.sort((a, b) => Number(a.price === null) - Number(b.price === null)
      || (a.price !== null && b.price !== null ? Math.abs(a.price - median) - Math.abs(b.price - median) : 0)
      || a.product.article.localeCompare(b.product.article));
    const collections = new Set();
    return group.filter(({ product }) => {
      const key = product.collection || product.article;
      if (collections.has(key)) return false;
      collections.add(key);
      return true;
    }).slice(0, category ? 3 : 1);
  });

  const textLines = [
    labels.title + ' · ' + regionLabel,
    market.period[idx] + '. ' + market.metric[idx],
    labels.method,
    candidates.map(({ product, price }) => product.article + (price === null ? '' : ' — ' + formatCatalogPrice(Math.round(price), currency))).join('\n') || labels.empty,
    candidates.some(entry => entry.price === null) ? labels.missing : '',
    labels.validate,
  ];
  return {
    text: textLines.filter(Boolean).join('\n\n'),
    sources: [{ title: market.source + ' · ' + market.period[idx], url: market.url }],
    recommendedProducts: candidates.map(entry => entry.product),
    marketPrices: Object.fromEntries(candidates.map(({ product, price }) => [product.article, price === null ? null : formatCatalogPrice(Math.round(price), currency)])),
    quickChips: Object.values(categories).map(group => labels.prompt + ': ' + group[idx + 1]),
    newContext: { ...context, marketRegion },
  };
}
