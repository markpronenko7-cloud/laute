export const FACTORY_FILM = {
  id: 'laute-factory-film', type: 'factory_film', badge: 'LAUTE / ВНУТРИ ПРОИЗВОДСТВА',
  title: 'Точность. Характер. LAUTE.',
  subtitle: 'От первой заготовки до последнего штриха. Посмотрите, как металл обретает форму, а инженерия — характер.',
  videoUrl: 'media/laute-factory-film.mp4', imageUrl: 'images/factory/robot.jpg',
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
  if (blocks.some(b => ['factory_film', 'factory_history'].includes(b.type))) return blocks;
  const result = blocks.map(b => b.id === 'blk-comp-hero' ? { ...b, ...FACTORY_FILM } : b.id === 'blk-comp-prod-gallery' ? {
    ...b, title: 'Производство без постановки', subtitle: 'Настоящие кадры из производственных цехов',
    items: [
      { title: 'Форма будущего изделия', desc: 'Латунные заготовки в начале производственного маршрута.', imageUrl: 'images/factory/brass.jpg' },
      { title: 'Точность обработки', desc: 'Рабочие зоны и оборудование механической обработки.', imageUrl: 'images/factory/machining.jpg' },
      { title: 'Роботизированная полировка', desc: 'Автоматизация повторяемых операций обработки поверхности.', imageUrl: 'images/factory/robot.jpg' },
      { title: 'Внимание к поверхности', desc: 'Обработка деталей на полировальном оборудовании.', imageUrl: 'images/factory/polishing.jpg' },
      { title: 'Работа мастера', desc: 'Ручная доводка изделий в производственном цехе.', imageUrl: 'images/factory/finishing.jpg' },
      { title: 'Сложная геометрия', desc: 'Корпуса и внутренняя конструкция изделий до финишной обработки.', imageUrl: 'images/factory/geometry.jpg' }
    ]
  } : b);
  if (!result.some(b => b.type === 'factory_film')) result.unshift(FACTORY_FILM);
  const cta = result.findIndex(b => b.type === 'cta_banner');
  result.splice(cta < 0 ? result.length : cta, 0, FACTORY_HISTORY);
  return result;
}
