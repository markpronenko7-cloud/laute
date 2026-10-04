import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Store, Building2, ShoppingBag, Phone, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

export const WhereToBuyPage = () => {
  const { openPartnerModal, lang, t } = useApp();
  const [activeTab, setActiveTab] = useState('wholesale');
  const [cityQuery, setCityQuery] = useState('');
  const [inquirySent, setInquirySent] = useState(false);

  const wp = t.whereToBuyPage || {};

  const handleInquirySubmit = (e) => {
    e.preventDefault();
    setInquirySent(true);
  };

  return (
    <div className="page-wrapper where-to-buy-page">
      {/* Header */}
      <section className="page-header">
        <div className="container">
          <div className="page-header-content">
            <span className="section-badge">{wp.badge || 'География присутствия'}</span>
            <h1 className="page-title">{wp.title || 'Где купить продукцию LAUTE'}</h1>
            <p className="page-subtitle">
              {wp.subtitle || 'Прямые поставки для оптовых заказчиков со складов представительства и приобретение в розницу через официальную дилерскую сеть.'}
            </p>

            <div className="tab-switcher">
              <button
                type="button"
                className={`tab-btn ${activeTab === 'wholesale' ? 'active' : ''}`}
                onClick={() => setActiveTab('wholesale')}
              >
                <Building2 size={16} />
                <span>{wp.tabWholesale || 'Оптовые закупки (B2B)'}</span>
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === 'retail' ? 'active' : ''}`}
                onClick={() => setActiveTab('retail')}
              >
                <ShoppingBag size={16} />
                <span>{wp.tabRetail || 'Розничным покупателям'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Content based on Tab */}
      <section className="section">
        <div className="container">
          {activeTab === 'wholesale' ? (
            <div className="wholesale-routing-block">
              <div className="section-title-wrap">
                <span className="section-badge">{lang === 'kz' ? 'Көтерме жеткізілімдер' : lang === 'en' ? 'Wholesale Supplies' : 'Оптовые поставки'}</span>
                <h2 className="section-title">{lang === 'kz' ? 'Өкілдіктер және өңірлік логистика' : lang === 'en' ? 'Offices & Regional Logistics' : 'Представительства и региональная логистика'}</h2>
                <p className="section-desc">
                  {lang === 'kz' ? 'Заңды тұлғалар, құрылыс нысандары және бөлшек желілер үшін жөнелтулер ресми өкілдіктер арқылы үйлестіріледі.' : lang === 'en' ? 'For corporate clients, construction sites and retail chains, shipments are coordinated through official representative offices.' : 'Для юридических лиц, строительных объектов и розничных сетей отгрузки координируются через официальные представительства.'}
                </p>
              </div>

              <div className="hubs-grid">
                <div className="hub-card">
                  <div className="hub-header">
                    <span className="hub-tag">{lang === 'kz' ? 'Ресми өкілдік' : lang === 'en' ? 'Official Representative Office' : 'Официальное представительство'}</span>
                    <h3 className="hub-city">{lang === 'kz' ? 'Новосібір (Сібір, РФ)' : lang === 'en' ? 'Novosibirsk (Siberia, RF)' : 'Новосибирск (Сибирь, РФ)'}</h3>
                  </div>
                  <p className="hub-address">Россия, 630073, г. Новосибирск, ул. Блюхера 71</p>
                  <p className="hub-desc">
                    {lang === 'kz' ? 'Компанияның басты бэк-офисі, Сібір және Қиыр Шығыс бойынша көтерме жөнелтулер мен өңірлік дилерлік жеткізілімдерді үйлестіру.' : lang === 'en' ? 'Head back-office of the company, coordinating wholesale shipments and regional dealer supplies across Siberia and the Far East.' : 'Главный бэк-офис компании, координация оптовых отгрузок и региональных дилерских поставок по Сибири и Дальнему Востоку.'}
                  </p>
                  <div className="hub-contacts">
                    <a href="tel:+79833105626" className="clickable-contact">
                      <Phone size={14} /> +7 (983) 310-56-26
                    </a>
                    <a href="tel:+79132030737" className="clickable-contact">
                      <Phone size={14} /> +7 (913) 203-07-37
                    </a>
                    <a href="mailto:nsk@laute.ltd" className="clickable-contact">
                      <Mail size={14} /> nsk@laute.ltd
                    </a>
                  </div>
                  <button type="button" className="btn btn-outline btn-sm btn-full" onClick={openPartnerModal}>
                    {lang === 'kz' ? 'Өкілдікпен байланысу' : lang === 'en' ? 'Contact Office' : 'Связаться с представительством'}
                  </button>
                </div>

                <div className="hub-card">
                  <div className="hub-header">
                    <span className="hub-tag">{lang === 'kz' ? 'Өңірлік бағыт' : lang === 'en' ? 'Regional Division' : 'Региональное направление'}</span>
                    <h3 className="hub-city">{lang === 'kz' ? 'Қазақстан' : lang === 'en' ? 'Kazakhstan' : 'Казахстан'}</h3>
                  </div>
                  <p className="hub-address">{lang === 'kz' ? 'LAUTE экспорттық жеткізілімдер бағыты' : lang === 'en' ? 'LAUTE Export Supplies Division' : 'Экспортное направление поставок LAUTE'}</p>
                  <p className="hub-desc">
                    {lang === 'kz' ? 'Қазақстан Республикасындағы дилерлер, жинақтаушылар және сауда желілері үшін сантехника жеткізілімдерін тікелей үйлестіру.' : lang === 'en' ? 'Direct coordination of plumbing supplies for dealers, developers, and retail chains in Kazakhstan.' : 'Прямая координация поставок сантехники для дилеров, комплектовщиков и торговых сетей в Республике Казахстан.'}
                  </p>
                  <div className="hub-contacts">
                    <a href="mailto:opt@laute.ltd" className="clickable-contact">
                      <Mail size={14} /> opt@laute.ltd
                    </a>
                    <a href="tel:+79833105626" className="clickable-contact">
                      <Phone size={14} /> +7 (983) 310-56-26
                    </a>
                  </div>
                  <button type="button" className="btn btn-outline btn-sm btn-full" onClick={openPartnerModal}>
                    {lang === 'kz' ? 'Қазақстанға арналған шарттар' : lang === 'en' ? 'Terms for Kazakhstan' : 'Условия для Казахстана'}
                  </button>
                </div>

                <div className="hub-card">
                  <div className="hub-header">
                    <span className="hub-tag">{lang === 'kz' ? 'Халықаралық үйлестіру' : lang === 'en' ? 'International Coordination' : 'Международная координация'}</span>
                    <h3 className="hub-city">{lang === 'kz' ? 'ОАЭ / АҚШ / Қытай' : lang === 'en' ? 'UAE / USA / China' : 'ОАЭ / США / Китай'}</h3>
                  </div>
                  <p className="hub-address">{lang === 'kz' ? 'Орталықтандырылған экспорттық логистика' : lang === 'en' ? 'Centralized Export Logistics' : 'Централизованная экспортная логистика'}</p>
                  <p className="hub-desc">
                    {lang === 'kz' ? 'Халықаралық серіктестер және құрылыс жобалары үшін сантехника мен бөлшектерді жеткізу.' : lang === 'en' ? 'Coordination of plumbing fixtures and components for international partners and development projects.' : 'Формирование поставок сантехники и комплектующих для международных оптовых партнёров и строительных объектов.'}
                  </p>
                  <div className="hub-contacts">
                    <a href="mailto:opt@laute.ltd" className="clickable-contact">
                      <Mail size={14} /> opt@laute.ltd
                    </a>
                    <a href="tel:+79833105626" className="clickable-contact">
                      <Phone size={14} /> +7 (983) 310-56-26
                    </a>
                  </div>
                  <button type="button" className="btn btn-outline btn-sm btn-full" onClick={openPartnerModal}>
                    {lang === 'kz' ? 'Коммерциялық шарттарды сұрау' : lang === 'en' ? 'Request Commercial Terms' : 'Запросить коммерческие условия'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="retail-routing-block">
              <div className="section-title-wrap">
                <span className="section-badge">{lang === 'kz' ? 'Бөлшек сауда' : lang === 'en' ? 'Retail Sales' : 'Розничные продажи'}</span>
                <h2 className="section-title">{lang === 'kz' ? 'Үйге және жөндеуге арналған сатып алу' : lang === 'en' ? 'Purchases for Home & Renovation' : 'Приобретение для дома и ремонта'}</h2>
                <p className="section-desc">
                  {lang === 'kz' ? 'LAUTE, Oute және Rainsberg брендтерінің өнімдері серіктес мамандандырылған сантехника дүкендерінде және құрылыс нарықтарында ұсынылған.' : lang === 'en' ? 'Products of LAUTE, Oute and Rainsberg brands are represented in partner specialized plumbing stores and online.' : 'Продукция брендов LAUTE, Oute и Rainsberg представлена в партнёрских специализированных магазинах сантехники, на строительных рынках и в онлайн-магазинах.'}
                </p>
              </div>

              <div className="retail-notice-card">
                <div className="notice-icon-large">
                  <Store size={32} color="#B45309" />
                </div>
                <div className="notice-body">
                  <h3>{wp.inquiryTitle || 'Поиск официальной точки продаж в вашем городе'}</h3>
                  <p>
                    {wp.inquiryDesc || 'В соответствии с регламентом компании, мы публикуем только актуальные и подтверждённые адреса партнёрских торговых точек. Если вы ищете конкретную модель в вашем населенном пункте, отправьте запрос — дежурный координатор подскажет ближайший магазин с наличием.'}
                  </p>

                  {inquirySent ? (
                    <div className="retail-success">
                      <CheckCircle2 size={24} color="#16A34A" />
                      <span>{lang === 'kz' ? 'Сұраныс қабылданды! Біз дүкендердің мекенжайларын көрсетеміз.' : lang === 'en' ? 'Inquiry received! We will send store locations to your contact.' : 'Запрос принят! Мы пришлем адреса магазинов на указанный контакт.'}</span>
                    </div>
                  ) : (
                    <form onSubmit={handleInquirySubmit} className="retail-inquiry-form">
                      <div className="form-inline-group">
                        <input
                          type="text"
                          required
                          placeholder={wp.searchPlaceholder || 'Поиск по городу (напр. Новосибирск, Алматы)...'}
                          value={cityQuery}
                          onChange={(e) => setCityQuery(e.target.value)}
                          className="search-input"
                        />
                        <button type="submit" className="btn btn-primary">
                          <span>{wp.inquiryBtn || 'Найти магазины'}</span>
                          <ArrowRight size={15} />
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
