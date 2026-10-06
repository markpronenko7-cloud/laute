import React from 'react';
import { useApp } from '../context/AppContext';

export const CollectionsSection = () => {
  const { t } = useApp();
  const baseUrl = import.meta.env.BASE_URL;

  const collectionsData = [
    {
      id: 'bathroom',
      title: 'Ванные пространства',
      subtitle: 'Смесители для раковин, накладных чаш и ванн',
      categoryBadge: 'ВАННАЯ КОМНАТА',
      image: `${baseUrl}images/collections/coll-bathroom.jpg`
    },
    {
      id: 'kitchen',
      title: 'Кухонные системы',
      subtitle: 'Функциональные смесители с выдвижным изливом и мойки',
      categoryBadge: 'КУХНЯ',
      image: `${baseUrl}images/collections/coll-kitchen.jpg`
    },
    {
      id: 'shower',
      title: 'Душевые зоны',
      subtitle: 'Встраиваемые системы, термостаты и тропический душ',
      categoryBadge: 'ДУШ',
      image: `${baseUrl}images/collections/coll-shower.jpg`
    },
    {
      id: 'engineering',
      title: 'Инженерная линия',
      subtitle: 'Высокоточная латунь CW617N и керамические картриджи',
      categoryBadge: 'ТЕХНОЛОГИИ',
      image: `${baseUrl}images/collections/coll-engineering.jpg`
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

        <div className="collections-grid">
          {collectionsData.map((item, index) => (
            <div 
              key={item.id} 
              className={`collection-card reveal-on-scroll reveal-delay-${(index % 4) + 1}`}
              onClick={(e) => e.preventDefault()}
              role="presentation"
            >
              <div className="collection-card-media">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="collection-card-img" 
                  loading="lazy"
                />
                <div className="collection-card-gradient"></div>
              </div>

              <div className="collection-card-glass-content">
                <span className="collection-cat-badge">{item.categoryBadge}</span>
                <h3 className="collection-card-heading">{item.title}</h3>
                <p className="collection-card-text">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
