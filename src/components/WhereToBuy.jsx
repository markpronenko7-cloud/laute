import React from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, Navigation, ArrowRight, ShieldCheck } from 'lucide-react';

export const WhereToBuy = () => {
  const { t, region, openPartnerModal } = useApp();

  return (
    <section id="where-to-buy" className="section">
      <div className="container">
        <div className="where-to-buy-card">
          <div style={{ maxWidth: '640px' }}>
            <div className="section-badge">
              <MapPin size={14} />
              <span>{t.whereToBuy.badge}</span>
            </div>
            <h2 className="section-title" style={{ fontSize: '1.875rem', marginBottom: '12px' }}>
              {t.whereToBuy.title}
            </h2>
            <p className="section-subtitle" style={{ fontSize: '1rem', marginBottom: '16px' }}>
              {t.whereToBuy.subtitle}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: '#64748B' }}>
              <ShieldCheck size={16} color="#38BDF8" />
              <span>{t.whereToBuy.notice}</span>
            </div>
          </div>

          <div>
            <button className="btn btn-secondary btn-lg" onClick={openPartnerModal}>
              <Navigation size={18} />
              <span>{t.whereToBuy.cta}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
