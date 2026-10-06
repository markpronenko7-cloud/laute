import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { HeroCarousel } from '../components/HeroCarousel';
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
  Headphones
} from 'lucide-react';

export const HomePage = () => {
  const { navigateTo, openPartnerModal, t } = useApp();

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

      {/* 2. ФОТОГРАФИЧЕСКИЙ БЛОК «КОЛЛЕКЦИИ» */}
      <CollectionsSection />

      {/* 3. ПАРТНЁРСТВО С LAUTE — СВЕТЛЫЙ ПРЕМИАЛЬНЫЙ БЛОК */}
      <section className="section light-audience-section" id="partners">
        <div className="container">
          <div className="section-title-wrap reveal-on-scroll">
            <span className="section-badge badge-refined">
              {h.audienceBadge || 'ПАРТНЁРСТВО'}
            </span>
            <h2 className="section-title light-title">
              {h.audienceTitle || 'Развиваем рынок вместе с партнерами'}
            </h2>
            <p className="section-desc light-desc">
              {h.audienceDesc || 'Сотрудничаем с дистрибьюторами, торговыми сетями и профессионалами строительного рынка. Формируем предложение под ваш канал продаж, ассортимент и задачи проекта.'}
            </p>
          </div>

          <div className="light-audience-grid">
            <div className="light-audience-card reveal-on-scroll reveal-delay-1">
              <div className="light-card-icon-wrap">
                <Users size={24} className="light-card-icon" />
              </div>
              <h3 className="light-card-heading">
                {h.audienceGroup1Title || 'Дистрибьюторам и оптовым компаниям'}
              </h3>
              <p className="light-card-body">
                {h.audienceGroup1Desc || 'Развивайте региональные продажи с продукцией LAUTE. Обсудим ассортимент, коммерческие условия и организацию поставок для вашего рынка.'}
              </p>
            </div>

            <div className="light-audience-card reveal-on-scroll reveal-delay-2">
              <div className="light-card-icon-wrap">
                <Store size={24} className="light-card-icon" />
              </div>
              <h3 className="light-card-heading">
                {h.audienceGroup2Title || 'Торговым сетям и салонам'}
              </h3>
              <p className="light-card-body">
                {h.audienceGroup2Desc || 'Сформируйте предложение для кухни и ванной комнаты в едином каталоге. Подберём модели и коллекции под формат магазина и потребности покупателей.'}
              </p>
            </div>

            <div className="light-audience-card reveal-on-scroll reveal-delay-3">
              <div className="light-card-icon-wrap">
                <HardHat size={24} className="light-card-icon" />
              </div>
              <h3 className="light-card-heading">
                {h.audienceGroup3Title || 'Девелоперам и комплектовщикам'}
              </h3>
              <p className="light-card-body">
                {h.audienceGroup3Desc || 'Подбирайте сантехническое оборудование под требования объекта. Поможем согласовать ассортимент, комплектацию и параметры поставки.'}
              </p>
            </div>

            <div className="light-audience-card reveal-on-scroll reveal-delay-4">
              <div className="light-card-icon-wrap">
                <Wrench size={24} className="light-card-icon" />
              </div>
              <h3 className="light-card-heading">
                {h.audienceGroup4Title || 'Монтажным организациям'}
              </h3>
              <p className="light-card-body">
                {h.audienceGroup4Desc || 'Выбирайте оборудование по монтажным размерам, подключениям и комплектации. По вопросам установки и совместимости обращайтесь к специалистам LAUTE.'}
              </p>
            </div>
          </div>

          <div className="section-cta-center reveal-on-scroll reveal-delay-2" style={{ marginTop: '48px' }}>
            <button 
              type="button" 
              className="btn btn-primary btn-luxury" 
              onClick={openPartnerModal}
              id="adv-btn-partner"
            >
              <span>{h.advBtn || 'Обсудить сотрудничество'}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* 4. ПЕРВЫЙ ЦИФРОВОЙ СЕРВИСНЫЙ ЦЕНТР LAUTE */}
      <section className="section light-service-section" id="service-preview">
        <div className="container">
          <div className="light-service-glass-box reveal-on-scroll">
            <div className="light-service-content">
              <span className="section-badge badge-refined">
                {h.serviceOverline || 'СЕРВИС ОТ ПРОИЗВОДИТЕЛЯ'}
              </span>
              <h2 className="service-glass-title">
                {h.serviceTitle || 'Первый цифровой сервисный центр LAUTE'}
              </h2>
              <p className="service-glass-desc">
                {h.serviceDesc || 'Поддержка LAUTE начинается с вашего обращения. Ознакомьтесь с гарантийными обязательствами и опишите вопрос в онлайн-форме. Специалист ответит в течение 36 часов в рабочие дни.'}
              </p>
              
              <div className="service-glass-actions">
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

            <div className="light-service-stats">
              <div className="service-stat-glass-card reveal-on-scroll reveal-delay-1">
                <div className="stat-glass-icon">
                  <Clock size={22} />
                </div>
                <div className="stat-glass-number">{h.stat1Num || '36 часов'}</div>
                <div className="stat-glass-label">{h.stat1Label || 'срок ответа в рабочие дни'}</div>
              </div>

              <div className="service-stat-glass-card reveal-on-scroll reveal-delay-2">
                <div className="stat-glass-icon">
                  <Headphones size={22} />
                </div>
                <div className="stat-glass-number">{h.stat2Num || 'Онлайн'}</div>
                <div className="stat-glass-label">{h.stat2Label || 'подача сервисного обращения'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. СОТРУДНИЧЕСТВО С LAUTE — ФОРМА СВЯЗИ */}
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
