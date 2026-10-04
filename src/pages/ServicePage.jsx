import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Clock, FileCheck, AlertCircle, CheckCircle2, UploadCloud, MessageSquare, Phone, Mail } from 'lucide-react';

export const ServicePage = () => {
  const { region, t } = useApp();

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

  return (
    <div className="page-wrapper service-page">
      {/* Header */}
      <section className="page-header">
        <div className="container">
          <div className="page-header-content">
            <span className="section-badge">Официальная гарантийная поддержка</span>
            <h1 className="page-title">Первый цифровой сервисный центр</h1>
            <p className="page-subtitle">
              Прямая сервисная платформа завода LAUTE для партнеров и конечных потребителей. Оформление рекламации и гарантийных случаев онлайн без визита в магазин.
            </p>

            <div className="service-sla-banner">
              <Clock size={20} className="sla-icon" />
              <span className="sla-phrase">«Ответ будет дан в течение 36 часов в рабочие дни»</span>
            </div>
          </div>
        </div>
      </section>

      {/* Warranty Terms */}
      <section className="section bg-light-section">
        <div className="container">
          <div className="section-title-wrap">
            <span className="section-badge">Регламент обслуживания</span>
            <h2 className="section-title">Гарантийные обязательства производителя</h2>
            <p className="section-desc">Основные правила гарантийного обслуживания сантехники LAUTE, Oute и Rainsberg.</p>
          </div>

          <div className="warranty-rules-grid">
            <div className="rule-card">
              <div className="rule-num">1</div>
              <h4>Право на бесплатное устранение дефектов</h4>
              <p>
                В комплекте с изделием поставляется гарантийный талон, дающий право на бесплатное устранение производственных дефектов и замену вышедших из строя узлов в течение гарантийного периода.
              </p>
            </div>

            <div className="rule-card">
              <div className="rule-num">2</div>
              <h4>Удобная подача через цифровую анкету</h4>
              <p>
                Для обращения достаточно заполнить форму ниже с описанием проблемы и прикрепить фото/видео дефекта, чека и общего вида изделия.
              </p>
            </div>

            <div className="rule-card">
              <div className="rule-num">3</div>
              <h4>Прямой контакт с инженером</h4>
              <p>
                Сервисный специалист свяжется с вами для уточнения деталей. Ответ по результатам рассмотрения претензии поступает на электронную почту или в WhatsApp.
              </p>
            </div>

            <div className="rule-card">
              <div className="rule-num">4</div>
              <h4>Исключения из гарантии</h4>
              <p>
                Гарантия не распространяется на механические повреждения при неквалифицированном монтаже, а также на дефекты, вызванные применением агрессивных абразивных или кислотно-щелочных химических средств.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Claim Form */}
      <section className="section service-form-section">
        <div className="container">
          <div className="form-layout-box">
            <div className="form-info-col">
              <span className="section-badge">Электронная заявка</span>
              <h2>Оформление гарантийного обращения</h2>
              <p>
                Заполните поля анкеты. Обращение направляется в региональную сервисную службу завода по географическому признаку:
              </p>

              <div className="routing-preview-box">
                <span className="routing-label">Региональная маршрутизация претензии:</span>
                <span className="routing-target">{getTargetEmail()}</span>
              </div>

              <div className="service-contacts-hint">
                <p>Прямой телефон бэк-офиса для консультаций:</p>
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
                <div className="form-success-box">
                  <CheckCircle2 size={48} color="#16A34A" />
                  <h3>Обращение успешно зарегистрировано!</h3>
                  <p>
                    Ваша заявка направлена сервисному инженеру. <strong>Ответ будет дан в течение 36 часов в рабочие дни</strong> на указанный e-mail или номер WhatsApp.
                  </p>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsSubmitted(false)}>
                    Подать новое обращение
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="b2b-form">
                  <div className="form-group">
                    <label>Регион обращения *</label>
                    <select
                      value={formData.regionInquiry}
                      onChange={(e) => setFormData({ ...formData, regionInquiry: e.target.value })}
                      className="form-select"
                    >
                      <option value="siberia">Сибирь / Новосибирск / ДВ</option>
                      <option value="kz">Казахстан</option>
                      <option value="ru">Россия (Центральный регион)</option>
                      <option value="intl">Другой международный регион</option>
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Ваше ФИО *</label>
                      <input
                        type="text"
                        required
                        placeholder="Иванов Иван Иванович"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      />
                    </div>
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
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Электронная почта *</label>
                      <input
                        type="email"
                        required
                        placeholder="client@mail.ru"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Установлен ли WhatsApp?</label>
                      <select
                        value={formData.hasWhatsapp}
                        onChange={(e) => setFormData({ ...formData, hasWhatsapp: e.target.value })}
                        className="form-select"
                      >
                        <option value="yes">Да, удобно получить ответ в WhatsApp</option>
                        <option value="no">Нет, только по Email</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Марка изделия *</label>
                      <select
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        className="form-select"
                      >
                        <option value="LAUTE">LAUTE</option>
                        <option value="Oute">Oute</option>
                        <option value="Rainsberg">Rainsberg</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Модель / Артикул (если известен)</label>
                      <input
                        type="text"
                        placeholder="Например, L-102 или из чека/коробки"
                        value={formData.modelArticle}
                        onChange={(e) => setFormData({ ...formData, modelArticle: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Магазин покупки</label>
                      <input
                        type="text"
                        placeholder="Название магазина или адрес"
                        value={formData.storeName}
                        onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Тип дефекта *</label>
                      <select
                        value={formData.defectType}
                        onChange={(e) => setFormData({ ...formData, defectType: e.target.value })}
                        className="form-select"
                      >
                        <option value="body-leak">Течь в корпусе изделия</option>
                        <option value="handle-leak">Течь из-под ручки / картриджа</option>
                        <option value="diverter">Не работает переключатель (дивертор)</option>
                        <option value="spout">Проблема с изливом или аэратором</option>
                        <option value="shower">Неисправность лейки или шланга</option>
                        <option value="other">Другая неисправность</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Описание неисправности *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Опишите, как и когда проявилась неисправность..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="form-group file-upload-box">
                    <label>Фото- и видеоматериалы дефекта:</label>
                    <div className="file-drop-area">
                      <UploadCloud size={24} className="upload-icon" />
                      <span>Прикрепите фото чека, общего вида товара и дефекта (до 15 МБ)</span>
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*,video/*"
                        onChange={() => setFormData({ ...formData, filesAttached: true })}
                        className="file-input-hidden"
                      />
                    </div>
                    {formData.filesAttached && (
                      <span className="file-attached-badge">
                        <CheckCircle2 size={14} color="#16A34A" /> Файлы прикреплены к обращению
                      </span>
                    )}
                  </div>

                  <button type="submit" className="btn btn-primary btn-full">
                    <span>Отправить гарантийное обращение</span>
                  </button>

                  <p className="form-privacy-note">
                    Отправляя заявку, вы соглашаетесь с обработкой персональных данных сервисной службой завода LAUTE.
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
