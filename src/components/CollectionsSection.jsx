import React from 'react';
import { useApp } from '../context/AppContext';

export const CollectionsSection = () => {
  const { t } = useApp();
  const baseUrl = import.meta.env.BASE_URL;

  const collectionsData = [
    {
      id: 'bathroom',
      title: 'Ванные пространства',
      subtitle: 'Смесители для раковин, накладных чаш и ванн с чистой архитектурной геометрией',
      categoryBadge: 'ВАННАЯ КОМНАТА',
      image: `${baseUrl}images/collections/coll-bathroom.jpg`,
      layoutClass: 'collection-card-featured'
    },
    {
      id: 'kitchen',
      title: 'Кухонные системы',
      subtitle: 'Функциональные смесители с поворотным и выдвижным изливом для современных моек',
      categoryBadge: 'КУХНЯ',
      image: `${baseUrl}images/collections/coll-kitchen.jpg`,
      layoutClass: 'collection-card-standard'
    },
    {
      id: 'shower',
      title: 'Душевые зоны',
      subtitle: 'Встраиваемые решения, термостатический контроль и тропический душ',
      categoryBadge: 'ДУШЕВАЯ ЗОНА',
      image: `${baseUrl}images/collections/coll-shower.jpg`,
      layoutClass: 'collection-card-standard'
    },
    {
      id: 'engineering',
      title: 'Инженерная линия',
      subtitle: 'Высокоточная латунь CW617N, ресурсные керамические картриджи и многослойные покрытия',
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
            {t.home?.collectionsTitle || 'Коллекции LAUTE'}
          </h2>
          <p className="section-desc collections-desc">
            {t.home?.collectionsDesc || 'Смесители, душевые решения и сантехническое оборудование, объединённые единой философией надежности и чистоты формы.'}
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
