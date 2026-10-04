import React from 'react';
import { useApp } from '../context/AppContext';
import { Globe, MapPin, ArrowUp } from 'lucide-react';

export const Footer = () => {
  const { lang, setLang, region, t, openPartnerModal, openAuthModal, openServiceModal } = useApp();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer id="contacts" className="footer">
      <div className="container">
        <div className="footer-top">
          {/* Brand Info */}
          <div className="footer-brand">
            <a href="#" className="brand-logo" onClick={(e) => { e.preventDefault(); scrollToTop(); }}>
              <div className="brand-mark">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4H10V16H20V20H4V4Z" fill="#FFFFFF" />
                </svg>
              </div>
              <span className="brand-name">LAUTE</span>
            </a>
            <p>{t.footer.desc}</p>

            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: '#94A3B8' }}>
                <MapPin size={14} color="#38BDF8" />
                <span>{t.footer.regionLabel} {t.regions[region] || region}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: '#94A3B8' }}>
                <Globe size={14} color="#38BDF8" />
                <span>{t.footer.langLabel} {lang.toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* Catalog Column */}
          <div>
            <h4 className="footer-col-title">{t.footer.cols.catalog}</h4>
            <ul className="footer-links">
              <li>
                <a href="#catalog" className="footer-link" onClick={(e) => { e.preventDefault(); scrollToSection('catalog'); }}>
                  {t.footer.links.allProducts}
                </a>
              </li>
              <li>
                <a href="#catalog" className="footer-link" onClick={(e) => { e.preventDefault(); scrollToSection('catalog'); }}>
                  {t.footer.links.mixers}
                </a>
              </li>
              <li>
                <a href="#catalog" className="footer-link" onClick={(e) => { e.preventDefault(); scrollToSection('catalog'); }}>
                  {t.footer.links.showers}
                </a>
              </li>
              <li>
                <a href="#catalog" className="footer-link" onClick={(e) => { e.preventDefault(); scrollToSection('catalog'); }}>
                  {t.footer.links.sinks}
                </a>
              </li>
              <li>
                <a href="#catalog" className="footer-link" onClick={(e) => { e.preventDefault(); scrollToSection('catalog'); }}>
                  {t.footer.links.cabins}
                </a>
              </li>
              <li>
                <a href="#catalog" className="footer-link" onClick={(e) => { e.preventDefault(); scrollToSection('catalog'); }}>
                  {t.footer.links.components}
                </a>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="footer-col-title">{t.footer.cols.company}</h4>
            <ul className="footer-links">
              <li>
                <a href="#production" className="footer-link" onClick={(e) => { e.preventDefault(); scrollToSection('production'); }}>
                  {t.footer.links.about}
                </a>
              </li>
              <li>
                <a href="#production" className="footer-link" onClick={(e) => { e.preventDefault(); scrollToSection('production'); }}>
                  {t.footer.links.production}
                </a>
              </li>
              <li>
                <a href="#production" className="footer-link" onClick={(e) => { e.preventDefault(); scrollToSection('production'); }}>
                  {t.footer.links.quality}
                </a>
              </li>
            </ul>
          </div>

          {/* Partners Column */}
          <div>
            <h4 className="footer-col-title">{t.footer.cols.partners}</h4>
            <ul className="footer-links">
              <li>
                <a href="#partners" className="footer-link" onClick={(e) => { e.preventDefault(); openPartnerModal(); }}>
                  {t.footer.links.wholesale}
                </a>
              </li>
              <li>
                <a href="#login" className="footer-link" onClick={(e) => { e.preventDefault(); openAuthModal(); }}>
                  {t.footer.links.b2bLogin}
                </a>
              </li>
              <li>
                <a href="#partners" className="footer-link" onClick={(e) => { e.preventDefault(); scrollToSection('partners'); }}>
                  {t.footer.links.specifications}
                </a>
              </li>
            </ul>
          </div>

          {/* Service Column */}
          <div>
            <h4 className="footer-col-title">{t.footer.cols.service}</h4>
            <ul className="footer-links">
              <li>
                <a href="#service" className="footer-link" onClick={(e) => { e.preventDefault(); openServiceModal(); }}>
                  {t.footer.links.serviceCenter}
                </a>
              </li>
              <li>
                <a href="#service" className="footer-link" onClick={(e) => { e.preventDefault(); scrollToSection('service'); }}>
                  {t.footer.links.warranty}
                </a>
              </li>
            </ul>
          </div>

          {/* Where to Buy & Contacts */}
          <div>
            <h4 className="footer-col-title">{t.footer.cols.whereToBuy}</h4>
            <ul className="footer-links">
              <li>
                <a href="#where-to-buy" className="footer-link" onClick={(e) => { e.preventDefault(); scrollToSection('where-to-buy'); }}>
                  {t.footer.links.findDealer}
                </a>
              </li>
              <li>
                <a href="#contacts" className="footer-link" onClick={(e) => { e.preventDefault(); openPartnerModal(); }}>
                  {t.footer.links.offices}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Line */}
        <div className="footer-bottom">
          <div className="footer-copy">
            {t.footer.copyright}
          </div>

          <div className="footer-bottom-links">
            <a href="#privacy" onClick={(e) => { e.preventDefault(); alert('Политика конфиденциальности LAUTE'); }}>
              {t.footer.privacy}
            </a>
            <a href="#terms" onClick={(e) => { e.preventDefault(); alert('Условия сотрудничества LAUTE B2B'); }}>
              {t.footer.terms}
            </a>
            <button
              onClick={scrollToTop}
              className="btn btn-secondary btn-sm"
              style={{ padding: '6px 12px' }}
              title="Наверх"
            >
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
