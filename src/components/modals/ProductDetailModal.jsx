import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  FileText,
  ShoppingBag,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { classifyProductImages, formatProductDisplay } from '../../utils/imageHelper';

export const ProductDetailModalInner = ({ selectedProduct, closeProductModal }) => {
  const {
    openAuthModal,
    startComparison,
    addToCart,
    updateCartQuantity,
    getCartItemQuantity,
    openCartModal,
    products,
    getProductPrice,
    partnerAccount,
    adminSession,
    isB2BAuthorized,
    warehousesList = [],
    getStockForSku,
    t,
    lang
  } = useApp();
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [activeTab, setActiveTab] = useState('specs'); // 'specs' | 'drawings' | 'stock'
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const touchStartRef = useRef(null);

  const baseUrl = import.meta.env.BASE_URL;
  const pm = t?.productModal || {};

  // If product is flagged as not found
  if (selectedProduct?.notFound) {
    return (
      <div className="modal-overlay" onClick={closeProductModal}>
        <div
          className="modal-content product-detail-modal"
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: '480px', width: '92%', padding: '36px 28px', textAlign: 'center' }}
        >
          <button className="modal-close-btn" onClick={closeProductModal} aria-label="Закрыть">
            <X size={20} />
          </button>
          <div style={{ marginBottom: 16, display: 'inline-flex', padding: 16, borderRadius: '50%', background: 'rgba(234, 88, 12, 0.12)', color: '#EA580C' }}>
            <Package size={36} />
          </div>
          <h3 style={{ color: '#FFFFFF', fontSize: '1.35rem', marginBottom: 10, fontWeight: 700 }}>
            Товар не найден
          </h3>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 24 }}>
            Запрошенный артикул <strong>{selectedProduct.article}</strong> отсутствует в каталоге или был удалён.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={closeProductModal}
          >
            Вернуться в каталог
          </button>
        </div>
      </div>
    );
  }

  const displayInfo = formatProductDisplay(selectedProduct);
  const imgInfo = classifyProductImages(selectedProduct, baseUrl);

  // Фотографии галереи (смеситель + дополнительные фото + упаковка)
  const galleryPhotos = imgInfo?.allPhotos || [];
  const activePhotoSrc = galleryPhotos[selectedPhoto] || imgInfo?.mainPhoto || `${baseUrl}images/cat_laute_brand.jpg`;

  // Сбор всех медиа-файлов строго ЭТОГО товара (фотографии + чертежи)
  const productMediaList = useMemo(() => {
    if (!selectedProduct) return [];
    const list = [];
    const seen = new Set();

    // 1. Фотографии изделия (главное фото, дополнительные фото, упаковка)
    if (imgInfo.allPhotos && imgInfo.allPhotos.length > 0) {
      imgInfo.allPhotos.forEach((url, i) => {
        if (url && !seen.has(url)) {
          seen.add(url);
          list.push({
            url,
            type: 'photo',
            title: i === 0 ? 'Основной смеситель' : `Фото #${i + 1}`
          });
        }
      });
    }

    // 2. Инженерные чертежи изделия
    if (imgInfo.drawingPhotos && imgInfo.drawingPhotos.length > 0) {
      imgInfo.drawingPhotos.forEach((url, i) => {
        if (url && !seen.has(url)) {
          seen.add(url);
          list.push({
            url,
            type: 'drawing',
            title: imgInfo.drawingPhotos.length > 1 ? `Чертёж #${i + 1}` : 'Чертёж и размеры'
          });
        }
      });
    }

    return list;
  }, [selectedProduct?.article, imgInfo]);

  // Сброс индекса при смене товара
  useEffect(() => {
    setLightboxIndex(null);
  }, [selectedProduct?.article]);

  const openLightbox = (targetUrl) => {
    if (!targetUrl || productMediaList.length === 0) return;
    const foundIdx = productMediaList.findIndex(m => m.url === targetUrl);
    setLightboxIndex(foundIdx >= 0 ? foundIdx : 0);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const handlePrevImage = (e) => {
    if (e) e.stopPropagation();
    if (productMediaList.length <= 1) return;
    setLightboxIndex(prev => (prev === null ? 0 : (prev - 1 + productMediaList.length) % productMediaList.length));
  };

  const handleNextImage = (e) => {
    if (e) e.stopPropagation();
    if (productMediaList.length <= 1) return;
    setLightboxIndex(prev => (prev === null ? 0 : (prev + 1) % productMediaList.length));
  };

  // Переключение клавишами ← и →, закрытие по Esc
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevImage();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextImage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, productMediaList.length]);

  // Поддержка свайпов на телефонах и планшетах
  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length > 0) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    }
  };

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current || !e.changedTouches || e.changedTouches.length === 0) return;
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      if (deltaX < 0) {
        handleNextImage();
      } else {
        handlePrevImage();
      }
    }
  };

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
                style={{ cursor: 'pointer' }}
                onClick={() => openLightbox(activePhotoSrc)}
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
                onClick={() => openLightbox(activePhotoSrc)}
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
                {getProductPrice(selectedProduct) ? `${Number(getProductPrice(selectedProduct)).toLocaleString('ru-RU')} ${selectedProduct.currency || '₸'}` : (pm.onDemand || 'По запросу')}
              </div>
              <span className="price-type-note">{partnerAccount?.role === 'partner' ? 'Твоя цена' : pm.officialBasePrice || 'Официальная базовая цена'}</span>
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
                        onClick={() => openLightbox(imgInfo.drawingPhotos[0])}
                      />
                      <button 
                        type="button" 
                        className="blueprint-zoom-btn"
                        onClick={() => openLightbox(imgInfo.drawingPhotos[0])}
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
                    {warehousesList.length > 0 ? (
                      warehousesList.map((wh) => {
                        const isStaffOrPartner = Boolean(adminSession) || Boolean(isB2BAuthorized);
                        const stockInfo = getStockForSku ? getStockForSku(selectedProduct.article, wh.id) : null;
                        const count = stockInfo && stockInfo.quantity !== null ? stockInfo.quantity : (selectedProduct.cityStock?.[wh.name] ?? null);
                        const isAvailable = count !== null && count > 0;
                        return (
                          <div key={wh.id} className="city-stock-row">
                            <span className="city-name">{wh.name}</span>
                            <span className={`city-count ${isAvailable ? 'in-stock' : 'out-of-stock'}`}>
                              {isStaffOrPartner
                                ? (count === null ? 'Нет данных' : count > 0 ? (pm.inStockWithCount || 'В наличии ({count} шт.)').replace('{count}', count) : (pm.onOrderShort || '0 шт. (под заказ)'))
                                : (isAvailable ? (pm.inStock || 'В наличии') : (pm.onOrder || 'Под заказ от завода'))}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      Object.entries(selectedProduct.cityStock || {}).map(([city, count]) => {
                        const isStaffOrPartner = Boolean(adminSession) || Boolean(isB2BAuthorized);
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
                      })
                    )}
                  </div>
                  {!adminSession && !isB2BAuthorized && (
                    <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Точные остатки в штуках доступны партнёрам:</span>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          closeProductModal();
                          if (openAuthModal) openAuthModal();
                        }}
                      >
                        Войти в B2B кабинет
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="product-actions-footer">
              {getCartItemQuantity(selectedProduct.article) > 0 ? (
                <div style={{ display: 'flex', gap: '10px', width: '100%', flexWrap: 'wrap' }}>
                  <div className="laute-card-qty-stepper" style={{ flex: '0 0 auto' }}>
                    <button
                      type="button"
                      className="laute-card-qty-btn"
                      onClick={() =>
                        updateCartQuantity(
                          selectedProduct.article,
                          getCartItemQuantity(selectedProduct.article) - 1
                        )
                      }
                      aria-label="Уменьшить количество"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="laute-card-qty-val">
                      {getCartItemQuantity(selectedProduct.article)} шт.
                    </span>
                    <button
                      type="button"
                      className="laute-card-qty-btn"
                      onClick={() => addToCart(selectedProduct, 1)}
                      aria-label="Увеличить количество"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ flex: '1 1 180px' }}
                    onClick={() => {
                      closeProductModal();
                      openCartModal();
                    }}
                  >
                    <ShoppingBag size={16} />
                    <span>{t?.catalogPage?.openCartBtn || 'Корзина заявки'}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary btn-full"
                  onClick={() => addToCart(selectedProduct, 1)}
                >
                  <ShoppingBag size={16} />
                  <span>{t?.catalogPage?.addToCartBtn || 'Добавить в корзину'}</span>
                </button>
              )}

              <button 
                type="button" 
                className="btn btn-outline btn-full btn-compare-trigger"
                onClick={handleCompareClick}
              >
                <Scale size={15} />
                <span>{pm.compare || t?.catalogPage?.compareBtn || 'Сравнить с другой моделью LAUTE'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Fullscreen Lightbox for Drawing or Photo with Next/Prev Arrows */}
        {lightboxIndex !== null && productMediaList[lightboxIndex] && (
          <div 
            className="product-lightbox-overlay" 
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label="Просмотр изображений товара"
          >
            {/* Close button */}
            <button 
              type="button" 
              className="lightbox-close-btn" 
              onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
              aria-label="Закрыть увеличение"
              title="Закрыть (Esc)"
            >
              <X size={22} />
            </button>

            {/* Left Arrow (Previous) */}
            {productMediaList.length > 1 && (
              <button
                type="button"
                className="lightbox-nav-btn lightbox-prev-btn"
                onClick={handlePrevImage}
                aria-label="Предыдущее изображение"
                title="Предыдущее (←)"
              >
                <ChevronLeft size={30} />
              </button>
            )}

            {/* Lightbox Content Container with Touch Swipe */}
            <div 
              className="product-lightbox-content" 
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <img 
                key={productMediaList[lightboxIndex].url}
                src={productMediaList[lightboxIndex].url} 
                alt={`${displayInfo.title} — ${productMediaList[lightboxIndex].title}`} 
                className="lightbox-img" 
              />

              {/* Counter and Type Badge */}
              <div className="lightbox-caption-badge">
                <span className="lightbox-badge-type">
                  {productMediaList[lightboxIndex].type === 'drawing' ? 'Инженерный чертёж' : 'Фотография изделия'}
                </span>
                {productMediaList.length > 1 && (
                  <span className="lightbox-badge-counter">
                    {lightboxIndex + 1} / {productMediaList.length}
                  </span>
                )}
              </div>
            </div>

            {/* Right Arrow (Next) */}
            {productMediaList.length > 1 && (
              <button
                type="button"
                className="lightbox-nav-btn lightbox-next-btn"
                onClick={handleNextImage}
                aria-label="Следующее изображение"
                title="Следующее (→)"
              >
                <ChevronRight size={30} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

class ProductModalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error('ProductDetailModal crashed:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="modal-overlay" onClick={this.props.onClose}>
          <div
            className="modal-content product-detail-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '480px', width: '92%', padding: '36px 24px', textAlign: 'center' }}
          >
            <h3 style={{ color: '#FFFFFF', marginBottom: 12 }}>Не удалось открыть товар</h3>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: 20 }}>
              Произошла непредвиденная ошибка при отображении карточки. Пожалуйста, попробуйте снова.
            </p>
            <button type="button" className="btn btn-primary" onClick={this.props.onClose}>
              Закрыть
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export const ProductDetailModal = () => {
  const { selectedProduct, closeProductModal } = useApp();
  if (!selectedProduct) return null;

  return (
    <ProductModalErrorBoundary onClose={closeProductModal}>
      <ProductDetailModalInner
        key={selectedProduct.article || 'product-modal'}
        selectedProduct={selectedProduct}
        closeProductModal={closeProductModal}
      />
    </ProductModalErrorBoundary>
  );
};

export default ProductDetailModal;
