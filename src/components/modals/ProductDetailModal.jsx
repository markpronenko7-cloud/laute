import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  MapPin, 
  CheckCircle, 
  ArrowRight, 
  Scale, 
  Layers, 
  ShieldCheck, 
  Sparkles,
  Package,
  Share2
} from 'lucide-react';

export const ProductDetailModal = () => {
  const { selectedProduct, closeProductModal, openPartnerModal, startComparison, products } = useApp();
  const [selectedPhoto, setSelectedPhoto] = useState(0);

  if (!selectedProduct) return null;

  const baseUrl = import.meta.env.BASE_URL;

  const getImgUrl = (path) => {
    if (!path) return `${baseUrl}laute-logo.png`;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const clean = path.replace(/^\//, '');
    return `${baseUrl}${clean}`;
  };

  const photos = [
    selectedProduct.photo1,
    selectedProduct.photo2,
    selectedProduct.photo3
  ].filter(Boolean);

  const activePhotoSrc = photos[selectedPhoto] ? getImgUrl(photos[selectedPhoto]) : `${baseUrl}images/cat_laute_brand.jpg`;

  const handleCompareClick = () => {
    // Find another item in same category to compare with
    const candidate = products.find(p => p.category === selectedProduct.category && p.article !== selectedProduct.article);
    if (candidate) {
      startComparison(selectedProduct, candidate);
      closeProductModal();
    }
  };

  return (
    <div className="modal-overlay" onClick={closeProductModal}>
      <div 
        className="modal-content product-detail-modal" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '820px', width: '95%' }}
      >
        <button className="modal-close-btn" onClick={closeProductModal} aria-label="Закрыть">
          <X size={20} />
        </button>

        <div className="product-modal-grid">
          {/* Left Column: Gallery */}
          <div className="product-gallery-side">
            <div className="main-image-container">
              <img 
                src={activePhotoSrc} 
                alt={selectedProduct.name} 
                className="main-product-img"
                onError={(e) => {
                  e.target.src = `${baseUrl}images/cat_laute_brand.jpg`;
                }}
              />
              {selectedProduct.isPopular && (
                <span className="product-badge-popular">
                  <Sparkles size={12} />
                  <span>Лидер продаж</span>
                </span>
              )}
            </div>

            {photos.length > 1 && (
              <div className="thumbnail-strip">
                {photos.map((ph, idx) => (
                  <button 
                    key={idx} 
                    type="button" 
                    className={`thumb-btn ${selectedPhoto === idx ? 'active' : ''}`}
                    onClick={() => setSelectedPhoto(idx)}
                  >
                    <img 
                      src={getImgUrl(ph)} 
                      alt="" 
                      onError={(e) => { e.target.src = `${baseUrl}laute-logo.png`; }}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* City Stock Status Panel */}
            <div className="city-stock-card">
              <div className="stock-card-title">
                <MapPin size={14} color="#EA580C" />
                <span>Наличие по городам присутствия LAUTE:</span>
              </div>
              <div className="stock-cities-list">
                {Object.entries(selectedProduct.cityStock || {}).map(([city, count]) => (
                  <div key={city} className="city-stock-row">
                    <span className="city-name">{city}</span>
                    <span className={`city-count ${count > 0 ? 'in-stock' : 'out-of-stock'}`}>
                      {count > 0 ? `В наличии (${count} шт.)` : 'Под заказ'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Specs & Info */}
          <div className="product-info-side">
            <div className="product-category-crumb">
              <span>{selectedProduct.category}</span>
              <span className="crumb-sep">/</span>
              <span className="product-article-tag">Арт. {selectedProduct.article}</span>
            </div>

            <h2 className="product-modal-name">{selectedProduct.name}</h2>

            <div className="product-price-row">
              <div className="price-val">
                {selectedProduct.price ? `${selectedProduct.price.toLocaleString('ru-RU')} ${selectedProduct.currency || '₸'}` : 'По запросу'}
              </div>
              <span className="price-type-note">Официальная базовая цена</span>
            </div>

            <p className="product-description-text">
              {selectedProduct.description}
            </p>

            <div className="product-specs-sheet">
              <div className="sheet-title">Характеристики и размеры:</div>

              {selectedProduct.dimensions && (
                <div className="spec-row">
                  <span className="spec-key">Размеры:</span>
                  <span className="spec-val">{selectedProduct.dimensions}</span>
                </div>
              )}

              {selectedProduct.weight && (
                <div className="spec-row">
                  <span className="spec-key">Вес нетто:</span>
                  <span className="spec-val">{selectedProduct.weight}</span>
                </div>
              )}

              {selectedProduct.volume && (
                <div className="spec-row">
                  <span className="spec-key">Логистический объём:</span>
                  <span className="spec-val">{selectedProduct.volume}</span>
                </div>
              )}

              {selectedProduct.specs && (
                <div className="spec-row">
                  <span className="spec-key">Спецификация:</span>
                  <span className="spec-val">{selectedProduct.specs}</span>
                </div>
              )}

              <div className="spec-row">
                <span className="spec-key">Гарантия:</span>
                <span className="spec-val">5 лет (заводская)</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="product-actions-footer">
              <button 
                type="button" 
                className="btn btn-primary btn-full"
                onClick={() => {
                  closeProductModal();
                  openPartnerModal();
                }}
              >
                <span>Запросить оптовый счёт / Спецификацию</span>
                <ArrowRight size={16} />
              </button>

              <button 
                type="button" 
                className="btn btn-outline btn-full btn-compare-trigger"
                onClick={handleCompareClick}
              >
                <Scale size={15} />
                <span>Сравнить с другой моделью LAUTE</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
