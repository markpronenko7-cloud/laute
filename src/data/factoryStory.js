export const FACTORY_FILM = {
  id: 'laute-factory-film', type: 'factory_film', badge: 'LAUTE / МАТЕРИАЛЫ И ПРОИЗВОДСТВО',
  title: 'Характер рождается в деталях.',
  subtitle: 'Металл, точность обработки и внимание к поверхности. Короткий взгляд на производство LAUTE — и визуальная история материалов.',
  videoUrl: 'media/laute-factory-documentary.mp4', imageUrl: 'images/factory/surface-study.webp',
  buttonText: 'Обсудить сотрудничество', buttonLink: '/partners',
  style: { background: 'transparent', padding: 'lg' }
};

export const FACTORY_HISTORY = {
  id: 'laute-factory-history', type: 'factory_history', badge: 'ИСТОРИЯ, КОТОРАЯ ПРОДОЛЖАЕТСЯ',
  title: 'Следующий шаг — ближе к будущему.',
  subtitle: 'Новые коллекции. Новые маршруты. Тот же характер LAUTE.',
  items: [
    { year: '2025', title: 'Новая глава флагманского бренда', desc: 'Год масштабного расширения коллекций под флагманским брендом LAUTE. Solana, Ethereum и Bitcoin отсылают к миру Web3 и выражают интерес бренда к технологиям будущего. Web3 и AI становятся частью нового взгляда LAUTE на развитие отрасли.', note: 'SOLANA / ETHEREUM / BITCOIN' },
    { year: '2026', title: 'Алматы. На новом Шёлковом пути.', desc: 'LAUTE открывает склад в Алматы — одной из ключевых точек исторического Шёлкового пути. Это новый этап развития логистики и сотрудничества в Центральной Азии: завод становится ближе к своим партнёрам и их проектам.', note: 'LAUTE / ALMATY / CENTRAL ASIA' }
  ], style: { background: 'transparent', padding: 'lg' }
};

const previousTitles = ['Точность. Характер. LAUTE.', 'Завод. Изнутри.'];
const previousPosters = ['images/factory/robot.jpg', 'images/factory/motion-poster.jpg', 'images/factory/documentary-poster.jpg'];
const previousGalleryCopy = {
  "images/prod_casting.png": [
    "Литьё под давлением",
    "Прецизионное литьё корпусов из первичной латуни марки CW617N без внутренних полостей"
  ],
  "images/prod_machining.png": [
    "ЧПУ металлообработка",
    "Автоматизированная токарно-фрезерная обработка с микронными допусками резьбы"
  ],
  "images/prod_polishing.png": [
    "Роботизированная полировка",
    "Зеркальная полировка поверхности перед нанесением гальванического и PVD слоёв"
  ],
  "images/prod_coating.png": [
    "PVD вакуумное осаждение",
    "Молекулярное напыление титана: стойкость к царапинам и бытовой химии"
  ],
  "images/prod_testing.png": [
    "Гидродинамическое тестирование",
    "100% проверка каждого смесителя воздухом и водой под давлением 16 бар"
  ],
  "images/prod_qc.png": [
    "Выходной контроль ОТК",
    "Инспекция геометрии, плавности хода картриджа и толщины защитного слоя"
  ],
  "images/factory/brass.jpg": [
    "Форма будущего изделия",
    "Латунные заготовки в начале производственного маршрута."
  ],
  "images/factory/machining.jpg": [
    "Производственная оснастка",
    "Формы и рабочие узлы оборудования в цехе."
  ],
  "images/factory/robot.jpg": [
    "Роботизированная полировка",
    "Автоматизация повторяемых операций обработки поверхности."
  ],
  "images/factory/polishing.jpg": [
    "Внимание к поверхности",
    "Обработка деталей на полировальном оборудовании."
  ],
  "images/factory/finishing.jpg": [
    "Работа мастера",
    "Ручная доводка изделий в производственном цехе."
  ],
  "images/factory/geometry.jpg": [
    "Сложная геометрия",
    "Корпуса и внутренняя конструкция изделий до финишной обработки."
  ]
};
const previousStoryText = "Бренд LAUTE создан для профессионалов сантехнического рынка. Мы проектируем продукцию с запасом прочности более 25 лет. Каждый смеситель проходит 100% контроль давлением 16 бар перед отправкой с завода. Используются исключительно экологичные сплавы латуни CW617N и оригинальные испанские картриджи Sedal Group.";

