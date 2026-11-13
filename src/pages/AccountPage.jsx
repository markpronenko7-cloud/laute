import React, { useCallback, useEffect, useState } from "react";
import { ArrowRight, Package, Search, Tag, User } from "lucide-react";
import { useApp } from "../context/AppContext";
import { portal, clearPartnerToken, money } from "../services/partnerApi";
import { PartnerManagement } from "../components/partners/PartnerManagement";
import { PartnerLogin } from "../components/partners/PartnerLogin";
import { PartnerOrders } from "../components/partners/PartnerOrders";
import "../styles/partners.css";

export function AccountPage() {
  const {
    partnerAccount,
    partnerManager,
    partnerPrices,
    partnerLoading,
    partnerError,
    refreshPartner,
    logoutPartner,
    navigateTo,
    products,
    clearCart,
    addToCart,
    openCartModal,
    openProductModal,
  } = useApp();
  const [orders, setOrders] = useState([]),
    [error, setError] = useState(""),
    [password, setPassword] = useState(""),
    [confirm, setConfirm] = useState(""),
    [busy, setBusy] = useState(false),
    [repeatPending, setRepeatPending] = useState(null),
    [changePassword, setChangePassword] = useState(false);
  const [discountSearch, setDiscountSearch] = useState("");
  const [discountsExpanded, setDiscountsExpanded] = useState(false);
  const discounts = Object.values(partnerPrices)
    .filter((item) => Number(item.discount) > 0)
    .sort((a, b) => b.discount - a.discount || a.article.localeCompare(b.article));
  const discountQuery = discountSearch.trim().toLocaleLowerCase("ru");
  const matchingDiscounts = discounts.filter((item) =>
    `${item.article} ${item.title}`.toLocaleLowerCase("ru").includes(discountQuery),
  );
  const reload = useCallback(async () => {
    try {
      setOrders((await portal("orders")).orders);
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }, []);
  useEffect(() => {
    setOrders([]);
    if (partnerAccount?.role === "partner" && !partnerAccount.mustChange)
      reload();
  }, [partnerAccount?.id, partnerAccount?.mustChange, reload]);
  const savePassword = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Пароли не совпадают");
      return;
    }
    setBusy(true);
    try {
      await portal("password", { password });
      setPassword("");
      setConfirm("");
      setChangePassword(false);
      await refreshPartner();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const repeat = (order) => {
    const unavailable = order.items.filter(
      (i) =>
        !products.some(
          (p) => p.article === i.article && p.status === "АКТИВЕН",
        ),
    );
    if (unavailable.length) {
      setError(
        `Сейчас недоступны: ${unavailable.map((i) => i.article).join(", ")}. Обратись к менеджеру.`,
      );
      return;
    }
    setRepeatPending(order);
  };
  const confirmRepeat = () => {
    const order = repeatPending;
    if (!order) return;
    setRepeatPending(null);
    clearCart();
    order.items.forEach((i) =>
      addToCart(
        products.find((p) => p.article === i.article),
        i.quantity,
      ),
    );
    openCartModal();
  };
  if (partnerLoading && !partnerAccount)
    return <div className="partner-page">Загрузка кабинета…</div>;
  if (!partnerAccount)
    return (
      <div className="partner-page portal-login">
        {partnerError && (
          <p role="alert" className="portal-error">
            {partnerError}
          </p>
        )}
        <PartnerLogin />
      </div>
    );
  return (
    <div className="partner-page partner-dashboard">
      {partnerError && <p className="portal-error" role="alert">{partnerError}</p>}
      {repeatPending && <section className="portal-section" role="dialog" aria-label="Повторить заказ">
        <p>Заменить корзину заказом № {repeatPending.number}? Цены рассчитаем заново.</p>
        <div className="portal-actions"><button className="btn btn-primary btn-sm" onClick={confirmRepeat}>Заменить и рассчитать</button><button className="btn btn-outline btn-sm" onClick={() => setRepeatPending(null)}>Отмена</button></div>
      </section>}
      <header className="portal-heading partner-dashboard-header">
        <div>
          <small>
            {partnerAccount.role === "manager"
              ? "Кабинет менеджера"
              : "Кабинет партнёра"}
          </small>
          <h1>{partnerAccount.profile.name}</h1>
        </div>
        <div className="portal-actions">
          {!partnerAccount.mustChange && (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setChangePassword((v) => !v)}
            >
              Сменить пароль
            </button>
          )}
          <button
            className="btn btn-outline btn-sm"
            onClick={async () => {
              try {
                await portal("logout");
              } finally {
                clearPartnerToken();
                logoutPartner();
              }
            }}
          >
            Выйти
          </button>
        </div>
      </header>
      {error && (
        <p role="alert" className="portal-error">
          {error}
        </p>
      )}
      {partnerAccount.mustChange || changePassword ? (
        <form
          className="portal-section portal-form portal-login"
          onSubmit={savePassword}
        >
          <h2>
            {partnerAccount.mustChange ? "Задай свой пароль" : "Новый пароль"}
          </h2>
          <p>От 12 символов. Временный пароль нужно заменить.</p>
          <label>
            Новый пароль
            <input
              type="password"
              required
              minLength={12}
              maxLength={72}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <label>
            Повтори пароль
            <input
              type="password"
              required
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </label>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? "Сохранение…" : "Сохранить пароль"}
          </button>
        </form>
      ) : partnerAccount.role === "manager" ? (
        <PartnerManagement />
      ) : (
        <>
          <div className="partner-dashboard-layout">
            <div className="partner-dashboard-main">
              <section className="portal-section partner-discount-panel">
                <div className="portal-heading">
                  <div>
                    <h2><Tag size={21} aria-hidden="true" /> Твои скидки</h2>
                    {!partnerLoading && !partnerError && discounts.length > 0 && (
                      <p>Товаров со скидкой: {discounts.length}</p>
                    )}
                  </div>
                  <button className="btn btn-primary" onClick={() => navigateTo("catalog")}>
                    Открыть каталог <ArrowRight size={16} aria-hidden="true" />
                  </button>
                </div>
                {partnerLoading ? <p role="status">Загружаем персональные цены…</p>
                  : partnerError ? <button type="button" className="btn btn-outline" onClick={() => refreshPartner().catch(() => {})}>Обновить цены</button>
                  : discounts.length === 0 ? <p>Персональные скидки пока не назначены.</p>
                  : <>
                    <label className="partner-discount-search">
                      <Search size={18} aria-hidden="true" />
                      <input type="search" aria-label="Поиск по товарам со скидкой" placeholder="Название или артикул"
                        value={discountSearch} onChange={(event) => {
                          setDiscountSearch(event.target.value);
                          setDiscountsExpanded(false);
                        }} />
                    </label>
                    <ul className="partner-discount-list">
                      {(discountsExpanded ? matchingDiscounts : matchingDiscounts.slice(0, 8)).map((item) => {
                        const product = products.find((entry) => entry.article === item.article);
                        return (
                          <li key={item.article}>
                            <div className="partner-discount-product">
                              {product ? <button type="button" onClick={() => openProductModal(product)}>{item.title}</button> : <strong>{item.title}</strong>}
                              <small>{item.article}</small>
                            </div>
                            <span className="partner-discount-rate">−{item.discount}%</span>
                            <div className="partner-discount-price">
                              {item.price == null ? <span>Цена по запросу</span> : <>
                                <strong>{money(item.price, item.currency)}</strong>
                                <del>{money(item.basePrice, item.currency)}</del>
                              </>}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                    {matchingDiscounts.length === 0 && <p>Товары не найдены.</p>}
                    {matchingDiscounts.length > 8 && (
                      <button type="button" className="btn btn-outline btn-sm" aria-expanded={discountsExpanded}
                        onClick={() => setDiscountsExpanded((expanded) => !expanded)}>
                        {discountsExpanded ? "Свернуть список" : `Показать все (${matchingDiscounts.length})`}
                      </button>
                    )}
                  </>}
              </section>
              <PartnerOrders orders={orders} reload={reload} repeat={repeat} />
            </div>
            <aside className="partner-dashboard-aside">
              <section className="portal-section">
                <h2><User size={20} aria-hidden="true" /> Менеджер</h2>
                {partnerManager ? <address>
                  <strong>{partnerManager.name}</strong>
                  {partnerManager.email && <a href={`mailto:${partnerManager.email}`}>{partnerManager.email}</a>}
                  {partnerManager.phone && <a href={`tel:${partnerManager.phone.replace(/[^+\d]/g, "")}`}>{partnerManager.phone}</a>}
                </address> : <>
                  <p>{partnerAccount.managerId ? "Менеджер временно недоступен." : "Назначь менеджера через отдел продаж, чтобы отправлять заказы."}</p>
                  <button className="btn btn-outline btn-sm" onClick={() => navigateTo("contacts")}>Контакты</button>
                </>}
              </section>
              <section className="portal-section">
                <h2><Package size={20} aria-hidden="true" /> Корзина</h2>
                <button className="btn btn-outline btn-sm" onClick={openCartModal}>Открыть корзину</button>
              </section>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
