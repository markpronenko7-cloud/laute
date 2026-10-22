import React, { useState } from 'react';
import { FACTORY_FILM, FACTORY_HISTORY } from '../../data/factoryStory';
import {
  X,
  Type,
  Image as ImageIcon,
  Layout,
  Grid,
  Phone,
  FileText,
  HelpCircle,
  Sparkles,
  Columns,
  Layers,
  Sliders,
  CheckCircle2,
  Package,
  MapPin,
  Send,
  Plus
} from 'lucide-react';

export const BLOCK_TEMPLATES = [
  { type: 'factory_film', category: 'hero', name: 'Фильм о заводе', desc: 'Документальный ролик, обложка и крупная типографика', icon: Sparkles, defaultData: FACTORY_FILM },
  { type: 'factory_history', category: 'text', name: 'История завода', desc: 'Годы, этапы развития и новые направления бренда', icon: Type, defaultData: FACTORY_HISTORY },
  // 1. ТЕКСТОВЫЕ БЛОКИ
  {
    type: 'hero',
    category: 'hero',
    name: 'Hero: Главный экран',
    desc: 'Премиальный главный экран с бейджем, крупным заголовком, описанием и кнопкой действия',
    icon: Sparkles,
    defaultData: {
      badge: 'ПРЕМИАЛЬНАЯ САНТЕХНИКА',
      title: 'Инженерное совершенство сантехники LAUTE',
      subtitle: 'Латунь CW617N · Картриджи Sedal · Вакуумное PVD · Гарантия 5 лет',
      buttonText: 'Смотреть каталог',
      buttonLink: '/catalog',
      buttonType: 'primary',
      style: { background: 'dark', alignment: 'center', padding: 'lg' }
    }
  },
  {
    type: 'text',
    category: 'text',
    name: 'Текстовый блок с бейджем',
    desc: 'Блок для информационного содержания, условий, манифеста бренда или описания стандартов',
    icon: Type,
    defaultData: {
      badge: 'О СТАНДАРТАХ LAUTE',
      title: 'Безупречное качество без компромиссов',
      content: 'Бренд LAUTE создан для профессионалов сантехнического рынка. Мы проектируем продукцию с запасом прочности более 25 лет. Каждый смеситель проходит 100% контроль давлением 16 бар перед отправкой с завода.',
      style: { background: 'card', alignment: 'left', padding: 'md' }
    }
  },
  {
    type: 'columns',
    category: 'text',
    name: 'Текст в две колонки',
    desc: 'Разделение текста на две аккуратные параллельные колонки с возможностью списков',
    icon: Columns,
    defaultData: {
      badge: 'ТЕХНИЧЕСКИЙ РЕГЛАМЕНТ',
      title: 'Инженерные спецификации и материалы',
      col1Title: 'Конструкция и гидравлика',
      col1Text: 'Корпуса смесителей отливаются под давлением из первичной конструкционной латуни CW617N. Толщина стенок предотвращает растрескивание при резких скачках давления.',
      col2Title: 'Керамические узлы Sedal',
      col2Text: 'Оригинальные картриджи Sedal Group (Испания) с полированными дисками из оксида алюминия гарантируют свыше 500 000 рабочих циклов без протечек.',
      style: { background: 'dark', alignment: 'left', padding: 'md' }
    }
  },

  // 2. ИЗОБРАЖЕНИЯ & МЕДИА
  {
    type: 'image_text',
    category: 'media',
    name: 'Изображение с текстом',
    desc: 'Презентация материала или детали: фотография слева или справа и акцентный текст с кнопкой',
    icon: Layout,
    defaultData: {
      badge: 'ТЕХНОЛОГИИ',
      title: 'Вакуумное молекулярное PVD-осаждение',
      subtitle: 'Стойкость к истиранию и бытовой химии',
      content: 'Многослойное вакуумное напыление титана и циркония внедряется в кристаллическую решетку металла. Покрытие не отслаивается со временем и сохраняет глубокий сатиновый блеск.',
      imageUrl: 'images/pvd_finish_macro.jpg',
      imagePosition: 'right',
      buttonText: 'Подробнее о технологиях',
      buttonLink: '/company',
      buttonType: 'outline',
      style: { background: 'card', alignment: 'left', padding: 'lg' }
    }
  },
  {
    type: 'gallery',
    category: 'media',
    name: 'Фотогалерея / Производство',
    desc: 'Сетка карточек с фотографиями, заголовками и описанием производственных процессов или коллекций',
    icon: Grid,
    defaultData: {
      badge: 'ПРОИЗВОДСТВЕННЫЙ ЦИКЛ',
      title: 'Лабораторный контроль и технологии завода',
      subtitle: '6 ключевых этапов создания каждого изделия LAUTE',
      style: { background: 'dark', alignment: 'center', padding: 'lg' },
      items: [
        {
          title: 'Литьё под давлением',
          desc: 'Прецизионное литьё корпусов из первичной латуни CW617N без внутренних раковин',
          imageUrl: 'images/prod_casting.png'
        },
        {
          title: 'ЧПУ металлообработка',
          desc: 'Автоматизированная токарно-фрезерная обработка с микронными допусками резьбы',
          imageUrl: 'images/prod_machining.png'
        },
        {
          title: 'Роботизированная полировка',
          desc: 'Зеркальная полировка поверхности перед нанесением гальванического и PVD слоёв',
          imageUrl: 'images/prod_polishing.png'
        },
        {
          title: 'PVD вакуумное осаждение',
          desc: 'Молекулярное напыление титана: стойкость к царапинам и бытовой химии',
          imageUrl: 'images/prod_coating.png'
        }
      ]
    }
  },

  // 3. ПРЕЗЕНТАЦИОННЫЕ БЛОКИ
  {
    type: 'features',
    category: 'presentation',
    name: 'Преимущества / Особенности',
    desc: 'Сетка из 3-4 карточек с иконками или изображениями, подчеркивающая ключевые плюсы',
    icon: CheckCircle2,
    defaultData: {
      badge: 'ПРЕИМУЩЕСТВА LAUTE',
      title: 'Почему выбирают сантехнику LAUTE',
      subtitle: 'Ключевые инженерные стандарты, проверенные в лабораториях',
      style: { background: 'card', alignment: 'left', padding: 'md' },
      items: [
        {
          title: 'Испанские картриджи Sedal',
          desc: 'Ресурс свыше 500 000 рабочих циклов (25 лет службы)',
          imageUrl: 'images/sedal_cartridge_macro.jpg'
        },
        {
          title: 'Первичная латунь CW617N',
          desc: 'Стойкость к гидроударам до 16 бар и экологическая безопасность',
          imageUrl: 'images/brass_eccentric_macro.jpg'
        },
        {
          title: 'Молекулярное PVD-покрытие',
          desc: 'Защита от царапин, извести и агрессивной бытовой химии',
          imageUrl: 'images/pvd_finish_macro.jpg'
        },
        {
          title: 'Гарантия завода 5 лет',
          desc: 'Первый цифровой сервис: решение сервисных вопросов за 36 часов',
          imageUrl: 'images/sus304_steel_macro.jpg'
        }
      ]
    }
  },
  {
    type: 'steps',
    category: 'presentation',
    name: 'Этапы сотрудничества (1-2-3-4)',
    desc: 'Пошаговый процесс взаимодействия для дилеров, оптовиков или покупателей',
    icon: Layers,
    defaultData: {
      badge: 'ЭТАПЫ ПОДКЛЮЧЕНИЯ',
      title: '4 простых шага к началу сотрудничества',
      subtitle: 'Быстрый старт поставок со складов в Новосибирске, Алматы и Москве',
      style: { background: 'dark', alignment: 'left', padding: 'md' },
      items: [
        { step: '01', title: 'Подача заявки', desc: 'Оставьте контакты вашей компании через онлайн-форму' },
        { step: '02', title: 'Согласование условий', desc: 'Предоставим оптовый прайс-лист, персональные скидки и условия' },
        { step: '03', title: 'Отгрузка со склада', desc: 'Комплектация и доставка заказа из ближайшего распределительного центра' },
        { step: '04', title: 'Маркетинговая поддержка', desc: 'Фирменные экспозиторы, образцы для шоурумов и подключение к сервису' }
      ]
    }
  },
  {
    type: 'cta_banner',
    category: 'presentation',
    name: 'Баннер призыва к действию (CTA)',
    desc: 'Акцентный контрастный баннер с предложением сотрудничества или перехода в каталог',
    icon: Sparkles,
    defaultData: {
      badge: 'ОПТОВЫЕ ПОСТАВКИ',
      title: 'Прямые поставки от завода LAUTE для дилеров',
      subtitle: 'Высокая дилерская маржинальность, 4 логистических склада, маркетинговые стенды и Первый цифровой сервис',
      buttonText: 'Стать региональным партнёром',
      buttonLink: '/partners',
      buttonType: 'gold',
      style: { background: 'card', alignment: 'center', padding: 'lg' }
    }
  },

  // 4. КАТАЛОГ & ПРОДУКЦИЯ
  {
    type: 'catalog_preview',
    category: 'catalog',
    name: 'Витрина каталога продукции',
    desc: 'Интерактивная подборка смесителей и сантехники LAUTE из реальной базы данных',
    icon: Package,
    defaultData: {
      badge: 'НОМЕНКЛАТУРА',
      title: 'Популярная продукция LAUTE',
      subtitle: 'Хиты продаж: смесители для кухни с каналом фильтра, ванны и душевые комплекты',
      filterCategory: 'all',
      limit: 6,
      style: { background: 'dark', alignment: 'center', padding: 'md' }
    }
  },

  // 5. КОНТАКТЫ & ЛОГИСТИКА
  {
    type: 'contact_cards',
    category: 'contacts',
    name: 'Карточки филиалов и складов',
    desc: 'Список представительств и логистических хабов (Новосибирск, Алматы, Москва, Китай)',
    icon: MapPin,
    defaultData: {
      badge: 'ОФИЦИАЛЬНЫЕ ПРЕДСТАВИТЕЛЬСТВА',
      title: 'Региональные отделы продаж и логистики',
      subtitle: 'Выберите ближайшее представительство завода LAUTE',
      style: { background: 'card', alignment: 'left', padding: 'lg' },
      items: [
        {
          title: 'Головной логистический комплекс (Сибирь)',
          city: 'Россия, г. Новосибирск',
          address: 'ул. Блюхера, 71',
          phone: '+7 (983) 310-56-26',
          altPhone: '+7 (913) 203-07-37',
          email: 'nsk@laute.ltd',
          manager: 'Оксана (рук. отдела продаж)',
          hours: 'Пн-Пт: 09:00 - 18:00 (НСК)'
        },
        {
          title: 'Экспортное представительство (Казахстан)',
          city: 'Казахстан, г. Алматы',
          address: 'пр. Райымбека, 212',
          phone: '+7 (983) 310-56-26',
          email: 'opt@laute.ltd',
          manager: 'Экспортное направление LAUTE (РК)',
          hours: 'Пн-Пт: 09:00 - 18:00 (ALM)'
        },
        {
          title: 'Отдел поставок Москва и Центр',
          city: 'Россия, г. Москва',
          address: 'Складской комплекс Юг',
          phone: '+7 (983) 310-56-26',
          email: 'msk@laute.ltd',
          manager: 'Отдел поставок Москва и Центральный регион',
          hours: 'Пн-Пт: 09:00 - 18:00 (МСК)'
        },
        {
          title: 'Завод LAUTE (КНР)',
          city: 'КНР, провинция Чжэцзян / Гуандун',
          address: 'Инженерно-производственный парк сантехники LAUTE',
          phone: '+7 (983) 310-56-26',
          email: 'opt@laute.ltd',
          manager: 'Отдел внешнеэкономической деятельности',
          hours: 'Пн-Сб: 08:30 - 17:30 (Пекин)'
        }
      ]
    }
  },

  // 6. ФОРМЫ ЗАЯВОК
  {
    type: 'form_lead',
    category: 'forms',
    name: 'Форма заявки / Обратной связи',
    desc: 'Интерактивная форма для сбора заявок на дилерство, сервис или консультацию',
    icon: Send,
    defaultData: {
      badge: 'ОБРАТНАЯ СВЯЗЬ',
      title: 'Свяжитесь с отделом развития LAUTE',
      subtitle: 'Оставьте заявку, и наш менеджер свяжется с вами в течение 30 минут',
      formType: 'partner', // partner | service | contact
      style: { background: 'card', alignment: 'center', padding: 'lg' }
    }
  },

  // 7. ДОПОЛНИТЕЛЬНЫЕ БЛОКИ
  {
    type: 'faq',
    category: 'extra',
    name: 'FAQ: Вопросы и ответы',
    desc: 'Раскрывающийся аккордеон с частыми вопросами клиентов и партнеров',
    icon: HelpCircle,
    defaultData: {
      badge: 'ВОПРОСЫ И ОТВЕТЫ',
      title: 'Часто задаваемые вопросы',
      subtitle: 'Ответы инженеров и отдела поставок LAUTE',
      style: { background: 'dark', alignment: 'left', padding: 'md' },
      items: [
        {
          question: 'Какой срок гарантии действует на сантехнику LAUTE?',
          answer: 'На корпуса смесителей из латуни CW617N и картриджи Sedal действует официальная заводская гарантия 5 лет. На комплектующие и гибкую подводку — 2 года.'
        },
        {
          question: 'Как осуществляется поставка оптовых заказов?',
          answer: 'Отгрузка производится с одного из 4 логистических складов (Новосибирск, Алматы, Москва, Китай) в зависимости от региона заказчика.'
        },
        {
          question: 'Предоставляются ли экспозиторы для магазинов?',
          answer: 'Да, официальным партнерам LAUTE бесплатно предоставляются фирменные демонстрационные стенды, буклеты и образцы продукции.'
        }
      ]
    }
  },
  {
    type: 'divider',
    category: 'extra',
    name: 'Элегантный разделитель',
    desc: 'Аккуратная линия разделения секций с фирменным стилем LAUTE',
    icon: Sliders,
    defaultData: {
      hasLogo: true,
      style: { padding: 'sm', background: 'transparent' }
    }
  }
];

