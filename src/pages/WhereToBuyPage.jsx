import { EditableNode, EditableSection, NativeSectionGate } from '../components/builder/NativeContent';
import { PageText } from '../components/PageText';
import { SiteAction } from '../components/SiteAction';
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Store, Building2, ShoppingBag, Phone, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { submitLeadInquiry } from '../services/adminApi';

export const WhereToBuyPage = () => {
  const { openPartnerModal, lang, t } = useApp();
  const [activeTab, setActiveTab] = useState('wholesale');
  const [cityQuery, setCityQuery] = useState('');
  const [inquirySent, setInquirySent] = useState(false);

  const wp = t.whereToBuyPage || {};

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    try {
      await submitLeadInquiry({
        source: 'where_to_buy_city_inquiry',
        city: cityQuery
      });
    } catch (err) {
      window.alert(err.message || 'Не удалось отправить запрос. Попробуйте ещё раз.');
      return;
    }
    setInquirySent(true);
  };

  return (
    <div className="page-wrapper where-to-buy-page">
      {/* Header */}
      <EditableSection sectionKey="where-to-buy-1" className="page-header">
        <div className="container">
          <div className="page-header-content">
            <EditableNode as="span" editKey={"wheretobuypage-1"} kind="text" className="section-badge">{wp.badge || 'География присутствия'}</EditableNode>
            <EditableNode as="h1" editKey={"wheretobuypage-2"} kind="text"  introRoute="where-to-buy" introField="h1" className="page-title">{wp.title || 'Где купить продукцию LAUTE'}</EditableNode>
            <EditableNode as="p" editKey={"wheretobuypage-3"} kind="text" introRoute="where-to-buy" introField="description" className="page-subtitle">
              {wp.subtitle || 'Прямые поставки для оптовых заказчиков со складов представительства и приобретение в розницу через официальную дилерскую сеть.'}
            </EditableNode>

            <div className="tab-switcher">
              <EditableNode as="button" editKey={"wheretobuypage-4"} kind="button"
                type="button"
                className={`tab-btn ${activeTab === 'wholesale' ? 'active' : ''}`}
                onClick={() => setActiveTab('wholesale')}
              >
                <Building2 size={16} />
                <span>{wp.tabWholesale || 'Оптовые закупки (B2B)'}</span>
              </EditableNode>
              <EditableNode as="button" editKey={"wheretobuypage-5"} kind="button"
                type="button"
                className={`tab-btn ${activeTab === 'retail' ? 'active' : ''}`}
                onClick={() => setActiveTab('retail')}
              >
                <ShoppingBag size={16} />
                <span>{wp.tabRetail || 'Розничным покупателям'}</span>
              </EditableNode>
            </div>
          </div>
        </div>
      </EditableSection>

      {/* Content based on Tab */}
      <EditableSection sectionKey="where-to-buy-2" className="section">
        <div className="container">
          {activeTab === 'wholesale' ? (
            <div className="wholesale-routing-block">
              <div className="section-title-wrap">
                <EditableNode as="span" editKey={"wheretobuypage-6"} kind="text" className="section-badge">{lang === 'kz' ? 'Көтерме жеткізілімдер' : lang === 'en' ? 'Wholesale Supplies' : 'Оптовые поставки'}</EditableNode>
                <EditableNode as="h2" editKey={"wheretobuypage-7"} kind="text" className="section-title">{lang === 'kz' ? 'Өкілдіктер және өңірлік логистика' : lang === 'en' ? 'Offices & Regional Logistics' : 'Представительства и региональная логистика'}</EditableNode>
                <EditableNode as="p" editKey={"wheretobuypage-8"} kind="text" className="section-desc">
                  {lang === 'kz' ? 'Заңды тұлғалар, құрылыс нысандары және бөлшек желілер үшін жөнелтулер ресми өкілдіктер арқылы үйлестіріледі.' : lang === 'en' ? 'For corporate clients, construction sites and retail chains, shipments are coordinated through official representative offices.' : 'Для юридических лиц, строительных объектов и розничных сетей отгрузки координируются через официальные представительства.'}
                </EditableNode>
              </div>

              <div className="hubs-grid">
                <div className="hub-card">
                  <div className="hub-header">
                    <EditableNode as="span" editKey={"wheretobuypage-9"} kind="text" className="hub-tag">{lang === 'kz' ? 'Ресми өкілдік' : lang === 'en' ? 'Official Representative Office' : 'Официальное представительство'}</EditableNode>
                    <EditableNode as="h3" editKey={"wheretobuypage-10"} kind="text" className="hub-city">{lang === 'kz' ? 'Новосібір (Сібір, РФ)' : lang === 'en' ? 'Novosibirsk (Siberia, RF)' : 'Новосибирск (Сибирь, РФ)'}</EditableNode>
                  </div>
                  <EditableNode as="p" editKey={"wheretobuypage-11"} kind="text" className="hub-address">Россия, 630073, г. Новосибирск, ул. Блюхера 71</EditableNode>
                  <EditableNode as="p" editKey={"wheretobuypage-12"} kind="text" className="hub-desc">
                    {lang === 'kz' ? 'Компанияның басты бэк-офисі, Сібір және Қиыр Шығыс бойынша көтерме жөнелтулер мен өңірлік дилерлік жеткізілімдерді үйлестіру.' : lang === 'en' ? 'Head back-office of the company, coordinating wholesale shipments and regional dealer supplies across Siberia and the Far East.' : 'Главный бэк-офис компании, координация оптовых отгрузок и региональных дилерских поставок по Сибири и Дальнему Востоку.'}
                  </EditableNode>
                  <div className="hub-contacts">
                    <EditableNode as="a" editKey={"wheretobuypage-13"} kind="link" href="tel:+79833105626" className="clickable-contact">
                      <Phone size={14} /> +7 (983) 310-56-26
                    </EditableNode>
                    <EditableNode as="a" editKey={"wheretobuypage-14"} kind="link" href="tel:+79132030737" className="clickable-contact">
                      <Phone size={14} /> +7 (913) 203-07-37
                    </EditableNode>
                    <EditableNode as="a" editKey={"wheretobuypage-15"} kind="link" href="mailto:nsk@laute.ltd" className="clickable-contact">
                      <Mail size={14} /> nsk@laute.ltd
                    </EditableNode>
                  </div>
                  <EditableNode as="button" editKey={"wheretobuypage-16"} kind="button" type="button" className="btn btn-outline btn-sm btn-full" onClick={openPartnerModal}>
                    {lang === 'kz' ? 'Өкілдікпен байланысу' : lang === 'en' ? 'Contact Office' : 'Связаться с представительством'}
                  </EditableNode>
                </div>

                <div className="hub-card">
                  <div className="hub-header">
                    <EditableNode as="span" editKey={"wheretobuypage-17"} kind="text" className="hub-tag">{lang === 'kz' ? 'Өңірлік бағыт' : lang === 'en' ? 'Regional Division' : 'Региональное направление'}</EditableNode>
                    <EditableNode as="h3" editKey={"wheretobuypage-18"} kind="text" className="hub-city">{lang === 'kz' ? 'Қазақстан' : lang === 'en' ? 'Kazakhstan' : 'Казахстан'}</EditableNode>
                  </div>
                  <EditableNode as="p" editKey={"wheretobuypage-19"} kind="text" className="hub-address">{lang === 'kz' ? 'LAUTE экспорттық жеткізілімдер бағыты' : lang === 'en' ? 'LAUTE Export Supplies Division' : 'Экспортное направление поставок LAUTE'}</EditableNode>
                  <EditableNode as="p" editKey={"wheretobuypage-20"} kind="text" className="hub-desc">
                    {lang === 'kz' ? 'Қазақстан Республикасындағы дилерлер, жинақтаушылар және сауда желілері үшін сантехника жеткізілімдерін тікелей үйлестіру.' : lang === 'en' ? 'Direct coordination of plumbing supplies for dealers, developers, and retail chains in Kazakhstan.' : 'Прямая координация поставок сантехники для дилеров, комплектовщиков и торговых сетей в Республике Казахстан.'}
                  </EditableNode>
                  <div className="hub-contacts">
                    <EditableNode as="a" editKey={"wheretobuypage-21"} kind="link" href="mailto:opt@laute.ltd" className="clickable-contact">
                      <Mail size={14} /> opt@laute.ltd
                    </EditableNode>
                    <EditableNode as="a" editKey={"wheretobuypage-22"} kind="link" href="tel:+79833105626" className="clickable-contact">
                      <Phone size={14} /> +7 (983) 310-56-26
                    </EditableNode>
                  </div>
                  <EditableNode as="button" editKey={"wheretobuypage-23"} kind="button" type="button" className="btn btn-outline btn-sm btn-full" onClick={openPartnerModal}>
                    {lang === 'kz' ? 'Қазақстанға арналған шарттар' : lang === 'en' ? 'Terms for Kazakhstan' : 'Условия для Казахстана'}
                  </EditableNode>
                </div>

                <div className="hub-card">
                  <div className="hub-header">
                    <EditableNode as="span" editKey={"wheretobuypage-24"} kind="text" className="hub-tag">{lang === 'kz' ? 'Халықаралық үйлестіру' : lang === 'en' ? 'International Coordination' : 'Международная координация'}</EditableNode>
                    <EditableNode as="h3" editKey={"wheretobuypage-25"} kind="text" className="hub-city">{lang === 'kz' ? 'ОАЭ / АҚШ / Қытай' : lang === 'en' ? 'UAE / USA / China' : 'ОАЭ / США / Китай'}</EditableNode>
                  </div>
                  <EditableNode as="p" editKey={"wheretobuypage-26"} kind="text" className="hub-address">{lang === 'kz' ? 'Орталықтандырылған экспорттық логистика' : lang === 'en' ? 'Centralized Export Logistics' : 'Централизованная экспортная логистика'}</EditableNode>
                  <EditableNode as="p" editKey={"wheretobuypage-27"} kind="text" className="hub-desc">
                    {lang === 'kz' ? 'Халықаралық серіктестер және құрылыс жобалары үшін сантехника мен бөлшектерді жеткізу.' : lang === 'en' ? 'Coordination of plumbing fixtures and components for international partners and development projects.' : 'Формирование поставок сантехники и комплектующих для международных оптовых партнёров и строительных объектов.'}
                  </EditableNode>
                  <div className="hub-contacts">
                    <EditableNode as="a" editKey={"wheretobuypage-28"} kind="link" href="mailto:opt@laute.ltd" className="clickable-contact">
                      <Mail size={14} /> opt@laute.ltd
                    </EditableNode>
                    <EditableNode as="a" editKey={"wheretobuypage-29"} kind="link" href="tel:+79833105626" className="clickable-contact">
                      <Phone size={14} /> +7 (983) 310-56-26
                    </EditableNode>
                  </div>
                  <EditableNode as="button" editKey={"wheretobuypage-30"} kind="button" type="button" className="btn btn-outline btn-sm btn-full" onClick={openPartnerModal}>
                    {lang === 'kz' ? 'Коммерциялық шарттарды сұрау' : lang === 'en' ? 'Request Commercial Terms' : 'Запросить коммерческие условия'}
                  </EditableNode>
                </div>
              </div>
            </div>
          ) : (
            <div className="retail-routing-block">
              <div className="section-title-wrap">
                <EditableNode as="span" editKey={"wheretobuypage-31"} kind="text" className="section-badge">{lang === 'kz' ? 'Бөлшек сауда' : lang === 'en' ? 'Retail Sales' : 'Розничные продажи'}</EditableNode>
                <EditableNode as="h2" editKey={"wheretobuypage-32"} kind="text" className="section-title">{lang === 'kz' ? 'Үйге және жөндеуге арналған сатып алу' : lang === 'en' ? 'Purchases for Home & Renovation' : 'Приобретение для дома и ремонта'}</EditableNode>
                <EditableNode as="p" editKey={"wheretobuypage-33"} kind="text" className="section-desc">
                  {lang === 'kz' ? 'LAUTE, Oute және Rainsberg брендтерінің өнімдері серіктес мамандандырылған сантехника дүкендерінде және құрылыс нарықтарында ұсынылған.' : lang === 'en' ? 'Products of LAUTE, Oute and Rainsberg brands are represented in partner specialized plumbing stores and online.' : 'Продукция брендов LAUTE, Oute и Rainsberg представлена в партнёрских специализированных магазинах сантехники, на строительных рынках и в онлайн-магазинах.'}
                </EditableNode>
              </div>

              <div className="retail-notice-card">
                <div className="notice-icon-large">
                  <Store size={32} color="#B45309" />
                </div>
                <div className="notice-body">
                  <EditableNode as="h3" editKey={"wheretobuypage-34"} kind="text">{wp.inquiryTitle || 'Поиск официальной точки продаж в вашем городе'}</EditableNode>
                  <EditableNode as="p" editKey={"wheretobuypage-35"} kind="text">
                    {wp.inquiryDesc || 'В соответствии с регламентом компании, мы публикуем только актуальные и подтверждённые адреса партнёрских торговых точек. Если вы ищете конкретную модель в вашем населенном пункте, отправьте запрос — дежурный координатор подскажет ближайший магазин с наличием.'}
                  </EditableNode>

                  {inquirySent ? (
                    <div className="retail-success">
                      <CheckCircle2 size={24} color="#0EA5E9" />
                      <EditableNode as="span" editKey={"wheretobuypage-36"} kind="text">{lang === 'kz' ? 'Сұраныс қабылданды! Біз дүкендердің мекенжайларын көрсетеміз.' : lang === 'en' ? 'Inquiry received! We will send store locations to your contact.' : 'Запрос принят! Мы пришлем адреса магазинов на указанный контакт.'}</EditableNode>
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
                        <EditableNode as={SiteAction} editKey={"wheretobuypage-37"} kind="submit" controlId="wheretobuy-1" type="submit" className="btn btn-primary">
                          <span>{wp.inquiryBtn || 'Найти магазины'}</span>
                          <ArrowRight size={15} />
                        </EditableNode>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </EditableSection>
    </div>
  );
};
