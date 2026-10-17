import React from 'react';
import { useApp } from '../context/AppContext';
import { BlockRenderer } from '../components/builder/BlockRenderer';

export const ContactsPage = () => {
  const { pagesList = [], lang, t } = useApp();
  const ctp = t.contactsPage || {};

  const contactsPage = pagesList.find(p => p.slug === 'contacts');
  const rawBlocks = contactsPage?.blocks || [];

  const blocks = rawBlocks.map((block, idx) => {
    if (lang !== 'ru' && idx === 0 && block.type === 'hero') {
      return {
        ...block,
        badge: ctp.badge || block.badge,
        title: ctp.title || block.title,
        subtitle: ctp.subtitle || block.subtitle,
        buttonText: ctp.submitBtn || block.buttonText
      };
    }
    if (lang !== 'ru' && block.type === 'contact_cards') {
      return {
        ...block,
        title: ctp.salesTitle || block.title
      };
    }
    if (lang !== 'ru' && block.type === 'form_lead') {
      return {
        ...block,
        title: ctp.formTitle || block.title,
        subtitle: ctp.formDesc || block.subtitle
      };
    }
    return block;
  });

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
          <h1 className="page-title">{ctp.title || 'Контакты завода LAUTE'}</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>{ctp.subtitle || 'Загрузка контактных данных...'}</p>
        </div>
      )}
    </div>
  );
};

export default ContactsPage;

