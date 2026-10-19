import React, { useCallback, useEffect, useState } from "react";
import { portal } from "../../services/partnerApi";
import { useApp } from "../../context/AppContext";
import { PartnerOrders } from "./PartnerOrders";
import "../../styles/partners.css";

const emptyAccount = () => ({
  login: "",
  role: "partner",
  active: true,
  managerId: "",
  maxDiscount: 30,
  discountPolicy: "reject",
  discounts: [],
  profile: {
    name: "",
    country: "RU",
    organizationForm: "",
    taxId: "",
    registrationId: "",
    bankDetails: "",
    contactName: "",
    email: "",
    phone: "",
  },
});
const taxLabel = (country) =>
  ({
    RU: "ИНН",
    KZ: "БИН / ИИН",
    CN: "USCC / налоговый номер",
    AE: "TRN / налоговый номер",
    US: "EIN / налоговый номер",
  })[country] || "Налоговый номер страны";

export function PartnerManagement({ admin = false }) {
  const { products, partnerAccount } = useApp();
  const [accounts, setAccounts] = useState([]),
    [orders, setOrders] = useState([]);
  const [form, setForm] = useState(null),
    [credentials, setCredentials] = useState(null);
  const [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [search, setSearch] = useState("");
  const reload = useCallback(async () => {
    setError("");
    try {
      const [a, o] = await Promise.all([
        portal("accounts", {}, admin),
        portal("orders", {}, admin),
      ]);
      setAccounts(a.accounts);
      setOrders(o.orders);
    } catch (e) {
      setError(e.message);
    }
  }, [admin]);
  useEffect(() => {
    reload();
  }, [reload]);
  const patch = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const profile = (key, value) =>
    setForm((f) => ({ ...f, profile: { ...f.profile, [key]: value } }));
  const run = async (operation) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await operation();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const showCredentials = (result) => {
    if (result.temporaryPassword)
      setCredentials({
        login: result.account.login,
        password: result.temporaryPassword,
      });
  };
  const save = (e) => {
    e.preventDefault();
    run(async () => {
      const result = await portal("save_account", form, admin);
      showCredentials(result);
      setForm(null);
      setNotice("Сохранено");
      await reload();
    });
  };
  const reset = (account) =>
    run(async () => {
      if (
        !window.confirm(
          `Сбросить пароль «${account.profile.name}»? Текущие сессии будут закрыты.`,
        )
      )
        return;
      showCredentials(
        await portal("reset_password", { id: account.id }, admin),
      );
      setNotice("Временный пароль создан");
    });
  const accessText = credentials
    ? `LAUTE\n${new URL(`${import.meta.env.BASE_URL}account`, window.location.origin).href}\nЛогин: ${credentials.login}\nВременный пароль: ${credentials.password}\nПри первом входе задай свой пароль.`
    : "";
  const managers = accounts.filter((a) => a.role === "manager" && a.active);
  const limit = admin
    ? (managers.find((a) => a.id === form?.managerId)?.maxDiscount ?? 99)
    : (partnerAccount?.maxDiscount ?? 0);
  return (
    <div className="partner-workspace">
      <div className="portal-heading">
        <div>
          <h1>Кабинеты партнёров</h1>
          <p>Клиенты, персональные цены и заказы</p>
        </div>
        <button
          className="btn btn-primary btn-sm"
          disabled={busy}
          onClick={() => {
            setCredentials(null);
            setForm(emptyAccount());
          }}
        >
          Создать кабинет
        </button>
      </div>
      {error && (
        <p role="alert" className="portal-error">
          {error}
        </p>
      )}
      {notice && <p role="status">{notice}</p>}
      {credentials && (
        <section className="portal-section">
          <h2>Доступы для передачи клиенту</h2>
          <p>Сохрани сейчас: временный пароль повторно не отображается.</p>
          <pre className="portal-credentials">{accessText}</pre>
          <div className="portal-actions">
            <button
              className="btn btn-primary btn-sm"
              onClick={() =>
                run(async () => {
                  await navigator.clipboard.writeText(accessText);
                  setNotice("Доступы скопированы");
                })
              }
            >
              Копировать доступы
            </button>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setCredentials(null)}
            >
              Скрыть
            </button>
          </div>
        </section>
      )}
      {form && (
        <form className="portal-section portal-form" onSubmit={save}>
          <div className="portal-heading">
            <h2>{form.id ? "Карточка" : "Новый кабинет"}</h2>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              disabled={busy}
              onClick={() => setForm(null)}
            >
              Закрыть
            </button>
          </div>
          <fieldset disabled={busy}>
            <div className="portal-grid">
              {admin && !form.id && (
                <label>
                  Роль
                  <select
                    value={form.role}
                    onChange={(e) => patch("role", e.target.value)}
                  >
                    <option value="partner">Клиент</option>
                    <option value="manager">Менеджер</option>
                  </select>
                </label>
              )}
              <label>
                {form.role === "manager"
                  ? "Имя менеджера"
                  : "Название организации"}
                <input
                  required
                  maxLength={200}
                  value={form.profile.name || ""}
                  onChange={(e) => profile("name", e.target.value)}
                />
              </label>
              <label>
                Логин
                <input
                  required
                  pattern="[a-zA-Z0-9@._+\-]{3,100}"
                  autoComplete="off"
                  value={form.login}
                  onChange={(e) => patch("login", e.target.value)}
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  required
                  maxLength={200}
                  value={form.profile.email || ""}
                  onChange={(e) => profile("email", e.target.value)}
                />
              </label>
              <label>
                Телефон
                <input
                  type="tel"
                  required
                  maxLength={60}
                  value={form.profile.phone || ""}
                  onChange={(e) => profile("phone", e.target.value)}
                />
              </label>
              {form.role === "partner" && (
                <>
                  <label>
                    Страна
                    <input
                      required
                      pattern="[A-Za-z]{2}"
                      maxLength={2}
                      list="portal-countries"
                      value={form.profile.country || ""}
                      onChange={(e) =>
                        profile("country", e.target.value.toUpperCase())
                      }
                      placeholder="RU, KZ, CN, AE, US"
                    />
                    <datalist id="portal-countries">
                      {["RU", "KZ", "CN", "AE", "US"].map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </label>
                  <label>
                    Форма организации
                    <input
                      required
                      maxLength={100}
                      placeholder="ООО / ИП / ТОО / LLC"
                      value={form.profile.organizationForm || ""}
                      onChange={(e) =>
                        profile("organizationForm", e.target.value)
                      }
                    />
                  </label>
                  <label>
                    {taxLabel(form.profile.country)}
                    <input
                      required
                      maxLength={100}
                      value={form.profile.taxId || ""}
                      onChange={(e) => profile("taxId", e.target.value)}
                    />
                  </label>
                  <label>
                    Регистрационный номер
                    <input
                      maxLength={200}
                      value={form.profile.registrationId || ""}
                      onChange={(e) =>
                        profile("registrationId", e.target.value)
                      }
                    />
                  </label>
                  <label>
                    Контактное лицо
                    <input
                      maxLength={200}
                      value={form.profile.contactName || ""}
                      onChange={(e) => profile("contactName", e.target.value)}
                    />
                  </label>
                  {admin && (
                    <label>
                      Менеджер
                      <select
                        required
                        value={form.managerId || ""}
                        onChange={(e) => patch("managerId", e.target.value)}
                      >
                        <option value="">Выбери менеджера</option>
                        {managers.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.profile.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  <label className="portal-wide">
                    Банковские реквизиты страны · необязательно
                    <textarea
                      maxLength={2000}
                      value={form.profile.bankDetails || ""}
                      placeholder="Банк, счёт / IBAN, BIC / SWIFT"
                      onChange={(e) => profile("bankDetails", e.target.value)}
                    />
                  </label>
                </>
              )}
              {admin && form.role === "manager" && (
                <label>
                  Максимальная скидка, %
                  <input
                    type="number"
                    min="0"
                    max="99"
                    step="0.01"
                    required
                    value={form.maxDiscount}
                    onChange={(e) =>
                      patch("maxDiscount", Number(e.target.value))
                    }
                  />
                </label>
              )}
              <label className="portal-checkbox">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => patch("active", e.target.checked)}
                />
                Доступ активен
              </label>
            </div>
            {form.role === "partner" && (
              <section className="portal-discounts">
                <h3>Скидки · лимит {limit}%</h3>
                {form.discounts.map((d, index) => (
                  <div className="portal-discount-row" key={index}>
                    <select
                      aria-label="Тип скидки"
                      value={d.kind}
                      onChange={(e) =>
                        patch(
                          "discounts",
                          form.discounts.map((x, i) =>
                            i === index
                              ? { ...x, kind: e.target.value, key: "" }
                              : x,
                          ),
                        )
                      }
                    >
                      <option value="category">Категория</option>
                      <option value="brand">Бренд</option>
                    </select>
                    <select
                      required
                      aria-label="Категория или бренд"
                      value={d.key}
                      onChange={(e) =>
                        patch(
                          "discounts",
                          form.discounts.map((x, i) =>
                            i === index ? { ...x, key: e.target.value } : x,
                          ),
                        )
                      }
                    >
                      <option value="">Выбери</option>
                      {[
                        ...new Set([
                          ...products.map((p) =>
                            d.kind === "brand"
                              ? p.brand || "LAUTE"
                              : p.category,
                          ),
                          d.key,
                        ]),
                      ]
                        .filter(Boolean)
                        .sort()
                        .map((key) => (
                          <option key={key}>{key}</option>
                        ))}
                    </select>
                    <input
                      type="number"
                      aria-label="Скидка в процентах"
                      required
                      min="0"
                      max={limit}
                      step="0.01"
                      value={d.percent}
                      onChange={(e) =>
                        patch(
                          "discounts",
                          form.discounts.map((x, i) =>
                            i === index
                              ? { ...x, percent: Number(e.target.value) }
                              : x,
                          ),
                        )
                      }
                    />
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() =>
                        patch(
                          "discounts",
                          form.discounts.filter((_, i) => i !== index),
                        )
                      }
                    >
                      Убрать
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() =>
                    patch("discounts", [
                      ...form.discounts,
                      { kind: "category", key: "", percent: 0 },
                    ])
                  }
                >
                  Добавить скидку
                </button>
                <label>
                  Если совпали бренд и категория
                  <select
                    value={form.discountPolicy}
                    onChange={(e) => patch("discountPolicy", e.target.value)}
                  >
                    <option value="reject">Запретить пересечение</option>
                    <option value="brand">Применить скидку бренда</option>
                    <option value="category">Применить скидку категории</option>
                    <option value="best">Применить большую скидку</option>
                  </select>
                </label>
                <small>Скидки не суммируются. Правило выбирает менеджер.</small>
              </section>
            )}
            <button className="btn btn-primary" type="submit">
              {busy ? "Сохранение…" : "Сохранить"}
            </button>
          </fieldset>
        </form>
      )}
      <section className="portal-section">
        <div className="portal-heading">
          <h2>{admin ? 'Клиенты и сотрудники' : 'Клиенты'}</h2>
          <button
            className="btn btn-outline btn-sm"
            onClick={reload}
            disabled={busy}
          >
            Обновить
          </button>
        </div>
        <input
          aria-label="Поиск кабинета"
          placeholder="Название или логин"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {!accounts.length && (
          <p>
            {admin
              ? "Сначала создай менеджера, затем клиента."
              : "Создай первый кабинет клиента."}
          </p>
        )}
        <div className="portal-account-list">
          {accounts
            .filter((a) =>
              `${a.profile.name} ${a.login}`
                .toLowerCase()
                .includes(search.toLowerCase()),
            )
            .map((account) => (
              <article key={account.id}>
                <div>
                  <strong>{account.profile.name}</strong>
                  <small>
                    {account.role === "manager" ? "Менеджер" : "Клиент"} ·{" "}
                    {account.login} · {account.active ? "Активен" : "Отключён"}
                  </small>
                </div>
                <div className="portal-actions">
                  <button
                    className="btn btn-outline btn-sm"
                    disabled={busy}
                    onClick={() => {
                      setCredentials(null);
                      setForm(structuredClone(account));
                    }}
                  >
                    Изменить
                  </button>
                  <button
                    className="btn btn-outline btn-sm"
                    disabled={busy}
                    onClick={() => reset(account)}
                  >
                    Сбросить пароль
                  </button>
                </div>
              </article>
            ))}
        </div>
      </section>
      <PartnerOrders orders={orders} reload={reload} admin={admin} management />
    </div>
  );
}
