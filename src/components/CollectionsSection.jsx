import { EditableNode, EditableSection, NativeSectionGate } from './builder/NativeContent';
import React from 'react';
import { useApp } from '../context/AppContext';
import { withBrandWord } from '../utils/brandFormatter';
import { catalogRoute } from '../utils/catalogSearch';

export const CollectionsSection = () => {
  const { t, siteContent, navigateTo, lang } = useApp();
  const baseUrl = import.meta.env.BASE_URL;
  const openLabel = lang === 'en' ? 'View in catalog' : lang === 'kz' ? 'Каталогтан көру' : 'Смотреть в каталоге';

  const collectionsData = [
    {
      id: 'bathroom',
      title: 'LAUTE Trump',
      subtitle: 'TRUMP101GQ · TRUMP194',
      image: baseUrl + 'images/campaign/trump.webp',
      route: catalogRoute({ collection: 'trump' }),
      layoutClass: 'collection-card-featured'
    },
    {
      id: 'kitchen',
      title: 'LAUTE Link',
      subtitle: 'LINK003BY-5',
      image: baseUrl + 'images/campaign/link.webp',
      route: catalogRoute({ collection: 'link' }),
      layoutClass: 'collection-card-standard'
    },
    {
      id: 'shower',
      title: 'LAUTE Model-1',
      subtitle: lang === 'en' ? 'Shower cabins' : lang === 'kz' ? 'Душ кабиналары' : 'Душевые кабины',
      image: baseUrl + 'images/products/interiors/model-1.webp',
      route: catalogRoute({ category: 'shower-cabins' }),
      layoutClass: 'collection-card-standard'
    },
    {
      id: 'engineering',
      title: t.home?.techBadge || 'Технологии & Материалы',
      subtitle: t.home?.spacesEngineeringSub || 'Нержавеющая сталь SUS304, ЭКО алюминий, испанские картриджи Sedal, латунь А+ и PVD-покрытие',
      categoryBadge: (t.home?.techBadge || 'ТЕХНОЛОГИИ & МАТЕРИАЛЫ').toUpperCase(),
      image: `${baseUrl}images/collections/solana-materials.webp`,
      imageAlt: 'LAUTE Solana SOL101',
      layoutClass: 'collection-card-wide'
    }
  ];

  return (
    <section className="section collections-section" id="collections">
      <div className="container">
        <div className="section-title-wrap reveal-on-scroll">
          <EditableNode as="span" editKey={"collectionssection-1"} kind="text" className="section-badge collections-badge">
            {siteContent?.homeBlocks?.collections?.badge || t.home?.collectionsBadge || 'АРХИТЕКТУРНЫЕ ЛИНИИ'}
          </EditableNode>
          <EditableNode as="h2" editKey={"collectionssection-2"} kind="text" className="section-title collections-title">
            {withBrandWord(siteContent?.homeBlocks?.collections?.title || t.home?.collectionsTitle || 'Коллекции LAUTE')}
          </EditableNode>
          <EditableNode as="p" editKey={"collectionssection-3"} kind="text" className="section-desc collections-desc">
            {withBrandWord(siteContent?.homeBlocks?.collections?.desc || t.home?.collectionsDesc || 'Смесители, душевые зоны, кабины и сантехническое оборудование, объединённые единой философией надежности и чистоты формы.')}
          </EditableNode>
        </div>

        {/* Editorial Visual Gallery with Varied Scale */}
        <div className="collections-gallery-editorial">
          {collectionsData.map((item, index) => {
            const Frame = item.route ? 'a' : 'div';
            return <Frame
              key={item.id}
              className={`collection-gallery-item ${item.layoutClass} reveal-on-scroll reveal-delay-${(index % 4) + 1}`}
              href={item.route ? baseUrl + item.route : undefined}
              onClick={item.route ? event => {
                if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
                event.preventDefault();
                navigateTo(item.route);
              } : undefined}
            >
              <div className="collection-media-wrapper">
                <EditableNode as="img" editKey={"collectionssection-4" + ':' + String(index)} kind="image"
                  src={item.image}
                  alt={item.imageAlt || item.title}
                  className="collection-media-img"
                  loading="lazy"
                />
                <div className="collection-media-vignette"></div>
              </div>

              {/* Floating Translucent Glass Caption */}
              <div className="collection-glass-caption">
                <div className="collection-caption-top">
                  <EditableNode as="span" editKey={"collectionssection-5" + ':' + String(index)} kind="text" className="collection-pill-tag">{item.route ? openLabel : item.categoryBadge}</EditableNode>
                </div>
                <EditableNode as="h3" editKey={"collectionssection-7" + ':' + String(index)} kind="text" className="collection-caption-heading">{item.title}</EditableNode>
                <EditableNode as="p" editKey={"collectionssection-8" + ':' + String(index)} kind="text" className="collection-caption-desc">{item.subtitle}</EditableNode>
                {item.imageAlt && <small className="collection-model-credit">{item.imageAlt}</small>}
              </div>
            </Frame>;
          })}
        </div>
      </div>
    </section>
  );
};
