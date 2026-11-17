export const TRUMP_HERO_SLIDE = {
  id: 'slide-trump',
  tagline: 'КОЛЛЕКЦИЯ LAUTE',
  title: 'LAUTE Trump',
  subtitle: 'TRUMP101GQ · TRUMP194',
  buttonText: 'Смотреть коллекцию',
  buttonLink: 'catalog?collection=trump',
  image: 'images/campaign/trump.webp?v=5',
  order: 0,
  isVisible: true
};

export function withTrumpHero(content) {
  const homeBlocks = content?.homeBlocks;
  const slides = homeBlocks?.heroSlider;
  if (homeBlocks?.heroCampaignVersion || !Array.isArray(slides)) return content;
  const alreadyAdded = slides.some(slide => slide.id === TRUMP_HERO_SLIDE.id);
  if (!alreadyAdded && slides[0]?.id !== 'slide-1') return content;
  return {
    ...content,
    homeBlocks: {
      ...homeBlocks,
      heroCampaignVersion: 1,
      heroSlider: alreadyAdded ? slides : [{ ...TRUMP_HERO_SLIDE }, ...slides]
    }
  };
}

export const navigationKey = route => ({ company: 'about', 'where-to-buy': 'whereToBuy' }[route] || route);

export const getNavTranslation = (content, lang, item) => {
  const values = content?.translations?.[lang];
  const legacy = lang === 'kz' ? content?.translations?.kk : null;
  return values?.nav?.[navigationKey(item.route)] || values?.[`nav_${item.id}`] || legacy?.nav?.[navigationKey(item.route)] || legacy?.[`nav_${item.id}`] || '';
};

export const getNavigation = (content, lang, t) => {
  const routes = ['home', 'catalog', 'company', 'partners', 'where-to-buy', 'service', 'contacts'];
  const defaults = ['Главная', 'Каталог', 'О LAUTE', 'Партнёрам', 'Где купить', 'Первый цифровой сервис', 'Контакты'];
  return routes.map((route, index) => {
    const item = content?.navigation?.find(item => item.route === route);
    return {
      route, order: item?.order ?? index + 1,
      isVisible: item?.isVisible !== false,
      label: (lang === 'ru' && item?.label) || getNavTranslation(content, lang, item || { route }) || t?.nav?.[navigationKey(route)] || defaults[index]
    };
  }).filter(item => item.isVisible).sort((a, b) => a.order - b.order);
};

export const getPageSeo = (content, route) => {
  const seo = content?.seo || {};
  const alias = route === 'company' ? 'about' : route;
  const pageRoute = route === 'about' ? 'company' : route;
  return { ...seo.pages?.[pageRoute], ...seo.pages?.[alias], ...seo[route], ...seo[alias] };
};
