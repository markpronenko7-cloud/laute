import React from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  PackageCheck,
  SplitSquareVertical,
  BadgePercent,
  MapPin,
  Boxes,
  Headphones,
  FileText,
  ArrowRight
} from 'lucide-react';

export const PartnerBenefits = () => {
  const { t, openPartnerModal } = useApp();

  const benefitIcons = [
    <PackageCheck size={22} />,
    <SplitSquareVertical size={22} />,
    <Boxes size={22} />,
    <BadgePercent size={22} />,
    <MapPin size={22} />,
    <TrendingUp size={22} />,
    <Headphones size={22} />,
    <FileText size={22} />
  ];

  return (
    <section id="partners" className="section section-alt">
      <div className="container">
        <div className="section-header text-center">
          <div className="section-badge">
            <TrendingUp size={14} />
            <span>{t.benefits.badge}</span>
          </div>
          <h2 className="section-title">{t.benefits.title}</h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            {t.benefits.subtitle}
          </p>
        </div>

        <div className="benefits-grid">
          {t.benefits.cards.map((card, index) => (
            <div key={index} className="benefit-card">
              <div className="benefit-icon">
                {benefitIcons[index % benefitIcons.length]}
              </div>
              <h3 className="benefit-title">{card.title}</h3>
              <p className="benefit-desc">{card.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <button className="btn btn-primary btn-lg" onClick={openPartnerModal}>
            <span>{t.benefits.cta}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
};
