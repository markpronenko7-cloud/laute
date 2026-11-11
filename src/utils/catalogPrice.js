const currencyByRegion = {
  siberia: 'RUB', moscow: 'RUB', kz: 'KZT', almaty: 'KZT',
  uae: 'AED', usa: 'USD', china: 'CNY'
};

const currencySymbols = { RUB: '₽', KZT: '₸', USD: '$', AED: 'AED', CNY: 'CNY' };
const currencyCodes = { '₽': 'RUB', '₸': 'KZT', '$': 'USD', '¥': 'CNY' };

export function getRegionalCurrency(region) {
  return currencyByRegion[region] || 'RUB';
}

export function normalizeCurrency(currency) {
  const value = String(currency || '').trim().toUpperCase();
  return currencyCodes[value] || value;
}

export function getRegionalProductPrice(product, region) {
  const price = Number(product.price);
  const currency = normalizeCurrency(product.currency);
  return currency === getRegionalCurrency(region) && Number.isFinite(price) && price > 0 ? price : null;
}

export function formatCatalogPrice(price, currency) {
  const code = normalizeCurrency(currency);
  return `${Number(price).toLocaleString('ru-RU')} ${currencySymbols[code] || code}`.trim();
}
