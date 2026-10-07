import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { HeroCarousel } from '../components/HeroCarousel';
import { AIProductMatchBanner } from '../components/AIProductMatchBanner';
import { CollectionsSection } from '../components/CollectionsSection';
import { 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  Store, 
  HardHat, 
  Wrench,
  Clock,
  ShieldCheck,
  PhoneCall,
  Mail,
  Headphones,
  Check
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

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleLeadSubmit = (e) => {
    e.preventDefault();
    setLeadSubmitted(true);
  };

  const h = t.home || {};

  return (
    <div className="page-wrapper home-page-transformed">
      {/* 1. FULL-SCREEN HERO CAROUSEL — 5 СЛАЙДОВ */}
      <HeroCarousel />

      {/* 2. AI-ПОДБОР ПРОДУКЦИИ LAUTE — КРИТИЧЕСКИ ВАЖНЫЙ ЭЛЕМЕНТ СРАЗУ ПОСЛЕ HERO */}
      <AIProductMatchBanner />

      {/* 3. ФОТОГРАФИЧЕСКАЯ ГАЛЕРЕЯ «КОЛЛЕКЦИИ» */}
      <CollectionsSection />

      {/* 4. «РАЗВИВАЕМ РЫНОК ВМЕСТЕ С ПАРТНЁРАМИ» — ПРЕМИАЛЬНЫЙ ВИЗУАЛЬНЫЙ БЛОК */}
      <section className="section visual-partnership-section" id="partners">
        <div className="container">
          <div className="section-title-wrap reveal-on-scroll">
            <span className="section-badge badge-refined">
              {h.audienceBadge || 'ПАРТНЁРСТВО'}
            </span>
            <h2 className="section-title visual-part-title">
              {h.audienceTitle || 'Развиваем рынок вместе с партнёрами'}
            </h2>
            <p className="section-desc visual-part-desc">
              {h.audienceDesc || 'Сотрудничаем с дистрибьюторами, торговыми сетями и профессионалами строительного рынка. Формируем предложение под ваш канал продаж, ассортимент и задачи проекта.'}
            </p>
          </div>

          <div className="partnership-visual-showcase reveal-on-scroll">
            {/* Visual Photographic Banner Area */}
            <div className="partnership-photo-banner">
              <img 
                src={`${baseUrl}images/hero/hero-slide-4.jpg`} 
                alt="Партнёрство с LAUTE" 
                className="partnership-main-photo"
                loading="lazy"
              />
              <div className="partnership-photo-vignette"></div>

              <div className="partnership-floating-glass-bar">
                <div className="glass-metric-pill">
                  <span className="metric-dot"></span>
                  <span>Прямой контракт с производителем</span>
                </div>
                <div className="glass-metric-pill">
                  <span className="metric-dot"></span>
                  <span>Персональные коммерческие условия</span>
                </div>
                <div className="glass-metric-pill">
                  <span className="metric-dot"></span>
                  <span>Техническая поддержка объектов</span>
                </div>
              </div>
            </div>

            {/* 4 Clean Glass Audience Cards */}
            <div className="partnership-audiences-grid">
              <div className="part-audience-card reveal-on-scroll reveal-delay-1">
                <div className="part-card-icon-bubble">
                  <Users size={22} />
                </div>
                <h3 className="part-card-title">
                  {h.audienceGroup1Title || 'Дистрибьюторам и оптовым компаниям'}
                </h3>
                <p className="part-card-text">
                  {h.audienceGroup1Desc || 'Развивайте региональные продажи с продукцией LAUTE. Обсудим ассортимент, коммерческие условия и организацию поставок для вашего рынка.'}
                </p>
              </div>

              <div className="part-audience-card reveal-on-scroll reveal-delay-2">
                <div className="part-card-icon-bubble">
                  <Store size={22} />
                </div>
                <h3 className="part-card-title">
                  {h.audienceGroup2Title || 'Торговым сетям и салонам'}
                </h3>
                <p className="part-card-text">
                  {h.audienceGroup2Desc || 'Сформируйте предложение для кухни и ванной комнаты в едином каталоге. Подберём модели и коллекции под формат магазина и потребности покупателей.'}
                </p>
              </div>

              <div className="part-audience-card reveal-on-scroll reveal-delay-3">
                <div className="part-card-icon-bubble">
                  <HardHat size={22} />
                </div>
                <h3 className="part-card-title">
                  {h.audienceGroup3Title || 'Девелоперам и комплектовщикам'}
                </h3>
                <p className="part-card-text">
                  {h.audienceGroup3Desc || 'Подбирайте сантехническое оборудование под требования объекта. Поможем согласовать ассортимент, комплектацию и параметры поставки.'}
                </p>
              </div>

              <div className="part-audience-card reveal-on-scroll reveal-delay-4">
                <div className="part-card-icon-bubble">
                  <Wrench size={22} />
                </div>
                <h3 className="part-card-title">
                  {h.audienceGroup4Title || 'Монтажным организациям'}
                </h3>
                <p className="part-card-text">
                  {h.audienceGroup4Desc || 'Выбирайте оборудование по монтажным размерам, подключениям и комплектации. По вопросам установки и совместимости обращайтесь к специалистам LAUTE.'}
                </p>
              </div>
            </div>

            {/* Center Single CTA */}
            <div className="partnership-action-wrap reveal-on-scroll reveal-delay-2">
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
      </section>

      {/* 5. «ПЕРВЫЙ ЦИФРОВОЙ СЕРВИСНЫЙ ЦЕНТР LAUTE» — ПРЕМИАЛЬНЫЙ СЕРВИСНЫЙ БЛОК */}
      <section className="section visual-service-section" id="service-preview">
        <div className="container">
          <div className="service-editorial-card reveal-on-scroll">
            <div className="service-editorial-grid">
              {/* Left Column: Authentic Service Content */}
              <div className="service-text-column">
                <span className="section-badge badge-refined">
                  {h.serviceOverline || 'СЕРВИС ОТ ПРОИЗВОДИТЕЛЯ'}
                </span>
                <h2 className="service-editorial-title">
                  {h.serviceTitle || 'Первый цифровой сервисный центр LAUTE'}
                </h2>
                <p className="service-editorial-desc">
                  {h.serviceDesc || 'Поддержка LAUTE начинается с вашего обращения. Ознакомьтесь с гарантийными обязательствами и опишите вопрос в онлайн-форме. Ответ будет дан в течение 36 часов в рабочие дни.'}
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

              {/* Right Column: Visual Factory Quality Testing Photo */}
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

      {/* 6. СОТРУДНИЧЕСТВО С LAUTE — ФОРМА СВЯЗИ */}
      <section className="section light-cta-section" id="b2b-lead-form">
        <div className="container">
          <div className="light-cta-card reveal-on-scroll">
            <div className="cta-left-content">
              <span className="section-badge badge-refined">
                {h.formBadge || 'СОТРУДНИЧЕСТВО С LAUTE'}
              </span>
              <h2 className="cta-heading light-heading">
                {h.formHeading || 'Ваш следующий шаг — партнёрство с LAUTE'}
              </h2>
              <p className="cta-subheading light-subheading">
                {h.formSubheading || 'Расскажите о вашей компании и регионе работы. Представитель LAUTE свяжется с вами, поможет выбрать ассортимент и подготовит коммерческое предложение.'}
              </p>

              <div className="cta-contact-summary">
                <div className="cta-contact-line">
                  <PhoneCall size={18} className="cta-contact-icon" />
                  <div>
                    <span className="cta-contact-label">{h.formDept || 'Отдел продаж'}:</span>
                    <a href="tel:+79833105626" className="cta-contact-value">+7 (983) 310-56-26</a>
                  </div>
                </div>

                <div className="cta-contact-line">
                  <Mail size={18} className="cta-contact-icon" />
                  <div>
                    <span className="cta-contact-label">{h.formEmailLabel || 'Электронная почта'}:</span>
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
                  <p>{h.formSuccessDesc || 'Представитель LAUTE свяжется с вами для отправки коммерческого предложения.'}</p>
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
