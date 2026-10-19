import React, { useState } from "react";
import {
  portal,
  ORDER_STATUSES,
  NEXT_STATUSES,
  money,
} from "../../services/partnerApi";

export function PartnerOrders({
  orders,
  reload,
  admin = false,
  management = false,
  repeat,
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const changeStatus = async (order, status) => {
    setBusy(true);
    setError("");
    try {
      await portal(
        "order_status",
        { id: order.id, previousStatus: order.status, status },
        admin,
      );
      await reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="portal-section">
      <div className="portal-heading">
        <h2>Заказы</h2>
        <button
          className="btn btn-outline btn-sm"
          onClick={reload}
          disabled={busy}
        >
          Обновить
        </button>
      </div>
      {error && (
        <p role="alert" className="portal-error">
          {error}
        </p>
      )}
      {!orders.length && <p>Заказов пока нет.</p>}
      {orders.map((order) => (
        <details className="portal-order" key={order.id}>
          <summary>
            <strong>№ {order.number}</strong> {management && order.customerName}{" "}
            <span>{ORDER_STATUSES[order.status]}</span>
            <small>{new Date(order.created_at).toLocaleString("ru-RU")}</small>
          </summary>
          <div className="portal-order-body">
            <ul>
              {order.items.map((item) => (
                <li key={item.article}>
                  <span>
                    {item.title} · {item.article}
                    <small>
                      {item.quantity} × {money(item.price, item.currency)}
                    </small>
                  </span>
                  <strong>{money(item.subtotal, item.currency)}</strong>
                </li>
              ))}
            </ul>
            <div className="portal-totals">
              {Object.entries(order.totals).map(([currency, value]) => (
                <strong key={currency}>{money(value, currency)}</strong>
              ))}
            </div>
            {order.comment && <p>{order.comment}</p>}
            <div className="portal-actions">
              {management ? (
                NEXT_STATUSES[order.status].map((status) => (
                  <button
                    key={status}
                    className="btn btn-outline btn-sm"
                    disabled={busy}
                    onClick={() => changeStatus(order, status)}
                  >
                    {ORDER_STATUSES[status]}
                  </button>
                ))
              ) : (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => repeat(order)}
                >
                  Повторить заказ
                </button>
              )}
            </div>
            <ol className="portal-timeline">
              {order.history.map((event, i) => (
                <li key={i}>
                  {ORDER_STATUSES[event.status]} ·{" "}
                  {new Date(event.at).toLocaleString("ru-RU")}
                </li>
              ))}
            </ol>
          </div>
        </details>
      ))}
    </section>
  );
}