function upgradeCompanyBlock(block) {
  if (block.id === 'blk-comp-hero' && block.type === 'hero') return { ...block, ...FACTORY_FILM };
  if (block.type === 'factory_film') {
    const legacyFilm = block.videoUrl === 'media/laute-factory-film.mp4';
    const documentary = block.videoUrl === FACTORY_FILM.videoUrl;
    if (!legacyFilm && !documentary) return block;
    const patch = {};
    if (legacyFilm) patch.videoUrl = FACTORY_FILM.videoUrl;
    if (previousPosters.includes(block.imageUrl) || (legacyFilm && !block.imageUrl)) patch.imageUrl = FACTORY_FILM.imageUrl;
    if (previousTitles.includes(block.title)) {
      patch.title = FACTORY_FILM.title;
      patch.subtitle = FACTORY_FILM.subtitle;
      patch.badge = FACTORY_FILM.badge;
    }
    return Object.keys(patch).length ? { ...block, ...patch } : block;
  }
  if (block.id === 'blk-comp-story' && ['images/pvd_finish_macro.jpg', 'images/factory/finishing.jpg'].includes(block.imageUrl)) {
    const defaultCopy = block.title === 'Безупречное качество без компромиссов' && block.content === previousStoryText;
    return {
      ...block, imageUrl: 'images/factory/craft-study.webp',
      ...(defaultCopy ? {
        badge: 'ВНИМАНИЕ К ДЕТАЛЯМ', title: 'Точность, которую замечаешь.',
        subtitle: 'Материал. Геометрия. Поверхность.',
        content: 'Характер изделия складывается из небольших решений: линии корпуса, перехода между поверхностями, ощущения металла в руке. Мы смотрим на эти детали как на единое целое — от первой формы до последнего штриха.'
      } : {})
    };
  }
  if (block.id === 'blk-comp-prod-gallery' && block.items?.length > 0 && ['Лабораторный контроль и технологии завода', 'Производство без постановки'].includes(block.title) && block.badge === 'ПРОИЗВОДСТВЕННЫЙ ЦИКЛ' && block.items.every(item => {
    const previous = previousGalleryCopy[item.imageUrl];
    return previous && item.title === previous[0] && item.desc === previous[1];
  })) {
    return {
      ...block, badge: 'ВИЗУАЛЬНЫЕ ЭТЮДЫ', title: 'Материал и форма.',
      subtitle: 'Иллюстративная серия о металле и обработке. Изображения созданы с помощью ИИ.',
      items: [
        { title: 'Сначала — материал.', desc: 'Тёплый тон латуни, геометрия заготовки и след инструмента. Визуальное исследование формы.', imageUrl: 'images/factory/metal-study.webp' },
        { title: 'Форма обретает точность.', desc: 'Ритм обработки и внимание к поверхности. Концептуальная сцена, вдохновлённая работой с металлом.', imageUrl: 'images/factory/machining-study.webp' }
      ]
    };
  }
  return block;
}

// Migrate only known shipped defaults. Staff-authored text, images and visibility
// survive; returning existing references keeps repeated reads idempotent.
export function getCompanyBlocks(blocks = []) {
  const result = blocks.map(upgradeCompanyBlock);
  if (!result.some(block => block.type === 'factory_film')) result.unshift(FACTORY_FILM);
  if (!result.some(block => block.type === 'factory_history')) {
    const cta = result.findIndex(block => block.type === 'cta_banner');
    result.splice(cta < 0 ? result.length : cta, 0, FACTORY_HISTORY);
  }
  return result.length === blocks.length && result.every((block, index) => block === blocks[index]) ? blocks : result;
}
