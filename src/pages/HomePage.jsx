import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowRight, 
  ShieldCheck, 
  Building2, 
  Truck, 
  CheckCircle2, 
  FileText, 
  Users, 
  Store, 
  HardHat, 
  Wrench,
  Clock,
  PhoneCall
} from 'lucide-react';

export const HomePage = () => {
  const { navigateTo, openPartnerModal, t } = useApp();
  const baseUrl = import.meta.env.BASE_URL;

  const [leadForm, setLeadForm] = useState({
    name: '',
    company: '',
    phone: '',
    city: ''
  });
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach((el) => observer.observe(el));

    const waveObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in-view');
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
    );
    const waveBridges = document.querySelectorAll('.section-wave-bridge');
    waveBridges.forEach((el) => waveObserver.observe(el));

    return () => {
      observer.disconnect();
      waveObserver.disconnect();
    };
  }, []);

  const handleLeadSubmit = (e) => {
    e.preventDefault();
    setLeadSubmitted(true);
  };

  const h = t.home || {};

  return (
    <div className="page-wrapper home-page">
      {/* 1. HERO — Краткое позиционирование LAUTE с фирменными волнами и градиентами (референс коробки LAUTE) */}
      <section className="hero-section">
        {/* Фирменные волнообразные графические ленты LAUTE (референс упаковки: потоки горячей и холодной воды) */}
        <div className="hero-wave-canvas" aria-hidden="true">
          <svg className="hero-wave-svg" viewBox="0 0 1440 760" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
            <defs>
              {/* Flame Stream Gradients (Hot Dynamic) */}
              <linearGradient id="lauteFlame1" x1="0%" y1="0%" x2="100%" y2="80%">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.85" />
                <stop offset="35%" stopColor="#F97316" stopOpacity="0.75" />
                <stop offset="70%" stopColor="#EA580C" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#DC2626" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="lauteFlame2" x1="20%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#F97316" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#B91C1C" stopOpacity="0.1" />
              </linearGradient>

              {/* Water Stream Gradients (Cold Dynamic) */}
              <linearGradient id="lauteWater1" x1="0%" y1="20%" x2="100%" y2="80%">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
                <stop offset="40%" stopColor="#0EA5E9" stopOpacity="0.65" />
                <stop offset="75%" stopColor="#0284C7" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#2563EB" stopOpacity="0.25" />
              </linearGradient>
              <linearGradient id="lauteWater2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7DD3FC" stopOpacity="0.5" />
                <stop offset="60%" stopColor="#0284C7" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0.1" />
              </linearGradient>

              {/* Glowing Edge Accent Gradients */}
              <linearGradient id="flameEdge" x1="0%" y1="0%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#F97316" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="waterEdge" x1="0%" y1="0%" x2="100%" y2="80%">
                <stop offset="0%" stopColor="#BAE6FD" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Cool Water Wave Ribbons (From lower-left sweeping diagonally across) */}
            <path
              className="hero-wave-water-bg"
              d="M-80,640 C220,690 480,510 820,570 C1100,620 1320,460 1520,400 L1520,760 L-80,760 Z"
              fill="url(#lauteWater2)"
              opacity="0.45"
            />
            <path
              className="hero-wave-water-main"
              d="M-100,550 C180,540 420,360 760,440 C1060,510 1280,380 1500,340 L1500,620 C1280,660 1060,720 760,650 C420,570 180,710 -100,710 Z"
              fill="url(#lauteWater1)"
              opacity="0.75"
            />
            <path
              className="hero-wave-water-edge"
              d="M-60,530 C200,520 440,345 780,425 C1080,495 1300,365 1520,325"
              stroke="url(#waterEdge)"
              strokeWidth="2.5"
              fill="none"
              opacity="0.85"
            />

            {/* Warm Flame Wave Ribbons (From upper-right cascading across) */}
            <path
              className="hero-wave-flame-bg"
              d="M1520,-40 C1240,60 980,240 680,210 C420,180 200,320 -60,420 L-60,500 C200,400 420,260 680,290 C980,320 1240,160 1520,60 Z"
              fill="url(#lauteFlame2)"
              opacity="0.45"
            />
            <path
              className="hero-wave-flame-main"
              d="M1520,20 C1280,110 1040,290 740,270 C480,250 260,390 0,510 L0,590 C260,470 480,330 740,350 C1040,370 1280,190 1520,100 Z"
              fill="url(#lauteFlame1)"
              opacity="0.8"
            />
            <path
              className="hero-wave-flame-edge"
              d="M1520,15 C1278,105 1038,285 738,265 C478,245 258,385 0,505"
              stroke="url(#flameEdge)"
              strokeWidth="3"
              fill="none"
              opacity="0.9"
            />
          </svg>
          <div className="hero-glow-warm"></div>
          <div className="hero-glow-cool"></div>
        </div>

        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              {/* Маленький текст над заголовком полностью удалён согласно п.3 */}

              <h1 className="hero-title reveal-on-scroll">
                {h.heroTitle || 'Прямые B2B-поставки сантехники и оборудования LAUTE'}
              </h1>

              <p className="hero-desc reveal-on-scroll reveal-delay-1">
                {h.heroDesc || 'Прямой контракт с заводом-изготовителем для дилеров, розничных сетей и комплектаторов строительных объектов. Официальная гарантия, цифровой сервис и персональные коммерческие условия.'}
              </p>

              <div className="hero-actions reveal-on-scroll reveal-delay-2">
                <button 
                  type="button" 
                  className="btn btn-primary btn-hero-primary" 
                  onClick={() => navigateTo('catalog')}
                  id="hero-btn-catalog"
                >
                  <span>{h.btnCatalog || 'Перейти в каталог'}</span>
                  <ArrowRight size={18} />
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline btn-hero-secondary" 
                  onClick={openPartnerModal}
                  id="hero-btn-partner"
                >
                  <span>{h.btnPartner || 'Стать оптовым партнёром'}</span>
                </button>
              </div>

              <div className="hero-pills reveal-on-scroll reveal-delay-3">
                <div className="hero-pill-item">
                  <CheckCircle2 size={16} className="pill-icon" />
                  <span>{h.pillContract || 'Прямой контракт с производителем'}</span>
                </div>
                <div className="hero-pill-item">
                  <Clock size={16} className="pill-icon" />
                  <span>{h.pillSla || 'Сервисный ответ за 36 часов в рабочие дни'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Плавный волновой мост перехода между Hero и Audience */}
        <div className="section-wave-bridge wave-hero-to-audience" aria-hidden="true">
          <svg viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none">
            <path
              d="M0,25 C360,75 720,10 1120,55 C1280,75 1380,45 1440,30 L1440,80 L0,80 Z"
              fill="#0B0E17"
            />
            <path
              d="M0,20 C360,70 720,5 1120,50 C1280,70 1380,40 1440,25"
              stroke="url(#flameEdge)"
              strokeWidth="2"
              fill="none"
              opacity="0.4"
            />
          </svg>
        </div>
      </section>

      {/* 2. ДЛЯ КОГО КОМПАНИЯ РАБОТАЕТ — МЯГКАЯ АРХИТЕКТУРНАЯ СЕКЦИЯ С ПОЛУПРОЗРАЧНЫМИ СЛОЯМИ */}
      <section className="section audience-section">
        {/* Атмосферный легкий градиентный фон (вместо плоского белого квадрата) */}
        <div className="audience-ambient-waves" aria-hidden="true">
          <div className="audience-glow-ambient"></div>
        </div>

        <div className="container">
          <div className="section-title-wrap reveal-on-scroll">
            <span className="section-badge">{h.audienceBadge || 'Целевая аудитория'}</span>
            <h2 className="section-title">{h.audienceTitle || 'Для кого работает LAUTE'}</h2>
            <p className="section-desc">
              {h.audienceDesc || 'Мы выстраиваем долгосрочные и предсказуемые отношения с профессиональными участниками рынка сантехники.'}
            </p>
          </div>

          <div className="audience-grid">
            <div className="audience-card audience-accent-flame reveal-on-scroll reveal-delay-1">
              <div className="audience-icon-box">
                <Users size={24} />
              </div>
              <h3 className="audience-card-title">{h.audienceGroup1Title || 'Дистрибьюторы и оптовики'}</h3>
              <p className="audience-card-desc">
                {h.audienceGroup1Desc || 'Прямое сотрудничество с заводом-изготовителем, индивидуальные оптовые цены и гибкая система скидок по категориям.'}
              </p>
            </div>

            <div className="audience-card audience-accent-water reveal-on-scroll reveal-delay-2">
              <div className="audience-icon-box">
                <Store size={24} />
              </div>
              <h3 className="audience-card-title">{h.audienceGroup2Title || 'Розничные сети и салоны'}</h3>
              <p className="audience-card-desc">
                {h.audienceGroup2Desc || 'Востребованный ассортимент смесителей и сантехники, качественная потребительская упаковка и удобный подбор по характеристикам.'}
              </p>
            </div>

            <div className="audience-card audience-accent-flame reveal-on-scroll reveal-delay-3">
              <div className="audience-icon-box">
                <HardHat size={24} />
              </div>
              <h3 className="audience-card-title">{h.audienceGroup3Title || 'Комплектаторы и девелоперы'}</h3>
              <p className="audience-card-desc">
                {h.audienceGroup3Desc || 'Комплектация строительных объектов, полный комплект технической документации, паспортов изделий и сертификатов.'}
              </p>
            </div>

            <div className="audience-card audience-accent-water reveal-on-scroll reveal-delay-4">
              <div className="audience-icon-box">
                <Wrench size={24} />
              </div>
              <h3 className="audience-card-title">{h.audienceGroup4Title || 'Монтажные организации'}</h3>
              <p className="audience-card-desc">
                {h.audienceGroup4Desc || 'Стандартизированные узлы подключения, совместимость комплектующих и официальная сервисная поддержка завода.'}
              </p>
            </div>
          </div>
        </div>

        {/* Волновой мост перехода между Audience и Advantages */}
        <div className="section-wave-bridge wave-audience-to-advantages" aria-hidden="true">
          <svg viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none">
            <path
              d="M0,10 C320,65 680,15 1060,55 C1240,75 1360,50 1440,35 L1440,80 L0,80 Z"
              fill="var(--graphite-850)"
            />
            <path
              d="M0,5 C320,60 680,10 1060,50 C1240,70 1360,45 1440,30"
              stroke="url(#waterEdge)"
              strokeWidth="2"
              fill="none"
              opacity="0.45"
            />
          </svg>
        </div>
      </section>

      {/* 3. ГЛАВНЫЕ ПРЕИМУЩЕСТВА СОТРУДНИЧЕСТВА */}
      <section className="section advantages-section">
        <div className="container">
          <div className="section-title-wrap reveal-on-scroll">
            <span className="section-badge">{h.advantagesBadge || 'Преимущества'}</span>
            <h2 className="section-title">{h.advantagesTitle || 'Почему партнёры выбирают LAUTE'}</h2>
            <p className="section-desc">
              {h.advantagesDesc || 'Прозрачные заводские условия, персональные цены и цифровой сервис, снимающий рутинную нагрузку с партнёра.'}
            </p>
          </div>

          <div className="advantages-grid">
            <div className="advantage-card reveal-on-scroll reveal-delay-1">
              <div className="advantage-num">01</div>
              <h3 className="advantage-title">{h.adv1Title || 'Прямой заводской контракт'}</h3>
              <p className="advantage-desc">
                {h.adv1Desc || 'Сотрудничество напрямую с производителем исключает лишние звенья наценки, обеспечивая прозрачные условия и стабильные оптовые цены.'}
              </p>
            </div>

            <div className="advantage-card reveal-on-scroll reveal-delay-2">
              <div className="advantage-num">02</div>
              <h3 className="advantage-title">{h.adv2Title || 'Индивидуальные условия и кабинет'}</h3>
              <p className="advantage-desc">
                {h.adv2Desc || 'Персональные скидки по категориям и брендам, прозрачный расчёт стоимости заказов и удобная работа через кабинет партнёра.'}
              </p>
            </div>

            <div className="advantage-card reveal-on-scroll reveal-delay-3">
              <div className="advantage-num">03</div>
              <h3 className="advantage-title">{h.adv3Title || 'Первый цифровой сервис'}</h3>
              <p className="advantage-desc">
                {h.adv3Desc || 'Приём сервисных обращений онлайн с фото и видео дефекта. Регламентный срок ответа завода — в течение 36 часов в рабочие дни.'}
              </p>
            </div>
          </div>

          <div className="section-cta-center reveal-on-scroll reveal-delay-2">
            <button 
              type="button" 
              className="btn btn-primary btn-lg" 
              onClick={openPartnerModal}
              id="adv-btn-partner"
            >
              <span>{h.advBtn || 'Запросить условия сотрудничества'}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Волновой мост между Advantages и Company */}
        <div className="section-wave-bridge wave-advantages-to-company" aria-hidden="true">
          <svg viewBox="0 0 1440 60" fill="none" preserveAspectRatio="none">
            <path
              d="M0,0 C380,45 740,10 1100,40 C1260,55 1380,30 1440,20 L1440,60 L0,60 Z"
              fill="var(--graphite-900)"
            />
            <path
              d="M0,0 C380,45 740,10 1100,40 C1260,55 1380,30 1440,20"
              stroke="url(#flameEdge)"
              strokeWidth="2"
              fill="none"
              opacity="0.35"
            />
          </svg>
        </div>
      </section>

      {/* 4. Блок каталога продукции полностью удалён с главной страницы согласно п.5 */}

      {/* 5. КРАТКИЙ БЛОК «О КОМПАНИИ» — АРХИТЕКТУРНЫЙ ИНЖЕНЕРНЫЙ МОДУЛЬ С ПРОЗРАЧНОСТЬЮ */}
      <section className="section company-preview-section">
        <div className="container">
          <div className="company-preview-grid">
            <div className="company-preview-content reveal-on-scroll">
              <span className="section-badge">{h.companyBadge || 'О бренде'}</span>
              <h2 className="section-title">{h.companyTitle || 'Производство и стандарты LAUTE'}</h2>
              <p className="section-desc">
                {h.companyDesc1 || 'LAUTE — международная марка сантехнического оборудования. Линейка продукции включает кухонные смесители, смесители для раковины, ванны и душа, душевые системы, мойки и комплектующие.'}
              </p>
              <p className="section-text-secondary">
                {h.companyDesc2 || 'Каждое изделие сопровождается заводским паспортом, точными размерными чертежами, инструкцией по установке и официальной гарантией производителя.'}
              </p>
              
              <div className="company-preview-btn-wrap">
                <button 
                  type="button" 
                  className="btn btn-outline btn-lg" 
                  onClick={() => navigateTo('company')}
                  id="btn-about-company"
                >
                  <span>{h.companyBtn || 'Подробнее о компании и производстве'}</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>

            <div className="company-preview-highlights">
              <div className="highlight-box highlight-accent-flame reveal-on-scroll reveal-delay-1">
                <Building2 size={24} className="highlight-icon" />
                <div>
                  <h4>{h.companyHighlight1Title || 'Заводские стандарты'}</h4>
                  <p>{h.companyHighlight1Desc || 'Контроль качества продукции на производстве и соответствие заявленным техническим характеристикам.'}</p>
                </div>
              </div>
              <div className="highlight-box highlight-accent-water reveal-on-scroll reveal-delay-2">
                <ShieldCheck size={24} className="highlight-icon" />
                <div>
                  <h4>{h.companyHighlight2Title || 'Официальные гарантии'}</h4>
                  <p>{h.companyHighlight2Desc || 'Заводские паспорта изделий и защищённые гарантийные обязательства производителя.'}</p>
                </div>
              </div>
              <div className="highlight-box highlight-accent-dual reveal-on-scroll reveal-delay-3">
                <FileText size={24} className="highlight-icon" />
                <div>
                  <h4>{h.companyHighlight3Title || 'Техническая документация'}</h4>
                  <p>{h.companyHighlight3Desc || 'Размерные чертежи, схемы подключения, инструкции по монтажу и сертификаты на продукцию.'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Волновой мост между Company и Service */}
        <div className="section-wave-bridge wave-company-to-service" aria-hidden="true">
          <svg viewBox="0 0 1440 60" fill="none" preserveAspectRatio="none">
            <path
              d="M0,20 C340,55 700,5 1080,45 C1240,60 1360,35 1440,15 L1440,60 L0,60 Z"
              fill="var(--graphite-850)"
            />
            <path
              d="M0,20 C340,55 700,5 1080,45 C1240,60 1360,35 1440,15"
              stroke="url(#waterEdge)"
              strokeWidth="2"
              fill="none"
              opacity="0.35"
            />
          </svg>
        </div>
      </section>

      {/* 6. ПОДДЕРЖКА ПАРТНЁРОВ И СЕРВИС 36 ЧАСОВ — АКЦЕНТНЫЙ БЛОК С ВОЛНАМИ */}
      <section className="section service-preview-section">
        <div className="container">
          <div className="service-banner-box reveal-on-scroll">
            <div className="service-wave-accent" aria-hidden="true"></div>
            <div className="service-banner-content">
              <div className="service-sla-badge">
                <Clock size={16} />
                <span>{h.serviceBadge || 'Регламент 36 часов в рабочие дни'}</span>
              </div>
              <h2 className="service-banner-title">{h.serviceTitle || 'Первый цифровой сервисный центр LAUTE'}</h2>
              <p className="service-banner-desc">
                {h.serviceDesc || 'Сервисный центр LAUTE принимает гарантийные обращения в цифровом формате. Регламентный ответ завода даётся в течение 36 часов в рабочие дни.'}
              </p>
              <div className="service-banner-actions">
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={() => navigateTo('service')}
                  id="btn-service-center"
                >
                  <span>{h.serviceBtn || 'Перейти в сервисный центр'}</span>
                  <ArrowRight size={16} />
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => navigateTo('partners')}
                  id="btn-partner-support"
                >
                  <span>{h.servicePartnerBtn || 'Условия поддержки партнёров'}</span>
                </button>
              </div>
            </div>

            <div className="service-banner-stats">
              <div className="service-stat-card reveal-on-scroll reveal-delay-1">
                <span className="stat-number">{h.stat1Num || '36 ч'}</span>
                <span className="stat-label">{h.stat1Label || 'Срок ответа в рабочие дни по регламенту'}</span>
              </div>
              <div className="service-stat-card reveal-on-scroll reveal-delay-2">
                <span className="stat-number">{h.stat2Num || 'Онлайн'}</span>
                <span className="stat-label">{h.stat2Label || 'Приём сервисных обращений'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Волновой мост между Service и CTA */}
        <div className="section-wave-bridge wave-service-to-cta" aria-hidden="true">
          <svg viewBox="0 0 1440 60" fill="none" preserveAspectRatio="none">
            <path
              d="M0,15 C360,50 720,10 1120,40 C1280,55 1380,25 1440,10 L1440,60 L0,60 Z"
              fill="var(--graphite-950)"
            />
            <path
              d="M0,15 C360,50 720,10 1120,40 C1280,55 1380,25 1440,10"
              stroke="url(#flameEdge)"
              strokeWidth="2"
              fill="none"
              opacity="0.3"
            />
          </svg>
        </div>
      </section>

      {/* 7. ФИНАЛЬНЫЙ CTA — ФОРМА С ПРОСТОРНЫМИ НЕ СЛИТЫМИ ПОЛЯМИ */}
      <section className="section home-cta-section" id="b2b-lead-form">
        <div className="container">
          <div className="home-cta-card reveal-on-scroll">
            <div className="cta-left-content">
              <span className="section-badge">{h.formBadge || 'Начать работу'}</span>
              <h2 className="cta-heading">{h.formHeading || 'Запросить оптовый каталог и коммерческие условия'}</h2>
              <p className="cta-subheading">
                {h.formSubheading || 'Заполните форму, и региональный представитель LAUTE направит дилерский прайс-лист, типовой договор и согласует условия поставок.'}
              </p>

              <div className="cta-contact-summary">
                <div className="cta-contact-line">
                  <PhoneCall size={18} className="cta-contact-icon" />
                  <div>
                    <span className="cta-contact-label">{h.formDept || 'Отдел оптовых продаж:'}</span>
                    <a href="tel:+79833105626" className="cta-contact-value">+7 (983) 310-56-26</a>
                  </div>
                </div>

                <div className="cta-contact-line">
                  <span className="cta-contact-label">{h.formEmailLabel || 'Email для запросов:'}</span>
                  <a href="mailto:opt@laute.ltd" className="cta-contact-value">opt@laute.ltd</a>
                </div>
              </div>

              <div className="cta-secondary-link-wrap">
                <button 
                  type="button" 
                  className="btn btn-outline btn-sm" 
                  onClick={() => navigateTo('contacts')}
                  id="btn-all-contacts"
                >
                  <span>{h.formAllContacts || 'Все контакты представительств →'}</span>
                </button>
              </div>
            </div>

            <div className="cta-right-form-wrap">
              {leadSubmitted ? (
                <div className="form-success-card">
                  <CheckCircle2 size={48} color="#0EA5E9" />
                  <h3>{h.formSuccessTitle || 'Запрос успешно отправлен!'}</h3>
                  <p>{h.formSuccessDesc || 'Менеджер оптового отдела свяжется с вами в течение рабочего дня для отправки коммерческого предложения.'}</p>
                  <button 
                    type="button" 
                    className="btn btn-outline btn-sm" 
                    style={{ marginTop: '16px' }}
                    onClick={() => setLeadSubmitted(false)}
                  >
                    {h.formSuccessAgain || 'Отправить ещё один запрос'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="b2b-lead-form">
                  <div className="form-field-group">
                    <label htmlFor="lead-name" className="field-label">
                      {h.fieldName || 'Ваше имя'} <span className="field-required">*</span>
                    </label>
                    <input
                      id="lead-name"
                      type="text"
                      required
                      placeholder="Иван Иванов"
                      className="form-input"
                      value={leadForm.name}
                      onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                    />
                  </div>

                  <div className="form-field-group">
                    <label htmlFor="lead-company" className="field-label">
                      {h.fieldCompany || 'Компания или сфера деятельности'} <span className="field-required">*</span>
                    </label>
                    <input
                      id="lead-company"
                      type="text"
                      required
                      placeholder="ООО / ИП / Торговая сеть / Комплектация"
                      className="form-input"
                      value={leadForm.company}
                      onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                    />
                  </div>

                  <div className="form-fields-grid-2">
                    <div className="form-field-group">
                      <label htmlFor="lead-phone" className="field-label">
                        {h.fieldPhone || 'Телефон для связи'} <span className="field-required">*</span>
                      </label>
                      <input
                        id="lead-phone"
                        type="tel"
                        required
                        placeholder="+7 (___) ___-__-__"
                        className="form-input"
                        value={leadForm.phone}
                        onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                      />
                    </div>

                    <div className="form-field-group">
                      <label htmlFor="lead-city" className="field-label">
                        {h.fieldCity || 'Город / Регион'} <span className="field-required">*</span>
                      </label>
                      <input
                        id="lead-city"
                        type="text"
                        required
                        placeholder="Например: Новосибирск"
                        className="form-input"
                        value={leadForm.city}
                        onChange={(e) => setLeadForm({ ...leadForm, city: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-submit-wrap">
                    <button type="submit" className="btn btn-primary btn-lg btn-full" id="btn-submit-lead">
                      <span>{h.formSubmit || 'Получить коммерческие условия и каталог'}</span>
                      <ArrowRight size={18} />
                    </button>
                    <p className="form-disclaimer">
                      {h.formDisclaimer || 'Нажимая кнопку, вы подтверждаете согласие на обработку данных для коммерческого взаимодействия.'}
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
