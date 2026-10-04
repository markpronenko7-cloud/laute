import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TrendingUp, ShieldCheck, Truck, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';

export const PartnersPage = () => {
  const { lang, t } = useApp();
  const pp = t.partnersPage || {};

  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    city: '',
    businessType: 'wholesale',
    comments: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const partnerTypes = [
    {
      title: pp.type1Title || 'Оптовые компании и дистрибьюторы',
      desc: pp.type1Desc || 'Формирование региональных складских запасов, специальные оптовые цены, защита территории и маркетинговая поддержка.'
    },
    {
      title: pp.type2Title || 'Федеральные и региональные розничные сети',
      desc: pp.type2Desc || 'Ритмичные графики поставок, штрихкодирование, качественная упаковка и промо-материалы для торговых залов.'
    },
    {
      title: pp.type3Title || 'Комплектаторы объектов и девелоперы',
      desc: pp.type3Desc || 'Поставка партий под график строительства, сертификаты соответствия, паспорта изделий и инженерный подбор под смету.'
    },
    {
      title: pp.type4Title || 'Салоны сантехники и дизайн-студии',
      desc: pp.type4Desc || 'Предоставление выставочных стендов, каталогов, 3D-моделей и персональные условия для архитекторов и дизайнеров.'
    }
  ];

  const stepsData = [
    {
      num: '01',
      title: lang === 'kz' ? 'Өтінім беру' : lang === 'en' ? 'Submit Inquiry' : 'Подача заявки',
      desc: lang === 'kz' ? 'Қалаңызды, бизнес түрін және жоспарланған сатып алу көлемін көрсете отырып пішінді толтырыңыз.' : lang === 'en' ? 'Fill out the form specifying your city, business type, and anticipated order volumes.' : 'Заполните форму с указанием вашего города, формы бизнеса и планируемого объема закупок.'
    },
    {
      num: '02',
      title: lang === 'kz' ? 'Өңірді талдау және ұсыныс' : lang === 'en' ? 'Territory Review & Offer' : 'Анализ региона и предложение',
      desc: lang === 'kz' ? 'Бекітілген аумақтың жауапты менеджері сізбен хабарласып, коммерциялық ұсыныс жасайды.' : lang === 'en' ? 'Assigned territory manager contacts you with tailor-made commercial terms.' : 'Ответственный менеджер закрепленной территории связывается с вами и формирует коммерческое предложение.'
    },
    {
      num: '03',
      title: lang === 'kz' ? 'Шарттарды келісу және шарт' : lang === 'en' ? 'Terms & Agreement' : 'Согласование условий и договор',
      desc: lang === 'kz' ? 'Жеке жеңілдіктер жүйесін, төлем ережелерін және жөнелту шарттарын бекіту.' : lang === 'en' ? 'Finalizing individual tier discounts, payment conditions, and shipping schedules.' : 'Закрепление индивидуальной системы скидок, правил оплаты и условий отгрузки.'
    },
    {
      num: '04',
      title: lang === 'kz' ? 'Жөнелту және сүйемелдеу' : lang === 'en' ? 'Fulfillment & Support' : 'Отгрузка и сопровождение',
      desc: lang === 'kz' ? 'Жеке кабинетке қолжетімділік, жақын маңдағы өңірлік қоймадан тапсырысты жедел жинақтау.' : lang === 'en' ? 'B2B portal access, rapid order picking from the nearest regional distribution depot.' : 'Доступ в личный кабинет, оперативная комплектация заказа с ближайшего регионального склада.'
    }
  ];

  return (
    <div className="page-wrapper partners-page">
      {/* Header */}
      <section className="page-header">
        <div className="container">
          <div className="page-header-content">
            <span className="section-badge">{pp.badge || 'B2B Сотрудничество'}</span>
            <h1 className="page-title">{pp.title || 'Сотрудничество с производителем LAUTE'}</h1>
            <p className="page-subtitle">
              {pp.subtitle || 'Прямые поставки сантехники от завода-изготовителя. Индивидуальные коммерческие условия, складская программа в регионах и сервисная поддержка.'}
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="section bg-light-section">
        <div className="container">
          <div className="section-title-wrap">
            <span className="section-badge">{pp.advTitle || 'Преимущества для бизнеса'}</span>
            <h2 className="section-title">{pp.advTitle || 'Почему оптовые клиенты выбирают LAUTE'}</h2>
            <p className="section-desc">
              {pp.subtitle || 'Мы создаем условия, при которых дилеры и комплектаторы получают предсказуемый заработок и надежного партнера в лице завода.'}
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-box">
                <Truck size={24} />
              </div>
              <h3 className="feature-title">{pp.adv2Title || 'Складская программа'}</h3>
              <p className="feature-desc">
                {pp.adv2Desc || 'Отработанные логистические цепочки и организация поставок в регионы обеспечивают своевременную комплектацию заказов.'}
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <TrendingUp size={24} />
              </div>
              <h3 className="feature-title">{pp.adv1Title || 'Прямые контракты'}</h3>
              <p className="feature-desc">
                {pp.adv1Desc || 'Прямая работа без посредников позволяет партнерам формировать конкурентные розничные цены при сохранении высокой нормы прибыли.'}
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <ShieldCheck size={24} />
              </div>
              <h3 className="feature-title">{pp.adv3Title || 'Цифровой сервис завода'}</h3>
              <p className="feature-desc">
                {pp.adv3Desc || 'Наличие Первого цифрового сервисного центра LAUTE снимает с розничных продавцов и дилеров бремя гарантийных разбирательств — клиент подает заявку онлайн.'}
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <FileText size={24} />
              </div>
              <h3 className="feature-title">{pp.adv4Title || 'Рекламная и техническая поддержка'}</h3>
              <p className="feature-desc">
                {pp.adv4Desc || 'Предоставление печатных каталогов, образцов продукции, схем сборки, сертификатов соответствия и паспортов изделий.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Target Segments */}
      <section className="section">
        <div className="container">
          <div className="section-title-wrap">
            <span className="section-badge">{pp.coopTitle || 'Форматы партнёрства'}</span>
            <h2 className="section-title">{pp.coopTitle || 'С кем мы работаем'}</h2>
            <p className="section-desc">
              {pp.coopDesc || 'Мы разрабатываем гибкие коммерческие программы под масштаб и специфику вашего бизнеса.'}
            </p>
          </div>

          <div className="partner-types-grid">
            {partnerTypes.map((pt, i) => (
              <div key={i} className="partner-type-item">
                <div className="partner-type-icon">
                  <CheckCircle2 size={20} color="#B45309" />
                </div>
                <div className="partner-type-body">
                  <h4>{pt.title}</h4>
                  <p>{pt.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Start */}
      <section className="section bg-light-section">
        <div className="container">
          <div className="section-title-wrap">
            <span className="section-badge">{lang === 'kz' ? 'Қосылу процесі' : lang === 'en' ? 'Onboarding Flow' : 'Процесс подключения'}</span>
            <h2 className="section-title">{lang === 'kz' ? 'Ынтымақтастықты қалай бастау керек' : lang === 'en' ? 'How to Start Cooperation' : 'Как начать сотрудничество'}</h2>
            <p className="section-desc">{lang === 'kz' ? 'Алғашқы өтінімнен тұрақты жеткізілімдерге дейінгі төрт қарапайым қадам.' : lang === 'en' ? 'Four simple steps from first inquiry to regular shipments.' : 'Четыре простых шага от первой заявки до регулярных поставок.'}</p>
          </div>

          <div className="steps-grid">
            {stepsData.map((st) => (
              <div key={st.num} className="step-flow-card">
                <span className="step-flow-num">{st.num}</span>
                <h3 className="step-flow-title">{st.title}</h3>
                <p className="step-flow-desc">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="section partner-form-section">
        <div className="container">
          <div className="form-layout-box">
            <div className="form-info-col">
              <span className="section-badge">{pp.badge || 'B2B Сотрудничество'}</span>
              <h2>{pp.formTitle || 'Заявка на получение дилерских условий'}</h2>
              <p>
                {pp.formDesc || 'Заполните форму, и региональный представитель LAUTE направит дилерский прайс-лист, типовой договор и согласует условия поставок.'}
              </p>

              <div className="form-contacts-hint">
                <p>{lang === 'kz' ? 'Тікелей бэк-офиске хабарласуға болады:' : lang === 'en' ? 'Direct contact with back office:' : 'Также вы можете связаться напрямую с бэк-офисом:'}</p>
                <strong><a href="mailto:opt@laute.ltd">opt@laute.ltd</a></strong> • <strong><a href="tel:+79833105626">+7 (983) 310-56-26</a></strong>
              </div>
            </div>

            <div className="form-body-col">
              {isSubmitted ? (
                <div className="form-success-box" style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.3)', padding: '24px', borderRadius: '8px', textAlign: 'center' }}>
                  <CheckCircle2 size={44} color="#16A34A" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ color: '#F8FAFC', marginBottom: '8px' }}>{pp.formSuccess || 'Заявка успешно отправлена!'}</h3>
                  <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '16px' }}>
                    {lang === 'kz' ? 'Көтерме бөлімнің менеджері коммерциялық ұсынысты жіберу үшін жұмыс күні ішінде сізбен хабарласады.' : lang === 'en' ? 'Wholesale department manager will contact you within one business day.' : 'Менеджер оптового отдела свяжется с вами в течение рабочего дня.'}
                  </p>
                  <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '0.8rem', color: '#CBD5E1', marginBottom: '16px' }}>
                    {lang === 'kz' ? 'Жедел байланыс:' : lang === 'en' ? 'Direct line:' : 'Прямая оперативная связь:'} <a href="tel:+79833105626" style={{ color: '#D4A373', fontWeight: 600 }}>+7 (983) 310-56-26</a> • <a href="mailto:opt@laute.ltd" style={{ color: '#D4A373' }}>opt@laute.ltd</a>
                  </div>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsSubmitted(false)}>
                    {lang === 'kz' ? 'Жаңа өтінім толтыру' : lang === 'en' ? 'Submit another inquiry' : 'Заполнить новую заявку'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="b2b-form">
                  <div className="form-group">
                    <label>{pp.formCompany || 'Название компании / ИП'} *</label>
                    <input
                      type="text"
                      required
                      placeholder="ООО / ИП / ТОО"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>{pp.formPerson || 'Контактное лицо'} *</label>
                      <input
                        type="text"
                        required
                        placeholder={lang === 'kz' ? 'Аты-жөні және лауазымы' : lang === 'en' ? 'Full name and position' : 'Имя и должность'}
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>{pp.formCity || 'Город / Регион'} *</label>
                      <input
                        type="text"
                        required
                        placeholder="Алматы, Новосибирск..."
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>{pp.formPhone || 'Телефон для связи'} *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+7 (___) ___-__-__"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>{pp.formEmail || 'Электронная почта'} *</label>
                      <input
                        type="email"
                        required
                        placeholder="opt@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>{pp.formType || 'Направление деятельности'}:</label>
                    <select
                      value={formData.businessType}
                      onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                      className="form-select"
                    >
                      <option value="wholesale">{lang === 'kz' ? 'Көтерме компания / Дистрибьютор' : lang === 'en' ? 'Wholesale / Distributor' : 'Оптовая компания / Дистрибьютор'}</option>
                      <option value="retail">{lang === 'kz' ? 'Бөлшек сауда дүкені' : lang === 'en' ? 'Retail Store' : 'Розничный магазин сантехники'}</option>
                      <option value="diy">{lang === 'kz' ? 'Дүкендер желісі / DIY' : lang === 'en' ? 'Retail Chain / DIY' : 'Сеть магазинов / DIY'}</option>
                      <option value="contractor">{lang === 'kz' ? 'Құрылыс / Мердігер ұйымы' : lang === 'en' ? 'Contractor / Developer' : 'Строительная / Подрядная организация'}</option>
                      <option value="ecommerce">{lang === 'kz' ? 'Интернет-дүкен / Маркетплейс' : lang === 'en' ? 'E-commerce / Marketplace' : 'Интернет-магазин / Маркетплейс'}</option>
                      <option value="other">{lang === 'kz' ? 'Басқа формат' : lang === 'en' ? 'Other format' : 'Другой формат'}</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>{pp.formComment || 'Комментарий к запросу'}:</label>
                    <textarea
                      rows={3}
                      placeholder={lang === 'kz' ? 'Қызықтыратын сериялар, көлем немесе сұрақтар...' : lang === 'en' ? 'Interested series, order volume, or questions...' : 'Укажите интересующие серии смесителей, примерный объем или вопросы...'}
                      value={formData.comments}
                      onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary btn-full">
                    <span>{pp.formSubmit || 'Отправить заявку партнёра'}</span>
                    <ArrowRight size={16} />
                  </button>

                  <p className="form-privacy-note">
                    {lang === 'kz' ? 'Түймені басу арқылы сіз көтерме ынтымақтастық мәселелері бойынша байланысу үшін байланыс деректерін өңдеуге келісіміңізді растайсыз.' : lang === 'en' ? 'By submitting, you confirm consent to contact details processing for wholesale cooperation.' : 'Нажимая кнопку, вы подтверждаете согласие на обработку контактных данных для связи по вопросам оптового сотрудничества.'}
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
