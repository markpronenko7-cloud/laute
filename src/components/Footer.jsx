import React from 'react';
import { useApp } from '../context/AppContext';
import { Globe, MapPin, Phone, Mail, ArrowUp } from 'lucide-react';
import { REGIONS_CONFIG } from '../data/regionsData';

export const Footer = () => {
  const { lang, setLang, region, setRegion, navigateTo, t, openPartnerModal } = useApp();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const logoSrc = `${import.meta.env.BASE_URL}laute-logo.png`;
  const f = t.footer || {};

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          {/* Brand Info & Socials */}
          <div className="footer-brand">
            <a 
              href={`${import.meta.env.BASE_URL}`} 
              className="brand-logo" 
              onClick={(e) => { e.preventDefault(); navigateTo('home'); }}
              title="LAUTE"
            >
              <img 
                src={logoSrc} 
                alt="LAUTE" 
                className="brand-logo-img footer-logo-img" 
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'inline-block';
                }}
              />
              <span className="brand-name-fallback" style={{ display: 'none', fontWeight: 800, fontSize: '1.4rem', letterSpacing: '0.04em', color: '#FFFFFF' }}>LAUTE</span>
            </a>

            <p className="footer-desc">
              {f.brandDesc || 'LAUTE — завод смесителей, душевых систем, кухонных моек и комплектующих. Продукция для жилых пространств и профессиональных проектов.'}
            </p>

            {/* Official Verified Social Networks */}
            <div className="footer-socials">
              <span className="footer-socials-label">{f.socialsLabel || 'Официальные страницы:'}</span>
              <div className="social-links-row">
                <a 
                  href="https://www.instagram.com/laute.official.russia/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-btn" 
                  title="LAUTE в Instagram"
                  aria-label="Instagram"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                  <span>Instagram</span>
                </a>

                <a 
                  href="https://www.facebook.com/laute.official.russia/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-btn" 
                  title="LAUTE в Facebook"
                  aria-label="Facebook"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                  <span>Facebook</span>
                </a>

                <a 
                  href="https://www.youtube.com/channel/UCNr6GllBjjPC6mg0wyc-BOw" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-btn" 
                  title="LAUTE на YouTube"
                  aria-label="YouTube"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                  </svg>
                  <span>YouTube</span>
                </a>
              </div>
            </div>

            {/* Language & Region Controls */}
            <div className="footer-controls">
              <div className="footer-control-item">
                <Globe size={14} className="control-icon" />
                <span className="control-text">{t.nav.language || f.langLabel || 'Язык сайта'}:</span>
                <div className="footer-pill-row">
                  {[
                    { code: 'ru', label: 'РУС' },
                    { code: 'kz', label: 'КАЗ' },
                    { code: 'en', label: 'ENG' }
                  ].map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => setLang(item.code)}
                      className={`footer-pill-btn ${lang === item.code ? 'active' : ''}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="footer-control-item">
                <MapPin size={14} className="control-icon" />
                <span className="control-text">{t.nav.region || t.regions?.currentRegion || 'Ваш регион'}:</span>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="footer-region-select"
                  aria-label={t.regions?.selectRegion || t.nav.region || 'Ваш регион'}
                >
                  {REGIONS_CONFIG.map((reg) => (
                    <option key={reg.id} value={reg.id}>
                      {t.regions?.[reg.id] || reg.names[lang] || reg.names.ru}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-col-title">{f.navCol || 'Навигация'}</h4>
            <ul className="footer-links">
              <li>
                <button type="button" className="footer-link-btn" onClick={() => navigateTo('home')}>
                  {t.nav.home || 'Главная'}
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-btn" onClick={() => navigateTo('catalog')}>
                  {t.nav.products || t.nav.catalog || 'Продукция'}
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-btn" onClick={() => navigateTo('company')}>
                  {t.nav.about || t.nav.company || t.nav.production || 'О LAUTE'}
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-btn" onClick={() => navigateTo('partners')}>
                  {t.nav.partners || 'Партнёрам'}
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-btn" onClick={() => navigateTo('where-to-buy')}>
                  {t.nav.whereToBuy || 'Где купить'}
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-btn" onClick={() => navigateTo('service')}>
                  {t.nav.service || 'Сервис и гарантия'}
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-btn" onClick={() => navigateTo('contacts')}>
                  {t.nav.contacts || 'Контакты'}
                </button>
              </li>
            </ul>
          </div>

          {/* Verified Contacts */}
          <div className="footer-col">
            <h4 className="footer-col-title">{f.contactsCol || 'Контакты'}</h4>
            
            <div className="footer-contact-block">
              <span className="contact-role">{f.representativeOffice || 'Представительство:'}</span>
              <p className="contact-address">
                Россия, 630073, Новосибирская область, г. Новосибирск, ул. Блюхера, 71
              </p>
            </div>

            <div className="footer-contact-block">
              <span className="contact-role">{f.salesDept || 'Отдел продаж:'}</span>
              <ul className="contact-list">
                <li>
                  <a href="tel:+79833105626" className="clickable-contact">
                    <Phone size={13} />
                    <span>+7 (983) 310-56-26</span>
                  </a>
                </li>
                <li>
                  <a href="tel:+79132030737" className="clickable-contact">
                    <Phone size={13} />
                    <span>+7 (913) 203-07-37</span>
                  </a>
                </li>
              </ul>
            </div>

            <div className="footer-contact-block">
              <span className="contact-role">{f.emailLabel || 'Электронная почта:'}</span>
              <ul className="contact-list">
                <li>
                  <a href="mailto:opt@laute.ltd" className="clickable-contact">
                    <Mail size={13} />
                    <span>opt@laute.ltd</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Wholesale Partner Action */}
          <div className="footer-col footer-action-col">
            <h4 className="footer-col-title">{f.collabCol || 'Сотрудничество'}</h4>
            <p className="footer-action-desc">
              {f.collabDesc || 'Обсуждайте ассортимент, условия сотрудничества и сервис с командой LAUTE.'}
            </p>
            <button 
              type="button" 
              className="btn btn-primary btn-full"
              onClick={openPartnerModal}
            >
              {f.partnerBtn || 'Стать партнёром'}
            </button>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <p className="copyright">
              © {new Date().getFullYear()} LAUTE LTD. {f.rights || 'Все права защищены.'}
            </p>
            <div className="footer-legal-links">
              <span>{f.legal || 'Политика конфиденциальности • Пользовательское соглашение'}</span>
            </div>
          </div>

          <div className="footer-bottom-right">
            <button 
              type="button" 
              className="scroll-top-btn" 
              onClick={scrollToTop}
              title="Наверх"
            >
              <span>{f.scrollTop || 'Наверх'}</span>
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
