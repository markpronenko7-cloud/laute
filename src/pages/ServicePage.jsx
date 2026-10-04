import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Clock, CheckCircle2, Phone, Mail } from 'lucide-react';

export const ServicePage = () => {
  const { region, lang, t } = useApp();
  const sp = t.servicePage || {};

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    hasWhatsapp: 'yes',
    regionInquiry: region || 'siberia',
    storeName: '',
    purchaseDate: '',
    brand: 'LAUTE',
    modelArticle: '',
    defectType: 'body-leak',
    description: '',
    filesAttached: false
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const getTargetEmail = () => {
    if (formData.regionInquiry === 'kz') return 'opt@laute.ltd (Казахстанское направление)';
    if (formData.regionInquiry === 'siberia') return 'nsk@laute.ltd (Сибирский сервисный отдел)';
    return 'opt@laute.ltd (Сервисный центр завода)';
  };

  const rulesData = [
    {
      num: '1',
      title: lang === 'kz' ? 'Ақауларды тегін жою құқығы' : lang === 'en' ? 'Free Defect Rectification' : 'Право на бесплатное устранение дефектов',
      desc: lang === 'kz' ? 'Бұйыммен бірге кепілдік талоны беріледі, ол кепілдік мерзімі ішінде өндірістік ақауларды тегін жоюға және істен шыққан тораптарды ауыстыруға құқық береді.' : lang === 'en' ? 'The product comes with a warranty certificate granting the right to free repair of manufacturing defects and component replacement throughout the warranty period.' : 'В комплекте с изделием поставляется гарантийный талон, дающий право на бесплатное устранение производственных дефектов и замену вышедших из строя узлов в течение гарантийного периода.'
    },
    {
      num: '2',
      title: lang === 'kz' ? 'Цифрлық сауалнама арқылы ыңғайлы өтінім беру' : lang === 'en' ? 'Digital Claim Submission' : 'Удобная подача через цифровую анкету',
      desc: lang === 'kz' ? 'Өтініш беру үшін төмендегі пішінді мәселені сипаттай отырып толтыру және ақаудың, чектің және бұйымның жалпы көрінісінің фото/бейнесін тіркеу жеткілікті.' : lang === 'en' ? 'Simply fill out the form below with problem description and attach defect photos/videos, receipt, and overview photos.' : 'Для обращения достаточно заполнить форму ниже с описанием проблемы и прикрепить фото/видео дефекта, чека и общего вида изделия.'
    },
    {
      num: '3',
      title: lang === 'kz' ? 'Инженермен тікелей байланыс' : lang === 'en' ? 'Direct Engineer Follow-up' : 'Прямой контакт с инженером',
      desc: lang === 'kz' ? 'Сервистік маман егжей-тегжейлерді нақтылау үшін сізбен хабарласады. Шағымды қарау нәтижелері бойынша жауап электрондық поштаға немесе WhatsApp-қа келеді.' : lang === 'en' ? 'A service specialist will contact you for specifics. Claim resolution will be communicated via email or WhatsApp.' : 'Сервисный специалист свяжется с вами для уточнения деталей. Ответ по результатам рассмотрения претензии поступает на электронную почту или в WhatsApp.'
    },
    {
      num: '4',
      title: lang === 'kz' ? 'Кепілдіктен ерекшеліктер' : lang === 'en' ? 'Warranty Exclusions' : 'Исключения из гарантии',
      desc: lang === 'kz' ? 'Кепілдік біліксіз монтаждау кезіндегі механикалық зақымдануларға, сондай-ақ агрессивті абразивті немесе қышқылды-сілтілі химиялық заттарды қолданудан туындаған ақауларға таралмайды.' : lang === 'en' ? 'Warranty does not cover mechanical damage from improper installation, or defects caused by abrasive, acid, or harsh chemical cleaners.' : 'Гарантия не распространяется на механические повреждения при неквалифицированном монтаже, а также на дефекты, вызванные применением агрессивных абразивных или кислотно-щелочных химических средств.'
    }
  ];

  return (
    <div className="page-wrapper service-page">
      {/* Header */}
      <section className="page-header">
        <div className="container">
          <div className="page-header-content">
            <span className="section-badge">{sp.badge || 'Официальная гарантийная поддержка'}</span>
            <h1 className="page-title">{sp.title || 'Первый цифровой сервисный центр завода LAUTE'}</h1>
            <p className="page-subtitle">
              {sp.subtitle || 'Официальная гарантия, оперативная обработка обращений и прямая сервисная поддержка покупателей сантехники LAUTE.'}
            </p>

            <div className="service-sla-banner">
              <Clock size={20} className="sla-icon" />
              <span className="sla-phrase">«{sp.slaTitle || 'Регламент рассмотрения — 36 часов в рабочие дни'}»</span>
            </div>
          </div>
        </div>
      </section>

      {/* Warranty Terms */}
      <section className="section bg-light-section">
        <div className="container">
          <div className="section-title-wrap">
            <span className="section-badge">{lang === 'kz' ? 'Қызмет көрсету регламенті' : lang === 'en' ? 'Service Regulations' : 'Регламент обслуживания'}</span>
            <h2 className="section-title">{lang === 'kz' ? 'Өндірушінің кепілдік міндеттемелері' : lang === 'en' ? 'Manufacturer Warranty Commitments' : 'Гарантийные обязательства производителя'}</h2>
            <p className="section-desc">{sp.slaDesc || 'Основные правила гарантийного обслуживания сантехники LAUTE, Oute и Rainsberg.'}</p>
          </div>

          <div className="warranty-rules-grid">
            {rulesData.map((rule) => (
              <div key={rule.num} className="rule-card">
                <div className="rule-num">{rule.num}</div>
                <h4>{rule.title}</h4>
                <p>{rule.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Claim Form */}
      <section className="section service-form-section">
        <div className="container">
          <div className="form-layout-box">
            <div className="form-info-col">
              <span className="section-badge">{lang === 'kz' ? 'Электрондық өтінім' : lang === 'en' ? 'Online Submission' : 'Электронная заявка'}</span>
              <h2>{sp.formTitle || 'Форма онлайн-обращения в сервис'}</h2>
              <p>
                {sp.formDesc || 'Заполните форму с описанием дефекта. Сервисный специалист свяжется с вами с готовым решением.'}
              </p>

              <div className="routing-preview-box">
                <span className="routing-label">{lang === 'kz' ? 'Шағымның өңірлік бағытталуы:' : lang === 'en' ? 'Regional Claim Routing:' : 'Региональная маршрутизация претензии:'}</span>
                <span className="routing-target">{getTargetEmail()}</span>
              </div>

              <div className="service-contacts-hint">
                <p>{lang === 'kz' ? 'Кеңес алу үшін бэк-офистің тікелей телефоны:' : lang === 'en' ? 'Direct line for consultations:' : 'Прямой телефон бэк-офиса для консультаций:'}</p>
                <a href="tel:+79833105626" className="clickable-contact">
                  <Phone size={14} /> +7 (983) 310-56-26
                </a>
                <a href="mailto:opt@laute.ltd" className="clickable-contact">
                  <Mail size={14} /> opt@laute.ltd
                </a>
              </div>
            </div>

            <div className="form-body-col">
              {isSubmitted ? (
                <div className="form-success-box" style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.3)', padding: '24px', borderRadius: '8px', textAlign: 'center' }}>
                  <CheckCircle2 size={44} color="#16A34A" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ color: '#F8FAFC', marginBottom: '8px' }}>{sp.successTitle || 'Обращение зарегистрировано!'}</h3>
                  <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '16px' }}>
                    {sp.successDesc || 'Номер вашей заявки сформирован. Сервисный инженер свяжется с вами в течение 36 рабочих часов.'}
                  </p>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsSubmitted(false)}>
                    {lang === 'kz' ? 'Жаңа өтініш беру' : lang === 'en' ? 'Submit new claim' : 'Подать новое обращение'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="b2b-form">
                  <div className="form-group">
                    <label>{sp.nameLabel || 'ФИО заявителя'} *</label>
                    <input
                      type="text"
                      required
                      placeholder={lang === 'kz' ? 'Аты-жөніңіз' : lang === 'en' ? 'Your full name' : 'Иван Иванов'}
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>{sp.phoneLabel || 'Телефон для связи'} *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+7 (___) ___-__-__"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>{sp.emailLabel || 'Email для ответа'} *</label>
                      <input
                        type="email"
                        required
                        placeholder="service@client.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>{sp.modelLabel || 'Артикул или модель изделия'} *</label>
                      <input
                        type="text"
                        required
                        placeholder="LT-1021 / LAUTE Kitchen Pro"
                        value={formData.modelArticle}
                        onChange={(e) => setFormData({ ...formData, modelArticle: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>{sp.defectLabel || 'Характер обращения'}:</label>
                      <select
                        value={formData.defectType}
                        onChange={(e) => setFormData({ ...formData, defectType: e.target.value })}
                        className="form-select"
                      >
                        <option value="body-leak">{lang === 'kz' ? 'Корпустан немесе қосылыстан ағу' : lang === 'en' ? 'Body/connection leak' : 'Течь корпуса или соединений'}</option>
                        <option value="cartridge">{lang === 'kz' ? 'Картридж немесе реттеу ақауы' : lang === 'en' ? 'Cartridge or regulation defect' : 'Неисправность картриджа / регулировки'}</option>
                        <option value="coating">{lang === 'kz' ? 'Жабынның зақымдануы' : lang === 'en' ? 'Coating issue' : 'Претензия к покрытию'}</option>
                        <option value="parts">{lang === 'kz' ? 'Қосалқы бөлшек қажет' : lang === 'en' ? 'Spare part required' : 'Требуется комплектующая деталь'}</option>
                        <option value="other">{lang === 'kz' ? 'Басқа' : lang === 'en' ? 'Other' : 'Другой гарантийный случай'}</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>{sp.descLabel || 'Подробное описание проблемы'} *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder={lang === 'kz' ? 'Ақаудың белгілерін және пайда болу жағдайларын сипаттаңыз...' : lang === 'en' ? 'Describe the issue symptoms and conditions...' : 'Опишите признаки дефекта, условия эксплуатации или повреждения...'}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary btn-full">
                    <span>{sp.submitBtn || 'Отправить обращение в сервис'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
