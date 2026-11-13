import React, { useEffect, useState } from "react";
import { ShoppingBag, X } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { portal, money } from "../../services/partnerApi";
import "../../styles/partners.css";

export function PartnerCart() {
  const {
    cartItems,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    closeCartModal,
    navigateTo,
    partnerAccount,
    refreshPartner,
  } = useApp();
  const [quote, setQuote] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [comment, setComment] = useState(""),
    [order, setOrder] = useState(null),
    [refresh, setRefresh] = useState(0);
  const requestStorageKey = `laute_portal_order_request:${partnerAccount.id}`;
  const itemsKey = JSON.stringify(
    cartItems.map((i) => ({ article: i.article, quantity: i.quantity })),
  );
  useEffect(() => {
    let active = true;
    setQuote(null);
    setError("");
    if (cartItems.length && !partnerAccount.mustChange)
      portal("quote", { items: JSON.parse(itemsKey) })
        .then((result) => {
          if (active) setQuote({ ...result, itemsKey });
        })
        .catch((e) => {
          if (active) setError(e.message);
        });
    return () => {
      active = false;
    };
  }, [itemsKey, refresh, partnerAccount.id, partnerAccount.mustChange]);
  const submit = async () => {
    if (busy || !quote || quote.itemsKey !== itemsKey) return;
    setBusy(true);
    setError("");
    try {
      const key = itemsKey;
      let request;
      try { request = JSON.parse(sessionStorage.getItem(requestStorageKey)); } catch { /* A corrupt draft gets a fresh request ID. */ }
      if (request?.key !== key) request = { key, id: crypto.randomUUID() };
      sessionStorage.setItem(requestStorageKey, JSON.stringify(request));
      const result = await portal("submit_order", {
        requestId: request.id,
        items: JSON.parse(itemsKey),
        quoteHash: quote.hash,
        comment,
      });
      setOrder(result.order);
      sessionStorage.removeItem(requestStorageKey);
      clearCart();
      refreshPartner().catch(() => {});
    } catch (e) {
      setError(e.message);
      setQuote(null);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="laute-cart-backdrop" onClick={busy ? undefined : closeCartModal} onKeyDown={(event) => {
      if (event.key === "Escape" && !busy) closeCartModal();
    }}>
      <div
        className="laute-cart-drawer partner-cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Заказ партнёра"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="laute-cart-header">
          <div className="laute-cart-header-left">
            <span className="laute-cart-header-icon"><ShoppingBag size={20} aria-hidden="true" /></span>
            <div>
              <h2 className="laute-cart-title">{order ? `Заказ № ${order.number}` : "Корзина"}</h2>
              <p className="laute-cart-subtitle">Заказ по персональным ценам</p>
            </div>
          </div>
          <button
            type="button"
            className="laute-cart-close-btn"
            aria-label="Закрыть"
            disabled={busy}
            onClick={closeCartModal}
          >
            <X size={19} aria-hidden="true" />
          </button>
        </div>
        <div className="laute-cart-body partner-cart">
        {order ? (
          <>
            <p role="status">
              Заказ сохранён и доступен менеджеру. Подтверждение получения
              появится в истории.
            </p>
            <div className="portal-totals">
              {Object.entries(order.totals).map(([c, v]) => (
                <strong key={c}>{money(v, c)}</strong>
              ))}
            </div>
            <button
              className="btn btn-primary"
              onClick={() => {
                closeCartModal();
                navigateTo("account");
              }}
            >
              Мои заказы
            </button>
          </>
        ) : partnerAccount.mustChange ? (
          <>
            <p>Сначала задай свой пароль в кабинете.</p>
            <button
              className="btn btn-primary"
              onClick={() => {
                closeCartModal();
                navigateTo("account");
              }}
            >
              Открыть кабинет
            </button>
          </>
        ) : (
          <>
            {!cartItems.length && <p>Корзина пуста.</p>}
            <div className="portal-cart-items">
              {cartItems.map((item) => {
                const q = quote?.items.find((i) => i.article === item.article);
                return (
                  <article key={item.article} className="laute-cart-item-card">
                    <span className="partner-cart-item-image">
                      {item.image && <img src={item.image} alt="" />}
                    </span>
                    <div className="partner-cart-item-main">
                      <h3 className="laute-cart-item-name">{item.title}</h3>
                      <small>
                        {item.article} ·{" "}
                        {q ? money(q.price, q.currency) : error ? "Цена недоступна" : "Расчёт…"}
                      </small>
                    </div>
                    <label>
                      Количество
                      <input
                        aria-label={`Количество ${item.article}`}
                        type="number"
                        min="1"
                        max="9999"
                        step="1"
                        disabled={busy}
                        value={item.quantity}
                        onChange={(e) =>
                          updateCartQuantity(item.article, e.target.value)
                        }
                      />
                    </label>
                    <strong>{q ? money(q.subtotal, q.currency) : "—"}</strong>
                    <button
                      className="btn btn-outline btn-sm"
                      disabled={busy}
                      onClick={() => removeFromCart(item.article)}
                    >
                      Убрать
                    </button>
                  </article>
                );
              })}
            </div>
            {error && (
              <p className="portal-error" role="alert">
                {error}
              </p>
            )}
            {cartItems.length > 0 && (
              <>
                <div className="portal-totals">
                  {quote &&
                    Object.entries(quote.totals).map(([c, v]) => (
                      <strong key={c}>{money(v, c)}</strong>
                    ))}
                </div>
                <label>
                  Комментарий
                  <textarea
                    maxLength={2000}
                    disabled={busy}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </label>
                <div className="portal-actions">
                  <button
                    className="btn btn-outline btn-sm"
                    disabled={busy}
                    onClick={() => setRefresh((v) => v + 1)}
                  >
                    Обновить расчёт
                  </button>
                  <button
                    className="btn btn-primary"
                    disabled={busy || !quote || quote.itemsKey !== itemsKey}
                    onClick={submit}
                  >
                    {busy ? "Отправка…" : "Подтвердить сумму и отправить"}
                  </button>
                </div>
              </>
            )}
          </>
        )}
        </div>
      </div>
    </div>
  );
}
