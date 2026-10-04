import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Handshake, TrendingUp, ShieldCheck, Truck, Headphones, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';

export const PartnersPage = () => {
  const { openPartnerModal, region, t } = useApp();

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
      title: 'Оптовые компании и дистрибьюторы',
      desc: 'Формирование региональных складских запасов, специальные оптовые цены, защита территории и маркетинговая поддержка.'
    },
    {
      title: 'Розничные магазины и сантехнические салоны',
      desc: 'Популярный ассортимент с высокой оборачиваемостью, предоставление образцов, торгового оборудования и буклетов.'
    },
    {
      title: 'Строительные компании и комплектаторы',
      desc: 'Комплектация жилых комплексов, гостиниц и общественных объектов надежной сантехникой с необходимым пакетом сертификатов.'
    },
    {
      title: 'Сети DIY и гипермаркеты',
      desc: 'Стабильные объемы поставок, штрихкодирование, логистическая поддержка и бесперебойная отгрузка со складов.'
    },
    {
      title: 'Интернет-магазины и E-commerce',
      desc: 'Предоставление выгрузок, высококачественных фотоматериалов, технических спецификаций и оперативные отгрузки.'
    }
  ];

  const steps = [
    {
      num: '01',
      title: 'Подача заявки',
      desc: 'Заполните форму с указанием вашего города, формы бизнеса и планируемого объема закупок.'
    },
    {
      num: '02',
      title: 'Анализ региона и предложение',
      desc: 'Ответственный менеджер закрепленной территории связывается с вами и формирует коммерческое предложение.'
    },
    {
      num: '03',
      title: 'Согласование условий и договор',
      desc: 'Закрепление индивидуальной системы скидок, правил оплаты и условий отгрузки.'
    },
    {
      num: '04',
      title: 'Отгрузка и сопровождение',
      desc: 'Доступ в личный кабинет, оперативная комплектация заказа с ближайшего регионального склада.'
    }
  ];

  return (
    <div className="page-wrapper partners-page">
      {/* Header */}
      <section className="page-header">
        <div className="container">
          <div className="page-header-content">
            <span className="section-badge">B2B Сотрудничество</span>
            <h1 className="page-title">Сотрудничество с производителем LAUTE</h1>
            <p className="page-subtitle">
              Прямые поставки сантехники от завода-изготовителя. Индивидуальные коммерческие условия, складская программа в регионах и сервисная поддержка.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="section bg-light-section">
        <div className="container">
          <div className="section-title-wrap">
            <span className="section-badge">Преимущества для бизнеса</span>
            <h2 className="section-title">Почему оптовые клиенты выбирают LAUTE</h2>
            <p className="section-desc">
              Мы создаем условия, при которых дилеры и комплектаторы получают предсказуемый заработок и надежного партнера в лице завода.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-box">
                <Truck size={24} />
              </div>
              <h3 className="feature-title">Региональная логистика</h3>
              <p className="feature-desc">
                Отработанные логистические цепочки и организация поставок в регионы России, Казахстана и стран ЕАЭС обеспечивают своевременную комплектацию заказов.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <TrendingUp size={24} />
              </div>
              <h3 className="feature-title">Высокая торговая маржинальность</h3>
              <p className="feature-desc">
                Прямая работа без посредников позволяет партнерам формировать конкурентные розничные цены при сохранении высокой нормы прибыли.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <ShieldCheck size={24} />
              </div>
              <h3 className="feature-title">Собственный цифровой сервис</h3>
              <p className="feature-desc">
                Наличие Первого цифрового сервисного центра LAUTE снимает с розничных продавцов и дилеров бремя гарантийных разбирательств — клиент подает заявку онлайн.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <FileText size={24} />
              </div>
              <h3 className="feature-title">Маркетинговая и техническая поддержка</h3>
              <p className="feature-desc">
                Предоставление печатных каталогов, образцов продукции, схем сборки, сертификатов соответствия и паспортов изделий.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Target Segments */}
      <section className="section">
        <div className="container">
          <div className="section-title-wrap">
            <span className="section-badge">Форматы партнёрства</span>
            <h2 className="section-title">С кем мы работаем</h2>
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
            <span className="section-badge">Процесс подключения</span>
            <h2 className="section-title">Как начать сотрудничество</h2>
            <p className="section-desc">Четыре простых шага от первой заявки до регулярных поставок.</p>
          </div>

          <div className="steps-grid">
            {steps.map((st) => (
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
              <span className="section-badge">Заявка на сотрудничество</span>
              <h2>Получите оптовый каталог и расчёт условий</h2>
              <p>
                Заполните анкету, и ответственный региональный менеджер (по Сибири, Казахстану или центральным регионам) свяжется с вами в течение рабочего дня.
              </p>

              <div className="form-contacts-hint">
                <p>Также вы можете связаться напрямую с бэк-офисом:</p>
                <strong><a href="mailto:opt@laute.ltd">opt@laute.ltd</a></strong> • <strong><a href="tel:+79833105626">+7 (983) 310-56-26</a></strong>
              </div>
            </div>

            <div className="form-body-col">
              {isSubmitted ? (
                <div className="form-success-box" style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.3)', padding: '24px', borderRadius: '8px', textAlign: 'center' }}>
                  <CheckCircle2 size={44} color="#16A34A" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ color: '#F8FAFC', marginBottom: '8px' }}>Данные заявки успешно сформированы</h3>
                  <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '16px' }}>
                    Заявка подготовлена для передачи региональному менеджеру LAUTE. (Интерфейс готов к интеграции с корпоративной CRM/ERP).
                  </p>
                  <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '0.8rem', color: '#CBD5E1', marginBottom: '16px' }}>
                    Прямая оперативная связь: <a href="tel:+79833105626" style={{ color: '#D4A373', fontWeight: 600 }}>+7 (983) 310-56-26</a> • <a href="mailto:opt@laute.ltd" style={{ color: '#D4A373' }}>opt@laute.ltd</a>
                  </div>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsSubmitted(false)}>
                    Заполнить новую заявку
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="b2b-form">
                  <div className="form-group">
                    <label>Название компании / ИП *</label>
                    <input
                      type="text"
                      required
                      placeholder="ООО «СантехОпт» или ИП Иванов"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Контактное лицо *</label>
                      <input
                        type="text"
                        required
                        placeholder="Имя и должность"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Город / Регион *</label>
                      <input
                        type="text"
                        required
                        placeholder="Новосибирск, Алматы, Омск и т.д."
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Телефон для связи *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+7 (___) ___-__-__"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Электронная почта *</label>
                      <input
                        type="email"
                        required
                        placeholder="opt@company.ru"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Формат бизнеса:</label>
                    <select
                      value={formData.businessType}
                      onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                      className="form-select"
                    >
                      <option value="wholesale">Оптовая компания / Дистрибьютор</option>
                      <option value="retail">Розничный магазин сантехники</option>
                      <option value="diy">Сеть магазинов / DIY</option>
                      <option value="contractor">Строительная / Подрядная организация</option>
                      <option value="ecommerce">Интернет-магазин / Маркетплейс</option>
                      <option value="other">Другой формат</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Комментарий или интересующие категории:</label>
                    <textarea
                      rows={3}
                      placeholder="Укажите интересующие серии смесителей, примерный объем или вопросы..."
                      value={formData.comments}
                      onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary btn-full">
                    <span>Отправить заявку менеджеру</span>
                    <ArrowRight size={16} />
                  </button>

                  <p className="form-privacy-note">
                    Нажимая кнопку, вы подтверждаете согласие на обработку контактных данных для связи по вопросам оптового сотрудничества.
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
