BEGIN;

-- Separate from the existing CMS password and sessions. No public table reads.
CREATE TABLE public.laute_portal_accounts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), login text UNIQUE NOT NULL,
 role text NOT NULL CHECK(role IN ('partner','manager')),
 password_hash text NOT NULL, must_change boolean NOT NULL DEFAULT true,
 active boolean NOT NULL DEFAULT true, failed_attempts int NOT NULL DEFAULT 0,
 locked_until timestamptz, manager_id uuid REFERENCES public.laute_portal_accounts(id),
 max_discount numeric NOT NULL DEFAULT 30 CHECK(max_discount BETWEEN 0 AND 99),
 profile jsonb NOT NULL DEFAULT '{}', discounts jsonb NOT NULL DEFAULT '[]',
 discount_policy text NOT NULL DEFAULT 'reject' CHECK(discount_policy IN ('reject','brand','category','best')),
 revision bigint NOT NULL DEFAULT 1, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.laute_portal_sessions (
 token_hash text PRIMARY KEY, account_id uuid NOT NULL REFERENCES public.laute_portal_accounts(id),
 expires_at timestamptz NOT NULL DEFAULT now()+interval '8 hours'
);
CREATE TABLE public.laute_portal_orders (
 id uuid PRIMARY KEY, account_id uuid NOT NULL REFERENCES public.laute_portal_accounts(id),
 number bigint GENERATED ALWAYS AS IDENTITY UNIQUE,
 status text NOT NULL DEFAULT 'new' CHECK(status IN ('new','accepted','processing','shipped','completed','cancelled')),
 items jsonb NOT NULL, totals jsonb NOT NULL, comment text NOT NULL DEFAULT '',
 history jsonb NOT NULL DEFAULT '[]', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.laute_portal_accounts(manager_id);
CREATE INDEX ON public.laute_portal_orders(account_id,created_at DESC);
ALTER TABLE public.laute_portal_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laute_portal_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laute_portal_orders ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.laute_portal_accounts,public.laute_portal_sessions,public.laute_portal_orders FROM anon,authenticated;

CREATE FUNCTION public.laute_portal_public_account(a public.laute_portal_accounts)
RETURNS jsonb LANGUAGE sql STABLE SET search_path=public,pg_temp AS $$
 SELECT jsonb_build_object('id',a.id,'login',a.login,'role',a.role,'mustChange',a.must_change,'active',a.active,
 'managerId',a.manager_id,'maxDiscount',a.max_discount,'profile',a.profile,'discounts',a.discounts,'discountPolicy',a.discount_policy,'revision',a.revision)
$$;

-- Price calculation is shared by the private catalog, quote and order transaction.
CREATE FUNCTION public.laute_portal_price(a public.laute_portal_accounts,p jsonb)
RETURNS jsonb LANGUAGE plpgsql STABLE SET search_path=public,pg_temp AS $$
DECLARE b numeric; c numeric; d numeric; base numeric; currency text;
BEGIN
 SELECT (value->>'percent')::numeric INTO b FROM jsonb_array_elements(a.discounts) WHERE value->>'kind'='brand' AND lower(value->>'key')=lower(coalesce(p->>'brand','LAUTE'));
 SELECT (value->>'percent')::numeric INTO c FROM jsonb_array_elements(a.discounts) WHERE value->>'kind'='category' AND value->>'key'=p->>'category';
 IF b IS NOT NULL AND c IS NOT NULL AND a.discount_policy='reject' THEN RAISE EXCEPTION 'Пересечение скидок: менеджеру нужно выбрать правило'; END IF;
 d:=CASE WHEN b IS NULL THEN coalesce(c,0) WHEN c IS NULL THEN b WHEN a.discount_policy='brand' THEN b WHEN a.discount_policy='category' THEN c ELSE greatest(b,c) END;
 base:=nullif(coalesce(p->>'price','0')::numeric,0);
 currency:=coalesce(nullif(p->>'currency',''),'₸');
 RETURN jsonb_build_object('article',p->>'article','title',coalesce(nullif(p->>'title',''),nullif(p->>'name',''),p->>'article'),
 'currency',currency,'basePrice',base,'discount',d,'price',CASE WHEN base>0 THEN round(base*(100-d)/100,2) ELSE NULL END);
END $$;

CREATE FUNCTION public.laute_portal(p_action text,p_token text DEFAULT NULL,p_data jsonb DEFAULT '{}')
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,extensions,pg_temp AS $$
DECLARE a public.laute_portal_accounts; target public.laute_portal_accounts; manager public.laute_portal_accounts;
 is_admin boolean:=false; v_token text; v_id uuid; v_password text; v_profile jsonb; v_discounts jsonb;
 v_role text; v_policy text; v_limit numeric; v_item jsonb; v_product jsonb; v_price jsonb; v_items jsonb:='[]';
 v_totals jsonb; v_hash text; v_quantity int; v_order public.laute_portal_orders; v_status text; v_result jsonb;
BEGIN
 IF p_action='login' THEN
   IF length(coalesce(p_data->>'password',''))>72 THEN RETURN jsonb_build_object('success',false,'error','Неверный логин или пароль'); END IF;
   SELECT * INTO a FROM laute_portal_accounts WHERE login=lower(trim(p_data->>'login')) FOR UPDATE;
   IF NOT FOUND OR NOT a.active THEN
     PERFORM crypt('invalid-password', '$2a$10$abcdefghijklmnopqrstuu');
     RETURN jsonb_build_object('success',false,'error','Неверный логин или пароль');
   END IF;
   IF a.locked_until>now() THEN RETURN jsonb_build_object('success',false,'error','Вход заблокирован на 15 минут'); END IF;
   IF a.password_hash IS DISTINCT FROM crypt(coalesce(p_data->>'password',''),a.password_hash) THEN
     UPDATE laute_portal_accounts SET failed_attempts=CASE WHEN locked_until IS NOT NULL THEN 1 ELSE failed_attempts+1 END,
       locked_until=CASE WHEN locked_until IS NULL AND failed_attempts>=4 THEN now()+interval '15 minutes' ELSE NULL END WHERE id=a.id;
     RETURN jsonb_build_object('success',false,'error','Неверный логин или пароль');
   END IF;
   UPDATE laute_portal_accounts SET failed_attempts=0,locked_until=NULL WHERE id=a.id;
   DELETE FROM laute_portal_sessions WHERE expires_at<now();
   v_token:=encode(gen_random_bytes(32),'hex');
   INSERT INTO laute_portal_sessions(token_hash,account_id) VALUES(encode(digest(v_token,'sha256'),'hex'),a.id);
   RETURN jsonb_build_object('success',true,'token',v_token,'account',laute_portal_public_account(a));
 END IF;

 SELECT x.* INTO a FROM laute_portal_sessions s JOIN laute_portal_accounts x ON x.id=s.account_id
 WHERE s.token_hash=encode(digest(coalesce(p_token,''),'sha256'),'hex') AND s.expires_at>now() AND x.active FOR UPDATE OF x;
 IF a.id IS NULL THEN is_admin:=coalesce(laute_check_session(p_token),false); END IF;
 IF a.id IS NULL AND NOT is_admin THEN RAISE EXCEPTION 'Сессия истекла. Войди снова' USING ERRCODE='28000'; END IF;
 IF p_action='logout' THEN DELETE FROM laute_portal_sessions WHERE token_hash=encode(digest(p_token,'sha256'),'hex'); RETURN jsonb_build_object('success',true); END IF;
 IF p_action='password' AND a.id IS NOT NULL THEN
   v_password:=p_data->>'password';
   IF length(v_password)<12 OR octet_length(v_password)>72 THEN RAISE EXCEPTION 'Пароль: от 12 символов, не более 72 байт'; END IF;
   IF a.password_hash=crypt(v_password,a.password_hash) THEN RAISE EXCEPTION 'Выбери новый пароль'; END IF;
   UPDATE laute_portal_accounts SET password_hash=crypt(v_password,gen_salt('bf',10)),must_change=false,revision=revision+1 WHERE id=a.id RETURNING * INTO a;
   DELETE FROM laute_portal_sessions WHERE account_id=a.id AND token_hash<>encode(digest(p_token,'sha256'),'hex');
   RETURN jsonb_build_object('success',true,'account',laute_portal_public_account(a));
 END IF;
 IF p_action='me' THEN
   SELECT * INTO manager FROM laute_portal_accounts WHERE id=a.manager_id AND active;
   RETURN jsonb_build_object('success',true,'account',laute_portal_public_account(a),
     'manager',CASE WHEN manager.id IS NOT NULL THEN manager.profile ELSE NULL END);
 END IF;
 IF a.must_change THEN RAISE EXCEPTION 'Сначала смени временный пароль'; END IF;

 IF p_action IN ('accounts','save_account','reset_password') THEN
   IF NOT is_admin AND a.role<>'manager' THEN RAISE EXCEPTION 'Недостаточно прав'; END IF;
   IF p_action='accounts' THEN
     SELECT coalesce(jsonb_agg(laute_portal_public_account(x) ORDER BY x.created_at DESC),'[]') INTO v_result
       FROM laute_portal_accounts x WHERE is_admin OR (x.role='partner' AND x.manager_id=a.id);
     RETURN jsonb_build_object('success',true,'accounts',v_result);
   END IF;
   v_id:=coalesce(nullif(p_data->>'id','')::uuid,gen_random_uuid());
   SELECT * INTO target FROM laute_portal_accounts WHERE id=v_id FOR UPDATE;
   IF target.id IS NOT NULL AND NOT is_admin AND (target.role<>'partner' OR target.manager_id<>a.id OR target.manager_id IS NULL) THEN RAISE EXCEPTION 'Недостаточно прав'; END IF;
   IF p_action='reset_password' THEN
     IF target.id IS NULL THEN RAISE EXCEPTION 'Кабинет не найден'; END IF;
     v_password:=encode(gen_random_bytes(15),'hex');
     UPDATE laute_portal_accounts SET password_hash=crypt(v_password,gen_salt('bf',10)),must_change=true,failed_attempts=0,locked_until=NULL,revision=revision+1 WHERE id=v_id RETURNING * INTO target;
     DELETE FROM laute_portal_sessions WHERE account_id=v_id;
     RETURN jsonb_build_object('success',true,'account',laute_portal_public_account(target),'temporaryPassword',v_password);
   END IF;
   v_role:=coalesce(p_data->>'role','partner');
   IF v_role NOT IN ('partner','manager') OR (NOT is_admin AND v_role<>'partner') OR (target.id IS NOT NULL AND target.role<>v_role) THEN RAISE EXCEPTION 'Недопустимая роль'; END IF;
   IF coalesce(p_data->>'login','') !~ '^[a-zA-Z0-9@._+-]{3,100}$' THEN RAISE EXCEPTION 'Логин: 3–100 латинских букв, цифр или @._+-'; END IF;
   IF target.id IS NOT NULL AND (p_data->>'revision')::bigint IS DISTINCT FROM target.revision THEN RAISE EXCEPTION 'Карточку изменили. Обнови список'; END IF;
   v_profile:=jsonb_build_object('name',trim(p_data->'profile'->>'name'),'country',upper(trim(p_data->'profile'->>'country')),
     'organizationForm',trim(p_data->'profile'->>'organizationForm'),'taxId',trim(p_data->'profile'->>'taxId'),
     'registrationId',trim(p_data->'profile'->>'registrationId'),'bankDetails',trim(p_data->'profile'->>'bankDetails'),
     'contactName',trim(p_data->'profile'->>'contactName'),'email',trim(p_data->'profile'->>'email'),'phone',trim(p_data->'profile'->>'phone'));
   IF coalesce(v_profile->>'name','')='' OR coalesce(v_profile->>'email','') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' OR coalesce(v_profile->>'phone','')='' THEN RAISE EXCEPTION 'Укажи название, email и телефон'; END IF;
   IF v_role='partner' AND (coalesce(v_profile->>'country','') !~ '^[A-Z]{2}$' OR coalesce(v_profile->>'organizationForm','')='' OR coalesce(v_profile->>'taxId','')='') THEN RAISE EXCEPTION 'Укажи страну (ISO), форму организации и налоговый номер'; END IF;
   IF v_role='partner' AND v_profile->>'country'='RU' AND v_profile->>'taxId' !~ '^(\d{10}|\d{12})$' THEN RAISE EXCEPTION 'ИНН РФ: 10 или 12 цифр'; END IF;
   IF v_role='partner' AND v_profile->>'country'='KZ' AND v_profile->>'taxId' !~ '^\d{12}$' THEN RAISE EXCEPTION 'БИН/ИИН: 12 цифр'; END IF;
   IF octet_length(v_profile::text)>12000 THEN RAISE EXCEPTION 'Реквизиты слишком длинные'; END IF;
   IF v_role='partner' THEN
     SELECT * INTO manager FROM laute_portal_accounts WHERE id=CASE WHEN is_admin THEN nullif(p_data->>'managerId','')::uuid ELSE a.id END AND role='manager' AND active FOR UPDATE;
     IF manager.id IS NULL THEN RAISE EXCEPTION 'Выбери активного менеджера'; END IF;
   END IF;
   v_limit:=CASE WHEN v_role='partner' THEN manager.max_discount WHEN is_admin THEN coalesce((p_data->>'maxDiscount')::numeric,30) ELSE a.max_discount END;
   IF v_limit<0 OR v_limit>99 THEN RAISE EXCEPTION 'Лимит скидки: от 0 до 99%%'; END IF;
   v_discounts:=coalesce(p_data->'discounts','[]'); v_policy:=coalesce(p_data->>'discountPolicy','reject');
   IF jsonb_typeof(v_discounts)<>'array' OR jsonb_array_length(v_discounts)>200 OR v_policy NOT IN ('reject','brand','category','best') THEN RAISE EXCEPTION 'Некорректные скидки'; END IF;
   FOR v_item IN SELECT value FROM jsonb_array_elements(v_discounts) LOOP
     IF coalesce(v_item->>'kind','') NOT IN ('brand','category') OR coalesce(trim(v_item->>'key'),'')='' OR coalesce((v_item->>'percent')::numeric,-1)<0 OR (v_item->>'percent')::numeric>least(v_limit,coalesce(manager.max_discount,99)) THEN RAISE EXCEPTION 'Скидка превышает лимит менеджера или содержит ошибку'; END IF;
   END LOOP;
   IF EXISTS(SELECT 1 FROM jsonb_array_elements(v_discounts) GROUP BY value->>'kind',lower(value->>'key') HAVING count(*)>1) THEN RAISE EXCEPTION 'Удали повторяющиеся скидки'; END IF;
   IF v_policy='reject' AND EXISTS(SELECT 1 FROM jsonb_array_elements(v_discounts) WHERE value->>'kind'='brand') AND EXISTS(SELECT 1 FROM jsonb_array_elements(v_discounts) WHERE value->>'kind'='category') THEN RAISE EXCEPTION 'Для скидок по бренду и категории выбери правило пересечения'; END IF;
   IF v_role='manager' AND EXISTS(SELECT 1 FROM laute_portal_accounts x,LATERAL jsonb_array_elements(x.discounts) d WHERE x.manager_id=v_id AND (d->>'percent')::numeric>v_limit) THEN RAISE EXCEPTION 'Сначала уменьши скидки клиентов этого менеджера'; END IF;
   IF target.id IS NULL THEN v_password:=encode(gen_random_bytes(15),'hex'); END IF;
   INSERT INTO laute_portal_accounts(id,login,role,password_hash,profile,manager_id,max_discount,discounts,discount_policy,active)
   VALUES(v_id,lower(trim(p_data->>'login')),v_role,coalesce(target.password_hash,crypt(v_password,gen_salt('bf',10))),v_profile,manager.id,v_limit,v_discounts,v_policy,coalesce((p_data->>'active')::boolean,true))
   ON CONFLICT(id) DO UPDATE SET login=excluded.login,profile=excluded.profile,manager_id=excluded.manager_id,max_discount=excluded.max_discount,discounts=excluded.discounts,discount_policy=excluded.discount_policy,active=excluded.active,revision=laute_portal_accounts.revision+1 RETURNING * INTO target;
   IF NOT target.active THEN DELETE FROM laute_portal_sessions WHERE account_id=v_id; END IF;
   RETURN jsonb_build_object('success',true,'account',laute_portal_public_account(target),'temporaryPassword',v_password);
 END IF;

 IF p_action='catalog' THEN
   IF a.role IS DISTINCT FROM 'partner' THEN RAISE EXCEPTION 'Только для клиента'; END IF;
   SELECT coalesce(jsonb_agg(laute_portal_price(a,coalesce(p.raw_data,'{}')||to_jsonb(p))),'[]') INTO v_result FROM laute_products p WHERE p.status='АКТИВЕН';
   RETURN jsonb_build_object('success',true,'prices',v_result);
 END IF;
 IF p_action IN ('quote','submit_order') THEN
   IF a.role IS DISTINCT FROM 'partner' THEN RAISE EXCEPTION 'Только для клиента'; END IF;
   IF NOT EXISTS(SELECT 1 FROM laute_portal_accounts WHERE id=a.manager_id AND role='manager' AND active) THEN RAISE EXCEPTION 'Менеджер недоступен. Обратись в отдел продаж'; END IF;
   IF p_action='submit_order' THEN
     v_id:=(p_data->>'requestId')::uuid;
     IF v_id IS NULL THEN RAISE EXCEPTION 'Не указан номер запроса'; END IF;
     SELECT * INTO v_order FROM laute_portal_orders WHERE id=v_id;
     IF FOUND THEN
       IF v_order.account_id<>a.id THEN RAISE EXCEPTION 'Номер запроса занят'; END IF;
       RETURN jsonb_build_object('success',true,'order',to_jsonb(v_order));
     END IF;
   END IF;
   IF jsonb_typeof(p_data->'items') IS DISTINCT FROM 'array' OR jsonb_array_length(p_data->'items') NOT BETWEEN 1 AND 200 THEN RAISE EXCEPTION 'В заказе должно быть от 1 до 200 позиций'; END IF;
   IF EXISTS(SELECT 1 FROM jsonb_array_elements(p_data->'items') GROUP BY value->>'article' HAVING count(*)>1) THEN RAISE EXCEPTION 'Повторяющиеся артикулы'; END IF;
   FOR v_item IN SELECT value FROM jsonb_array_elements(p_data->'items') ORDER BY value->>'article' LOOP
     IF coalesce(v_item->>'quantity','') !~ '^\d{1,4}$' THEN RAISE EXCEPTION 'Количество: целое число от 1 до 9999'; END IF;
     v_quantity:=(v_item->>'quantity')::int;
     IF v_quantity<1 THEN RAISE EXCEPTION 'Количество должно быть больше нуля'; END IF;
     SELECT coalesce(p.raw_data,'{}')||to_jsonb(p) INTO v_product FROM laute_products p WHERE p.article=v_item->>'article' AND p.status='АКТИВЕН' FOR SHARE;
     IF v_product IS NULL THEN RAISE EXCEPTION 'Товар % недоступен. Удали его из корзины',v_item->>'article'; END IF;
     v_price:=laute_portal_price(a,v_product);
     IF v_price->>'price' IS NULL THEN RAISE EXCEPTION 'Для товара % менеджер ещё не указал цену',v_item->>'article'; END IF;
     v_items:=v_items||jsonb_build_array(v_price||jsonb_build_object('quantity',v_quantity,'subtotal',round((v_price->>'price')::numeric*v_quantity,2)));
   END LOOP;
   SELECT jsonb_object_agg(currency,total) INTO v_totals FROM (SELECT value->>'currency' currency,sum((value->>'subtotal')::numeric) total FROM jsonb_array_elements(v_items) GROUP BY value->>'currency') t;
   v_hash:=encode(digest(v_items::text||a.revision::text,'sha256'),'hex');
   IF p_action='quote' THEN RETURN jsonb_build_object('success',true,'items',v_items,'totals',v_totals,'hash',v_hash); END IF;
   IF v_hash IS DISTINCT FROM p_data->>'quoteHash' THEN RAISE EXCEPTION 'Цены изменились. Обнови расчёт и подтверди сумму'; END IF;
   IF length(coalesce(p_data->>'comment',''))>2000 THEN RAISE EXCEPTION 'Комментарий: не более 2000 символов'; END IF;
   INSERT INTO laute_portal_orders(id,account_id,items,totals,comment,history) VALUES(v_id,a.id,v_items,v_totals,coalesce(p_data->>'comment',''),jsonb_build_array(jsonb_build_object('status','new','at',now()))) RETURNING * INTO v_order;
   RETURN jsonb_build_object('success',true,'order',to_jsonb(v_order));
 END IF;
 IF p_action='orders' THEN
   SELECT coalesce(jsonb_agg(to_jsonb(o)||jsonb_build_object('customerName',x.profile->>'name') ORDER BY o.created_at DESC),'[]') INTO v_result
    FROM laute_portal_orders o JOIN laute_portal_accounts x ON x.id=o.account_id
    WHERE is_admin OR (a.role='manager' AND x.manager_id=a.id) OR o.account_id=a.id;
   RETURN jsonb_build_object('success',true,'orders',v_result);
 END IF;
 IF p_action='order_status' THEN
   SELECT o.* INTO v_order FROM laute_portal_orders o JOIN laute_portal_accounts x ON x.id=o.account_id
     WHERE o.id=(p_data->>'id')::uuid AND (is_admin OR (a.role='manager' AND x.manager_id=a.id)) FOR UPDATE OF o;
   IF NOT FOUND THEN RAISE EXCEPTION 'Заказ недоступен'; END IF;
   IF v_order.status IS DISTINCT FROM p_data->>'previousStatus' THEN RAISE EXCEPTION 'Статус изменился. Обнови заказы'; END IF;
   v_status:=p_data->>'status';
   IF NOT ((v_order.status='new' AND v_status IN ('accepted','cancelled')) OR (v_order.status='accepted' AND v_status IN ('processing','cancelled')) OR (v_order.status='processing' AND v_status IN ('shipped','cancelled')) OR (v_order.status='shipped' AND v_status='completed')) THEN RAISE EXCEPTION 'Недопустимый переход статуса'; END IF;
   UPDATE laute_portal_orders SET status=v_status,updated_at=now(),history=history||jsonb_build_array(jsonb_build_object('status',v_status,'at',now(),'actor',coalesce(a.login,'admin'))) WHERE id=v_order.id RETURNING * INTO v_order;
   RETURN jsonb_build_object('success',true,'order',to_jsonb(v_order));
 END IF;
 RAISE EXCEPTION 'Неизвестное действие';
END $$;

REVOKE ALL ON FUNCTION public.laute_portal_public_account(public.laute_portal_accounts),public.laute_portal_price(public.laute_portal_accounts,jsonb),public.laute_portal(text,text,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.laute_portal(text,text,jsonb) TO anon,authenticated;
COMMIT;
