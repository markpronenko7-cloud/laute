import React from 'react';
import { useApp } from '../context/AppContext';
import { withBrandWord } from '../utils/brandFormatter';

export const CollectionsSection = () => {
  const { t } = useApp();
  const baseUrl = import.meta.env.BASE_URL;

  const collectionsData = [
    {
      id: 'bathroom',
      title: t.home?.spacesBathroom || 'Пространства ванных комнат',
      subtitle: 'Смесители для раковин, накладных чаш и ванн с чистой архитектурной геометрией',
      categoryBadge: (t.home?.spacesBathroom || 'ПРОСТРАНСТВА ВАННЫХ КОМНАТ').toUpperCase(),
      image: `${baseUrl}images/collections/coll-bathroom.jpg`,
      layoutClass: 'collection-card-featured'
    },
    {
      id: 'kitchen',
      title: t.home?.spacesKitchen || 'Кухонные смесители',
      subtitle: 'Функциональные смесители с поворотным и гибким изливом. Модели со встроенным каналом для подключения к системе фильтрации питьевой воды.',
      categoryBadge: (t.home?.spacesKitchen || 'КУХОННЫЕ СМЕСИТЕЛИ').toUpperCase(),
      filterFeatureBadge: t.home?.spacesKitchenFilter || 'С подключением к системе фильтрации чистой воды',
      image: `${baseUrl}images/collections/coll-kitchen.jpg`,
      layoutClass: 'collection-card-standard'
    },
    {
      id: 'shower',
      title: t.home?.spacesShower || 'Душевые зоны и кабины',
      subtitle: 'Встраиваемые решения, термостатический контроль, тропический душ и надежные душевые кабины',
      categoryBadge: (t.home?.spacesShower || 'ДУШЕВЫЕ ЗОНЫ И КАБИНЫ').toUpperCase(),
      image: `${baseUrl}images/collections/coll-shower.jpg`,
      layoutClass: 'collection-card-standard'
    },
    {
      id: 'engineering',
      title: t.home?.techBadge || 'Технологии & Материалы',
      subtitle: 'Нержавеющая сталь SUS304, ЭКО алюминий, испанские картриджи Sedal, латунь А+ и PVD-покрытие',
      categoryBadge: 'ТЕХНОЛОГИИ & МАТЕРИАЛЫ',
      image: `${baseUrl}images/collections/coll-engineering.jpg`,
      layoutClass: 'collection-card-wide'
    }
  ];

  return (
    <section className="section collections-section" id="collections">
      <div className="container">
        <div className="section-title-wrap reveal-on-scroll">
          <span className="section-badge collections-badge">
            {t.home?.collectionsBadge || 'АРХИТЕКТУРНЫЕ ЛИНИИ'}
          </span>
          <h2 className="section-title collections-title">
            {withBrandWord(t.home?.collectionsTitle || 'Коллекции LAUTE')}
          </h2>
          <p className="section-desc collections-desc">
            {withBrandWord(t.home?.collectionsDesc || 'Смесители, душевые зоны, кабины и сантехническое оборудование, объединённые единой философией надежности и чистоты формы.')}
          </p>
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
                <img 
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
                  <span className="collection-pill-tag">{item.categoryBadge}</span>
                  {item.filterFeatureBadge && (
                    <span className="collection-pill-tag collection-pill-filter">
                      {item.filterFeatureBadge}
                    </span>
                  )}
                </div>
                <h3 className="collection-caption-heading">{item.title}</h3>
                <p className="collection-caption-desc">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
