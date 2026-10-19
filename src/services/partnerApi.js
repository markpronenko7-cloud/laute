import { SUPABASE_CONFIG, getAuthToken } from "./adminApi";

const KEY = "laute_portal_token";
export const getPartnerToken = () => sessionStorage.getItem(KEY);
export const clearPartnerToken = () => {
  sessionStorage.removeItem(KEY);
  localStorage.removeItem("laute_partner_token");
  localStorage.removeItem("laute_b2b_auth");
};
export async function portal(action, data = {}, admin = false) {
  const response = await fetch(
    `${SUPABASE_CONFIG.url}/rest/v1/rpc/laute_portal`,
    {
      method: "POST",
      signal: AbortSignal.timeout(20000),
      headers: {
        apikey: SUPABASE_CONFIG.anonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_action: action,
        p_token: admin ? getAuthToken() : getPartnerToken(),
        p_data: data,
      }),
    },
  );
  const result = await response.json();
  if (!response.ok || result.success !== true) {
    if (result.code === "28000") {
      clearPartnerToken();
      window.dispatchEvent(new Event("laute:portal-expired"));
    }
    throw new Error(
      result.code === "PGRST202"
        ? "Кабинеты ещё не подключены к базе. Обратись к менеджеру."
        : result.error || result.message || "Не удалось выполнить действие",
    );
  }
  return result;
}
export async function loginPartner(login, password) {
  const result = await portal("login", { login, password });
  sessionStorage.setItem(KEY, result.token);
  return result.account;
}
export const ORDER_STATUSES = {
  new: "Отправлен менеджеру",
  accepted: "Получен менеджером",
  processing: "В работе",
  shipped: "Отгружен",
  completed: "Завершён",
  cancelled: "Отменён",
};
export const NEXT_STATUSES = {
  new: ["accepted", "cancelled"],
  accepted: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["completed"],
  completed: [],
  cancelled: [],
};
export const money = (value, currency) =>
  `${Number(value).toLocaleString("ru-RU", { maximumFractionDigits: 2 })} ${currency}`;
