import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRight, ShieldCheck, Factory, Truck, CheckCircle2, PackageCheck, Headphones, Layers, Sparkles, Building2 } from 'lucide-react';

export const HomePage = () => {
  const { navigateTo, openPartnerModal, openAuthModal, openServiceModal, openAIModal } = useApp();
  const baseUrl = import.meta.env.BASE_URL;

  const [leadForm, setLeadForm] = useState({
    name: '',
    phone: '',
    city: '',
    businessType: 'wholesale'
  });
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  const handleLeadSubmit = (e) => {
    e.preventDefault();
    setLeadSubmitted(true);
  };

  const previewCategories = [
    {
      id: 'kitchen-mixers',
      name: 'Кухонные смесители',
      desc: 'Высокие изливы, под фильтр питьевой воды, выдвижные лейки и гибкие конструкции.',
      img: `${baseUrl}images/cat_kitchen.png`
    },
    {
      id: 'bath-mixers',
      name: 'Смесители для ванны и раковины',
      desc: 'Монолитные и поворотные модели, настенный монтаж и варианты для накладных чаш.',
      img: `${baseUrl}images/cat_bath.png`
    },
    {
      id: 'shower-systems',
      name: 'Душевые системы и стойки',
      desc: 'Тропические верхние души, ручные лейки с форсунками Easy Clean и надежные переключатели.',
      img: `${baseUrl}images/cat_shower.png`
    },
    {
      id: 'sinks',
      name: 'Многофункциональные мойки',
      desc: 'Нержавеющие кухонные мойки с шумоизоляцией, коландерами и эргономичной глубиной.',
      img: `${baseUrl}images/cat_sinks.png`
    },
    {
      id: 'components',
      name: 'Оригинальные комплектующие',
      desc: 'Керамические картриджи, гибкая подводка, усиленные душевые шланги и аэраторы.',
      img: `${baseUrl}images/cat_components.png`
    },
    {
      id: 'shower-cabins',
      name: 'Бюджетные душевые кабины',
      desc: 'Практичные кабины с закалённым стеклом и надежными поддонами для массового сегмента.',
      img: `${baseUrl}images/cat_laute_brand.jpg`
    }
  ];

  return (
    <div className="page-wrapper home-page">
      {/* 1. Hero / Оффер LAUTE */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <div className="hero-badge">
                <span className="badge-dot"></span>
                <span>Международный производственно-торговый холдинг LAUTE</span>
              </div>

              <h1 className="hero-title">
                Инженерная сантехника и оборудование для профессиональных партнёров
              </h1>

              <p className="hero-desc">
                Прямые поставки смесителей, кухонных моек, душевых систем и комплектующих от завода-изготовителя. Склады в Новосибирске, Алматы и Москве. Индивидуальные B2B-условия для дилеров, комплектаторов и строительных объектов.
              </p>

              <div className="hero-actions">
                <button type="button" className="btn btn-primary btn-lg" onClick={() => navigateTo('catalog')}>
                  <span>Смотреть каталог продукции</span>
                  <ArrowRight size={18} />
                </button>
                <button type="button" className="btn btn-outline btn-lg" onClick={openPartnerModal}>
                  <span>Стать оптовым партнёром</span>
                </button>
              </div>

              <div className="hero-metrics">
                <div className="metric-item">
                  <strong>С 1998 г.</strong>
                  <span>Немецкие инженерные корни</span>
                </div>
                <div className="metric-item">
                  <strong>3 склада</strong>
                  <span>Новосибирск, Москва, Алматы</span>
                </div>
                <div className="metric-item">
                  <strong>14 категорий</strong>
                  <span>Широкая номенклатура</span>
                </div>
                <div className="metric-item">
                  <strong>До 7 лет</strong>
                  <span>Заводская гарантия</span>
                </div>
              </div>
            </div>

            <div className="hero-media-wrapper">
              <div className="hero-card-featured">
                <img
                  src={`${baseUrl}images/cat_kitchen.png`}
                  alt="Смесители LAUTE"
                  className="hero-featured-img"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <div className="hero-card-overlay">
                  <span className="featured-tag">Флагманская серия</span>
                  <h3>Кухонные смесители с подключением фильтра</h3>
                  <p>Латунные корпуса, керамический узел, раздельные контуры питьевой и водопроводной воды.</p>
                  <button type="button" className="card-inline-btn" onClick={() => navigateTo('catalog')}>
                    Смотреть в каталоге →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Категории продукции (Preview) */}
      <section className="section bg-light-section">
        <div className="container">
          <div className="section-title-wrap">
            <span className="section-badge">Ассортиментная матрица</span>
            <h2 className="section-title">Категории продукции</h2>
            <p className="section-desc">
              Номенклатура LAUTE сформирована по назначению изделий и закрывает потребности как розничных сетей, так и объектного строительства.
            </p>
          </div>

          <div className="categories-preview-grid">
            {previewCategories.map((cat) => (
              <div key={cat.id} className="category-preview-card" onClick={() => navigateTo('catalog')}>
                <div className="cat-img-box">
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="cat-img"
                    onError={(e) => {
                      e.target.src = `${baseUrl}laute-logo.png`;
                      e.target.style.opacity = '0.3';
                      e.target.style.padding = '30px';
                    }}
                  />
                </div>
                <div className="cat-body">
                  <h3 className="cat-title">{cat.name}</h3>
                  <p className="cat-desc">{cat.desc}</p>
                  <span className="cat-link">Перейти в каталог →</span>
                </div>
              </div>
            ))}
          </div>

          <div className="section-cta-center">
            <button type="button" className="btn btn-outline" onClick={() => navigateTo('catalog')}>
              <Layers size={16} />
              <span>Открыть полный каталог (все 14 категорий)</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* 3. Преимущества сотрудничества (Preview) */}
      <section className="section">
        <div className="container">
          <div className="section-title-wrap">
            <span className="section-badge">B2B Партнёрство</span>
            <h2 className="section-title">Преимущества работы с заводом LAUTE</h2>
            <p className="section-desc">
              Прямой контракт с производителем, продуманная региональная логистика и оперативный сервис.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-box">
                <Factory size={24} />
              </div>
              <h3 className="feature-title">Прямые поставки от производителя</h3>
              <p className="feature-desc">
                Исключение посредников позволяет партнёрам получать лучшие коммерческие условия и стабильные отгрузки под крупные проекты.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <Truck size={24} />
              </div>
              <h3 className="feature-title">Региональные склады</h3>
              <p className="feature-desc">
                Собственные складские мощности в Новосибирске (хаб по Сибири и ДВ), Москве и Алматы (Казахстан) обеспечивают бесперебойное пополнение запасов.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <ShieldCheck size={24} />
              </div>
              <h3 className="feature-title">Первый цифровой сервис</h3>
              <p className="feature-desc">
                Сервисная служба завода принимает заявки от клиентов онлайн (ответ в течение 36 часов в рабочие дни), избавляя дилеров от рекламационной рутины.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <Building2 size={24} />
              </div>
              <h3 className="feature-title">Защита дилерской территории</h3>
              <p className="feature-desc">
                Прозрачные правила взаимодействия, проектная защита на тендерах и комплектации объектов, предоставление образцов и торгового оборудования.
              </p>
            </div>
          </div>

          <div className="section-cta-center">
            <button type="button" className="btn btn-primary" onClick={() => navigateTo('partners')}>
              <span>Подробнее об условиях для оптовиков</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* 4. Производство и качество (Preview) */}
      <section className="section bg-light-section">
        <div className="container">
          <div className="home-prod-split">
            <div className="prod-split-content">
              <span className="section-badge">Производственные мощности</span>
              <h2 className="section-title">Контроль качества на каждом этапе выпуска</h2>
              <p className="section-desc">
                Завод LAUTE оснащен современным парком оборудования: от литья прочных корпусов до роботизированной механической обработки, полировки и финишных испытаний.
              </p>

              <div className="prod-checks-list">
                <div className="check-item">
                  <CheckCircle2 size={18} color="#16A34A" />
                  <span>Литьё корпусов смесителей с контролем плотности металла</span>
                </div>
                <div className="check-item">
                  <CheckCircle2 size={18} color="#16A34A" />
                  <span>Многослойные гальванические покрытия, стойкие к истиранию</span>
                </div>
                <div className="check-item">
                  <CheckCircle2 size={18} color="#16A34A" />
                  <span>100% проверка каждого изделия на герметичность водой и воздухом</span>
                </div>
                <div className="check-item">
                  <CheckCircle2 size={18} color="#16A34A" />
                  <span>Гарантийные обязательства завода до 7 лет на смесители</span>
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <button type="button" className="btn btn-outline" onClick={() => navigateTo('company')}>
                  <span>Подробнее о заводе и истории</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            <div className="prod-split-gallery">
              <div className="gallery-mini-grid">
                <div className="mini-card">
                  <img src={`${baseUrl}images/prod_casting.png`} alt="Литьё" />
                  <span>Литьё корпусов</span>
                </div>
                <div className="mini-card">
                  <img src={`${baseUrl}images/prod_machining.png`} alt="Обработка" />
                  <span>Роботизированная обработка</span>
                </div>
                <div className="mini-card">
                  <img src={`${baseUrl}images/prod_qc.png`} alt="ОТК" />
                  <span>Контроль ОТК</span>
                </div>
                <div className="mini-card">
                  <img src={`${baseUrl}images/prod_testing.png`} alt="Испытания" />
                  <span>Испытания под давлением</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Поддержка и сервисы (Compact Supporting Blocks) */}
      <section className="section">
        <div className="container">
          <div className="support-dual-grid">
            {/* Service Block */}
            <div className="support-card service-support-card">
              <div className="support-badge">Сервис завода</div>
              <h3>Первый цифровой сервисный центр</h3>
              <p className="support-highlight">
                «Ответ будет дан в течение 36 часов в рабочие дни»
              </p>
              <p className="support-text">
                Прямая сервисная поддержка для покупателей сантехники LAUTE, Oute и Rainsberg. Онлайн-подача гарантийных обращений с фото- и видеофиксацией.
              </p>
              <div className="support-actions">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => navigateTo('service')}>
                  <span>Оформить обращение онлайн</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* AI Selection Support Block */}
            <div className="support-card ai-support-card">
              <div className="support-badge">Сервис подбора</div>
              <h3>Помощь в подборе оборудования</h3>
              <p className="support-highlight">
                Консультация по параметрам и совместимости
              </p>
              <p className="support-text">
                Помощь в подборе моделей по высоте излива, типу монтажа, габаритам кухонных моек и душевых систем под требования вашего проекта.
              </p>
              <div className="support-actions">
                <button type="button" className="btn btn-outline btn-sm" onClick={openAIModal}>
                  <Sparkles size={14} />
                  <span>Подобрать оборудование</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Заявка / CTA */}
      <section className="section home-cta-section">
        <div className="container">
          <div className="home-cta-box">
            <div className="cta-left">
              <span className="section-badge">Начало работы</span>
              <h2>Запросить оптовый каталог и коммерческие условия</h2>
              <p>
                Оставьте контактные данные, и ответственный региональный представитель свяжется с вами для предоставления дилерского прайс-листа и условий логистики.
              </p>
              <div className="cta-direct-links">
                <span>Прямая связь: </span>
                <a href="tel:+79833105626" className="clickable-contact">+7 (983) 310-56-26</a>
                <span> • </span>
                <a href="mailto:opt@laute.ltd" className="clickable-contact">opt@laute.ltd</a>
              </div>
            </div>

            <div className="cta-right">
              {leadSubmitted ? (
                <div className="cta-success">
                  <CheckCircle2 size={40} color="#16A34A" />
                  <h4>Запрос успешно отправлен!</h4>
                  <p>Менеджер региона свяжется с вами в течение рабочего дня.</p>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="cta-quick-form">
                  <div className="form-group">
                    <input
                      type="text"
                      required
                      placeholder="Ваше имя / Компания"
                      value={leadForm.name}
                      onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <input
                        type="tel"
                        required
                        placeholder="Телефон для связи"
                        value={leadForm.phone}
                        onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="text"
                        required
                        placeholder="Город (напр. Новосибирск)"
                        value={leadForm.city}
                        onChange={(e) => setLeadForm({ ...leadForm, city: e.target.value })}
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary btn-full">
                    <span>Получить оптовые условия</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
