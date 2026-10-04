import React from 'react';
import { useApp } from '../context/AppContext';
import { Eye, Home, Building2, Utensils } from 'lucide-react';

export const InteriorShowcase = () => {
  const { t } = useApp();

  const renderInteriorGraphic = (index) => {
    if (index === 0) {
      // Master Bathroom Minimalist
      return (
        <svg viewBox="0 0 400 240" style={{ width: '100%', height: '100%' }} fill="none">
          <defs>
            <linearGradient id="wallGrad1" x1="0" y1="0" x2="0" y2="100%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
            <linearGradient id="mirrorGlow" x1="0" y1="0" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <rect width="400" height="240" fill="url(#wallGrad1)" />
          {/* Tile lines */}
          <line x1="80" y1="0" x2="80" y2="240" stroke="rgba(255,255,255,0.04)" />
          <line x1="160" y1="0" x2="160" y2="240" stroke="rgba(255,255,255,0.04)" />
          <line x1="240" y1="0" x2="240" y2="240" stroke="rgba(255,255,255,0.04)" />
          <line x1="320" y1="0" x2="320" y2="240" stroke="rgba(255,255,255,0.04)" />
          {/* LED Backlit Mirror */}
          <rect x="140" y="30" width="120" height="100" rx="60" fill="url(#mirrorGlow)" stroke="#38BDF8" strokeWidth="1.5" strokeOpacity="0.5" />
          {/* Basin Counter */}
          <rect x="90" y="160" width="220" height="14" rx="2" fill="#334155" />
          {/* Ceramic Basin */}
          <path d="M140 160 C140 145 260 145 260 160 Z" fill="#F8FAFC" />
          {/* Tall Basin Mixer */}
          <path d="M196 160 V120 C196 105 215 105 220 115 L220 125" stroke="#CBD5E1" strokeWidth="5" strokeLinecap="round" />
          <rect x="188" y="140" width="4" height="10" rx="1" fill="#94A3B8" />
        </svg>
      );
    } else if (index === 1) {
      // Modern High-Tech Kitchen
      return (
        <svg viewBox="0 0 400 240" style={{ width: '100%', height: '100%' }} fill="none">
          <defs>
            <linearGradient id="kitchenBacksplash" x1="0" y1="0" x2="100%" y2="0">
              <stop offset="0%" stopColor="#111827" />
              <stop offset="50%" stopColor="#1F2937" />
              <stop offset="100%" stopColor="#111827" />
            </linearGradient>
          </defs>
          <rect width="400" height="240" fill="url(#kitchenBacksplash)" />
          {/* Granite Countertop */}
          <rect x="40" y="150" width="320" height="24" rx="2" fill="#374151" />
          {/* Undermount Stainless Sink */}
          <rect x="120" y="150" width="160" height="40" rx="4" fill="#1F2937" stroke="#4B5563" strokeWidth="2" />
          {/* Pull-out Kitchen Mixer */}
          <path d="M200 150 V80 C200 50 250 50 255 75 V105" stroke="#E2E8F0" strokeWidth="7" strokeLinecap="round" />
          <path d="M245 75 C248 85 258 85 255 105" stroke="#38BDF8" strokeWidth="3" strokeDasharray="3 3" />
          {/* Single lever handle */}
          <line x1="185" y1="125" x2="200" y2="130" stroke="#94A3B8" strokeWidth="5" strokeLinecap="round" />
        </svg>
      );
    } else {
      // Hospitality & Development Shower Space
      return (
        <svg viewBox="0 0 400 240" style={{ width: '100%', height: '100%' }} fill="none">
          <defs>
            <linearGradient id="hotelTiles" x1="0" y1="0" x2="0" y2="100%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0B1320" />
            </linearGradient>
          </defs>
          <rect width="400" height="240" fill="url(#hotelTiles)" />
          {/* Glass Partition */}
          <rect x="250" y="20" width="4" height="200" fill="rgba(56, 189, 248, 0.3)" />
          <line x1="252" y1="20" x2="252" y2="220" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
          {/* Ceiling Shower Head */}
          <rect x="160" y="20" width="80" height="8" rx="2" fill="#E2E8F0" />
          <line x1="200" y1="0" x2="200" y2="20" stroke="#E2E8F0" strokeWidth="6" />
          {/* Rainfall stream subtle */}
          <line x1="175" y1="28" x2="175" y2="180" stroke="rgba(56, 189, 248, 0.2)" strokeWidth="1.5" strokeDasharray="4 6" />
          <line x1="200" y1="28" x2="200" y2="180" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1.5" strokeDasharray="4 6" />
          <line x1="225" y1="28" x2="225" y2="180" stroke="rgba(56, 189, 248, 0.2)" strokeWidth="1.5" strokeDasharray="4 6" />
          {/* Concealed Thermostat Wall Plate */}
          <rect x="120" y="110" width="30" height="50" rx="3" fill="#334155" stroke="#64748B" strokeWidth="1.5" />
          <circle cx="135" cy="125" r="7" fill="#E2E8F0" />
          <circle cx="135" cy="145" r="7" fill="#E2E8F0" />
        </svg>
      );
    }
  };

  return (
    <section className="section">
      <div className="container">
        <div className="section-header text-center">
          <div className="section-badge">
            <Eye size={14} />
            <span>{t.interior.badge}</span>
          </div>
          <h2 className="section-title">{t.interior.title}</h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            {t.interior.subtitle}
          </p>
        </div>

        <div className="interior-grid">
          {t.interior.items.map((item, idx) => (
            <div key={idx} className="interior-card">
              <div className="interior-visual">
                <span className="interior-tag">{item.tag}</span>
                {renderInteriorGraphic(idx)}
              </div>
              <div className="interior-info">
                <h3 className="interior-title">{item.title}</h3>
                <p className="interior-desc">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
