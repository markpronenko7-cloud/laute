import React from 'react';
import { useApp } from '../context/AppContext';
import { Factory, CheckCircle2, Cog, Sparkles, Droplets, ArrowRight } from 'lucide-react';

export const Production = () => {
  const { t, openPartnerModal } = useApp();

  const pillarIcons = [
    <Sparkles size={20} color="#38BDF8" />,
    <Cog size={20} color="#38BDF8" />,
    <CheckCircle2 size={20} color="#38BDF8" />,
    <Droplets size={20} color="#38BDF8" />
  ];

  return (
    <section id="production" className="section">
      <div className="container">
        <div className="production-wrapper">
          <div className="section-header">
            <div className="section-badge">
              <Factory size={14} />
              <span>{t.production.badge}</span>
            </div>
            <h2 className="section-title" style={{ maxWidth: '780px' }}>
              {t.production.title}
            </h2>
            <p className="section-subtitle">
              {t.production.subtitle}
            </p>
          </div>

          <div className="production-pillars">
            {t.production.pillars.map((pillar, idx) => (
              <div key={idx} className="pillar-card">
                <div style={{ marginBottom: '14px' }}>
                  {pillarIcons[idx]}
                </div>
                <h3 className="pillar-title">{pillar.title}</h3>
                <p className="pillar-desc">{pillar.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', paddingTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem', color: '#94A3B8' }}>
              <CheckCircle2 size={18} color="#10B981" />
              <span>Строгий входной контроль сырья и 100% выходной тест каждого смесителя</span>
            </div>

            <button
              className="btn btn-secondary"
              onClick={openPartnerModal}
            >
              <span>{t.production.cta}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
