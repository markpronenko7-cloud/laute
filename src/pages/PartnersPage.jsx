import { getPublishedPage } from '../utils/pagePublication';
import { usePageIntro } from '../components/PageText';
import React from 'react';
import { useApp } from '../context/AppContext';
import { BlockRenderer } from '../components/builder/BlockRenderer';

export const PartnersPage = () => {
  const { pagesList = [], lang, t } = useApp();
  const pp = t.partnersPage || {};

  const partnersPage = getPublishedPage(pagesList.find(p => p.slug === 'partners' || p.published?.slug === 'partners'), true);
  const intro = usePageIntro('partners');
  const rawBlocks = partnersPage?.blocks || [];

  const blocks = rawBlocks.map((source, idx) => {
    const block = idx === 0 && source.type === 'hero' ? { ...source, title: intro.h1 || source.title, subtitle: intro.description || source.subtitle } : source;
    if (lang !== 'ru' && idx === 0 && block.type === 'hero') {
      return {
        ...block,
        badge: pp.badge || block.badge,
        title: pp.title || block.title,
        subtitle: pp.subtitle || block.subtitle,
        buttonText: pp.formSubmit || block.buttonText
      };
    }
    if (lang !== 'ru' && block.type === 'features') {
      return {
        ...block,
        title: pp.advTitle || block.title,
        subtitle: pp.coopDesc || block.subtitle
      };
    }
    if (lang !== 'ru' && block.type === 'form_lead') {
      return {
        ...block,
        title: pp.formTitle || block.title,
        subtitle: pp.formDesc || block.subtitle
      };
    }
    return block;
  });

  return (
    <div className="page-wrapper partners-page-wrap">
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
          <h1 className="page-title">{pp.title || 'Сотрудничество с заводом LAUTE'}</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>{pp.subtitle || 'Загрузка партнерских условий...'}</p>
        </div>
      )}
    </div>
  );
};

export default PartnersPage;

