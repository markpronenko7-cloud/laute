import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { loginPartner } from "../../services/partnerApi";

export function PartnerLogin() {
  const { refreshPartner, navigateTo, closeAuthModal } = useApp();
  const [login, setLogin] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await loginPartner(login, password);
      setPassword("");
      await refreshPartner();
      closeAuthModal();
      navigateTo("account");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <form className="portal-form" onSubmit={submit}>
      <h2>Вход в кабинет</h2>
      <label>
        Логин
        <input
          required
          autoComplete="username"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
        />
      </label>
      <label>
        Пароль
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      {error && (
        <p className="portal-error" role="alert">
          {error}
        </p>
      )}
      <button className="btn btn-primary" disabled={busy}>
        {busy ? "Вход…" : "Войти"}
      </button>
      <p>Доступы и сброс пароля — у твоего менеджера.</p>
    </form>
  );
}
