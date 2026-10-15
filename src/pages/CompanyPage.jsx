import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { BlockRenderer } from '../components/builder/BlockRenderer';

export const CompanyPage = () => {
  const { pagesList = [] } = useApp();

  const companyPage = pagesList.find(p => p.slug === 'company');
  const blocks = companyPage?.blocks || [];

  useEffect(() => {
    document.title = 'О компании LAUTE — Завод сантехники и стандарты качества';
  }, []);

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
          <h1 className="page-title">О компании LAUTE</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>Загрузка информации о заводе...</p>
        </div>
      )}
    </div>
  );
};

export default CompanyPage;
