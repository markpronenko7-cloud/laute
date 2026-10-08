/**
 * Контекст сервиса и региональной логистики LAUTE
 */

export const LAUTE_SERVICE_CONTEXT = {
  serviceDesk: {
    name: 'Цифровой Сервисный Центр LAUTE',
    slaHours: 36,
    channels: ['Онлайн-форма на сайте', 'Telegram Service Bot', 'Региональные представители'],
    replacementProtocol: 'При подтверждении гарантийного случая оригинальные картриджи или узлы отгружаются со складов присутствия (Алматы, Астана, Новосибирск, Москва).',
  },

  warrantyTerms: {
    body: '5 лет на литые латунные корпуса CW617N',
    cartridges: '2 года на керамические картриджи Sedal / Kerox',
    accessories: '2 года на душевые шланги, лейки, гибкую подводку и аэраторы',
    commercialUse: 'Для отелей и общественных объектов действует расширенная корпоративная сервисная программа.',
  },

  warehouses: [
    { city: 'Алматы', status: 'Активен', stockRole: 'Центральный хаб РК' },
    { city: 'Астана', status: 'Активен', stockRole: 'Северный регион' },
    { city: 'Новосибирск', status: 'Активен', stockRole: 'Сибирь и Дальний Восток' },
    { city: 'Москва', status: 'Активен', stockRole: 'Центральный регион РФ' },
  ]
};

export default LAUTE_SERVICE_CONTEXT;
