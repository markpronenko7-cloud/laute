import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Phone, Mail, MapPin, Building2, User, Clock, ArrowRight, CheckCircle2, Globe } from 'lucide-react';

export const ContactsPage = () => {
  const { region, setRegion, t } = useApp();

  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    email: '',
    targetRegion: region || 'siberia',
    message: ''
  });

  const [formSent, setFormSent] = useState(false);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormSent(true);
  };

  const staffContacts = [
    {
      role: 'Руководитель отдела продаж',
      name: 'Оксана',
      phone: '+7 (983) 310-56-26',
      phoneClean: '+79833105626',
      email: 'nsk@laute.ltd',
      scope: 'Оптовые контракты, согласование коммерческих условий и поставок'
    },
    {
      role: 'Руководитель агентской структуры',
      name: 'Сергей',
      phone: '+7 (913) 203-07-37',
      phoneClean: '+79132030737',
      email: 'nsk2@laute.ltd',
      scope: 'Представитель по Новосибирской области и развитие дилерской сети'
    },
    {
      role: 'Региональный представитель',
      name: 'Евгений',
      phone: '+7 (952) 802-55-99',
      phoneClean: '+79528025599',
      email: 'tomsk@laute.ltd',
      scope: 'Томская область, Кемеровская область (Кузбасс), Республика Бурятия'
    },
    {
      role: 'Администратор бэк-офиса',
      name: 'Екатерина',
      email: 'opt@laute.ltd',
      scope: 'Общие вопросы, первичный документооборот, сертификаты'
    },
    {
      role: 'Руководитель представительства',
      name: 'Дмитрий',
      email: 'pro_d@laute.ltd',
      scope: 'Стратегические партнерства и межрегиональное развитие'
    }
  ];

  return (
    <div className="page-wrapper contacts-page">
      {/* Header */}
      <section className="page-header">
        <div className="container">
          <div className="page-header-content">
            <span className="section-badge">Контакты представительства</span>
            <h1 className="page-title">Контакты завода LAUTE</h1>
            <p className="page-subtitle">
              Официальные телефоны, электронная почта и адреса ответственных сотрудников представительства в Сибири, России и странах СНГ.
            </p>
          </div>
        </div>
      </section>

      {/* Main Office Details */}
      <section className="section bg-light-section">
        <div className="container">
          <div className="contacts-office-grid">
            <div className="office-info-card">
              <div className="office-header">
                <Building2 size={24} className="office-icon" />
                <div>
                  <span className="office-tag">Главный бэк-офис представительства завода</span>
                  <h2 className="office-title">Новосибирск, Россия</h2>
                </div>
              </div>

              <div className="office-details-list">
                <div className="detail-item">
                  <MapPin size={18} className="detail-icon" />
                  <div>
                    <strong>Фактический адрес:</strong>
                    <p>Россия, 630073, Новосибирская область, г. Новосибирск, ул. Блюхера 71</p>
                  </div>
                </div>

                <div className="detail-item">
                  <Clock size={18} className="detail-icon" />
                  <div>
                    <strong>Режим работы:</strong>
                    <p>Понедельник — Пятница: 09:00 – 18:00 (МСК+4)</p>
                  </div>
                </div>

                <div className="detail-item">
                  <Phone size={18} className="detail-icon" />
                  <div>
                    <strong>Телефон приемной / бэк-офиса:</strong>
                    <p>
                      <a href="tel:+79833105626" className="clickable-contact">
                        +7 (983) 310-56-26
                      </a>
                    </p>
                  </div>
                </div>

                <div className="detail-item">
                  <Mail size={18} className="detail-icon" />
                  <div>
                    <strong>Общая электронная почта:</strong>
                    <p>
                      <a href="mailto:opt@laute.ltd" className="clickable-contact">
                        opt@laute.ltd
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              <div className="office-logistic-note">
                <p>
                  <strong>Почему Новосибирск:</strong> Географический центр России и СНГ, узловой логистический ХАБ, обеспечивающий эффективные поставки в Сибирь, на Дальний Восток, в Казахстан и центральные регионы.
                </p>
              </div>
            </div>

            {/* Fast Contact Form */}
            <div className="contact-form-container">
              <h3 className="form-card-title">Написать в отдел продаж</h3>
              <p className="form-card-desc">Задайте вопрос по наличию, оптовым ценам или дилерству.</p>

              {formSent ? (
                <div className="form-success-box">
                  <CheckCircle2 size={40} color="#16A34A" />
                  <h4>Сообщение отправлено!</h4>
                  <p>Ответственный менеджер свяжется с вами по указанному телефону или почте.</p>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setFormSent(false)}>
                    Отправить ещё одно сообщение
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="b2b-form">
                  <div className="form-group">
                    <label>Ваше имя *</label>
                    <input
                      type="text"
                      required
                      placeholder="Имя или организация"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Телефон *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+7 (___) ___-__-__"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>E-mail *</label>
                      <input
                        type="email"
                        required
                        placeholder="your@mail.ru"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Ваш регион:</label>
                    <select
                      value={contactForm.targetRegion}
                      onChange={(e) => setContactForm({ ...contactForm, targetRegion: e.target.value })}
                      className="form-select"
                    >
                      <option value="siberia">Сибирь (Новосибирск, Томск, Кузбасс и др.)</option>
                      <option value="kz">Казахстан (Алматы, Астана и др.)</option>
                      <option value="ru">Россия (Центральный регион, Москва)</option>
                      <option value="intl">Международный отдел</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Сообщение / Запрос:</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Опишите ваш запрос или вопрос..."
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary btn-full">
                    <span>Отправить обращение</span>
                    <ArrowRight size={15} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Responsible Managers List */}
      <section className="section">
        <div className="container">
          <div className="section-title-wrap">
            <span className="section-badge">Персональные контакты</span>
            <h2 className="section-title">Ответственные сотрудники представительства</h2>
            <p className="section-desc">
              Прямая телефонная и почтовая связь со специалистами по региональным направлениям.
            </p>
          </div>

          <div className="staff-grid">
            {staffContacts.map((staff, i) => (
              <div key={i} className="staff-card">
                <div className="staff-avatar">
                  <User size={24} />
                </div>
                <div className="staff-info">
                  <span className="staff-role">{staff.role}</span>
                  <h3 className="staff-name">{staff.name}</h3>
                  <p className="staff-scope">{staff.scope}</p>

                  <div className="staff-links">
                    {staff.phone && (
                      <a href={`tel:${staff.phoneClean}`} className="clickable-contact">
                        <Phone size={14} />
                        <span>{staff.phone}</span>
                      </a>
                    )}
                    {staff.email && (
                      <a href={`mailto:${staff.email}`} className="clickable-contact">
                        <Mail size={14} />
                        <span>{staff.email}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
