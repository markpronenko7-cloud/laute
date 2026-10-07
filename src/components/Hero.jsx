import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRight, ShieldCheck, Layers } from 'lucide-react';
import { HeroShowcaseGraphic } from './ProductIllustrations';

export const Hero = () => {
  const { t, openPartnerModal } = useApp();

  const scrollToCatalog = () => {
    const el = document.getElementById('catalog');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-grid">
          {/* Left Column: Text & Strategic B2B Presentation */}
          <div className="hero-content">
            <div className="hero-badge">
              <span className="dot"></span>
              <span>{t.hero.badge}</span>
            </div>

            <h1 className="hero-title">
              {t.hero.title}
            </h1>

            <p className="hero-subtitle">
              {t.hero.subtitle}
            </p>

            <div className="hero-actions">
              <button
                className="btn btn-primary btn-lg"
                onClick={scrollToCatalog}
              >
                <span>{t.hero.ctaCatalog}</span>
                <ArrowRight size={18} />
              </button>

              <button
                className="btn btn-secondary btn-lg"
                onClick={openPartnerModal}
              >
                <span>{t.hero.ctaPartner}</span>
              </button>
            </div>

            <div className="hero-notice">
              <ShieldCheck size={18} color="#38BDF8" />
              <span>{t.hero.statusNotice}</span>
            </div>
          </div>

          {/* Right Column: Architectural Engineering Product Card */}
          <div className="hero-visual">
            <div className="hero-card-showcase">
              <div className="showcase-header">
                <span className="showcase-tag">ENGINEERED SANITARY FIXTURE</span>
                <div className="showcase-status">
                  <span>QC PASSED</span>
                </div>
              </div>

              <div className="showcase-image-area">
                <HeroShowcaseGraphic />
              </div>

              <div className="showcase-footer">
                <div className="showcase-metric">
                  <div className="showcase-metric-label">MATERIAL</div>
                  <div className="showcase-metric-val">Brass CW617N</div>
                </div>
                <div className="showcase-metric">
                  <div className="showcase-metric-label">PRESSURE TEST</div>
                  <div className="showcase-metric-val">100% Air/Hydro</div>
                </div>
                <div className="showcase-metric">
                  <div className="showcase-metric-label">CARTRIDGE</div>
                  <div className="showcase-metric-val">Ceramic Disc</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
