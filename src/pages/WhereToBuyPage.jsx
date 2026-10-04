import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Store, Building2, ShoppingBag, MapPin, Phone, Mail, ArrowRight, CheckCircle2, Info } from 'lucide-react';

export const WhereToBuyPage = () => {
  const { openPartnerModal, region, t } = useApp();
  const [activeTab, setActiveTab] = useState('wholesale');
  const [cityQuery, setCityQuery] = useState('');
  const [inquirySent, setInquirySent] = useState(false);

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
            <span className="section-badge">География присутствия</span>
            <h1 className="page-title">Где купить продукцию LAUTE</h1>
            <p className="page-subtitle">
              Прямые поставки для оптовых заказчиков со складов представительства и приобретение в розницу через официальную дилерскую сеть.
            </p>

            <div className="tab-switcher">
              <button
                type="button"
                className={`tab-btn ${activeTab === 'wholesale' ? 'active' : ''}`}
                onClick={() => setActiveTab('wholesale')}
              >
                <Building2 size={16} />
                <span>Оптовые закупки (B2B)</span>
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === 'retail' ? 'active' : ''}`}
                onClick={() => setActiveTab('retail')}
              >
                <ShoppingBag size={16} />
                <span>Розничным покупателям</span>
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
                <span className="section-badge">Оптовые поставки</span>
                <h2 className="section-title">Представительства и региональная логистика</h2>
                <p className="section-desc">
                  Для юридических лиц, строительных объектов и розничных сетей отгрузки координируются через официальные представительства.
                </p>
                <div style={{ margin: '12px auto 0', maxWidth: '720px', padding: '10px 16px', background: 'rgba(212,163,115,0.08)', border: '1px solid rgba(212,163,115,0.2)', borderRadius: '6px', fontSize: '0.85rem', color: '#CBD5E1' }}>
                  <strong>Протокол развития:</strong> Окончательная география распределительных складов формируется и согласовывается. Актуальные маршруты отгрузки уточняйте у регионального менеджера.
                </div>
              </div>

              <div className="hubs-grid">
                <div className="hub-card">
                  <div className="hub-header">
                    <span className="hub-tag">Официальное представительство</span>
                    <h3 className="hub-city">Новосибирск</h3>
                  </div>
                  <p className="hub-address">Россия, 630073, г. Новосибирск, ул. Блюхера 71</p>
                  <p className="hub-desc">
                    Главный бэк-офис компании, координация оптовых отгрузок и региональных дилерских поставок по Сибири и Дальнему Востоку.
                  </p>
                  <div className="hub-contacts">
                    <a href="tel:+79833105626" className="clickable-contact">
                      <Phone size={14} /> +7 (983) 310-56-26 (Оксана)
                    </a>
                    <a href="tel:+79132030737" className="clickable-contact">
                      <Phone size={14} /> +7 (913) 203-07-37 (Сергей)
                    </a>
                    <a href="mailto:opt@laute.ltd" className="clickable-contact">
                      <Mail size={14} /> opt@laute.ltd
                    </a>
                  </div>
                  <button type="button" className="btn btn-outline btn-sm btn-full" onClick={openPartnerModal}>
                    Связаться с представительством
                  </button>
                </div>

                <div className="hub-card">
                  <div className="hub-header">
                    <span className="hub-tag">Региональное направление</span>
                    <h3 className="hub-city">Казахстан и Центральная Азия</h3>
                  </div>
                  <p className="hub-address">Экспортное направление поставок LAUTE</p>
                  <p className="hub-desc">
                    Прямая координация поставок сантехники для дилеров, комплектовщиков и торговых сетей в Республике Казахстан.
                  </p>
                  <div className="hub-contacts">
                    <a href="mailto:opt@laute.ltd" className="clickable-contact">
                      <Mail size={14} /> opt@laute.ltd
                    </a>
                    <a href="tel:+79833105626" className="clickable-contact">
                      <Phone size={14} /> +7 (983) 310-56-26
                    </a>
                    <span className="contact-note">Прямая связь через экспортный отдел</span>
                  </div>
                  <button type="button" className="btn btn-outline btn-sm btn-full" onClick={openPartnerModal}>
                    Условия для Казахстана
                  </button>
                </div>

                <div className="hub-card">
                  <div className="hub-header">
                    <span className="hub-tag">Региональное направление</span>
                    <h3 className="hub-city">Европейская часть РФ и СНГ</h3>
                  </div>
                  <p className="hub-address">Централизованная логистическая координация</p>
                  <p className="hub-desc">
                    Формирование поставок сантехники и комплектующих для региональных оптовых партнёров и строительных объектов.
                  </p>
                  <div className="hub-contacts">
                    <a href="mailto:opt@laute.ltd" className="clickable-contact">
                      <Mail size={14} /> opt@laute.ltd
                    </a>
                    <a href="tel:+79132030737" className="clickable-contact">
                      <Phone size={14} /> +7 (913) 203-07-37
                    </a>
                  </div>
                  <button type="button" className="btn btn-outline btn-sm btn-full" onClick={openPartnerModal}>
                    Запросить коммерческие условия
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="retail-routing-block">
              <div className="section-title-wrap">
                <span className="section-badge">Розничные продажи</span>
                <h2 className="section-title">Приобретение для дома и ремонта</h2>
                <p className="section-desc">
                  Продукция брендов LAUTE, Oute и Rainsberg представлена в партнёрских специализированных магазинах сантехники, на строительных рынках и в онлайн-магазинах.
                </p>
              </div>

              <div className="retail-notice-card">
                <div className="notice-icon-large">
                  <Store size={32} color="#B45309" />
                </div>
                <div className="notice-body">
                  <h3>Поиск официальной точки продаж в вашем городе</h3>
                  <p>
                    В соответствии с регламентом компании, мы публикуем только актуальные и подтверждённые адреса партнёрских торговых точек. Если вы ищете конкретную модель в вашем населенном пункте, отправьте запрос — дежурный координатор подскажет ближайший магазин с наличием.
                  </p>

                  {inquirySent ? (
                    <div className="retail-success">
                      <CheckCircle2 size={24} color="#16A34A" />
                      <span>Запрос принят! Мы пришлем адреса магазинов на указанный контакт.</span>
                    </div>
                  ) : (
                    <form onSubmit={handleInquirySubmit} className="retail-inquiry-form">
                      <div className="form-inline-group">
                        <input
                          type="text"
                          required
                          placeholder="Ваш город (напр., Томск, Караганда, Новосибирск)"
                          value={cityQuery}
                          onChange={(e) => setCityQuery(e.target.value)}
                          className="search-input"
                        />
                        <button type="submit" className="btn btn-primary">
                          <span>Найти магазины</span>
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
