import React from 'react';
import { useApp } from '../context/AppContext';
import { Globe, MapPin, Phone, Mail, ArrowUp, Building2, ShieldCheck, Clock } from 'lucide-react';

export const Footer = () => {
  const { lang, setLang, region, setRegion, navigateTo, t, openPartnerModal, openAuthModal, openServiceModal } = useApp();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const logoSrc = `${import.meta.env.BASE_URL}laute-logo.png`;

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          {/* Brand Info */}
          <div className="footer-brand">
            <a 
              href={`${import.meta.env.BASE_URL}`} 
              className="brand-logo" 
              onClick={(e) => { e.preventDefault(); navigateTo('home'); }}
              title="LAUTE International"
            >
              <img 
                src={logoSrc} 
                alt="LAUTE" 
                className="brand-logo-img" 
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'inline-block';
                }}
              />
              <span className="brand-name-fallback" style={{ display: 'none', fontWeight: 800, fontSize: '1.5rem', letterSpacing: '0.05em', color: '#FFFFFF' }}>LAUTE</span>
            </a>

            <p className="footer-desc">
              Международная производственно-торговая платформа сантехнического оборудования. Прямые поставки смесителей, кухонных моек, душевых систем и комплектующих для оптовых компаний, дилеров и строительных объектов.
            </p>

            <div className="footer-region-status">
              <div className="status-item">
                <MapPin size={15} className="status-icon" />
                <span>Региональный склад / рынок: <strong>{t.regions[region] || region}</strong></span>
              </div>
              <div className="status-item">
                <Globe size={15} className="status-icon" />
                <span>Язык интерфейса: <strong>{lang.toUpperCase()}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="footer-col">
            <h4 className="footer-col-title">Навигация по разделам</h4>
            <ul className="footer-links">
              <li>
                <button type="button" className="footer-link-btn" onClick={() => navigateTo('home')}>
                  Главная
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-btn" onClick={() => navigateTo('catalog')}>
                  Каталог продукции (14 категорий)
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-btn" onClick={() => navigateTo('company')}>
                  О компании и Завод Laute
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-btn" onClick={() => navigateTo('partners')}>
                  Оптовым партнёрам и условия
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-btn" onClick={() => navigateTo('where-to-buy')}>
                  Где купить (Опт и Розница)
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-btn" onClick={() => navigateTo('service')}>
                  Первый цифровой сервис-центр
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-btn" onClick={() => navigateTo('contacts')}>
                  Контакты представительств
                </button>
              </li>
            </ul>
          </div>

          {/* Verified Contacts Column */}
          <div className="footer-col">
            <h4 className="footer-col-title">Подтверждённые контакты</h4>
            
            <div className="footer-contact-block">
              <span className="contact-role">Главный бэк-офис представительства:</span>
              <p className="contact-address">
                Россия, 630073, Новосибирская область, г. Новосибирск, ул. Блюхера 71
              </p>
            </div>

            <div className="footer-contact-block">
              <span className="contact-role">Телефоны отдела продаж:</span>
              <ul className="contact-list">
                <li>
                  <a href="tel:+79833105626" className="clickable-contact">
                    <Phone size={13} />
                    <span>+7 (983) 310-56-26</span>
                    <span className="contact-name">— Оксана (рук. отдела продаж)</span>
                  </a>
                </li>
                <li>
                  <a href="tel:+79132030737" className="clickable-contact">
                    <Phone size={13} />
                    <span>+7 (913) 203-07-37</span>
                    <span className="contact-name">— Сергей (Новосибирская обл.)</span>
                  </a>
                </li>
                <li>
                  <a href="tel:+79528025599" className="clickable-contact">
                    <Phone size={13} />
                    <span>+7 (952) 802-55-99</span>
                    <span className="contact-name">— Евгений (Томск, Кузбасс, Бурятия)</span>
                  </a>
                </li>
              </ul>
            </div>

            <div className="footer-contact-block">
              <span className="contact-role">Электронная почта:</span>
              <ul className="contact-list">
                <li>
                  <a href="mailto:opt@laute.ltd" className="clickable-contact">
                    <Mail size={13} />
                    <span>opt@laute.ltd</span>
                    <span className="contact-name">— Екатерина (бэк-офис)</span>
                  </a>
                </li>
                <li>
                  <a href="mailto:nsk@laute.ltd" className="clickable-contact">
                    <Mail size={13} />
                    <span>nsk@laute.ltd</span>
                    <span className="contact-name">— Оксана (продажи)</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Partner & Service Action Column */}
          <div className="footer-col">
            <h4 className="footer-col-title">Сервис и сотрудничество</h4>
            
            <div className="footer-service-notice">
              <div className="notice-header">
                <Clock size={16} className="notice-icon" />
                <strong>Гарантийный сервис:</strong>
              </div>
              <p className="notice-text">
                «Ответ будет дан в течение 36 часов в рабочие дни»
              </p>
              <button 
                type="button" 
                className="btn btn-outline btn-sm btn-full"
                onClick={openServiceModal}
              >
                Подать гарантийную заявку
              </button>
            </div>

            <div style={{ marginTop: '20px' }}>
              <button 
                type="button" 
                className="btn btn-primary btn-sm btn-full"
                onClick={openPartnerModal}
              >
                Запросить оптовые условия
              </button>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <p className="copyright">
              © 2026 LAUTE LTD. Международная производственно-торговая платформа сантехники. Все права защищены.
            </p>
            <div className="footer-legal-links">
              <span>Склады: Новосибирск (Сибирь) • Алматы (Казахстан) • Москва</span>
            </div>
          </div>

          <div className="footer-bottom-right">
            <button 
              type="button" 
              className="scroll-top-btn" 
              onClick={scrollToTop}
              title="Наверх"
            >
              <span>Наверх</span>
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
