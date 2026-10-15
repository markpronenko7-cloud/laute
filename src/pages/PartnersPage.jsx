import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { BlockRenderer } from '../components/builder/BlockRenderer';

export const PartnersPage = () => {
  const { pagesList = [] } = useApp();

  const partnersPage = pagesList.find(p => p.slug === 'partners');
  const blocks = partnersPage?.blocks || [];

  useEffect(() => {
    document.title = 'Партнёрам и дилерам LAUTE — Прямые поставки от завода';
  }, []);

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
          <h1 className="page-title">Сотрудничество с заводом LAUTE</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>Загрузка партнерских условий...</p>
        </div>
      )}
    </div>
  );
};

export default PartnersPage;
