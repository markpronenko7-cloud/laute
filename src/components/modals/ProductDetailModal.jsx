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
  Ruler,
  Maximize2,
  FileText
} from 'lucide-react';
import { classifyProductImages, formatProductDisplay } from '../../utils/imageHelper';

export const ProductDetailModal = () => {
  const { selectedProduct, closeProductModal, openPartnerModal, startComparison, products, adminSession, t, lang } = useApp();
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [activeTab, setActiveTab] = useState('specs'); // 'specs' | 'drawings' | 'stock'
  const [lightboxImg, setLightboxImg] = useState(null);

  if (!selectedProduct) return null;

  const baseUrl = import.meta.env.BASE_URL;
  const pm = t.productModal || {};

  const displayInfo = formatProductDisplay(selectedProduct);
  const imgInfo = classifyProductImages(selectedProduct, baseUrl);

  // Фотографии галереи (смеситель + дополнительные фото + упаковка)
  const galleryPhotos = imgInfo.allPhotos;
  const activePhotoSrc = galleryPhotos[selectedPhoto] || imgInfo.mainPhoto;

  const handleCompareClick = () => {
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
        style={{ maxWidth: '880px', width: '95%' }}
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
                alt={displayInfo.title} 
                className="main-product-img"
                onError={(e) => {
                  e.target.src = `${baseUrl}images/cat_laute_brand.jpg`;
                }}
              />
              {selectedProduct.isPopular && (
                <span className="product-badge-popular">
                  <Sparkles size={12} />
                  <span>{pm.popularBadge || 'Лидер продаж'}</span>
                </span>
              )}

              {/* Lightbox Trigger */}
              <button 
                type="button" 
                className="img-enlarge-btn"
                onClick={() => setLightboxImg(activePhotoSrc)}
                title="Увеличить изображение"
              >
                <Maximize2 size={14} />
              </button>
            </div>

            {/* Thumbnail Strip */}
            {galleryPhotos.length > 1 && (
              <div className="thumbnail-strip">
                {galleryPhotos.map((ph, idx) => (
                  <button 
                    key={idx} 
                    type="button" 
                    className={`thumb-btn ${selectedPhoto === idx ? 'active' : ''}`}
                    onClick={() => setSelectedPhoto(idx)}
                    title={idx === 0 ? 'Основной смеситель' : `Фото #${idx + 1}`}
                  >
                    <img 
                      src={ph} 
                      alt="" 
                      onError={(e) => { e.target.src = `${baseUrl}laute-logo.png`; }}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Быстрый переход к чертежу, если он доступен */}
            {imgInfo.drawingPhotos.length > 0 && (
              <button 
                type="button" 
                className={`quick-drawing-btn ${activeTab === 'drawings' ? 'active' : ''}`}
                onClick={() => setActiveTab('drawings')}
              >
                <Ruler size={15} color="#0EA5E9" />
                <span>Смотреть чертёж и размеры изделия</span>
              </button>
            )}

            {/* Мини-панель ключевых параметров */}
            <div className="product-meta-summary-card">
              <div className="meta-summary-row">
                <span className="summary-label">Гарантия завода:</span>
                <span className="summary-val">5 лет (официальная)</span>
              </div>
              <div className="meta-summary-row">
                <span className="summary-label">Стандарт:</span>
                <span className="summary-val">Европейский EN 817</span>
              </div>
              {selectedProduct.material && (
                <div className="meta-summary-row">
                  <span className="summary-label">Материал:</span>
                  <span className="summary-val">{selectedProduct.material}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Tabs & Product Info */}
          <div className="product-info-side">
            <div className="product-category-crumb">
              <span>{selectedProduct.category}</span>
              <span className="crumb-sep">/</span>
              <span className="product-article-tag">{(pm.art || 'Арт.')} {selectedProduct.article}</span>
            </div>

            <h2 className="product-modal-name">{displayInfo.title}</h2>

            {displayInfo.subtitle && (
              <div className="product-modal-subtitle">
                {displayInfo.subtitle}
              </div>
            )}

            <div className="product-price-row">
              <div className="price-val">
                {selectedProduct.price ? `${selectedProduct.price.toLocaleString('ru-RU')} ${selectedProduct.currency || '₸'}` : (pm.onDemand || 'По запросу')}
              </div>
              <span className="price-type-note">{pm.officialBasePrice || 'Официальная базовая цена'}</span>
            </div>

            {/* TAB CONTROLS: Характеристики | Размеры и чертежи | Наличие на складах */}
            <div className="modal-tabs-header">
              <button 
                type="button" 
                className={`modal-tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
                onClick={() => setActiveTab('specs')}
              >
                <FileText size={14} />
                <span>Характеристики</span>
              </button>

              <button 
                type="button" 
                className={`modal-tab-btn ${activeTab === 'drawings' ? 'active' : ''}`}
                onClick={() => setActiveTab('drawings')}
              >
                <Ruler size={14} />
                <span>Размеры и чертежи</span>
                {imgInfo.drawingPhotos.length > 0 && <span className="tab-pill">1</span>}
              </button>

              <button 
                type="button" 
                className={`modal-tab-btn ${activeTab === 'stock' ? 'active' : ''}`}
                onClick={() => setActiveTab('stock')}
              >
                <MapPin size={14} />
                <span>Склады</span>
              </button>
            </div>

            {/* TAB CONTENT 1: SPECS */}
            {activeTab === 'specs' && (
              <div className="tab-panel tab-panel-specs">
                <p className="product-description-text">
                  {selectedProduct.description || 'Высококачественное сантехническое изделие бренда LAUTE, спроектированное для долговечной безаварийной эксплуатации в европейском стандарте надежности.'}
                </p>

                <div className="product-specs-sheet">
                  {selectedProduct.dimensions && (
                    <div className="spec-row">
                      <span className="spec-key">{pm.dimensions || 'Габариты / излив:'}</span>
                      <span className="spec-val">{selectedProduct.dimensions}</span>
                    </div>
                  )}

                  {selectedProduct.specs && (
                    <div className="spec-row">
                      <span className="spec-key">{pm.specs || 'Спецификация:'}</span>
                      <span className="spec-val">{selectedProduct.specs}</span>
                    </div>
                  )}

                  {selectedProduct.color && (
                    <div className="spec-row">
                      <span className="spec-key">Цвет покрытия:</span>
                      <span className="spec-val">{displayInfo.color || selectedProduct.color}</span>
                    </div>
                  )}

                  {selectedProduct.collection && (
                    <div className="spec-row">
                      <span className="spec-key">Серия / Коллекция:</span>
                      <span className="spec-val">{displayInfo.series || selectedProduct.collection}</span>
                    </div>
                  )}

                  {selectedProduct.weight && (
                    <div className="spec-row">
                      <span className="spec-key">{pm.weightNet || 'Вес нетто:'}</span>
                      <span className="spec-val">{selectedProduct.weight} кг</span>
                    </div>
                  )}

                  {selectedProduct.volume && (
                    <div className="spec-row">
                      <span className="spec-key">{pm.volume || 'Логистический объём:'}</span>
                      <span className="spec-val">{selectedProduct.volume} м³</span>
                    </div>
                  )}

                  {selectedProduct.installType && (
                    <div className="spec-row">
                      <span className="spec-key">Тип установки:</span>
                      <span className="spec-val">{selectedProduct.installType}</span>
                    </div>
                  )}

                  <div className="spec-row">
                    <span className="spec-key">{pm.warranty || 'Гарантия:'}</span>
                    <span className="spec-val">{pm.warrantyVal || '5 лет (заводская официальная)'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: РАЗМЕРЫ И ЧЕРТЕЖИ (DEDICATED BLUEPRINT SECTION) */}
            {activeTab === 'drawings' && (
              <div className="tab-panel tab-panel-drawings">
                <div className="drawing-panel-notice">
                  <Ruler size={16} color="#0EA5E9" />
                  <div>
                    <strong>Инженерная схема и габаритные размеры</strong>
                    <p>Точные параметры для монтажа, подключения и согласования спецификации объекта.</p>
                  </div>
                </div>

                {imgInfo.drawingPhotos.length > 0 ? (
                  <div className="blueprint-display-card">
                    <div className="blueprint-img-wrap">
                      <img 
                        src={imgInfo.drawingPhotos[0]} 
                        alt={`Чертёж ${displayInfo.title}`} 
                        className="blueprint-img"
                        onClick={() => setLightboxImg(imgInfo.drawingPhotos[0])}
                      />
                      <button 
                        type="button" 
                        className="blueprint-zoom-btn"
                        onClick={() => setLightboxImg(imgInfo.drawingPhotos[0])}
                      >
                        <Maximize2 size={13} />
                        <span>Открыть в полном размере</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="blueprint-placeholder-card">
                    <Ruler size={32} color="#94A3B8" />
                    <h4>Габаритная спецификация изделия</h4>
                    <p>Официальные монтажные размеры предоставлены в табличной форме:</p>
                  </div>
                )}

                {/* Таблица габаритов */}
                <div className="dimensions-data-table">
                  <div className="dim-row">
                    <span className="dim-name">Габариты и вылет:</span>
                    <span className="dim-value">{selectedProduct.dimensions || 'По стандарту монтажа'}</span>
                  </div>
                  <div className="dim-row">
                    <span className="dim-name">Артикул изделия:</span>
                    <span className="dim-value">{selectedProduct.article}</span>
                  </div>
                  <div className="dim-row">
                    <span className="dim-name">Тип монтажного узла:</span>
                    <span className="dim-value">{selectedProduct.installType || 'Стандартное подключение 1/2"'}</span>
                  </div>
                  {selectedProduct.weight && (
                    <div className="dim-row">
                      <span className="dim-name">Масса изделия:</span>
                      <span className="dim-value">{selectedProduct.weight} кг</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: НАЛИЧИЕ НА СКЛАДАХ */}
            {activeTab === 'stock' && (
              <div className="tab-panel tab-panel-stock">
                <div className="city-stock-card" style={{ marginTop: '4px' }}>
                  <div className="stock-card-title">
                    <MapPin size={15} color="#EA580C" />
                    <span>{pm.stockInCities || 'Наличие по филиалам LAUTE:'}</span>
                  </div>
                  <div className="stock-cities-list">
                    {Object.entries(selectedProduct.cityStock || {}).map(([city, count]) => {
                      const isStaffOrPartner = Boolean(adminSession) || Boolean(localStorage.getItem('laute_partner_token'));
                      return (
                        <div key={city} className="city-stock-row">
                          <span className="city-name">{city}</span>
                          <span className={`city-count ${count > 0 ? 'in-stock' : 'out-of-stock'}`}>
                            {isStaffOrPartner 
                              ? (count > 0 ? (pm.inStockWithCount || 'В наличии ({count} шт.)').replace('{count}', count) : (pm.onOrderShort || 'Под заказ'))
                              : (count > 0 ? (pm.inStock || 'В наличии') : (pm.onOrder || 'Под заказ от завода'))}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

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
                <span>{pm.requestQuote || 'Запросить оптовый счёт / Спецификацию'}</span>
                <ArrowRight size={16} />
              </button>

              <button 
                type="button" 
                className="btn btn-outline btn-full btn-compare-trigger"
                onClick={handleCompareClick}
              >
                <Scale size={15} />
                <span>{pm.compare || 'Сравнить с другой моделью LAUTE'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Fullscreen Lightbox for Drawing or Photo */}
        {lightboxImg && (
          <div className="product-lightbox-overlay" onClick={() => setLightboxImg(null)}>
            <div className="product-lightbox-content" onClick={(e) => e.stopPropagation()}>
              <button 
                type="button" 
                className="lightbox-close-btn" 
                onClick={() => setLightboxImg(null)}
                aria-label="Закрыть увеличение"
              >
                <X size={24} />
              </button>
              <img src={lightboxImg} alt="Увеличенное изображение" className="lightbox-img" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailModal;
