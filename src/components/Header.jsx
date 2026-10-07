import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Globe, MapPin, User, Menu, X, ChevronDown, Sparkles } from 'lucide-react';
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
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const top = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
          setIsScrolled(top > 20);
          const ratio = Math.min(Math.max(top / 160, 0), 1);
          document.documentElement.style.setProperty('--header-scroll-ratio', ratio.toFixed(3));
          ticking = false;
        });
        ticking = true;
      }
    };
    handleScroll();
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

  // Close mobile drawer on route change or escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsLangOpen(false);
        setIsRegionOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const languageOptions = [
    { code: 'ru', label: 'РУС', full: 'Русский' },
    { code: 'kz', label: 'КАЗ', full: 'Қазақша' },
    { code: 'en', label: 'ENG', full: 'English' }
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
        {/* Left: Brand Logo & Main Nav */}
        <div className="header-left">
          <a 
            href={`${import.meta.env.BASE_URL}`} 
            className="brand-logo" 
            onClick={(e) => { e.preventDefault(); handleNavClick('home'); }}
            title="LAUTE — Официальный сайт"
          >
            <img 
              src={logoSrc} 
              alt="LAUTE" 
              className="brand-logo-img" 
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextSibling) e.target.nextSibling.style.display = 'inline-block';
              }}
            />
            <span className="brand-name-fallback" style={{ display: 'none', fontWeight: 800, fontSize: '1.6rem', letterSpacing: '0.05em', color: '#FFFFFF' }}>
              LAUTE
            </span>
          </a>

          <nav className="nav-desktop" aria-label="Основная навигация">
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
                  {t.nav.products || t.nav.catalog || 'Продукция'}
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  className={`nav-link ${currentRoute === 'company' ? 'active' : ''}`} 
                  onClick={() => handleNavClick('company')}
                >
                  {t.nav.about || t.nav.company || 'О LAUTE'}
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  className={`nav-link ${currentRoute === 'partners' ? 'active' : ''}`} 
                  onClick={() => handleNavClick('partners')}
                >
                  {t.nav.partners || 'Партнёрам'}
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  className={`nav-link ${currentRoute === 'where-to-buy' ? 'active' : ''}`} 
                  onClick={() => handleNavClick('where-to-buy')}
                >
                  {t.nav.whereToBuy || 'Где купить'}
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  className={`nav-link ${currentRoute === 'service' ? 'active' : ''}`} 
                  onClick={() => handleNavClick('service')}
                >
                  {t.nav.service || 'Сервис и гарантия'}
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  className={`nav-link ${currentRoute === 'contacts' ? 'active' : ''}`} 
                  onClick={() => handleNavClick('contacts')}
                >
                  {t.nav.contacts || 'Контакты'}
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Right: Selectors & Actions */}
        <div className="header-right">
          {/* Language Selector */}
          <div className="select-dropdown header-lang-dropdown" ref={langRef}>
            <button
              type="button"
              className="select-trigger"
              onClick={() => setIsLangOpen(!isLangOpen)}
              aria-label={t.nav.language || 'Язык сайта'}
            >
              <Globe size={15} className="select-icon" />
              <span className="select-val">{lang === 'ru' ? 'РУС' : lang === 'kz' ? 'КАЗ' : 'ENG'}</span>
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
          <div className="select-dropdown header-region-dropdown" ref={regionRef}>
            <button
              type="button"
              className="select-trigger"
              onClick={() => setIsRegionOpen(!isRegionOpen)}
              aria-label={t.regions?.selectRegion || t.nav.region || 'Ваш регион'}
            >
              <MapPin size={15} className="select-icon" />
              <span className="select-val">{t.regions?.[region] || region}</span>
              <ChevronDown size={13} className={`arrow-icon ${isRegionOpen ? 'open' : ''}`} />
            </button>

            {isRegionOpen && (
              <div className="dropdown-panel region-panel">
                <div className="dropdown-header">
                  <p className="dropdown-desc">{t.regions?.regionDesc || 'Выберите регион, чтобы увидеть контакты и условия обращения в LAUTE.'}</p>
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
              </div>
            )}
          </div>

          {/* B2B Client Cabinet */}
          <button
            type="button"
            className="btn btn-outline btn-sm cabinet-btn"
            onClick={openAuthModal}
            title={t.nav.clientCabinet || 'Кабинет партнера'}
          >
            <User size={15} />
            <span>{t.nav.clientCabinet || 'Кабинет партнера'}</span>
          </button>

          {/* Main Wholesale Partner CTA */}
          <button
            type="button"
            className="btn btn-primary btn-partner-cta"
            onClick={openPartnerModal}
          >
            <span>{t.nav.requestQuote || 'Стать партнёром'}</span>
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
        <div className="mobile-nav-drawer" role="dialog" aria-modal="true">
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
                {t.nav.products || t.nav.catalog || 'Продукция'}
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`mobile-nav-link ${currentRoute === 'company' ? 'active' : ''}`}
                onClick={() => handleNavClick('company')}
              >
                {t.nav.about || t.nav.company || 'О LAUTE'}
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`mobile-nav-link ${currentRoute === 'partners' ? 'active' : ''}`}
                onClick={() => handleNavClick('partners')}
              >
                {t.nav.partners || 'Партнёрам'}
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`mobile-nav-link ${currentRoute === 'where-to-buy' ? 'active' : ''}`}
                onClick={() => handleNavClick('where-to-buy')}
              >
                {t.nav.whereToBuy || 'Где купить'}
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`mobile-nav-link ${currentRoute === 'service' ? 'active' : ''}`}
                onClick={() => handleNavClick('service')}
              >
                {t.nav.service || 'Сервис и гарантия'}
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`mobile-nav-link ${currentRoute === 'contacts' ? 'active' : ''}`}
                onClick={() => handleNavClick('contacts')}
              >
                {t.nav.contacts || 'Контакты'}
              </button>
            </li>
          </ul>

          <div className="mobile-drawer-footer">
            <div className="mobile-selectors">
              <div className="mobile-select-group">
                <span className="mobile-select-label">{t.nav.language || 'Язык сайта'}:</span>
                <div className="lang-buttons">
                  {languageOptions.map((opt) => (
                    <button
                      key={opt.code}
                      type="button"
                      className={`lang-btn ${lang === opt.code ? 'active' : ''}`}
                      onClick={() => {
                        setLang(opt.code);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mobile-select-group">
                <span className="mobile-select-label">{t.nav.region || 'Ваш регион'}:</span>
                <div className="region-chips">
                  {regionOptions.map((opt) => (
                    <button
                      key={opt.code}
                      type="button"
                      className={`region-chip ${region === opt.code ? 'active' : ''}`}
                      onClick={() => {
                        setRegion(opt.code);
                        setIsMobileMenuOpen(false);
                      }}
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
                <span>{t.nav.clientCabinet || 'Кабинет партнера'}</span>
              </button>
              <button
                type="button"
                className="btn btn-primary btn-full"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openPartnerModal();
                }}
              >
                <span>{t.nav.requestQuote || 'Стать партнёром'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
