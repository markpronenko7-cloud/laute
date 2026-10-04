import React, { useState } from 'react';
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

  const handleLeadSubmit = (e) => {
    e.preventDefault();
    setLeadSubmitted(true);
  };

  const h = t.home || {};

  return (
    <div className="page-wrapper home-page">
      {/* 1. HERO — Краткое позиционирование LAUTE */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              {/* Маленький текст над заголовком полностью удалён согласно п.3 */}

              <h1 className="hero-title">
                {h.heroTitle || 'Прямые B2B-поставки сантехники и оборудования LAUTE'}
              </h1>

              <p className="hero-desc">
                {h.heroDesc || 'Прямой контракт с заводом-изготовителем для дилеров, розничных сетей и комплектаторов строительных объектов. Официальная гарантия, цифровой сервис и персональные коммерческие условия.'}
              </p>

              <div className="hero-actions">
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

              <div className="hero-pills">
                <div className="hero-pill-item">
                  <CheckCircle2 size={16} className="pill-icon" />
                  <span>{h.pillContract || 'Прямой контракт с производителем'}</span>
                </div>
                <div className="hero-pill-item">
                  <Clock size={16} className="pill-icon" />
                  <span>{h.pillSla || 'Сервисный ответ за 36 часов'}</span>
                </div>
                <div className="hero-pill-item">
                  <Truck size={16} className="pill-icon" />
                  <span>{h.pillLogistics || 'Региональная логистика (РФ и ЕАЭС)'}</span>
                </div>
              </div>
            </div>

            <div className="hero-media-wrapper">
              <div className="hero-card-featured">
                <img
                  src={`${baseUrl}images/cat_kitchen.png`}
                  alt="Инженерная сантехника LAUTE"
                  className="hero-featured-img"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <div className="hero-card-overlay">
                  <span className="featured-tag">{h.featuredTag || 'Каталог продукции'}</span>
                  <h3>{h.featuredTitle || 'Смесители и сантехнические системы'}</h3>
                  <p>{h.featuredDesc || 'Продуманная эргономика, надежные узлы и широкий ассортимент для проектных и розничных поставок.'}</p>
                  <button 
                    type="button" 
                    className="card-inline-btn" 
                    onClick={() => navigateTo('catalog')}
                  >
                    {h.featuredBtn || 'Смотреть каталог →'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ДЛЯ КОГО КОМПАНИЯ РАБОТАЕТ */}
      <section className="section bg-light-section audience-section">
        <div className="container">
          <div className="section-title-wrap">
            <span className="section-badge">{h.audienceBadge || 'Целевая аудитория'}</span>
            <h2 className="section-title">{h.audienceTitle || 'Для кого работает LAUTE'}</h2>
            <p className="section-desc">
              {h.audienceDesc || 'Мы выстраиваем долгосрочные и предсказуемые отношения с профессиональными участниками рынка сантехники.'}
            </p>
          </div>

          <div className="audience-grid">
            <div className="audience-card">
              <div className="audience-icon-box">
                <Users size={24} />
              </div>
              <h3 className="audience-card-title">{h.audienceGroup1Title || 'Дистрибьюторы и оптовики'}</h3>
              <p className="audience-card-desc">
                {h.audienceGroup1Desc || 'Прямые контейнерные и сборные поставки, гибкая система скидок от объёма и защита коммерческих интересов в регионе.'}
              </p>
            </div>

            <div className="audience-card">
              <div className="audience-icon-box">
                <Store size={24} />
              </div>
              <h3 className="audience-card-title">{h.audienceGroup2Title || 'Розничные сети и салоны'}</h3>
              <p className="audience-card-desc">
                {h.audienceGroup2Desc || 'Востребованная матрица моделей, качественная потребительская упаковка, рекламная поддержка и стабильный складской запас.'}
              </p>
            </div>

            <div className="audience-card">
              <div className="audience-icon-box">
                <HardHat size={24} />
              </div>
              <h3 className="audience-card-title">{h.audienceGroup3Title || 'Комплектаторы и девелоперы'}</h3>
              <p className="audience-card-desc">
                {h.audienceGroup3Desc || 'Своевременное обеспечение жилых комплексов, гостиниц и коммерческих объектов. Полный пакет сертификатов и паспортов изделий.'}
              </p>
            </div>

            <div className="audience-card">
              <div className="audience-icon-box">
                <Wrench size={24} />
              </div>
              <h3 className="audience-card-title">{h.audienceGroup4Title || 'Монтажные организации'}</h3>
              <p className="audience-card-desc">
                {h.audienceGroup4Desc || 'Стандартизированные узлы подключения, долговечность картриджей и постоянное наличие оригинальных комплектующих на складах.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ГЛАВНЫЕ ПРЕИМУЩЕСТВА СОТРУДНИЧЕСТВА */}
      <section className="section advantages-section">
        <div className="container">
          <div className="section-title-wrap">
            <span className="section-badge">{h.advantagesBadge || 'Преимущества'}</span>
            <h2 className="section-title">{h.advantagesTitle || 'Почему партнёры выбирают LAUTE'}</h2>
            <p className="section-desc">
              {h.advantagesDesc || 'Стабильность поставок, честные заводские условия и сервис, снимающий рутинную нагрузку с партнёра.'}
            </p>
          </div>

          <div className="advantages-grid">
            <div className="advantage-card">
              <div className="advantage-num">01</div>
              <h3 className="advantage-title">{h.adv1Title || 'Прямой заводской контракт'}</h3>
              <p className="advantage-desc">
                {h.adv1Desc || 'Сотрудничество напрямую с производителем исключает лишние звенья наценки, гарантируя партнёрам высокую маржинальность и стабильность цен.'}
              </p>
            </div>

            <div className="advantage-card">
              <div className="advantage-num">02</div>
              <h3 className="advantage-title">{h.adv2Title || 'Складская логистика ЕАЭС'}</h3>
              <p className="advantage-desc">
                {h.adv2Desc || 'Четко выстроенные транспортные коридоры и развивающаяся сеть распределительных складов обеспечивают быструю комплектацию и отправку партий.'}
              </p>
            </div>

            <div className="advantage-card">
              <div className="advantage-num">03</div>
              <h3 className="advantage-title">{h.adv3Title || 'Первый цифровой сервис'}</h3>
              <p className="advantage-desc">
                {h.adv3Desc || 'Завод принимает и обрабатывает гарантийные обращения покупателей онлайн за 36 часов в рабочие дни. Дилерам не нужно содержать сервисный отдел.'}
              </p>
            </div>
          </div>

          <div className="section-cta-center">
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
      </section>

      {/* 4. Блок каталога продукции полностью удалён с главной страницы согласно п.5 */}

      {/* 5. КРАТКИЙ БЛОК «О КОМПАНИИ» (Ведёт на отдельную страницу) */}
      <section className="section company-preview-section">
        <div className="container">
          <div className="company-preview-grid">
            <div className="company-preview-content">
              <span className="section-badge">{h.companyBadge || 'О бренде'}</span>
              <h2 className="section-title">{h.companyTitle || 'Производственные стандарты и надежность'}</h2>
              <p className="section-desc">
                {h.companyDesc1 || 'LAUTE — международная торговая и производственная марка инженерной сантехники. Концепция бренда основана на строгом контроле на всех технологических переделах: от выбора сырья до финишных гидравлических испытаний готовых изделий.'}
              </p>
              <p className="section-text-secondary">
                {h.companyDesc2 || 'Продукция создается с расчетом на длительную интенсивную эксплуатацию, обеспечивая плавность хода рукояток, точную регулировку температуры и защиту от протечек.'}
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
              <div className="highlight-box">
                <Building2 size={24} className="highlight-icon" />
                <div>
                  <h4>{h.companyHighlight1Title || 'Стандартизация и ОТК'}</h4>
                  <p>{h.companyHighlight1Desc || 'Многоступенчатая приёмка партий и соответствие техническим регламентам.'}</p>
                </div>
              </div>
              <div className="highlight-box">
                <ShieldCheck size={24} className="highlight-icon" />
                <div>
                  <h4>{h.companyHighlight2Title || 'Официальные гарантии'}</h4>
                  <p>{h.companyHighlight2Desc || 'Заводские паспорта изделий и защищённые гарантийные обязательства производителя.'}</p>
                </div>
              </div>
              <div className="highlight-box">
                <FileText size={24} className="highlight-icon" />
                <div>
                  <h4>{h.companyHighlight3Title || 'Документация для проектов'}</h4>
                  <p>{h.companyHighlight3Desc || 'Полный комплект сертификатов, 3D-моделей и спецификаций для проектировщиков.'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ПОДДЕРЖКА ПАРТНЁРОВ И СЕРВИС 36 ЧАСОВ */}
      <section className="section bg-light-section service-preview-section">
        <div className="container">
          <div className="service-banner-box">
            <div className="service-banner-content">
              <div className="service-sla-badge">
                <Clock size={16} />
                <span>{h.serviceBadge || 'Регламент 36 часов в рабочие дни'}</span>
              </div>
              <h2 className="service-banner-title">{h.serviceTitle || 'Первый цифровой сервисный центр LAUTE'}</h2>
              <p className="service-banner-desc">
                {h.serviceDesc || 'Мы берем гарантийное обслуживание конечных покупателей на себя. Заявка с фото или видео дефекта подаётся онлайн за 2 минуты, а сервисные специалисты завода принимают решение в течение 36 часов.'}
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
              <div className="service-stat-card">
                <span className="stat-number">{h.stat1Num || '36 ч'}</span>
                <span className="stat-label">{h.stat1Label || 'Максимальный срок ответа по заявке'}</span>
              </div>
              <div className="service-stat-card">
                <span className="stat-number">{h.stat2Num || '100%'}</span>
                <span className="stat-label">{h.stat2Label || 'Онлайн-сопровождение рекламаций'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. ФИНАЛЬНЫЙ CTA — ФОРМА С ПРОСТОРНЫМИ НЕ СЛИТЫМИ ПОЛЯМИ */}
      <section className="section home-cta-section" id="b2b-lead-form">
        <div className="container">
          <div className="home-cta-card">
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
                  <CheckCircle2 size={48} color="#16A34A" />
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
