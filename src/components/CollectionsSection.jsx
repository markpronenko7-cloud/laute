import { EditableNode, EditableSection, NativeSectionGate } from './builder/NativeContent';
import React from 'react';
import { useApp } from '../context/AppContext';
import { withBrandWord } from '../utils/brandFormatter';

export const CollectionsSection = () => {
  const { t, siteContent } = useApp();
  const baseUrl = import.meta.env.BASE_URL;

  const collectionsData = [
    {
      id: 'bathroom',
      title: t.home?.spacesBathroom || 'Пространства ванных комнат',
      subtitle: t.home?.spacesBathroomSub || 'Смесители для раковин, накладных чаш и ванн с чистой архитектурной геометрией',
      categoryBadge: (t.home?.spacesBathroom || 'ПРОСТРАНСТВА ВАННЫХ КОМНАТ').toUpperCase(),
      image: `${baseUrl}images/collections/coll-bathroom.jpg`,
      layoutClass: 'collection-card-featured'
    },
    {
      id: 'kitchen',
      title: t.home?.spacesKitchen || 'Кухонные смесители',
      subtitle: t.home?.spacesKitchenSub || 'Функциональные смесители с поворотным и гибким изливом. Модели со встроенным каналом для подключения к системе фильтрации питьевой воды.',
      categoryBadge: (t.home?.spacesKitchen || 'КУХОННЫЕ СМЕСИТЕЛИ').toUpperCase(),
      filterFeatureBadge: t.home?.spacesKitchenFilter || 'С подключением к системе фильтрации чистой воды',
      image: `${baseUrl}images/collections/coll-kitchen.jpg`,
      layoutClass: 'collection-card-standard'
    },
    {
      id: 'shower',
      title: t.home?.spacesShower || 'Душевые зоны и кабины',
      subtitle: t.home?.spacesShowerSub || 'Встраиваемые решения, термостатический контроль, тропический душ и надежные душевые кабины',
      categoryBadge: (t.home?.spacesShower || 'ДУШЕВЫЕ ЗОНЫ И КАБИНЫ').toUpperCase(),
      image: `${baseUrl}images/collections/coll-shower.jpg`,
      layoutClass: 'collection-card-standard'
    },
    {
      id: 'engineering',
      title: t.home?.techBadge || 'Технологии & Материалы',
      subtitle: t.home?.spacesEngineeringSub || 'Нержавеющая сталь SUS304, ЭКО алюминий, испанские картриджи Sedal, латунь А+ и PVD-покрытие',
      categoryBadge: (t.home?.techBadge || 'ТЕХНОЛОГИИ & МАТЕРИАЛЫ').toUpperCase(),
      image: `${baseUrl}images/collections/coll-engineering.jpg`,
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
          {collectionsData.map((item, index) => (
            <div
              key={item.id}
              className={`collection-gallery-item ${item.layoutClass} reveal-on-scroll reveal-delay-${(index % 4) + 1}`}
              onClick={(e) => e.preventDefault()}
              role="presentation"
            >
              <div className="collection-media-wrapper">
                <EditableNode as="img" editKey={"collectionssection-4" + ':' + String(index)} kind="image"
                  src={item.image}
                  alt={item.title}
                  className="collection-media-img"
                  loading="lazy"
                />
                <div className="collection-media-vignette"></div>
              </div>

              {/* Floating Translucent Glass Caption */}
              <div className="collection-glass-caption">
                <div className="collection-caption-top">
                  <EditableNode as="span" editKey={"collectionssection-5" + ':' + String(index)} kind="text" className="collection-pill-tag">{item.categoryBadge}</EditableNode>
                  {item.filterFeatureBadge && (
                    <EditableNode as="span" editKey={"collectionssection-6" + ':' + String(index)} kind="text" className="collection-pill-tag collection-pill-filter">
                      {item.filterFeatureBadge}
                    </EditableNode>
                  )}
                </div>
                <EditableNode as="h3" editKey={"collectionssection-7" + ':' + String(index)} kind="text" className="collection-caption-heading">{item.title}</EditableNode>
                <EditableNode as="p" editKey={"collectionssection-8" + ':' + String(index)} kind="text" className="collection-caption-desc">{item.subtitle}</EditableNode>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
