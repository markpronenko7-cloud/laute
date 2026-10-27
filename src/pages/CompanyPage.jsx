import { getPublishedPage } from '../utils/pagePublication';
import { getCompanyBlocks } from '../data/factoryStory';
import { usePageIntro } from '../components/PageText';
import React from 'react';
import { useApp } from '../context/AppContext';
import { BlockRenderer } from '../components/builder/BlockRenderer';
import { FactoryGallery } from '../components/FactoryStory';

export const CompanyPage = () => {
  const { pagesList = [], lang, t } = useApp();
  const cp = t.companyPage || {};

  const companyPage = getPublishedPage(pagesList.find(p => p.slug === 'company' || p.published?.slug === 'company'), true);
  const intro = usePageIntro('company');
  const rawBlocks = getCompanyBlocks(companyPage?.blocks || []);

  const blocks = rawBlocks.map((source, idx) => {
    const block = idx === 0 && source.type === 'hero' ? { ...source, title: intro.h1 || source.title, subtitle: intro.description || source.subtitle } : source;
    const cleanBadge = typeof block.badge === 'string' ? block.badge.replace(/LAUTEк\s*/gi, 'LAUTE') : block.badge;
    if (lang !== 'ru' && block.id === 'blk-comp-story' && block.title === 'Точность, которую замечаешь.') {
      return { ...block,
        badge: lang === 'en' ? 'THE LAUTE APPROACH' : 'LAUTE ҰСТАНЫМЫ',
        title: lang === 'en' ? 'Precision you can feel.' : 'Сезілетін дәлдік.',
        subtitle: lang === 'en' ? 'Material. Geometry. Surface.' : 'Материал. Геометрия. Бет.',
        content: lang === 'en'
          ? 'A product’s character comes from small decisions: the line of its body, the transition between surfaces, the feel of metal in your hand. We see these details as a whole, from the first form to the final touch.'
          : 'Бұйымның мінезі шағын шешімдерден құралады: корпус сызығы, беттердің түйісуі және қолдағы металдың сезімі. Біз бұл бөлшектерді алғашқы пішіннен соңғы штрихқа дейін тұтас қарастырамыз.',
        buttonText: lang === 'en' ? 'Become a partner' : 'Серіктес болу'
      };
    }
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
          block.id === 'blk-comp-prod-gallery' && block.type === 'gallery' ? <FactoryGallery key={block.id} block={block}/> : <React.Fragment key={block.id || idx}><BlockRenderer
            key={block.id || idx}
            block={block}
            index={idx}
            totalBlocks={blocks.length}
            isEditor={false}
            resolvePageLinks
          />{block.isVisible !== false && block.imageUrl === 'images/factory/craft-study.webp' && <div className="container factory-visual-disclosure"><p>{lang === 'en' ? 'Image: AI-generated conceptual illustration.' : lang === 'kz' ? 'Сурет: ЖИ көмегімен жасалған көркем бейне.' : 'Изображение: концептуальная AI-визуализация.'}</p></div>}</React.Fragment>
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

