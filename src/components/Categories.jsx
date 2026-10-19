import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRight, Layers } from 'lucide-react';
import { CategoryGraphic } from './ProductIllustrations';

export const Categories = () => {
  const { t, openPartnerModal } = useApp();

  return (
    <section id="catalog" className="section section-alt">
      <div className="container">
        <div className="section-header flex-between">
          <div>
            <div className="section-badge">
              <Layers size={14} />
              <span>{t.categories.badge}</span>
            </div>
            <h2 className="section-title">{t.categories.title}</h2>
            <p className="section-subtitle">{t.categories.subtitle}</p>
          </div>

          <button
            className="btn btn-outline"
            onClick={openPartnerModal}
          >
            <span>{t.categories.allCatalogBtn}</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="categories-grid">
          {t.categories.items.map((cat) => (
            <article key={cat.id} className="category-card">
              <div>
                <div className="category-icon-wrap">
                  <CategoryGraphic type={cat.id} style={{ width: '32px', height: '32px' }} />
                </div>
                <h3 className="category-title">{cat.title}</h3>
                <p className="category-desc">{cat.desc}</p>
              </div>

              <div>
                <div className="category-specs-badge">
                  {cat.specs}
                </div>
                <div className="category-link">
                  <span>{t.nav.catalog}</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
