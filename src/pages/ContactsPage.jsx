import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Phone, Mail, MapPin, Building2, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

export const ContactsPage = () => {
  const { region, setRegion, lang, t } = useApp();
  const cp = t.contactsPage || {};

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
      role: lang === 'kz' ? 'Сату бөлімінің басшысы' : lang === 'en' ? 'Head of Wholesale Sales' : 'Руководитель отдела продаж',
      name: 'Оксана',
      phone: '+7 (983) 310-56-26',
      phoneClean: '+79833105626',
      email: 'nsk@laute.ltd',
      scope: lang === 'kz' ? 'Көтерме келісімшарттар, коммерциялық шарттарды және жеткізулерді келісу' : lang === 'en' ? 'Wholesale contracts, commercial agreements and supply schedules' : 'Оптовые контракты, согласование коммерческих условий и поставок'
    },
    {
      role: lang === 'kz' ? 'Агенттік құрылымның басшысы' : lang === 'en' ? 'Head of Agency Network' : 'Руководитель агентской структуры',
      name: 'Сергей',
      phone: '+7 (913) 203-07-37',
      phoneClean: '+79132030737',
      email: 'nsk2@laute.ltd',
      scope: lang === 'kz' ? 'Новосібір облысы бойынша өкіл және дилерлік желіні дамыту' : lang === 'en' ? 'Novosibirsk region representative and dealer network expansion' : 'Представитель по Новосибирской области и развитие дилерской сети'
    },
    {
      role: lang === 'kz' ? 'Өңірлік өкіл' : lang === 'en' ? 'Regional Sales Representative' : 'Региональный представитель',
      name: 'Евгений',
      phone: '+7 (952) 802-55-99',
      phoneClean: '+79528025599',
      email: 'tomsk@laute.ltd',
      scope: lang === 'kz' ? 'Томск облысы, Кемерово облысы (Кузбасс), Бурятия Республикасы' : lang === 'en' ? 'Tomsk, Kemerovo (Kuzbass), and Buryatia regions' : 'Томская область, Кемеровская область (Кузбасс), Республика Бурятия'
    },
    {
      role: lang === 'kz' ? 'Бэк-офис әкімшісі' : lang === 'en' ? 'Back Office Administrator' : 'Администратор бэк-офиса',
      name: 'Екатерина',
      email: 'opt@laute.ltd',
      scope: lang === 'kz' ? 'Жалпы сұрақтар, құжат айналымы, өнім сертификаттары' : lang === 'en' ? 'General inquiries, initial paperwork, certificates' : 'Общие вопросы, первичный документооборот, сертификаты'
    },
    {
      role: lang === 'kz' ? 'Өкілдік басшысы' : lang === 'en' ? 'Head of Representative Office' : 'Руководитель представительства',
      name: 'Дмитрий',
      email: 'pro_d@laute.ltd',
      scope: lang === 'kz' ? 'Стратегиялық серіктестіктер және аймақаралық даму' : lang === 'en' ? 'Strategic partnerships and inter-regional development' : 'Стратегические партнерства и межрегиональное развитие'
    }
  ];

  return (
    <div className="page-wrapper contacts-page">
      {/* Header */}
      <section className="page-header">
        <div className="container">
          <div className="page-header-content">
            <span className="section-badge">{cp.badge || 'Контакты представительства'}</span>
            <h1 className="page-title">{cp.title || 'Контакты завода LAUTE'}</h1>
            <p className="page-subtitle">
              {cp.subtitle || 'Официальные телефоны, электронная почта и адреса ответственных сотрудников представительства.'}
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
                  <span className="office-tag">{lang === 'kz' ? 'Зауыт өкілдігінің басты бэк-офисі' : lang === 'en' ? 'Main Factory Office' : 'Главный бэк-офис представительства завода'}</span>
                  <h2 className="office-title">{cp.mainOfficeTitle || 'Новосибирск, Россия'}</h2>
                </div>
              </div>

              <div className="office-details-list">
                <div className="detail-item">
                  <MapPin size={18} className="detail-icon" />
                  <div>
                    <strong>{lang === 'kz' ? 'Нақты мекенжайы:' : lang === 'en' ? 'Physical Address:' : 'Фактический адрес:'}</strong>
                    <p>Россия, 630073, Новосибирская область, г. Новосибирск, ул. Блюхера 71</p>
                  </div>
                </div>

                <div className="detail-item">
                  <Clock size={18} className="detail-icon" />
                  <div>
                    <strong>{lang === 'kz' ? 'Жұмыс кестесі:' : lang === 'en' ? 'Working Hours:' : 'Режим работы:'}</strong>
                    <p>{lang === 'kz' ? 'Дүйсенбі — Жұма: 09:00 – 18:00 (МСК+4)' : lang === 'en' ? 'Monday — Friday: 09:00 – 18:00 (UTC+7)' : 'Понедельник — Пятница: 09:00 – 18:00 (МСК+4)'}</p>
                  </div>
                </div>

                <div className="detail-item">
                  <Phone size={18} className="detail-icon" />
                  <div>
                    <strong>{lang === 'kz' ? 'Қабылдау / бэк-офис телефоны:' : lang === 'en' ? 'Reception / Back Office Phone:' : 'Телефон приемной / бэк-офиса:'}</strong>
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
                    <strong>{lang === 'kz' ? 'Жалпы электрондық пошта:' : lang === 'en' ? 'General Email:' : 'Общая электронная почта:'}</strong>
                    <p>
                      <a href="mailto:opt@laute.ltd" className="clickable-contact">
                        opt@laute.ltd
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fast Contact Form */}
            <div className="contact-form-container">
              {formSent ? (
                <div className="contact-form-success">
                  <CheckCircle2 size={44} color="#0EA5E9" />
                  <h3>{cp.successTitle || 'Сообщение успешно отправлено!'}</h3>
                  <p>{lang === 'kz' ? 'Өңірлік маман 1 жұмыс күні ішінде сізбен хабарласады.' : lang === 'en' ? 'Regional coordinator will reply within 1 business day.' : 'Ответственный специалист региона свяжется с вами в течение 1 рабочего дня.'}</p>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setFormSent(false)}>
                    {lang === 'kz' ? 'Тағы бір хабарлама жазу' : lang === 'en' ? 'Send another message' : 'Написать ещё одно сообщение'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="contacts-form">
                  <span className="section-badge">{lang === 'kz' ? 'Тікелей байланыс' : lang === 'en' ? 'Direct Line' : 'Прямая связь'}</span>
                  <h3>{cp.formTitle || 'Написать напрямую в представительство'}</h3>
                  <p>{cp.formDesc || 'Оставьте сообщение, и ответственный специалист региона свяжется с вами в течение 1 рабочего дня.'}</p>

                  <div className="form-group">
                    <label>{cp.nameLabel || 'Ваше имя'} *</label>
                    <input
                      type="text"
                      required
                      placeholder={lang === 'kz' ? 'Аты-жөніңіз' : lang === 'en' ? 'Your name' : 'Иван Иванов'}
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>{cp.phoneLabel || 'Номер телефона'} *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+7 (___) ___-__-__"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>{cp.emailLabel || 'Email для связи'} *</label>
                      <input
                        type="email"
                        required
                        placeholder="client@domain.com"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>{cp.messageLabel || 'Текст обращения'} *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder={lang === 'kz' ? 'Сұрағыңызды немесе ұсынысыңызды сипаттаңыз...' : lang === 'en' ? 'Describe your inquiry or proposal...' : 'Опишите ваш вопрос или предложение...'}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary btn-full">
                    <span>{cp.submitBtn || 'Отправить сообщение'}</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Staff Directory */}
      <section className="section">
        <div className="container">
          <div className="section-title-wrap">
            <span className="section-badge">{lang === 'kz' ? 'Команда' : lang === 'en' ? 'Team' : 'Команда'}</span>
            <h2 className="section-title">{cp.salesTitle || 'Ответственные менеджеры по регионам'}</h2>
            <p className="section-desc">
              {lang === 'kz' ? 'Жеткізілімдер мен техникалық сұрақтар бойынша өкілдік мамандарымен тікелей байланыс.' : lang === 'en' ? 'Direct contact with factory representatives regarding orders and technical inquiries.' : 'Прямой контакт со специалистами представительства по поставкам и техническим вопросам.'}
            </p>
          </div>

          <div className="staff-grid">
            {staffContacts.map((staff, idx) => (
              <div key={idx} className="staff-card">
                <span className="staff-role">{staff.role}</span>
                <h3 className="staff-name">{staff.name}</h3>
                <p className="staff-scope">{staff.scope}</p>

                <div className="staff-links">
                  {staff.phone && (
                    <a href={`tel:${staff.phoneClean}`} className="staff-link">
                      <Phone size={14} /> {staff.phone}
                    </a>
                  )}
                  <a href={`mailto:${staff.email}`} className="staff-link">
                    <Mail size={14} /> {staff.email}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
