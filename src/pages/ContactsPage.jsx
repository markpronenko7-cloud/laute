import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { BlockRenderer } from '../components/builder/BlockRenderer';

export const ContactsPage = () => {
  const { pagesList = [] } = useApp();

  const contactsPage = pagesList.find(p => p.slug === 'contacts');
  const blocks = contactsPage?.blocks || [];

  useEffect(() => {
    document.title = 'Контакты и представительства завода LAUTE | Официальный сайт';
  }, []);

  return (
    <div className="page-wrapper contacts-page-wrap">
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
          <h1 className="page-title">Контакты завода LAUTE</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>Загрузка контактных данных...</p>
        </div>
      )}
    </div>
  );
};

export default ContactsPage;
