import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Globe, MapPin, User, ArrowUpRight, Menu, X, ChevronDown } from 'lucide-react';

export const Header = () => {
  const { lang, setLang, region, setRegion, t, openPartnerModal, openAuthModal } = useApp();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const langRef = useRef(null);
  const regionRef = useRef(null);

  // Close dropdowns on outside click
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

  const regionOptions = [
    { code: 'kz', label: t.regions.kz },
    { code: 'siberia', label: t.regions.siberia },
    { code: 'ru', label: t.regions.ru },
    { code: 'intl', label: t.regions.intl }
  ];

  const scrollTo = (id) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="header">
      <div className="container header-container">
        <div className="header-left">
          <a href="#" className="brand-logo" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <div className="brand-mark">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 4H10V16H20V20H4V4Z" fill="#FFFFFF" />
              </svg>
            </div>
            <span className="brand-name">LAUTE</span>
          </a>

          <nav className="nav-desktop">
            <ul className="nav-links">
              <li>
                <a href="#catalog" className="nav-link" onClick={(e) => { e.preventDefault(); scrollTo('catalog'); }}>
                  {t.nav.catalog}
                </a>
              </li>
              <li>
                <a href="#production" className="nav-link" onClick={(e) => { e.preventDefault(); scrollTo('production'); }}>
                  {t.nav.production}
                </a>
              </li>
              <li>
                <a href="#partners" className="nav-link" onClick={(e) => { e.preventDefault(); scrollTo('partners'); }}>
                  {t.nav.partners}
                </a>
              </li>
              <li>
                <a href="#where-to-buy" className="nav-link" onClick={(e) => { e.preventDefault(); scrollTo('where-to-buy'); }}>
                  {t.nav.whereToBuy}
                </a>
              </li>
              <li>
                <a href="#service" className="nav-link" onClick={(e) => { e.preventDefault(); scrollTo('service'); }}>
                  {t.nav.service}
                </a>
              </li>
              <li>
                <a href="#contacts" className="nav-link" onClick={(e) => { e.preventDefault(); scrollTo('contacts'); }}>
                  {t.nav.contacts}
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="header-right">
          {/* Language Selector */}
          <div className="select-dropdown" ref={langRef}>
            <button
              className="select-btn"
              onClick={() => setIsLangOpen(!isLangOpen)}
              aria-label="Select Language"
              aria-expanded={isLangOpen}
            >
              <Globe size={15} />
              <span>{lang.toUpperCase()}</span>
              <ChevronDown size={14} />
            </button>
            {isLangOpen && (
              <ul className="select-menu">
                {languageOptions.map((item) => (
                  <li key={item.code}>
                    <button
                      className={`select-item ${lang === item.code ? 'active' : ''}`}
                      onClick={() => {
                        setLang(item.code);
                        setIsLangOpen(false);
                      }}
                    >
                      <span>{item.full}</span>
                      <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Region Selector */}
          <div className="select-dropdown" ref={regionRef}>
            <button
              className="select-btn"
              onClick={() => setIsRegionOpen(!isRegionOpen)}
              aria-label="Select Region"
              aria-expanded={isRegionOpen}
            >
              <MapPin size={15} />
              <span style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {t.regions[region] || region}
              </span>
              <ChevronDown size={14} />
            </button>
            {isRegionOpen && (
              <ul className="select-menu">
                {regionOptions.map((item) => (
                  <li key={item.code}>
                    <button
                      className={`select-item ${region === item.code ? 'active' : ''}`}
                      onClick={() => {
                        setRegion(item.code);
                        setIsRegionOpen(false);
                      }}
                    >
                      <span>{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* B2B Client Cabinet */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={openAuthModal}
            title={t.nav.clientCabinet}
          >
            <User size={15} />
            <span>{t.nav.clientCabinet}</span>
          </button>

          {/* Partner CTA */}
          <button
            className="btn btn-primary btn-sm"
            onClick={openPartnerModal}
          >
            <span>{t.nav.requestQuote}</span>
            <ArrowUpRight size={15} />
          </button>

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Navigation"
          >
            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <a
            href="#catalog"
            className="mobile-nav-link"
            onClick={(e) => { e.preventDefault(); scrollTo('catalog'); }}
          >
            {t.nav.catalog}
          </a>
          <a
            href="#production"
            className="mobile-nav-link"
            onClick={(e) => { e.preventDefault(); scrollTo('production'); }}
          >
            {t.nav.production}
          </a>
          <a
            href="#partners"
            className="mobile-nav-link"
            onClick={(e) => { e.preventDefault(); scrollTo('partners'); }}
          >
            {t.nav.partners}
          </a>
          <a
            href="#where-to-buy"
            className="mobile-nav-link"
            onClick={(e) => { e.preventDefault(); scrollTo('where-to-buy'); }}
          >
            {t.nav.whereToBuy}
          </a>
          <a
            href="#service"
            className="mobile-nav-link"
            onClick={(e) => { e.preventDefault(); scrollTo('service'); }}
          >
            {t.nav.service}
          </a>
          <a
            href="#contacts"
            className="mobile-nav-link"
            onClick={(e) => { e.preventDefault(); scrollTo('contacts'); }}
          >
            {t.nav.contacts}
          </a>

          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              className="btn btn-secondary"
              onClick={() => { setIsMobileMenuOpen(false); openAuthModal(); }}
            >
              <User size={16} />
              <span>{t.nav.clientCabinet}</span>
            </button>
            <button
              className="btn btn-primary"
              onClick={() => { setIsMobileMenuOpen(false); openPartnerModal(); }}
            >
              <span>{t.nav.requestQuote}</span>
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
