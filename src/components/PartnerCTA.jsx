import React from 'react';
import { useApp } from '../context/AppContext';
import { Handshake, ArrowRight, FileSpreadsheet, MessageSquare } from 'lucide-react';

export const PartnerCTA = () => {
  const { t, openPartnerModal } = useApp();

  const scrollToCatalog = () => {
    const el = document.getElementById('catalog');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="section" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      <div className="container">
        <div className="partner-cta-banner">
          <div className="section-badge">
            <Handshake size={14} />
            <span>{t.ctaPartner.badge}</span>
          </div>

          <h2>{t.ctaPartner.title}</h2>
          <p>{t.ctaPartner.subtitle}</p>

          <div className="partner-cta-actions">
            <button className="btn btn-primary btn-lg" onClick={openPartnerModal}>
              <span>{t.ctaPartner.primaryBtn}</span>
              <ArrowRight size={18} />
            </button>

            <button className="btn btn-secondary btn-lg" onClick={scrollToCatalog}>
              <span>{t.ctaPartner.secondaryBtn}</span>
            </button>

            <button className="btn btn-outline btn-lg" onClick={openPartnerModal}>
              <MessageSquare size={18} />
              <span>{t.ctaPartner.consultBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
