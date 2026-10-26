export const FACTORY_FILM = {
  id: 'laute-factory-film', type: 'factory_film', badge: 'LAUTE / ВНУТРИ ПРОИЗВОДСТВА',
  title: 'Завод. Изнутри.',
  subtitle: 'За каждым изделием — металл, технологии и люди. Короткая экскурсия по производству LAUTE: от латунной заготовки до обработки поверхности.',
  videoUrl: 'media/laute-factory-documentary.mp4', imageUrl: 'images/factory/documentary-poster.jpg',
  buttonText: 'Обсудить сотрудничество', buttonLink: '/partners',
  style: { background: 'deep', padding: 'lg' }
};

export const FACTORY_HISTORY = {
  id: 'laute-factory-history', type: 'factory_history', badge: 'ИСТОРИЯ, КОТОРАЯ ПРОДОЛЖАЕТСЯ',
  title: 'Следующий шаг — ближе к будущему.',
  subtitle: 'Новые коллекции. Новые маршруты. Тот же характер LAUTE.',
  items: [
    { year: '2025', title: 'Новая глава флагманского бренда', desc: 'Год масштабного расширения коллекций под флагманским брендом LAUTE. Solana, Ethereum и Bitcoin отсылают к миру Web3 и выражают интерес бренда к технологиям будущего. Web3 и AI становятся частью нового взгляда LAUTE на развитие отрасли.', note: 'SOLANA / ETHEREUM / BITCOIN' },
    { year: '2026', title: 'Алматы. На новом Шёлковом пути.', desc: 'LAUTE открывает склад в Алматы — одной из ключевых точек исторического Шёлкового пути. Это новый этап развития логистики и сотрудничества в Центральной Азии: завод становится ближе к своим партнёрам и их проектам.', note: 'LAUTE / ALMATY / CENTRAL ASIA' }
  ], style: { background: 'deep', padding: 'lg' }
};

// Upgrade the original company layout once. Saved factory blocks remain fully editable.
export function getCompanyBlocks(blocks = []) {
  const result = blocks.map(b => b.id === 'blk-comp-hero' && b.type === 'hero' ? { ...b, ...FACTORY_FILM } : b.type === 'factory_film' && b.videoUrl === 'media/laute-factory-film.mp4' ? {
    ...b, videoUrl: FACTORY_FILM.videoUrl, imageUrl: FACTORY_FILM.imageUrl,
    ...(b.title === 'Точность. Характер. LAUTE.' ? { title: FACTORY_FILM.title, subtitle: FACTORY_FILM.subtitle } : {})
  } : b.id === 'blk-comp-story' && b.imageUrl === 'images/pvd_finish_macro.jpg' ? {
    ...b, imageUrl: 'images/factory/finishing.jpg'
  } : b.id === 'blk-comp-prod-gallery' && b.items?.length > 0 && b.items.every(item => /^images\/prod_/.test(item.imageUrl || '')) ? {
    ...b, title: 'Производство без постановки', subtitle: 'Настоящие кадры из производственных цехов',
    items: [
      { title: 'Форма будущего изделия', desc: 'Латунные заготовки в начале производственного маршрута.', imageUrl: 'images/factory/brass.jpg' },
      { title: 'Производственная оснастка', desc: 'Формы и рабочие узлы оборудования в цехе.', imageUrl: 'images/factory/machining.jpg' },
      { title: 'Роботизированная полировка', desc: 'Автоматизация повторяемых операций обработки поверхности.', imageUrl: 'images/factory/robot.jpg' },
      { title: 'Внимание к поверхности', desc: 'Обработка деталей на полировальном оборудовании.', imageUrl: 'images/factory/polishing.jpg' },
      { title: 'Работа мастера', desc: 'Ручная доводка изделий в производственном цехе.', imageUrl: 'images/factory/finishing.jpg' },
      { title: 'Сложная геометрия', desc: 'Корпуса и внутренняя конструкция изделий до финишной обработки.', imageUrl: 'images/factory/geometry.jpg' }
    ]
  } : b);
  if (!result.some(b => b.type === 'factory_film')) result.unshift(FACTORY_FILM);
  if (!result.some(b => b.type === 'factory_history')) {
    const cta = result.findIndex(b => b.type === 'cta_banner');
    result.splice(cta < 0 ? result.length : cta, 0, FACTORY_HISTORY);
  }
  return result.length === blocks.length && result.every((block, index) => block === blocks[index]) ? blocks : result;
}
