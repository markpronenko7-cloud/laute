const kazakhstan = 'https://stat.gov.kz/ru/industries/business-statistics/stat-inno-build/publications/348860/';
const russia = 'https://www.rosstat.gov.ru/folder/313/document/288267?print=1';

// Dated construction indicators used as context for testing an assortment.
export const regionalMarket = {
  kz: {
    source: 'БНС РК',
    url: kazakhstan,
    period: ['январь–сентябрь 2026', '2026 жылғы қаңтар–қыркүйек', 'Jan–Sep 2026'],
    metric: ['В Казахстане введено 13,20 млн м² жилья (+2,7% год к году).', 'Қазақстанда 13,20 млн м² тұрғын үй пайдалануға берілді (бір жылда +2,7%).', 'Kazakhstan completed 13.20 million m² of housing (+2.7% year over year).'],
    categories: ['basin', 'kitchen', 'shower'],
  },
  almaty: {
    source: 'БНС РК',
    url: kazakhstan,
    period: ['январь–сентябрь 2026', '2026 жылғы қаңтар–қыркүйек', 'Jan–Sep 2026'],
    metric: ['В Алматы введено 2,03 млн м² жилья (+2,1% год к году), из них 1,91 млн м² в многоквартирных домах.', 'Алматыда 2,03 млн м² тұрғын үй пайдалануға берілді (бір жылда +2,1%), оның 1,91 млн м² көппәтерлі үйлерде.', 'Almaty completed 2.03 million m² of housing (+2.1% year over year), including 1.91 million m² in multi-unit buildings.'],
    categories: ['basin', 'shower', 'kitchen'],
  },
  moscow: {
    source: 'Росстат',
    url: russia,
    period: ['2025 год', '2025 жыл', '2025'],
    metric: ['На Москву пришлось 6,8% площади жилья, введённого в России.', 'Ресейде пайдалануға берілген тұрғын үй алаңының 6,8%-ы Мәскеуге тиесілі.', 'Moscow accounted for 6.8% of the housing floor area completed in Russia.'],
    categories: ['basin', 'shower', 'kitchen'],
  },
  siberia: {
    source: 'Росстат',
    url: russia,
    period: ['2025 год', '2025 жыл', '2025'],
    metric: ['На Новосибирскую область пришлось 2,3% площади жилья, введённого в России.', 'Ресейде пайдалануға берілген тұрғын үй алаңының 2,3%-ы Новосибирск облысына тиесілі.', 'Novosibirsk Oblast accounted for 2.3% of the housing floor area completed in Russia.'],
    categories: ['kitchen', 'basin', 'bath'],
  },
  uae: {
    source: 'Dubai Municipality',
    url: 'https://www.mediaoffice.ae/en/news/2026/march/25-03/dubai-records-strong-performance-in-the-construction-sector',
    period: ['I квартал 2026', '2026 жылғы I тоқсан', 'Q1 2026'],
    metric: ['В Дубае выдано 3 154 свидетельства о завершении строительства зданий.', 'Дубайда құрылыс аяқталғаны туралы 3 154 куәлік берілді.', 'Dubai issued 3,154 building completion certificates.'],
    categories: ['shower', 'basin', 'kitchen'],
  },
  usa: {
    source: 'U.S. Census Bureau',
    url: 'https://www.census.gov/construction/nrc/pdf/newresconst_202512.pdf',
    period: ['2025 год', '2025 жыл', '2025'],
    metric: ['В США завершено около 1,50 млн частных жилых единиц.', 'АҚШ-та шамамен 1,50 млн жеке тұрғын үй бірлігінің құрылысы аяқталды.', 'About 1.50 million privately owned housing units were completed in the United States.'],
    categories: ['kitchen', 'basin', 'shower'],
  },
  china: {
    source: 'National Bureau of Statistics of China',
    url: 'https://www.stats.gov.cn/english/PressRelease/202601/t20260120_1962353.html',
    period: ['2025 год', '2025 жыл', '2025'],
    metric: ['Девелоперы в Китае сдали 428,3 млн м² жилья (−20,2% год к году).', 'Қытайдағы құрылыс компаниялары 428,3 млн м² тұрғын үйді пайдалануға берді (бір жылда −20,2%).', 'Chinese real estate developers completed 428.3 million m² of residential buildings (−20.2% year over year).'],
    categories: ['basin', 'kitchen', 'bath'],
  },
};
