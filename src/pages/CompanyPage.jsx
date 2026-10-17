import React from 'react';
import { useApp } from '../context/AppContext';
import { BlockRenderer } from '../components/builder/BlockRenderer';

export const CompanyPage = () => {
  const { pagesList = [], lang, t } = useApp();
  const cp = t.companyPage || {};

  const companyPage = pagesList.find(p => p.slug === 'company');
  const rawBlocks = companyPage?.blocks || [];

  const blocks = rawBlocks.map((block, idx) => {
    const cleanBadge = typeof block.badge === 'string' ? block.badge.replace(/LAUTEк\s*/gi, 'LAUTE') : block.badge;
    if (lang !== 'ru' && idx === 0 && block.type === 'hero') {
      return {
        ...block,
        badge: cp.badge || cleanBadge,
        title: cp.title || block.title,
        subtitle: cp.subtitle || block.subtitle
      };
    }
    if (lang !== 'ru' && block.type === 'gallery') {
      return {
        ...block,
        title: cp.productionTitle || block.title,
        subtitle: cp.productionDesc || block.subtitle
      };
    }
    if (lang !== 'ru' && block.type === 'cta_banner') {
      return {
        ...block,
        title: cp.ctaTitle || block.title,
        subtitle: cp.ctaDesc || block.subtitle,
        buttonText: cp.ctaBtn || block.buttonText
      };
    }
    return { ...block, badge: cleanBadge };
  });

  return (
    <div className="page-wrapper company-page-wrap">
      {blocks.length > 0 ? (
        blocks.map((block, idx) => (
          <BlockRenderer
            key={block.id || idx}
            block={block}
            index={idx}
            totalBlocks={blocks.length}
            isEditor={false}
          />
        ))
      ) : (
        <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
          <h1 className="page-title">{cp.title || 'О компании LAUTE'}</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>{cp.subtitle || 'Загрузка информации о заводе...'}</p>
        </div>
      )}
    </div>
  );
};

export default CompanyPage;

