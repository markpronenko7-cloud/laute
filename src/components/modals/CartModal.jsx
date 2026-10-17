import React, { useState, useEffect } from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  UserCheck,
  Clock,
  AlertCircle,
  Send
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { classifyProductImages } from '../../utils/imageHelper';
import {
  submitCartOrderInquiry,
  resolveManagerByCity,
  fetchTerritoryRules,
  getTerritoryRulesSync
} from '../../services/adminApi';

const CartModal = () => {
  const {
    t,
    lang,
    isCartModalOpen,
    openCartModal,
    closeCartModal,
    cartItems,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartDistinctCount,
    cartTotalUnits,
    cartTotalKnownAmount,
    cartHasPriceOnRequest,
    navigateTo,
    currentRoute
  } = useApp();

  const baseUrl = import.meta.env.BASE_URL;
  const ct = t?.catalogPage || {};

  // step: 'cart' | 'form' | 'success'
  const [step, setStep] = useState('cart');
  const [territoryRules, setTerritoryRules] = useState(() => getTerritoryRulesSync());

  // Поля формы заявки без регистрации
  const [customerName, setCustomerName] = useState('');
  const [contact, setContact] = useState('');
  const [city, setCity] = useState('');
  const [comment, setComment] = useState('');
  const [consent, setConsent] = useState(true);
  const [honeypot, setHoneypot] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [submittedOrder, setSubmittedOrder] = useState(null);

  useEffect(() => {
    if (isCartModalOpen) {
      fetchTerritoryRules()
        .then((rules) => {
          if (Array.isArray(rules) && rules.length > 0) {
            setTerritoryRules(rules);
          }
        })
        .catch(() => {});
    }
  }, [isCartModalOpen]);

  const handleClose = () => {
    closeCartModal();
    if (step === 'success') {
      setTimeout(() => {
        setStep('cart');
        setSubmittedOrder(null);
        setFormError('');
      }, 250);
    }
  };

  const liveRoutingPreview = city.trim().length >= 2
    ? resolveManagerByCity(city, territoryRules)
    : null;

  const handleProceedToForm = () => {
    if (cartItems.length === 0) return;
    setFormError('');
    setStep('form');
  };

  const handleSubmitInquiry = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setFormError('');

    setIsSubmitting(true);
    try {
      const result = await submitCartOrderInquiry({
        customerName,
        contact,
        city,
        comment,
        consent,
        honeypot,
        items: cartItems.map((it) => {
          const { mainPhoto } = classifyProductImages(it, baseUrl);
          return {
            article: it.article,
            title: it.title,
            series: it.series,
            category: it.category,
            quantity: it.quantity,
            price: it.price,
            image: mainPhoto || ''
          };
        }),
        lang
      });

      if (result && result.success && result.order) {
        setSubmittedOrder(result.order);
        clearCart();
        setStep('success');
        setCustomerName('');
        setContact('');
        setComment('');
      }
    } catch (err) {
      // НЕ очищаем корзину при ошибке отправки
      const code = err?.code || err?.message || '';
      if (code === 'INVALID_NAME') {
        setFormError(ct.inquiryErrorName || 'Пожалуйста, укажите ваше имя (не менее 2 символов).');
      } else if (code === 'INVALID_CONTACT') {
        setFormError(ct.inquiryErrorContact || 'Укажите корректный номер телефона (от 10 цифр) или действующий Email.');
      } else if (code === 'INVALID_CITY') {
        setFormError(ct.inquiryErrorCity || 'Пожалуйста, укажите город.');
      } else if (code === 'CONSENT_REQUIRED') {
        setFormError(ct.inquiryErrorConsent || 'Необходимо подтвердить согласие на обработку персональных данных.');
      } else if (code === 'EMPTY_CART') {
        setFormError(ct.inquiryErrorEmpty || 'Корзина пуста. Добавьте хотя бы один товар.');
      } else if (code === 'RATE_LIMIT') {
        setFormError(ct.inquiryErrorRateLimit || 'Пожалуйста, подождите несколько секунд перед повторной отправкой.');
      } else {
        setFormError(err?.message || 'Ошибка при отправке заявки. Ваша корзина сохранена.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (val) => {
    const num = Number(val);
    if (!Number.isFinite(num) || num <= 0) return ct.priceOnRequest || 'Цена по запросу';
    return `${num.toLocaleString('ru-RU')} ₽`;
  };

  // Плавающая кнопка корзины, если модальное окно закрыто, но в корзине есть товары (и мы не в админке)
  if (!isCartModalOpen) {
    if (cartDistinctCount > 0 && currentRoute !== 'admin') {
      return (
        <button
          type="button"
          className="laute-floating-cart-pill"
          onClick={() => {
            setStep('cart');
            setFormError('');
            openCartModal();
          }}
          aria-label={ct.openCartBtn || 'Корзина заявки'}
        >
          <span className="laute-floating-cart-icon">
            <ShoppingBag size={18} />
            <span className="laute-floating-cart-badge">{cartTotalUnits}</span>
          </span>
          <span className="laute-floating-cart-info">
            <span className="laute-floating-cart-title">{ct.openCartBtn || 'Корзина заявки'}</span>
            <span className="laute-floating-cart-sum">
              {cartTotalKnownAmount > 0
                ? `${cartTotalKnownAmount.toLocaleString('ru-RU')} ₽`
                : `${cartDistinctCount} поз.`}
            </span>
          </span>
        </button>
      );
    }
    return null;
  }

  return (
    <div className="laute-cart-backdrop" onClick={handleClose} role="dialog" aria-modal="true">
      <div className="laute-cart-drawer" onClick={(e) => e.stopPropagation()}>
        {/* ВЕРХНЯЯ ШАПКА КОРЗИНЫ */}
        <div className="laute-cart-header">
          <div className="laute-cart-header-left">
            <div className="laute-cart-header-icon">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h2 className="laute-cart-title">
                {step === 'form'
                  ? ct.inquiryFormTitle || 'Отправка заявки региональному менеджеру'
                  : step === 'success'
                  ? ct.inquirySuccessTitle || 'Заявка принята в обработку'
                  : ct.cartTitle || 'Корзина заявки'}
              </h2>
              <p className="laute-cart-subtitle">
                {step === 'form'
                  ? ct.inquiryFormSubtitle || 'Укажите контактные данные и город для передачи заявки ответственному менеджеру'
                  : ct.cartSubtitle || 'Оформление первичной заявки без регистрации по публичным ценам каталога'}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="laute-cart-close-btn"
            onClick={handleClose}
            aria-label={t?.modals?.close || 'Закрыть'}
          >
            <X size={20} />
          </button>
        </div>

        {/* ОСНОВНОЕ СОДЕРЖИМОЕ: ШАГ 1 — СПИСОК ПОЗИЦИЙ КОРЗИНЫ */}
        {step === 'cart' && (
          <>
            <div className="laute-cart-body">
              {cartItems.length === 0 ? (
                <div className="laute-cart-empty">
                  <div className="laute-cart-empty-icon">
                    <ShoppingBag size={36} strokeWidth={1.5} />
                  </div>
                  <h3>{ct.cartEmptyTitle || 'Корзина пока пуста'}</h3>
                  <p>
                    {ct.cartEmptyDesc ||
                      'Добавьте интересующие модели из каталога LAUTE, укажите необходимое количество и отправьте заявку региональному менеджеру.'}
                  </p>
                  <button
                    type="button"
                    className="laute-cart-primary-btn"
                    onClick={() => {
                      handleClose();
                      if (currentRoute !== 'catalog') {
                        navigateTo('catalog');
                      }
                    }}
                  >
                    {ct.cartBrowseBtn || 'Перейти к выбору товаров'}
                  </button>
                </div>
              ) : (
                <div className="laute-cart-items-list">
                  <div className="laute-cart-list-toolbar">
                    <span className="laute-cart-list-count">
                      {ct.cartSummaryItems || 'Позиций в заявке'}: <strong>{cartDistinctCount}</strong> ({cartTotalUnits} шт.)
                    </span>
                    <button
                      type="button"
                      className="laute-cart-clear-link"
                      onClick={clearCart}
                    >
                      <Trash2 size={14} />
                      <span>{ct.cartClearBtn || 'Очистить корзину'}</span>
                    </button>
                  </div>

                  {cartItems.map((item) => {
                    const { mainPhoto } = classifyProductImages(item, baseUrl);
                    const photoSrc = mainPhoto || null;

                    return (
                      <div key={item.article} className="laute-cart-item-card">
                        <div className="laute-cart-item-media">
                          {photoSrc ? (
                            <img
                              src={photoSrc}
                              alt={item.title}
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="laute-cart-item-noimg">LAUTE</div>
                          )}
                        </div>

                        <div className="laute-cart-item-main">
                          <div className="laute-cart-item-top">
                            <div>
                              <span className="laute-cart-item-sku">
                                {ct.skuLabel || 'АРТ.'} {item.article}
                              </span>
                              <h4 className="laute-cart-item-name">{item.title}</h4>
                            </div>

                            <button
                              type="button"
                              className="laute-cart-item-remove"
                              onClick={() => removeFromCart(item.article)}
                              title={ct.cartRemoveItem || 'Удалить позицию'}
                              aria-label={ct.cartRemoveItem || 'Удалить позицию'}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <div className="laute-cart-item-bottom">
                            <div className="laute-cart-item-price-block">
                              <span className="laute-cart-meta-label">
                                {ct.cartItemPrice || 'Публичная цена'}:
                              </span>
                              <span className="laute-cart-unit-price">
                                {item.hasKnownPrice
                                  ? formatCurrency(item.price)
                                  : ct.priceOnRequest || 'Цена по запросу'}
                              </span>
                            </div>

                            <div className="laute-cart-qty-control">
                              <button
                                type="button"
                                className="laute-cart-qty-btn"
                                onClick={() => updateCartQuantity(item.article, item.quantity - 1)}
                                aria-label="Уменьшить количество"
                              >
                                <Minus size={14} />
                              </button>
                              <input
                                type="number"
                                min="1"
                                max="9999"
                                className="laute-cart-qty-input"
                                value={item.quantity}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10);
                                  if (!isNaN(val) && val > 0) {
                                    updateCartQuantity(item.article, val);
                                  }
                                }}
                                aria-label={ct.cartItemQty || 'Количество'}
                              />
                              <button
                                type="button"
                                className="laute-cart-qty-btn"
                                onClick={() => updateCartQuantity(item.article, item.quantity + 1)}
                                aria-label="Увеличить количество"
                              >
                                <Plus size={14} />
                              </button>
                            </div>

                            <div className="laute-cart-item-subtotal-block">
                              <span className="laute-cart-meta-label">
                                {ct.cartItemSubtotal || 'Сумма по позиции'}:
                              </span>
                              <strong className="laute-cart-line-subtotal">
                                {item.hasKnownPrice
                                  ? formatCurrency(item.lineSubtotal)
                                  : ct.priceOnRequest || 'Цена по запросу'}
                              </strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="laute-cart-footer">
                <div className="laute-cart-summary-box">
                  <div className="laute-cart-summary-row">
                    <span>{ct.cartSummaryItems || 'Позиций в заявке'}:</span>
                    <strong>{cartDistinctCount} ({cartTotalUnits} шт.)</strong>
                  </div>
                  <div className="laute-cart-summary-row laute-cart-summary-total">
                    <span>{ct.cartSummaryTotal || 'Общая сумма (по известным ценам)'}:</span>
                    <strong className="laute-cart-grand-total">
                      {cartTotalKnownAmount > 0
                        ? formatCurrency(cartTotalKnownAmount)
                        : ct.priceOnRequest || 'Цена по запросу'}
                    </strong>
                  </div>
                  {cartHasPriceOnRequest && (
                    <div className="laute-cart-por-note">
                      * {ct.cartPriceOnRequestNote || 'Позиции со статусом «Цена по запросу» рассчитываются менеджером индивидуально'}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="laute-cart-primary-btn laute-cart-proceed-btn"
                  onClick={handleProceedToForm}
                >
                  <span>{ct.cartProceedBtn || 'Отправить заявку'}</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            )}
          </>
        )}

        {/* ШАГ 2 — ФОРМА ОТПРАВКИ ЗАЯВКИ БЕЗ РЕГИСТРАЦИИ */}
        {step === 'form' && (
          <form className="laute-cart-body laute-inquiry-form" onSubmit={handleSubmitInquiry} noValidate>
            <button
              type="button"
              className="laute-cart-back-btn"
              onClick={() => {
                setStep('cart');
                setFormError('');
              }}
            >
              <ArrowLeft size={16} />
              <span>{ct.cartBackToItems || 'Вернуться к составу корзины'}</span>
            </button>

            {formError && (
              <div className="laute-inquiry-alert-error" role="alert">
                <AlertCircle size={18} />
                <span>{formError}</span>
              </div>
            )}

            {/* Скрытое поле защиты от спам-ботов */}
            <div style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }} aria-hidden="true">
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            <div className="laute-inquiry-fields-grid">
              <div className="laute-inquiry-field">
                <label htmlFor="laute-inq-name">
                  {ct.inquiryFieldName || 'Ваше имя'} <span className="req-star">*</span>
                </label>
                <input
                  id="laute-inq-name"
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={ct.inquiryFieldNamePlaceholder || 'Иван Петров'}
                />
              </div>

              <div className="laute-inquiry-field">
                <label htmlFor="laute-inq-contact">
                  {ct.inquiryFieldContact || 'Телефон или Email для связи'} <span className="req-star">*</span>
                </label>
                <input
                  id="laute-inq-contact"
                  type="text"
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder={ct.inquiryFieldContactPlaceholder || '+7 (___) ___-__-__ или name@company.ru'}
                />
              </div>

              <div className="laute-inquiry-field laute-inquiry-field-full">
                <label htmlFor="laute-inq-city">
                  {ct.inquiryFieldCity || 'Город'} <span className="req-star">*</span>
                </label>
                <input
                  id="laute-inq-city"
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={ct.inquiryFieldCityPlaceholder || 'Например: Новосибирск, Москва, Алматы'}
                />
                {liveRoutingPreview && (
                  <div
                    className={`laute-city-routing-badge ${
                      liveRoutingPreview.status === 'assigned' ? 'is-assigned' : 'is-pending'
                    }`}
                  >
                    <MapPin size={14} />
                    {liveRoutingPreview.status === 'assigned' ? (
                      <span>
                        {ct.inquiryAssignedTerritory || 'Определена территория'}:{' '}
                        <strong>{liveRoutingPreview.territoryName}</strong> ({liveRoutingPreview.managerName})
                      </span>
                    ) : (
                      <span>
                        {ct.inquiryPendingAssignment ||
                          'Ожидает назначения ответственного менеджера по вашему городу'}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="laute-inquiry-field laute-inquiry-field-full">
                <label htmlFor="laute-inq-comment">
                  {ct.inquiryFieldComment || 'Комментарий к заявке (необязательно)'}
                </label>
                <textarea
                  id="laute-inq-comment"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={ct.inquiryFieldCommentPlaceholder || 'Уточнения по комплектации, объекту или срокам'}
                />
              </div>
            </div>

            <label className="laute-inquiry-consent">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              <span>
                {ct.inquiryConsent ||
                  'Я даю согласие на обработку персональных данных для рассмотрения заявки и связи со специалистом LAUTE'}
              </span>
            </label>

            {/* СОСТАВ ЗАЯВКИ И ИТОГОВАЯ СУММА ПОД ФОРМОЙ */}
            <div className="laute-inquiry-composition-box">
              <div className="laute-inquiry-composition-header">
                <h4>{ct.inquiryCompositionTitle || 'Состав отправляемой заявки'}</h4>
                <span>{cartDistinctCount} поз. / {cartTotalUnits} шт.</span>
              </div>

              <div className="laute-inquiry-composition-list">
                {cartItems.map((it) => (
                  <div key={it.article} className="laute-inquiry-composition-item">
                    <div className="laute-inquiry-comp-left">
                      <span className="laute-inquiry-comp-sku">{it.article}</span>
                      <span className="laute-inquiry-comp-title">{it.title}</span>
                    </div>
                    <div className="laute-inquiry-comp-right">
                      <span className="laute-inquiry-comp-qty">{it.quantity} шт.</span>
                      <strong className="laute-inquiry-comp-sum">
                        {it.hasKnownPrice
                          ? formatCurrency(it.lineSubtotal)
                          : ct.priceOnRequest || 'Цена по запросу'}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>

              <div className="laute-inquiry-composition-total">
                <span>{ct.cartSummaryTotal || 'Общая сумма (по известным ценам)'}:</span>
                <strong>
                  {cartTotalKnownAmount > 0
                    ? formatCurrency(cartTotalKnownAmount)
                    : ct.priceOnRequest || 'Цена по запросу'}
                </strong>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="laute-cart-primary-btn laute-inquiry-submit-btn"
            >
              <Send size={17} />
              <span>
                {isSubmitting
                  ? ct.inquirySubmittingBtn || 'Отправка заявки...'
                  : ct.inquirySubmitBtn || 'Отправить заявку'}
              </span>
            </button>
          </form>
        )}

        {/* ШАГ 3 — ПОДТВЕРЖДЕНИЕ ОТПРАВЛЕННОЙ ЗАЯВКИ И НОМЕР ЗАЯВКИ */}
        {step === 'success' && submittedOrder && (
          <div className="laute-cart-body laute-inquiry-success">
            <div className="laute-inquiry-success-icon">
              <CheckCircle2 size={44} />
            </div>

            <h3 className="laute-inquiry-success-title">
              {ct.inquirySuccessTitle || 'Заявка принята в обработку'}
            </h3>

            <div className="laute-inquiry-number-card">
              <span className="laute-inquiry-number-label">
                {ct.inquiryNumberLabel || 'Номер заявки'}:
              </span>
              <strong className="laute-inquiry-number-value">
                {submittedOrder.inquiryNumber}
              </strong>
            </div>

            <div className="laute-inquiry-routing-card">
              {submittedOrder.routing?.status === 'assigned' ? (
                <>
                  <div className="laute-inquiry-routing-row">
                    <MapPin size={16} />
                    <div>
                      <span className="laute-routing-meta">{ct.inquiryAssignedTerritory || 'Определена территория'}:</span>
                      <strong>{submittedOrder.routing.territoryName}</strong>
                    </div>
                  </div>
                  <div className="laute-inquiry-routing-row">
                    <UserCheck size={16} />
                    <div>
                      <span className="laute-routing-meta">{ct.inquiryAssignedManager || 'Ответственный менеджер'}:</span>
                      <strong>
                        {submittedOrder.routing.managerName} ({submittedOrder.routing.managerEmail})
                      </strong>
                    </div>
                  </div>
                </>
              ) : (
                <div className="laute-inquiry-routing-row is-pending">
                  <Clock size={16} />
                  <div>
                    <span className="laute-routing-meta">Статус маршрутизации ({submittedOrder.customer?.city}):</span>
                    <strong>
                      {ct.inquiryPendingAssignment ||
                        'Ожидает назначения ответственного менеджера по вашему городу'}
                    </strong>
                  </div>
                </div>
              )}

              <p className="laute-inquiry-status-note">
                {ct.inquirySavedNotice ||
                  'Заявка сохранена в системе LAUTE и доступна в служебном интерфейсе.'}{' '}
                {submittedOrder.emailNotification?.sent
                  ? ct.inquiryEmailSentNotice ||
                    'Уведомление с полным составом заявки передано на почту ответственного менеджера.'
                  : ct.inquiryEmailQueuedNotice ||
                    'Заявка зафиксирована в реестре управления территориальным менеджером.'}
              </p>
            </div>

            <div className="laute-inquiry-composition-box">
              <div className="laute-inquiry-composition-header">
                <h4>{ct.inquiryCompositionTitle || 'Состав отправляемой заявки'}</h4>
                <span>{submittedOrder.summary?.distinctItems} поз. / {submittedOrder.summary?.totalUnits} шт.</span>
              </div>
              <div className="laute-inquiry-composition-list">
                {(submittedOrder.items || []).map((it) => (
                  <div key={it.article} className="laute-inquiry-composition-item">
                    <div className="laute-inquiry-comp-left">
                      <span className="laute-inquiry-comp-sku">{it.article}</span>
                      <span className="laute-inquiry-comp-title">{it.title}</span>
                    </div>
                    <div className="laute-inquiry-comp-right">
                      <span className="laute-inquiry-comp-qty">{it.quantity} шт.</span>
                      <strong className="laute-inquiry-comp-sum">
                        {it.publicPrice
                          ? formatCurrency(it.lineSubtotal)
                          : ct.priceOnRequest || 'Цена по запросу'}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
              <div className="laute-inquiry-composition-total">
                <span>{ct.cartSummaryTotal || 'Общая сумма (по известным ценам)'}:</span>
                <strong>
                  {submittedOrder.summary?.totalKnownAmount > 0
                    ? formatCurrency(submittedOrder.summary.totalKnownAmount)
                    : ct.priceOnRequest || 'Цена по запросу'}
                </strong>
              </div>
            </div>

            <button
              type="button"
              className="laute-cart-primary-btn"
              onClick={handleClose}
            >
              {ct.inquiryCloseBtn || 'Вернуться в каталог'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;
