// Isolated PostgreSQL integration checks. Install the test runtime in .temp/qa;
// it is never bundled with the website and is not an application dependency.
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { pathToFileURL } from "node:url";
import path from "node:path";
const runtime = path.resolve(
  process.env.PGLITE_MODULE_PATH ||
    ".temp/qa/node_modules/@electric-sql/pglite",
);
const { PGlite } = await import(
  pathToFileURL(path.join(runtime, "dist/index.js"))
);
const { pgcrypto } = await import(
  pathToFileURL(path.join(runtime, "dist/contrib/pgcrypto.js"))
);
const db = new PGlite({ extensions: { pgcrypto } });
let checks = 0;
const check = (condition, message) => {
  assert.ok(condition, message);
  checks++;
};
const rpc = async (action, token, data = {}) =>
  (
    await db.query("select laute_portal($1,$2,$3) result", [
      action,
      token,
      JSON.stringify(data),
    ])
  ).rows[0].result;
const denied = async (action, token, data = {}) => {
  await assert.rejects(rpc(action, token, data));
  checks++;
};
try {
  await db.exec(`CREATE EXTENSION pgcrypto; CREATE ROLE anon; CREATE ROLE authenticated;
    CREATE TABLE laute_admin_sessions(token text PRIMARY KEY,expires_at timestamptz);
    CREATE FUNCTION laute_check_session(p_token text) RETURNS boolean LANGUAGE sql AS $$ SELECT EXISTS(SELECT 1 FROM laute_admin_sessions WHERE token=p_token AND expires_at>now()) $$;
    CREATE TABLE laute_products(article text PRIMARY KEY,name text,brand text,category text,price numeric,currency text,status text,raw_data jsonb DEFAULT '{}');
    INSERT INTO laute_admin_sessions VALUES('qa-admin',now()+interval '1 hour');
    INSERT INTO laute_products VALUES('QA-RUB','QA product','LAUTE','Mixers',100.05,'₽','АКТИВЕН','{}'),('QA-KZT','QA KZT','Aloute','Mixers',200,'₸','АКТИВЕН','{}'),('QA-NOPRICE','No price','LAUTE','Other',0,'₽','АКТИВЕН','{}'),('QA-HIDDEN','Hidden','LAUTE','Mixers',300,'₽','СКРЫТ','{}');`);
  await db.exec(
    await fs.readFile(
      "supabase/migrations/20261019_partner_portal.sql",
      "utf8",
    ),
  );
  const profile = {
    name: "QA company",
    country: "RU",
    organizationForm: "ООО",
    taxId: "1234567890",
    email: "qa@example.invalid",
    phone: "+70000000000",
  };
  const create = (login, role = "partner", extra = {}) =>
    rpc("save_account", "qa-admin", { login, role, profile, ...extra });
  await denied("accounts", null);
  const m1 = await create("qa-manager-1", "manager", { maxDiscount: 30 });
  const m2 = await create("qa-manager-2", "manager", { maxDiscount: 10 });
  check(m1.temporaryPassword.length >= 24, "Strong temporary passwords");
  check(
    !JSON.stringify(m1.account).includes("password_hash"),
    "Hashes never returned",
  );
  const managerLogin = await rpc("login", null, {
    login: "qa-manager-1",
    password: m1.temporaryPassword,
  });
  const mt = managerLogin.token;
  await denied("accounts", mt);
  await denied("password", mt, { password: "short" });
  await denied("password", mt, { password: m1.temporaryPassword });
  await rpc("password", mt, { password: "QA-manager-new-password-123" });
  const c1 = await rpc("save_account", mt, {
    login: "qa-client-1",
    role: "partner",
    profile,
    discounts: [{ kind: "category", key: "Mixers", percent: 20 }],
    discountPolicy: "reject",
  });
  const c2 = await create("qa-client-2", "partner", {
    managerId: m2.account.id,
  });
  check(
    c1.account.managerId === m1.account.id,
    "Manager ownership forced on server",
  );
  check(
    (await rpc("accounts", mt)).accounts.length === 1,
    "Manager lists only own clients",
  );
  await denied("save_account", mt, {
    ...m2.account,
    revision: m2.account.revision,
  });
  await denied("reset_password", mt, { id: c2.account.id });
  await denied("save_account", mt, {
    login: "elevated",
    role: "manager",
    profile,
  });
  await denied("save_account", mt, {
    login: "over-limit",
    profile,
    discounts: [{ kind: "brand", key: "LAUTE", percent: 31 }],
  });
  await denied("save_account", mt, {
    login: "bad-tax",
    profile: { ...profile, taxId: "1" },
  });
  await denied("save_account", mt, {
    login: "bad-kz-tax",
    profile: { ...profile, country: "KZ", taxId: "1" },
  });
  await denied("save_account", mt, {
    login: "no-country",
    profile: { ...profile, country: "" },
  });
  const intl = await rpc("save_account", mt, {
    login: "qa-international",
    profile: {
      ...profile,
      country: "AE",
      taxId: "AE-TRN-123",
      organizationForm: "LLC",
      registrationId: "REG-1",
      bankDetails: "IBAN",
    },
  });
  check(
    intl.account.profile.country === "AE" &&
      !("address" in intl.account.profile),
    "International requisites without store address",
  );
  const cl = await rpc("login", null, {
    login: "qa-client-1",
    password: c1.temporaryPassword,
  });
  const ct = cl.token;
  await denied("catalog", ct);
  await rpc("password", ct, { password: "QA-client-new-password-123" });
  await denied("accounts", ct);
  await denied("save_account", ct, c1.account);
  await denied("reset_password", ct, { id: c1.account.id });
  const prices = (await rpc("catalog", ct)).prices;
  check(
    prices.find((x) => x.article === "QA-RUB").price === 80.04,
    "Server discount rounded to cents",
  );
  check(
    !prices.some((x) => x.article === "QA-HIDDEN"),
    "Hidden products excluded",
  );
  const items = [
    { article: "QA-RUB", quantity: 3 },
    { article: "QA-KZT", quantity: 2 },
  ];
  const q = await rpc("quote", ct, { items });
  check(
    q.totals["₽"] === 240.12 && q.totals["₸"] === 320,
    "Currencies totalled separately",
  );
  await denied("quote", ct, { items: [{ article: "QA-RUB", quantity: 1.5 }] });
  await denied("quote", ct, { items: [{ article: "QA-RUB", quantity: 0 }] });
  await denied("quote", ct, {
    items: [{ article: "QA-RUB", quantity: 10000 }],
  });
  await denied("quote", ct, { items: [items[0], items[0]] });
  await denied("quote", ct, { items: [{ article: "QA-HIDDEN", quantity: 1 }] });
  await denied("quote", ct, {
    items: [{ article: "QA-NOPRICE", quantity: 1 }],
  });
  await denied("submit_order", ct, {
    items,
    requestId: crypto.randomUUID(),
    quoteHash: "forged",
  });
  const requestId = crypto.randomUUID();
  const order = (
    await rpc("submit_order", ct, {
      items: items.map((x) => ({ ...x, price: 1 })),
      requestId,
      quoteHash: q.hash,
    })
  ).order;
  check(order.totals["₽"] === 240.12, "Client-supplied price ignored");
  const again = await rpc("submit_order", ct, {
    items,
    requestId,
    quoteHash: q.hash,
  });
  check(
    order.id === again.order.id &&
      (await rpc("orders", ct)).orders.length === 1,
    "Retry is idempotent",
  );
  check(
    (await rpc("orders", "qa-admin")).orders.length === 1,
    "Admin sees partner orders",
  );
  const cl2 = await rpc("login", null, {
    login: "qa-client-2",
    password: c2.temporaryPassword,
  });
  await rpc("password", cl2.token, { password: "QA-client-2-new-password" });
  check(
    (await rpc("orders", cl2.token)).orders.length === 0,
    "Other client cannot see order",
  );
  await denied("order_status", ct, {
    id: order.id,
    previousStatus: "new",
    status: "accepted",
  });
  const ml2 = await rpc("login", null, {
    login: "qa-manager-2",
    password: m2.temporaryPassword,
  });
  await rpc("password", ml2.token, { password: "QA-manager-2-new-password" });
  check(
    (await rpc("orders", ml2.token)).orders.length === 0,
    "Other manager cannot see order",
  );
  await denied("order_status", ml2.token, {
    id: order.id,
    previousStatus: "new",
    status: "accepted",
  });
  await denied("order_status", mt, {
    id: order.id,
    previousStatus: "new",
    status: "completed",
  });
  for (const [previousStatus, status] of [
    ["new", "accepted"],
    ["accepted", "processing"],
    ["processing", "shipped"],
    ["shipped", "completed"],
  ])
    await rpc("order_status", mt, { id: order.id, previousStatus, status });
  check(
    (await rpc("orders", ct)).orders[0].history.length === 5,
    "Receipt and status history persisted",
  );
  await db.exec("UPDATE laute_products SET price=999 WHERE article='QA-RUB'");
  await denied("submit_order", ct, {
    items,
    requestId: crypto.randomUUID(),
    quoteHash: q.hash,
  });
  check(
    (await rpc("orders", ct)).orders[0].items.find(
      (x) => x.article === "QA-RUB",
    ).price === 80.04,
    "History preserves original prices",
  );
  let current = (await rpc("accounts", mt)).accounts.find(
    (x) => x.id === c1.account.id,
  );
  const overlap = [
    { kind: "category", key: "Mixers", percent: 20 },
    { kind: "brand", key: "LAUTE", percent: 10 },
  ];
  await denied("save_account", mt, {
    ...current,
    discounts: overlap,
    discountPolicy: "reject",
  });
  for (const [policy, expected] of [
    ["brand", 899.1],
    ["category", 799.2],
    ["best", 799.2],
  ]) {
    current = (
      await rpc("save_account", mt, {
        ...current,
        discounts: overlap,
        discountPolicy: policy,
      })
    ).account;
    check(
      (await rpc("catalog", ct)).prices.find((x) => x.article === "QA-RUB")
        .price === expected,
      `Explicit overlap rule ${policy}`,
    );
  }
  await denied("save_account", mt, { ...current, revision: 0 });
  await denied("save_account", "qa-admin", {
    ...(await rpc("accounts", "qa-admin")).accounts.find(
      (x) => x.id === m1.account.id,
    ),
    maxDiscount: 5,
  });
  await denied("save_account", mt, {
    ...current,
    discounts: [overlap[0], overlap[0]],
  });
  const reset = await rpc("reset_password", mt, { id: current.id });
  await denied("me", ct);
  const resetLogin = await rpc("login", null, {
    login: current.login,
    password: reset.temporaryPassword,
  });
  check(
    resetLogin.account.mustChange === true,
    "Reset revokes sessions and requires password change",
  );
  for (let i = 0; i < 5; i++)
    check(
      (await rpc("login", null, { login: current.login, password: "wrong" }))
        .success === false,
      "Failed login rejected",
    );
  check(
    (
      await rpc("login", null, {
        login: current.login,
        password: reset.temporaryPassword,
      })
    ).success === false,
    "Five failures lock even the correct password",
  );
  await db.exec(
    `UPDATE laute_portal_accounts SET locked_until=now()-interval '1 minute' WHERE id='${current.id}'`,
  );
  check(
    (
      await rpc("login", null, {
        login: current.login,
        password: reset.temporaryPassword,
      })
    ).success === true,
    "Expired lock recovers",
  );
  const perms = (
    await db.query(
      "select has_table_privilege('anon','laute_portal_accounts','SELECT') a, has_table_privilege('anon','laute_portal_orders','SELECT') o, has_function_privilege('anon','laute_portal_public_account(laute_portal_accounts)','EXECUTE') f",
    )
  ).rows[0];
  check(
    !perms.a && !perms.o && !perms.f,
    "Anonymous users cannot read private tables or helper functions",
  );
  check(
    (
      await db.query(
        "select bool_and(relrowsecurity) enabled from pg_class where relname in ('laute_portal_accounts','laute_portal_sessions','laute_portal_orders')",
      )
    ).rows[0].enabled,
    "RLS on every private table",
  );
  await rpc("logout", mt);
  await denied("accounts", mt);
  console.log(
    `Partner portal: ${checks} PostgreSQL checks passed. No production data used.`,
  );
} catch (error) {
  console.error(
    "Partner checks failed:",
    error.message,
    error.code || "",
    error.where || "",
    error.stack
      ?.split("\n")
      .filter((line) => line.includes("verify_partner_portal.js"))
      .join("\n"),
  );
  process.exitCode = 1;
} finally {
  await db.close();
}
