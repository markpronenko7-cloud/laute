import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Globe, MapPin, User, Menu, X, ChevronDown } from 'lucide-react';
import { REGIONS_CONFIG } from '../data/regionsData';

export const Header = () => {
  const { lang, setLang, region, setRegion, currentRoute, navigateTo, t, openPartnerModal, openAuthModal } = useApp();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const langRef = useRef(null);
  const regionRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setIsLangOpen(false);
      }
      if (regionRef.current && !regionRef.current.contains(e.target)) {
        setIsRegionOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const languageOptions = [
    { code: 'ru', label: 'RU', full: 'Русский' },
    { code: 'kz', label: 'KZ', full: 'Қазақша' },
    { code: 'en', label: 'EN', full: 'English' }
  ];

  const regionOptions = REGIONS_CONFIG.map((reg) => ({
    code: reg.id,
    label: t.regions?.[reg.id] || reg.names[lang] || reg.names.ru
  }));

  const handleNavClick = (route) => {
    setIsMobileMenuOpen(false);
    navigateTo(route);
  };

  const logoSrc = `${import.meta.env.BASE_URL}laute-logo.png`;

  return (
    <header className={`header ${isScrolled ? 'header-scrolled' : ''}`}>
      <div className="container header-container">
        <div className="header-left">
          <a 
            href={`${import.meta.env.BASE_URL}`} 
            className="brand-logo" 
            onClick={(e) => { e.preventDefault(); handleNavClick('home'); }}
            title="LAUTE"
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
            <span className="brand-name-fallback" style={{ display: 'none', fontWeight: 800, fontSize: '1.4rem', letterSpacing: '0.04em', color: '#0F172A' }}>LAUTE</span>
          </a>

          <nav className="nav-desktop">
            <ul className="nav-links">
              <li>
                <button 
                  type="button" 
                  className={`nav-link ${currentRoute === 'home' ? 'active' : ''}`} 
                  onClick={() => handleNavClick('home')}
                >
                  {t.nav.home || 'Главная'}
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  className={`nav-link ${currentRoute === 'catalog' ? 'active' : ''}`} 
                  onClick={() => handleNavClick('catalog')}
                >
                  {t.nav.catalog}
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  className={`nav-link ${currentRoute === 'company' ? 'active' : ''}`} 
                  onClick={() => handleNavClick('company')}
                >
                  {t.nav.production}
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  className={`nav-link ${currentRoute === 'partners' ? 'active' : ''}`} 
                  onClick={() => handleNavClick('partners')}
                >
                  {t.nav.partners}
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  className={`nav-link ${currentRoute === 'where-to-buy' ? 'active' : ''}`} 
                  onClick={() => handleNavClick('where-to-buy')}
                >
                  {t.nav.whereToBuy}
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  className={`nav-link ${currentRoute === 'service' ? 'active' : ''}`} 
                  onClick={() => handleNavClick('service')}
                >
                  {t.nav.service}
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  className={`nav-link ${currentRoute === 'contacts' ? 'active' : ''}`} 
                  onClick={() => handleNavClick('contacts')}
                >
                  {t.nav.contacts}
                </button>
              </li>
            </ul>
          </nav>
        </div>

        <div className="header-right">
          {/* Language Selector */}
          <div className="select-dropdown" ref={langRef}>
            <button
              type="button"
              className="select-trigger"
              onClick={() => setIsLangOpen(!isLangOpen)}
              aria-label="Выбрать язык"
            >
              <Globe size={15} className="select-icon" />
              <span className="select-val">{lang.toUpperCase()}</span>
              <ChevronDown size={13} className={`arrow-icon ${isLangOpen ? 'open' : ''}`} />
            </button>

            {isLangOpen && (
              <div className="dropdown-panel lang-panel">
                {languageOptions.map((opt) => (
                  <button
                    key={opt.code}
                    type="button"
                    className={`dropdown-option ${lang === opt.code ? 'active' : ''}`}
                    onClick={() => {
                      setLang(opt.code);
                      setIsLangOpen(false);
                    }}
                  >
                    <span className="opt-code">{opt.label}</span>
                    <span className="opt-label">{opt.full}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Region Selector */}
          <div className="select-dropdown" ref={regionRef}>
            <button
              type="button"
              className="select-trigger"
              onClick={() => setIsRegionOpen(!isRegionOpen)}
              aria-label={t.regions?.selectRegion || 'Выберите регион'}
            >
              <MapPin size={15} className="select-icon" />
              <span className="select-val">{t.regions?.[region] || region}</span>
              <ChevronDown size={13} className={`arrow-icon ${isRegionOpen ? 'open' : ''}`} />
            </button>

            {isRegionOpen && (
              <div className="dropdown-panel region-panel">
                <div className="dropdown-header">
                  <p className="dropdown-desc">{t.regions?.selectRegion || 'Выберите регион:'}</p>
                </div>
                {regionOptions.map((opt) => (
                  <button
                    key={opt.code}
                    type="button"
                    className={`dropdown-option ${region === opt.code ? 'active' : ''}`}
                    onClick={() => {
                      setRegion(opt.code);
                      setIsRegionOpen(false);
                    }}
                  >
                    <MapPin size={13} style={{ opacity: 0.7 }} />
                    <span className="opt-label">{opt.label}</span>
                  </button>
                ))}
                {t.regions?.note && (
                  <div className="dropdown-footer-note">
                    {t.regions.note}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* B2B Client Cabinet */}
          <button
            type="button"
            className="btn btn-outline btn-sm cabinet-btn"
            onClick={openAuthModal}
            title={t.nav.clientCabinet}
          >
            <User size={15} />
            <span>{t.nav.clientCabinet}</span>
          </button>

          {/* Main Wholesale Partner CTA */}
          <button
            type="button"
            className="btn btn-primary btn-partner-cta"
            onClick={openPartnerModal}
          >
            <span>{t.nav.requestQuote || 'Стать оптовым партнёром'}</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="mobile-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Меню"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <ul className="mobile-nav-links">
            <li>
              <button
                type="button"
                className={`mobile-nav-link ${currentRoute === 'home' ? 'active' : ''}`}
                onClick={() => handleNavClick('home')}
              >
                {t.nav.home || 'Главная'}
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`mobile-nav-link ${currentRoute === 'catalog' ? 'active' : ''}`}
                onClick={() => handleNavClick('catalog')}
              >
                {t.nav.catalog}
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`mobile-nav-link ${currentRoute === 'company' ? 'active' : ''}`}
                onClick={() => handleNavClick('company')}
              >
                {t.nav.production}
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`mobile-nav-link ${currentRoute === 'partners' ? 'active' : ''}`}
                onClick={() => handleNavClick('partners')}
              >
                {t.nav.partners}
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`mobile-nav-link ${currentRoute === 'where-to-buy' ? 'active' : ''}`}
                onClick={() => handleNavClick('where-to-buy')}
              >
                {t.nav.whereToBuy}
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`mobile-nav-link ${currentRoute === 'service' ? 'active' : ''}`}
                onClick={() => handleNavClick('service')}
              >
                {t.nav.service}
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`mobile-nav-link ${currentRoute === 'contacts' ? 'active' : ''}`}
                onClick={() => handleNavClick('contacts')}
              >
                {t.nav.contacts}
              </button>
            </li>
          </ul>

          <div className="mobile-drawer-footer">
            <div className="mobile-selectors">
              <div className="mobile-select-group">
                <span className="mobile-select-label">Язык:</span>
                <div className="lang-buttons">
                  {languageOptions.map((opt) => (
                    <button
                      key={opt.code}
                      type="button"
                      className={`lang-btn ${lang === opt.code ? 'active' : ''}`}
                      onClick={() => setLang(opt.code)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mobile-select-group">
                <span className="mobile-select-label">{t.regions?.currentRegion || 'Регион'}:</span>
                <div className="region-chips">
                  {regionOptions.map((opt) => (
                    <button
                      key={opt.code}
                      type="button"
                      className={`region-chip ${region === opt.code ? 'active' : ''}`}
                      onClick={() => setRegion(opt.code)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mobile-actions">
              <button
                type="button"
                className="btn btn-outline btn-full"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openAuthModal();
                }}
              >
                <User size={16} />
                <span>{t.nav.clientCabinet}</span>
              </button>

              <button
                type="button"
                className="btn btn-primary btn-full"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openPartnerModal();
                }}
              >
                <span>{t.nav.requestQuote || 'Стать оптовым партнёром'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
