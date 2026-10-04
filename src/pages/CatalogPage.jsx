import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Filter, SlidersHorizontal, ArrowRight, ShieldCheck, Download, PackageCheck, Layers, Info } from 'lucide-react';

export const CatalogPage = () => {
  const { lang, t, region, openPartnerModal, openAuthModal } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMounting, setSelectedMounting] = useState('all');

  const baseUrl = import.meta.env.BASE_URL;

  // 14 Categories strictly following Section 3 of the Protocol
  const categories = [
    {
      id: 'kitchen-mixers',
      name: 'Кухонные смесители',
      badge: 'Высокий спрос',
      desc: 'Смесители с высоким изливом, подключением питьевого фильтра, гибким изливом и выдвижной лейкой. Керамический картридж.',
      filters: 'Под фильтр • Гибкий излив • Выдвижная лейка • Однорычажные',
      image: `${baseUrl}images/cat_kitchen.png`,
      specs: ['Высота излива: 180–320 мм', 'Подключение фильтра: опционально', 'Управление: однорычажное', 'Материал: сантехническая латунь'],
      mounting: 'deck'
    },
    {
      id: 'basin-mixers',
      name: 'Смесители для раковины',
      badge: 'Базовая программа',
      desc: 'Низкие и высокие модели для накладных чаш, настенные варианты со стабильным картриджем и экономичным аэратором.',
      filters: 'Низкие • Высокие для чаш • Настенные • С донным клапаном',
      image: `${baseUrl}images/cat_bath.png`,
      specs: ['Высота: 140–280 мм', 'Для накладных чаш', 'Мягкий аэратор', 'Керамический узел'],
      mounting: 'deck'
    },
    {
      id: 'bath-mixers',
      name: 'Смесители для ванны',
      badge: 'Надёжность',
      desc: 'Модели с коротким монолитным или длинным поворотным изливом, настенного монтажа и врезные на борт ванны.',
      filters: 'Короткий излив • Длинный поворотный • Настенный • На борт',
      image: `${baseUrl}images/cat_bath.png`,
      specs: ['Длина излива: 100–350 мм', 'Межосевое: 150 мм', 'Дивертор: флажковый/кнопочный', 'Душевой выход: G 1/2"'],
      mounting: 'wall'
    },
    {
      id: 'universal-mixers',
      name: 'Универсальные смесители (ванна/раковина)',
      badge: 'Популярная серия',
      desc: 'Классические решения с длинным поворотным изливом 300–400 мм для совмещённого обслуживания ванны и умывальника.',
      filters: 'Поворотный излив 300–400 мм • Настенный монтаж • С душевым набором',
      image: `${baseUrl}images/cat_bath.png`,
      specs: ['Вылет излива: 300–400 мм', 'Угол поворота: 360°', 'Стандартная посадка 150 мм', 'Надёжный переключатель'],
      mounting: 'wall'
    },
    {
      id: 'shower-mixers',
      name: 'Смесители для душа',
      badge: 'Компактные',
      desc: 'Компактные смесители без излива наружного и скрытого монтажа, обеспечивающие эргономичное управление душевой зоной.',
      filters: 'Без излива • Наружный монтаж • Встраиваемый блок',
      image: `${baseUrl}images/cat_shower.png`,
      specs: ['Монтаж: настенный / скрытый', 'Подключение: 1/2"', 'Плавная регулировка', 'Шумопоглощение'],
      mounting: 'wall'
    },
    {
      id: 'bidet-hygiene',
      name: 'Биде и гигиенический душ',
      badge: 'Комфорт',
      desc: 'Смесители на биде с поворотным аэратором, а также встраиваемые и настенные комплекты гигиенического душа со шлангом и лейкой.',
      filters: 'Для биде • Комплект гигиенического душа • Встраиваемые',
      image: `${baseUrl}images/cat_shower.png`,
      specs: ['Шланг с защитой от перекручивания', 'Лейка с клапаном Stop', 'Компактный настенный держатель'],
      mounting: 'wall'
    },
    {
      id: 'sinks',
      name: 'Кухонные мойки',
      badge: 'Многофункциональные',
      desc: 'Нержавеющие кухонные мойки различной толщины стали и конфигураций: с крылом, интегрированным водопадом, коландером и шумоизоляцией.',
      filters: 'Врезные • Подстольные • С крылом • Интегрированные системы',
      image: `${baseUrl}images/cat_sinks.png`,
      specs: ['Шумоизоляционное покрытие', 'Глубина чаши: 180–220 мм', 'Комплект сливной арматуры', 'Отверстия под смеситель/дозатор'],
      mounting: 'deck'
    },
    {
      id: 'shower-systems',
      name: 'Душевые системы и гарнитуры',
      badge: 'Премиум дизайн',
      desc: 'Душевые стойки с регулировкой высоты, широкими верхними тропическими душами, ручными лейками с несколькими режимами струи.',
      filters: 'С изливом • Без излива • С термостатом • С регулировкой стойки',
      image: `${baseUrl}images/cat_shower.png`,
      specs: ['Регулировка стойки: 850–1250 мм', 'Диаметр верхнего душа: 200–300 мм', 'Шланг 1.5 м', 'Защита от известкового налёта'],
      mounting: 'wall'
    },
    {
      id: 'cartridges',
      name: 'Картриджи',
      badge: 'Комплектующие',
      desc: 'Оригинальные керамические картриджи различных диаметров (25, 35, 40 мм) с увеличенным ресурсом циклов открывания-закрывания.',
      filters: '25 мм • 35 мм • 40 мм • С ножками / без ножек',
      image: `${baseUrl}images/cat_components.png`,
      specs: ['Керамические пластины высокой твёрдости', 'Плавный ход рычага', 'Точная посадка'],
      mounting: 'internal'
    },
    {
      id: 'hoses',
      name: 'Шланги для душа и подводка',
      badge: 'Комплектующие',
      desc: 'Душевые шланги с двойным замком и защитой от перекручивания, а также надёжная гибкая подводка для воды в оплетке из нержавеющей стали.',
      filters: '1.5 м • 1.75 м • 2.0 м • Силиконовые • Металлическая оплётка',
      image: `${baseUrl}images/cat_german_line.png`,
      specs: ['Резьба: 1/2" х 1/2"', 'Защита от изломов', 'Высокое рабочее давление'],
      mounting: 'internal'
    },
    {
      id: 'shower-heads',
      name: 'Лейки и душевые головки',
      badge: 'Комплектующие',
      desc: 'Ручные и верхние душевые лейки с форсунками Easy Clean, различными режимами распыления (дождь, массаж, комбо).',
      filters: 'Ручные 1–3 режима • Верхний душ 200–250 мм • Гигиенические',
      image: `${baseUrl}images/cat_accessories.png`,
      specs: ['Форсунки лёгкой очистки', 'Стандартная резьба G 1/2"', 'Ударопрочный корпус'],
      mounting: 'accessory'
    },
    {
      id: 'spouts-aerators',
      name: 'Изливы и аэраторы',
      badge: 'Комплектующие',
      desc: 'Поворотные изливы S- и L-образных форм, универсальные длинные гусаки, антиизвестковые насыщающие кислородом аэраторы.',
      filters: 'L-образные • S-образные • 300 мм • 350 мм • 400 мм • Аэраторы M24',
      image: `${baseUrl}images/cat_components.png`,
      specs: ['Латунные и стальные варианты', 'Стандартная резьбовая посадка', 'Равномерное распределение струи'],
      mounting: 'internal'
    },
    {
      id: 'diverters-hardware',
      name: 'Переключатели и крепёж',
      badge: 'Комплектующие',
      desc: 'Диверторы, настенные эксцентрики с отражателями, гайки, штоки и монтажные монтажные комплекты для профессиональной установки.',
      filters: 'Кнопочные диверторы • Флажковые • Эксцентрики 3/4" на 1/2"',
      image: `${baseUrl}images/cat_components.png`,
      specs: ['Усиленный металл', 'Точная геометрия резьбы', 'Комплектация с уплотнителями'],
      mounting: 'internal'
    },
    {
      id: 'shower-cabins',
      name: 'Бюджетные душевые кабины',
      badge: 'Специальная линия',
      desc: 'Практичные душевые кабины с закалённым безопасным стеклом, надёжными поддонами, раздвижными дверями и продуманной сборкой.',
      filters: '80х80 • 90х90 • Низкий поддон • Высокий поддон • Без крыши / с крышей',
      image: `${baseUrl}images/cat_laute_brand.jpg`,
      specs: ['Закалённое стекло: 4–5 мм', 'Профиль: анодированный алюминий', 'Акриловый поддон с металлическим каркасом', 'Роликовая система плавного хода'],
      mounting: 'cabin'
    }
  ];

  const filteredCategories = categories.filter(c => {
    const matchesCat = selectedCategory === 'all' || c.id === selectedCategory;
    const matchesMount = selectedMounting === 'all' || c.mounting === selectedMounting;
    const matchesSearch = searchQuery === '' || 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.filters.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesMount && matchesSearch;
  });

  return (
    <div className="page-wrapper catalog-page">
      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <div className="page-header-content">
            <span className="section-badge">Официальный ассортимент</span>
            <h1 className="page-title">Каталог сантехнического оборудования LAUTE</h1>
            <p className="page-subtitle">
              Полный номенклатурный перечень по 14 целевым категориям. Инженерные смесители, душевые системы, кухонные мойки и оригинальные комплектующие для оптовых заказчиков.
            </p>

            <div className="catalog-header-actions">
              <button type="button" className="btn btn-primary" onClick={openPartnerModal}>
                <span>Запросить оптовый прайс-лист</span>
                <ArrowRight size={16} />
              </button>
              <button type="button" className="btn btn-outline" onClick={openAuthModal}>
                <PackageCheck size={16} />
                <span>Проверить остатки (B2B кабинет)</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stock Notice & Rules */}
      <section className="stock-notice-bar">
        <div className="container">
          <div className="notice-inner">
            <Info size={18} className="notice-icon" />
            <div className="notice-text">
              <strong>Порядок работы с остатками и ценами:</strong> Базовые цены носят ориентировочный характер. Индивидуальные оптовые скидки, наличие по номенклатуре и плановые Excel-выгрузки остатков предоставляются авторизованным дилерам через Личный кабинет партнёра (обновление по графику поставок, не real-time).
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Workspace */}
      <section className="catalog-main-section">
        <div className="container">
          {/* Controls Bar */}
          <div className="catalog-controls-bar">
            {/* Search */}
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Поиск по категории, артикулу или назначению..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            {/* Mounting Filter */}
            <div className="mounting-filter-group">
              <span className="filter-label">Тип монтажа:</span>
              <div className="filter-chips">
                <button
                  type="button"
                  className={`chip-btn ${selectedMounting === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedMounting('all')}
                >
                  Все типы
                </button>
                <button
                  type="button"
                  className={`chip-btn ${selectedMounting === 'deck' ? 'active' : ''}`}
                  onClick={() => setSelectedMounting('deck')}
                >
                  На изделие / мойку
                </button>
                <button
                  type="button"
                  className={`chip-btn ${selectedMounting === 'wall' ? 'active' : ''}`}
                  onClick={() => setSelectedMounting('wall')}
                >
                  Настенный / скрытый
                </button>
                <button
                  type="button"
                  className={`chip-btn ${selectedMounting === 'internal' ? 'active' : ''}`}
                  onClick={() => setSelectedMounting('internal')}
                >
                  Комплектующие
                </button>
              </div>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="catalog-grid">
            {filteredCategories.map((cat, idx) => (
              <div key={cat.id} className="catalog-card">
                <div className="card-media">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="card-product-img"
                    onError={(e) => {
                      e.target.src = `${baseUrl}laute-logo.png`;
                      e.target.style.opacity = '0.3';
                      e.target.style.padding = '40px';
                    }}
                  />
                  <span className="card-badge">{cat.badge}</span>
                </div>

                <div className="card-content">
                  <div className="card-cat-number">Категория #{idx + 1}</div>
                  <h3 className="card-title">{cat.name}</h3>
                  <p className="card-desc">{cat.desc}</p>

                  <div className="card-tags">
                    <span className="card-filter-summary">{cat.filters}</span>
                  </div>

                  <div className="card-specs-list">
                    {cat.specs.map((s, i) => (
                      <div key={i} className="spec-bullet">
                        <span className="bullet-dot">•</span>
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>

                  <div className="card-footer">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm btn-full"
                      onClick={openPartnerModal}
                    >
                      <span>Запросить спецификацию</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredCategories.length === 0 && (
            <div className="empty-catalog-state">
              <p>По вашему запросу категорий не найдено. Попробуйте сбросить фильтры.</p>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedMounting('all');
                  setSearchQuery('');
                }}
              >
                Сбросить фильтры
              </button>
            </div>
          )}

          {/* B2B Bottom Banner */}
          <div className="catalog-bottom-banner">
            <div className="banner-text">
              <h3>Требуется спецификация под строительный объект или дилерский прайс?</h3>
              <p>Предоставляем технические листы, размерные чертежи, логистические габариты упаковок и коммерческие условия для оптовых партнёров.</p>
            </div>
            <button type="button" className="btn btn-primary" onClick={openPartnerModal}>
              Оставить запрос менеджеру
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
