import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { BlockRenderer } from './BlockRenderer';

export const CustomPageRenderer = ({ page }) => {
  const { currentRoute, pagesList = [] } = useApp();

  // Find page by currentRoute if page prop is not passed directly
  const activePage = page || pagesList.find(p => p.slug === currentRoute || p.route === `/${currentRoute}`);

  useEffect(() => {
    if (activePage?.title) {
      document.title = `${activePage.title} | LAUTE`;
    }
  }, [activePage]);

  if (!activePage) {
    return (
      <div className="page-wrapper" style={{ padding: '120px 20px', textAlign: 'center' }}>
        <div className="container">
          <h1 className="page-title" style={{ fontSize: 32, marginBottom: 12 }}>Страница не найдена</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>
            Запрошенная страница не существует или была перемещена в панели управления LAUTE.
          </p>
          <a href="#home" className="btn btn-primary">
            Вернуться на главную
          </a>
        </div>
      </div>
    );
  }

  const blocks = activePage.blocks || [];

  return (
    <div className={`page-wrapper custom-page-${activePage.slug}`}>
      {blocks.length === 0 ? (
        <div className="container" style={{ padding: '100px 20px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          <h1 className="page-title" style={{ marginBottom: 12 }}>{activePage.title}</h1>
          <p>{activePage.description || 'Содержимое страницы формируется в визуальном конструкторе LAUTE.'}</p>
        </div>
      ) : (
        blocks.map((block, idx) => (
          <BlockRenderer
            key={block.id || idx}
            block={block}
            index={idx}
            totalBlocks={blocks.length}
            isEditor={false}
          />
        ))
      )}
    </div>
  );
};