export const BlockLibraryModal = ({ isOpen, onClose, onSelectTemplate }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'Все блоки' },
    { id: 'hero', label: 'Hero / Главный экран' },
    { id: 'text', label: 'Текстовые блоки' },
    { id: 'media', label: 'Изображения & Медиа' },
    { id: 'presentation', label: 'Презентация & Шаги' },
    { id: 'catalog', label: 'Каталог продукции' },
    { id: 'contacts', label: 'Контакты & Склады' },
    { id: 'forms', label: 'Формы заявок' },
    { id: 'extra', label: 'FAQ & Разделители' }
  ];

  const filteredTemplates = BLOCK_TEMPLATES.filter(tpl => {
    const matchCat = activeCategory === 'all' || tpl.category === activeCategory;
    const matchQuery = !searchQuery ||
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="admin-modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="admin-modal"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 940, width: '92%', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div className="admin-modal-header" style={{ padding: '16px 22px', borderBottom: '1px solid var(--adm-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(212,175,55,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37' }}>
              <Plus size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 17, color: '#FFFFFF' }}>Добавить блок</h3>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--adm-text-muted)' }}>

              </p>
            </div>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Filters and search */}
        <div style={{ padding: '12px 22px', borderBottom: '1px solid var(--adm-border)', background: 'rgba(255,255,255,0.01)', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="admin-input"
            placeholder="Поиск блоков по названию..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ minWidth: 260, fontSize: 13, padding: '7px 12px' }}
          />

          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', flex: 1, paddingBottom: 2 }}>
            {categories.map(c => (
              <button
                key={c.id}
                type="button"
                className={`admin-btn ${activeCategory === c.id ? 'admin-btn-primary' : 'admin-btn-ghost'} admin-btn-xs`}
                onClick={() => setActiveCategory(c.id)}
                style={{ whiteSpace: 'nowrap', fontSize: 12 }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid of Blocks */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 14 }}>
            {filteredTemplates.map((tpl, idx) => {
              const IconComp = tpl.icon;
              return (
                <button type="button"
                  key={idx}
                  className="block-library-card"
                  onClick={() => {
                    onSelectTemplate(tpl);
                    onClose();
                  }}
                  style={{
                    background: 'var(--adm-surface-card)',
                    border: '1px solid var(--adm-border)',
                    borderRadius: 10,
                    padding: 16,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--adm-accent-blue)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.35)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--adm-border)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 6, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37' }}>
                        <IconComp size={16} />
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--adm-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {categories.find(c=>c.id===tpl.category)?.label || ''}
                      </span>
                    </div>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: 14, color: '#FFFFFF' }}>{tpl.name.replace(/^Hero:\s*/,'Обложка: ').replace(/^CTA:\s*/,'Баннер: ')}</h4>
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--adm-text-muted)', lineHeight: 1.4 }}>

                    </p>
                  </div>

                  <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: 'var(--adm-accent-blue)', fontWeight: 600 }}>Добавить</span>
                    <Plus size={14} style={{ color: 'var(--adm-accent-blue)' }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
