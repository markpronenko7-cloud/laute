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
  ShieldCheck 
} from 'lucide-react';

import { HeroCarousel } from '../components/HeroCarousel';
import { CollectionsSection } from '../components/CollectionsSection';
import { withBrandWord } from '../utils/brandFormatter';

export const HomePage = () => {
  const { navigateTo, openPartnerModal, openServiceModal, t } = useApp();
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
