import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Clock, Check, ArrowRight, ShieldAlert, Cpu, Wrench } from 'lucide-react';

export const AIAndService = () => {
  const { t, openAIModal, openServiceModal } = useApp();

  return (
    <section id="service" className="section section-alt">
      <div className="container">
        <div className="split-sections">
          {/* AI Helper Box */}
          <div className="feature-box ai-box">
            <div>
              <div className="section-badge">
                <Sparkles size={14} />
                <span>{t.ai.badge}</span>
              </div>
              <h2 className="section-title" style={{ fontSize: '1.875rem' }}>
                {t.ai.title}
              </h2>
              <p className="section-subtitle" style={{ fontSize: '1rem' }}>
                {t.ai.subtitle}
              </p>

              <ul className="feature-list">
                {t.ai.features.map((feat, idx) => (
                  <li key={idx} className="feature-item">
                    <Check size={16} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <button className="btn btn-outline" onClick={openAIModal} style={{ width: '100%' }}>
                <Sparkles size={16} />
                <span>{t.ai.cta}</span>
              </button>
            </div>
          </div>

          {/* First Digital Service Center */}
          <div className="feature-box service-box">
            <div>
              <div className="section-badge">
                <Wrench size={14} />
                <span>{t.service.badge}</span>
              </div>
              <h2 className="section-title" style={{ fontSize: '1.875rem' }}>
                {t.service.title}
              </h2>
              <p className="section-subtitle" style={{ fontSize: '1rem' }}>
                {t.service.subtitle}
              </p>

              <div className="sla-badge">
                <div className="sla-badge-icon">
                  <Clock size={20} />
                </div>
                <div>
                  <div className="sla-title">{t.service.slaTitle}</div>
                  <div className="sla-text">{t.service.slaDesc}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
                {t.service.steps.map((st, idx) => (
                  <div key={idx} style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ color: '#38BDF8', fontWeight: '800', fontSize: '0.75rem', marginBottom: '4px' }}>{st.num}</div>
                    <div style={{ color: '#FFFFFF', fontSize: '0.8125rem', fontWeight: '600', marginBottom: '4px' }}>{st.title}</div>
                    <div style={{ color: '#94A3B8', fontSize: '0.6875rem', lineHeight: '1.4' }}>{st.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <button className="btn btn-primary" onClick={openServiceModal} style={{ width: '100%' }}>
                <span>{t.service.submitBtn}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
