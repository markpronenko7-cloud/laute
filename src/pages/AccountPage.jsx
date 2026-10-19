import React, { useCallback, useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { portal, clearPartnerToken } from "../services/partnerApi";
import { PartnerManagement } from "../components/partners/PartnerManagement";
import { PartnerLogin } from "../components/partners/PartnerLogin";
import { PartnerOrders } from "../components/partners/PartnerOrders";
import "../styles/partners.css";

export function AccountPage() {
  const {
    partnerAccount,
    partnerManager,
    partnerLoading,
    partnerError,
    refreshPartner,
    logoutPartner,
    navigateTo,
    products,
    clearCart,
    addToCart,
    openCartModal,
  } = useApp();
  const [orders, setOrders] = useState([]),
    [error, setError] = useState(""),
    [password, setPassword] = useState(""),
    [confirm, setConfirm] = useState(""),
    [busy, setBusy] = useState(false),
    [repeatPending, setRepeatPending] = useState(null),
    [changePassword, setChangePassword] = useState(false);
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
    <div className="partner-page">
      {partnerError && <p className="portal-error" role="alert">{partnerError}</p>}
      {repeatPending && <section className="portal-section" role="dialog" aria-label="Повторить заказ">
        <p>Заменить корзину заказом № {repeatPending.number}? Цены рассчитаем заново.</p>
        <div className="portal-actions"><button className="btn btn-primary btn-sm" onClick={confirmRepeat}>Заменить и рассчитать</button><button className="btn btn-outline btn-sm" onClick={() => setRepeatPending(null)}>Отмена</button></div>
      </section>}
      <div className="portal-heading">
        <div>
          <h1>{partnerAccount.profile.name}</h1>
          <small>
            {partnerAccount.role === "manager"
              ? "Кабинет менеджера"
              : "Кабинет партнёра"}
          </small>
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
      </div>
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
          <section className="portal-section">
            <div className="portal-heading">
              <div>
                <h2>Твои персональные цены</h2>
                <p>Выбери товар, укажи количество и отправь заказ.</p>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => navigateTo("catalog")}
              >
                Открыть каталог
              </button>
            </div>
            {partnerManager ? (
              <p>
                Твой менеджер: <strong>{partnerManager.name}</strong> ·{" "}
                <a href={`mailto:${partnerManager.email}`}>
                  {partnerManager.email}
                </a>{" "}
                ·{" "}
                <a href={`tel:${partnerManager.phone?.replace(/[^+\d]/g, "")}`}>
                  {partnerManager.phone}
                </a>
              </p>
            ) : (
              <p>
                Менеджер временно недоступен. Обратись в отдел продаж через
                «Контакты».
              </p>
            )}
          </section>
          <PartnerOrders orders={orders} reload={reload} repeat={repeat} />
        </>
      )}
    </div>
  );
}
