import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowRight, 
  Users, 
  Store, 
  HardHat, 
  Wrench, 
  PhoneCall, 
  Mail, 
  CheckCircle2, 
  Clock, 
  Headphones, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';

import { HeroCarousel } from '../components/HeroCarousel';
import { CollectionsSection } from '../components/CollectionsSection';
import { withBrandWord } from '../utils/brandFormatter';

export const HomePage = () => {
  const { navigateTo, openPartnerModal, openServiceModal, startAIPartnerAnalysis, t } = useApp();
  const baseUrl = import.meta.env.BASE_URL;

  const [leadForm, setLeadForm] = useState({
    name: '',
    company: '',
    phone: '',
    city: ''
  });
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  useEffect(() => {
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleLeadSubmit = (e) => {
    e.preventDefault();
    setLeadSubmitted(true);
  };

  const h = t.home || {};

  return (
    <div className="page-wrapper home-page-transformed">
      {/* 1. FULL-SCREEN HERO CAROUSEL — 5 СЛАЙДОВ (3 СЕКУНДЫ АВТОМАТИЧЕСКАЯ СМЕНА) */}
      <HeroCarousel />

      {/* 2. ФОТОГРАФИЧЕСКАЯ ГАЛЕРЕЯ «КОЛЛЕКЦИИ LAUTE» */}
      <CollectionsSection />

      {/* 2.5. МАТЕРИАЛЫ И ТЕХНОЛОГИИ LAUTE — ИНЖЕНЕРНАЯ НАДЕЖНОСТЬ В КАЖДОЙ ДЕТАЛИ */}
      <section className="section visual-technologies-section" id="technologies">
        <div className="container">
          <div className="section-title-wrap reveal-on-scroll">
            <span className="section-badge badge-refined">
              {h.techBadge || 'ТЕХНОЛОГИИ & МАТЕРИАЛЫ'}
            </span>
            <h2 className="section-title visual-tech-title">
              {withBrandWord(h.techTitle || 'Инженерная надежность в каждой детали')}
            </h2>
            <p className="section-desc visual-tech-desc">
              {withBrandWord(h.techDesc || 'Никаких компромиссов: первичная конструкционная латунь, пищевая нержавеющая сталь SUS304, ЭКО алюминий, испанские картриджи Sedal и молекулярное вакуумное PVD-осаждение.')}
            </p>
          </div>

          <div className="technologies-editorial-grid">
            {/* 1. Испанские картриджи Sedal — КРУПНЫЙ ВИЗУАЛЬНЫЙ ПЛАН (Featured Macro) */}
            <div className="tech-card tech-card-featured reveal-on-scroll">
              <div className="tech-media-frame">
                <img 
                  src={`${baseUrl}images/sedal_cartridge_macro.jpg`} 
                  alt="Испанский керамический картридж Sedal для смесителей LAUTE" 
                  className="tech-macro-img"
                  loading="lazy"
                />
                <div className="tech-media-overlay"></div>
                <div className="tech-floating-tag">
                  <span className="tech-spec-pill">SEDAL GROUP · SPAIN · EST. 1974</span>
                </div>
              </div>
              <div className="tech-card-body">
                <div className="tech-card-header">
                  <span className="tech-num">01</span>
                  <span className="tech-kicker">ЕВРОПЕЙСКИЙ СТАНДАРТ EN 817</span>
                </div>
                <h3 className="tech-heading">{h.sedalTitle || 'Испанские картриджи Sedal'}</h3>
                <p className="tech-text">
                  {h.sedalDesc || 'Керамические картриджи от европейского производителя Sedal (Испания, осн. 1974). Диски из спеченной керамики с микрозеркальной алмазной полировкой, тестирование до 500 000 рабочих циклов по европейскому стандарту EN 817. Плавный ход рычага и термостойкость до 90°C.'}
                </p>
                <div className="tech-spec-bullets">
                  <div className="tech-spec-item">
                    <span className="spec-item-bullet">•</span>
                    <span>Диски из оксида алюминия Al₂O₃ с алмазной притиркой</span>
                  </div>
                  <div className="tech-spec-item">
                    <span className="spec-item-bullet">•</span>
                    <span>Ресурс 500 000 циклов (EN 817) без капель и протечек</span>
                  </div>
                  <div className="tech-spec-item">
                    <span className="spec-item-bullet">•</span>
                    <span>Термостойкость до 90°C и гидротест 16 бар</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Сверхпрочные эксцентрики из латуни А+ */}
            <div className="tech-card tech-card-standard reveal-on-scroll reveal-delay-1">
              <div className="tech-media-frame">
                <img 
                  src={`${baseUrl}images/brass_eccentric_macro.jpg`} 
                  alt="Сверхпрочные эксцентрики из первичной латуни А+" 
                  className="tech-macro-img"
                  loading="lazy"
                />
                <div className="tech-media-overlay"></div>
                <div className="tech-floating-tag">
                  <span className="tech-spec-pill">GRADE A+ CW617N BRASS</span>
                </div>
              </div>
              <div className="tech-card-body">
                <div className="tech-card-header">
                  <span className="tech-num">02</span>
                  <span className="tech-kicker">ПРЕЦИЗИОННАЯ РЕЗЬБА 1/2" × 3/4"</span>
                </div>
                <h3 className="tech-heading">{h.brassEccentricTitle || 'Сверхпрочные эксцентрики из латуни А+'}</h3>
                <p className="tech-text">
                  {h.brassEccentricDesc || 'Массивные монтажные S-образные переходники из первичной конструкционной латуни марки А+. Прецизионная резьба 1/2" на 3/4" и плотная металлическая структура для надежного настенного монтажа смесителей.'}
                </p>
              </div>
            </div>

            {/* 3. PVD-покрытие */}
            <div className="tech-card tech-card-standard reveal-on-scroll reveal-delay-2">
              <div className="tech-media-frame">
                <img 
                  src={`${baseUrl}images/pvd_finish_macro.jpg`} 
                  alt="PVD-покрытие сантехники LAUTE" 
                  className="tech-macro-img"
                  loading="lazy"
                />
                <div className="tech-media-overlay"></div>
                <div className="tech-floating-tag">
                  <span className="tech-spec-pill">VACUUM DEPOSITION</span>
                </div>
              </div>
              <div className="tech-card-body">
                <div className="tech-card-header">
                  <span className="tech-num">03</span>
                  <span className="tech-kicker">МОЛЕКУЛЯРНАЯ СТОЙКОСТЬ</span>
                </div>
                <h3 className="tech-heading">{h.pvdTitle || 'PVD-покрытие'}</h3>
                <p className="tech-text">
                  {h.pvdDesc || 'PVD — технология нанесения прочного декоративно-защитного покрытия в вакууме на молекулярном уровне. Стойкость к истиранию и безупречная глубина цвета.'}
                </p>
              </div>
            </div>

            {/* 4. Нержавеющая сталь SUS304 */}
            <div className="tech-card tech-card-standard reveal-on-scroll reveal-delay-3">
              <div className="tech-media-frame">
                <img 
                  src={`${baseUrl}images/sus304_steel_macro.jpg`} 
                  alt="Пищевая нержавеющая сталь SUS304 LAUTE" 
                  className="tech-macro-img"
                  loading="lazy"
                />
                <div className="tech-media-overlay"></div>
                <div className="tech-floating-tag">
                  <span className="tech-spec-pill">FOOD-GRADE SUS304</span>
                </div>
              </div>
              <div className="tech-card-body">
                <div className="tech-card-header">
                  <span className="tech-num">04</span>
                  <span className="tech-kicker">ПИЩЕВОЙ СТАНДАРТ</span>
                </div>
                <h3 className="tech-heading">{h.sus304Title || 'Нержавеющая сталь SUS304'}</h3>
                <p className="tech-text">
                  {h.sus304Desc || 'Пищевая аустенитная нержавеющая сталь с высоким содержанием хрома и никеля. Абсолютная устойчивость к коррозии и благородная матовая сатинированная фактура.'}
                </p>
              </div>
            </div>

            {/* 5. ЭКО алюминий */}
            <div className="tech-card tech-card-standard reveal-on-scroll reveal-delay-4">
              <div className="tech-media-frame">
                <img 
                  src={`${baseUrl}images/eco_aluminum_macro.jpg`} 
                  alt="Конструкционный ЭКО алюминий для душевых зон и кабин" 
                  className="tech-macro-img"
                  loading="lazy"
                />
                <div className="tech-media-overlay"></div>
                <div className="tech-floating-tag">
                  <span className="tech-spec-pill">ECO ANODIZED ALLOY</span>
                </div>
              </div>
              <div className="tech-card-body">
                <div className="tech-card-header">
                  <span className="tech-num">05</span>
                  <span className="tech-kicker">РЕЦИКЛИНГ И ЖЕСТКОСТЬ</span>
                </div>
                <h3 className="tech-heading">{h.ecoAluTitle || 'ЭКО алюминий'}</h3>
                <p className="tech-text">
                  {h.ecoAluDesc || 'Конструкционный анодированный алюминиевый профиль. Экологичный и долговечный металл высокой жесткости для душевых перегородок и кабин.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. «РАЗВИВАЕМ РЫНОК ВМЕСТЕ С ПАРТНЁРАМИ» — КРЕАТИВНЫЙ АСИММЕТРИЧНЫЙ АРХИТЕКТУРНЫЙ БЛОК */}
      <section className="section visual-partnership-section" id="partners">
        <div className="container">
          <div className="section-title-wrap reveal-on-scroll">
            <span className="section-badge badge-refined">
              {h.audienceBadge || 'ПАРТНЁРСТВО'}
            </span>
            <h2 className="section-title visual-part-title">
              {withBrandWord(h.audienceTitle || 'Развиваем рынок вместе с партнёрами')}
            </h2>
            <p className="section-desc visual-part-desc">
              {withBrandWord(h.audienceDesc || 'Сотрудничаем с дистрибьюторами, торговыми сетями и профессионалами строительного рынка. Формируем предложение под ваш канал продаж, ассортимент и задачи проекта.')}
            </p>
          </div>

          <div className="partnership-asymmetric-stage reveal-on-scroll">
            {/* Left Column: Architectural Photo Canvas & Floating Overlay */}
            <div className="partnership-heroic-visual">
              <div className="partnership-media-frame">
                <img 
                  src={`${baseUrl}images/hero/hero-slide-4.jpg`} 
                  alt="Партнёрство с LAUTE" 
                  className="partnership-stage-img"
                  loading="lazy"
                />
                <div className="partnership-stage-gradient"></div>

                <div className="partnership-stage-badge">
                  <span className="stage-badge-tag">B2B NETWORK</span>
                  <span className="stage-badge-brand">
                    <span className="brand-word">LAUTE</span> COMMERCIAL SPECIFICATION
                  </span>
                </div>

                <div className="partnership-stage-overlay">
                  <div className="partnership-metric-tags">
                    <div className="glass-metric-pill">
                      <span className="metric-index">01</span>
                      <span>Прямой контракт с производителем</span>
                    </div>
                    <div className="glass-metric-pill">
                      <span className="metric-index">02</span>
                      <span>Персональные коммерческие условия</span>
                    </div>
                    <div className="glass-metric-pill">
                      <span className="metric-index">03</span>
                      <span>Техническая поддержка объектов</span>
                    </div>
                  </div>

                  <div className="partnership-stage-cta">
                    <button 
                      type="button" 
                      className="btn btn-primary btn-luxury" 
                      onClick={openPartnerModal}
                      id="adv-btn-partner"
                    >
                      <span>{h.btnPartner || 'Стать партнёром'}</span>
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: 4 Tiered Architectural Glass Cards */}
            <div className="partnership-cards-tier">
              <div className="tier-audience-card reveal-on-scroll reveal-delay-1">
                <div className="tier-card-top">
                  <div className="tier-icon-box">
                    <Users size={20} />
                  </div>
                  <span className="tier-index-num">01</span>
                </div>
                <h3 className="tier-card-title">
                  {withBrandWord(h.audienceGroup1Title || 'Дистрибьюторам и оптовым компаниям')}
                </h3>
                <p className="tier-card-desc">
                  {withBrandWord(h.audienceGroup1Desc || 'Развивайте региональные продажи с продукцией LAUTE. Обсудим ассортимент, коммерческие условия и организацию поставок для вашего рынка.')}
                </p>
              </div>

              <div className="tier-audience-card reveal-on-scroll reveal-delay-2">
                <div className="tier-card-top">
                  <div className="tier-icon-box">
                    <Store size={20} />
                  </div>
                  <span className="tier-index-num">02</span>
                </div>
                <h3 className="tier-card-title">
                  {withBrandWord(h.audienceGroup2Title || 'Торговым сетям и салонам')}
                </h3>
                <p className="tier-card-desc">
                  {withBrandWord(h.audienceGroup2Desc || 'Сформируйте предложение для кухни и ванной комнаты в едином каталоге. Подберём модели и коллекции под формат магазина и потребности покупателей.')}
                </p>
              </div>

              <div className="tier-audience-card reveal-on-scroll reveal-delay-3">
                <div className="tier-card-top">
                  <div className="tier-icon-box">
                    <HardHat size={20} />
                  </div>
                  <span className="tier-index-num">03</span>
                </div>
                <h3 className="tier-card-title">
                  {withBrandWord(h.audienceGroup3Title || 'Девелоперам и комплектовщикам')}
                </h3>
                <p className="tier-card-desc">
                  {withBrandWord(h.audienceGroup3Desc || 'Подбирайте сантехническое оборудование под требования объекта. Поможем согласовать ассортимент, комплектацию и параметры поставки.')}
                </p>
              </div>

              <div className="tier-audience-card reveal-on-scroll reveal-delay-4">
                <div className="tier-card-top">
                  <div className="tier-icon-box">
                    <Wrench size={20} />
                  </div>
                  <span className="tier-index-num">04</span>
                </div>
                <h3 className="tier-card-title">
                  {withBrandWord(h.audienceGroup4Title || 'Монтажным организациям')}
                </h3>
                <p className="tier-card-desc">
                  {withBrandWord(h.audienceGroup4Desc || 'Выбирайте оборудование по монтажным размерам, подключениям и комплектации. По вопросам установки и совместимости обращайтесь к специалистам LAUTE.')}
                </p>
              </div>
            </div>
          </div>

          {/* AI PARTNERSHIP CONSULTATION CTA BANNER */}
          <div className="partnership-ai-cta-banner reveal-on-scroll">
            <div className="ai-cta-banner-content">
              <div className="ai-cta-badge">
                <Sparkles size={16} className="ai-cta-icon-sparkle" />
                <span>ИНТЕЛЛЕКТУАЛЬНЫЙ АНАЛИЗ ВОЗМОЖНОСТЕЙ</span>
              </div>
              <h3 className="ai-cta-title">
                {withBrandWord(h.aiPartnershipTitle || 'Проанализируйте свои возможности с AI LAUTE')}
              </h3>
              <p className="ai-cta-desc">
                {withBrandWord(h.aiPartnershipDesc || 'Цифровой интеллект LAUTE задаст несколько уточняющих вопросов, поможет сформулировать профиль потребностей вашего бизнеса и определит формат взаимодействия без лишней бюрократии.')}
              </p>
            </div>
            <div className="ai-cta-banner-action">
              <button 
                type="button" 
                className="btn btn-primary btn-luxury btn-ai-start" 
                onClick={startAIPartnerAnalysis}
                id="btn-partner-ai-analysis"
              >
                <Sparkles size={18} />
                <span>{h.aiPartnershipBtn || 'Начать анализ'}</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. «ПЕРВЫЙ ЦИФРОВОЙ СЕРВИСНЫЙ ЦЕНТР LAUTE» — ПРЕМИАЛЬНЫЙ СЕРВИСНЫЙ БЛОК */}
      <section className="section visual-service-section" id="service-preview">
        <div className="container">
          <div className="service-editorial-card reveal-on-scroll">
            <div className="service-editorial-grid">
              {/* Left Column: Service Details & SLA */}
              <div className="service-text-column">
                <span className="section-badge badge-refined">
                  {h.serviceOverline || 'СЕРВИС ОТ ПРОИЗВОДИТЕЛЯ'}
                </span>
                <h2 className="service-editorial-title">
                  {withBrandWord(h.serviceTitle || 'Первый цифровой сервисный центр LAUTE')}
                </h2>
                <p className="service-editorial-desc">
                  {withBrandWord(h.serviceDesc || 'Поддержка LAUTE начинается с вашего обращения. Ознакомьтесь с гарантийными обязательствами и опишите вопрос в онлайн-форме. Ответ будет дан в течение 36 часов в рабочие дни.')}
                </p>

                {/* Service SLA & Online Support Badges */}
                <div className="service-stats-editorial-row">
                  <div className="service-stat-glass-pill">
                    <div className="stat-glass-icon-wrap">
                      <Clock size={20} />
                    </div>
                    <div>
                      <div className="stat-pill-num">{h.stat1Num || '36 часов'}</div>
                      <div className="stat-pill-label">{h.stat1Label || 'срок ответа в рабочие дни'}</div>
                    </div>
                  </div>

                  <div className="service-stat-glass-pill">
                    <div className="stat-glass-icon-wrap">
                      <Headphones size={20} />
                    </div>
                    <div>
                      <div className="stat-pill-num">{h.stat2Num || 'Онлайн'}</div>
                      <div className="stat-pill-label">{h.stat2Label || 'подача сервисного обращения'}</div>
                    </div>
                  </div>
                </div>

                <div className="service-editorial-actions">
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    onClick={() => navigateTo('service')}
                    id="btn-service-center"
                  >
                    <span>{h.serviceBtn || 'Обратиться в сервис'}</span>
                    <ArrowRight size={16} />
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline light-btn-outline" 
                    onClick={() => navigateTo('partners')}
                    id="btn-partner-support"
                  >
                    <span>{h.servicePartnerBtn || 'Поддержка партнеров'}</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Factory Quality Testing Photo */}
              <div className="service-visual-column">
                <div className="service-photo-frame">
                  <img 
                    src={`${baseUrl}images/prod_testing.png`} 
                    alt="Контроль качества и сервис LAUTE" 
                    className="service-photo-img"
                    loading="lazy"
                  />
                  <div className="service-photo-overlay"></div>
                  <div className="service-photo-caption-glass">
                    <ShieldCheck size={18} className="shield-icon" />
                    <span>Заводское гидро- и пневмотестирование 100% узлов</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. СОТРУДНИЧЕСТВО С LAUTE — ФОРМА СВЯЗИ С ВЫСОКИМ КОНТРАСТОМ И ЧИТАЕМОСТЬЮ */}
      <section className="section light-cta-section" id="b2b-lead-form">
        <div className="container">
          <div className="light-cta-card reveal-on-scroll">
            <div className="cta-left-content">
              <span className="section-badge badge-refined">
                {withBrandWord(h.formBadge || 'СОТРУДНИЧЕСТВО С LAUTE')}
              </span>
              <h2 className="cta-heading light-heading">
                {withBrandWord(h.formHeading || 'Ваш следующий шаг — партнёрство с LAUTE')}
              </h2>
              <p className="cta-subheading light-subheading">
                {withBrandWord(h.formSubheading || 'Расскажите о вашей компании и регионе работы. Представитель LAUTE свяжется с вами, поможет выбрать ассортимент и подготовит коммерческое предложение.')}
              </p>

              {/* High-Contrast Architectural Contact Panel */}
              <div className="cta-contact-summary-box">
                <div className="cta-contact-line">
                  <div className="cta-contact-icon-bubble">
                    <PhoneCall size={18} />
                  </div>
                  <div>
                    <span className="cta-contact-label">{h.formDept || 'Отдел продаж и дистрибуции'}</span>
                    <a href="tel:+79833105626" className="cta-contact-value">+7 (983) 310-56-26</a>
                  </div>
                </div>

                <div className="cta-contact-line">
                  <div className="cta-contact-icon-bubble">
                    <Mail size={18} />
                  </div>
                  <div>
                    <span className="cta-contact-label">{h.formEmailLabel || 'Официальная электронная почта'}</span>
                    <a href="mailto:opt@laute.ltd" className="cta-contact-value">opt@laute.ltd</a>
                  </div>
                </div>
              </div>

              <div className="cta-secondary-link-wrap">
                <button 
                  type="button" 
                  className="btn btn-outline light-btn-outline btn-sm" 
                  onClick={() => navigateTo('contacts')}
                  id="btn-all-contacts"
                >
                  <span>{h.formAllContacts || 'Контакты в вашем регионе'}</span>
                </button>
              </div>
            </div>

            <div className="cta-right-form-wrap">
              {leadSubmitted ? (
                <div className="form-success-card light-form-success">
                  <CheckCircle2 size={48} color="#0EA5E9" />
                  <h3>{h.formSuccessTitle || 'Запрос успешно отправлен!'}</h3>
                  <p>{withBrandWord(h.formSuccessDesc || 'Представитель LAUTE свяжется с вами для отправки коммерческого предложения.')}</p>
                  <button 
                    type="button" 
                    className="btn btn-outline light-btn-outline btn-sm" 
                    style={{ marginTop: '16px' }}
                    onClick={() => setLeadSubmitted(false)}
                  >
                    {h.formSuccessAgain || 'Отправить ещё один запрос'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="b2b-lead-form light-lead-form">
                  <div className="form-field-group">
                    <label htmlFor="lead-name" className="field-label light-field-label">
                      {h.fieldName || 'Ваше имя'} <span className="field-required">*</span>
                    </label>
                    <input
                      id="lead-name"
                      type="text"
                      required
                      placeholder="Иван Иванов"
                      className="form-input light-form-input"
                      value={leadForm.name}
                      onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                    />
                  </div>

                  <div className="form-field-group">
                    <label htmlFor="lead-company" className="field-label light-field-label">
                      {h.fieldCompany || 'Компания или направление деятельности'} <span className="field-required">*</span>
                    </label>
                    <input
                      id="lead-company"
                      type="text"
                      required
                      placeholder="ООО / ИП / Торговая сеть / Комплектация"
                      className="form-input light-form-input"
                      value={leadForm.company}
                      onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                    />
                  </div>

                  <div className="form-fields-grid-2">
                    <div className="form-field-group">
                      <label htmlFor="lead-phone" className="field-label light-field-label">
                        {h.fieldPhone || 'Телефон'} <span className="field-required">*</span>
                      </label>
                      <input
                        id="lead-phone"
                        type="tel"
                        required
                        placeholder="+7 (___) ___-__-__"
                        className="form-input light-form-input"
                        value={leadForm.phone}
                        onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                      />
                    </div>

                    <div className="form-field-group">
                      <label htmlFor="lead-city" className="field-label light-field-label">
                        {h.fieldCity || 'Город и страна'} <span className="field-required">*</span>
                      </label>
                      <input
                        id="lead-city"
                        type="text"
                        required
                        placeholder="Например: Новосибирск"
                        className="form-input light-form-input"
                        value={leadForm.city}
                        onChange={(e) => setLeadForm({ ...leadForm, city: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-submit-wrap">
                    <button type="submit" className="btn btn-primary btn-lg btn-full" id="btn-submit-lead">
                      <span>{h.formSubmit || 'Получить предложение'}</span>
                      <ArrowRight size={18} />
                    </button>
                    <p className="form-disclaimer light-disclaimer">
                      {h.formDisclaimer || 'Я согласен на обработку персональных данных на условиях Политики конфиденциальности'}
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

export default HomePage;
