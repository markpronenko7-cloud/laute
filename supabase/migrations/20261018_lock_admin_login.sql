-- Keep the production password and existing sessions intact while making
-- the five-attempt lockout atomic across concurrent requests.
CREATE OR REPLACE FUNCTION public.laute_login(p_password text, p_ip text DEFAULT NULL::text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $function$
DECLARE
  v_auth public.laute_admin_auth%ROWTYPE;
  v_token text;
  v_wait_mins integer;
  v_attempts integer;
BEGIN
  SELECT * INTO v_auth
  FROM public.laute_admin_auth
  WHERE id = 'master'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Пароль администратора не настроен');
  END IF;

  IF v_auth.locked_until IS NOT NULL AND v_auth.locked_until > now() THEN
    v_wait_mins := CEIL(EXTRACT(EPOCH FROM (v_auth.locked_until - now())) / 60);
    RETURN jsonb_build_object('success', false, 'error',
      'Слишком много неудачных попыток входа. Доступ заблокирован на ' || v_wait_mins || ' мин.');
  END IF;

  -- An expired lock starts a fresh set of five attempts.
  IF v_auth.locked_until IS NOT NULL THEN
    v_auth.failed_attempts := 0;
  END IF;

  IF v_auth.password_hash = crypt(p_password, v_auth.password_hash) THEN
    UPDATE public.laute_admin_auth
    SET failed_attempts = 0, locked_until = NULL, updated_at = now()
    WHERE id = 'master';

    v_token := encode(gen_random_bytes(32), 'hex');
    INSERT INTO public.laute_admin_sessions (token, expires_at, ip_address)
    VALUES (v_token, now() + interval '7 days', p_ip);

    INSERT INTO public.laute_audit_log (id, action, action_title, summary, details, session_id)
    VALUES (
      'log-' || floor(extract(epoch from now()) * 1000)::text || '-' || substr(md5(random()::text), 1, 5),
      'LOGIN_SUCCESS', 'Успешный вход в панель управления',
      'Авторизована сессия ' || substr(v_token, 1, 8),
      COALESCE('IP: ' || p_ip, 'IP: неизвестен'), substr(v_token, 1, 8)
    );

    RETURN jsonb_build_object(
      'success', true,
      'token', v_token,
      'session', jsonb_build_object(
        'id', 'laute_sess_' || substr(v_token, 1, 8),
        'role', 'admin',
        'title', 'Администратор LAUTE',
        'createdAt', now()
      )
    );
  END IF;

  v_attempts := COALESCE(v_auth.failed_attempts, 0) + 1;
  IF v_attempts >= 5 THEN
    UPDATE public.laute_admin_auth
    SET failed_attempts = v_attempts, locked_until = now() + interval '15 minutes', updated_at = now()
    WHERE id = 'master';

    INSERT INTO public.laute_audit_log (id, action, action_title, summary, details)
    VALUES (
      'log-' || floor(extract(epoch from now()) * 1000)::text || '-' || substr(md5(random()::text), 1, 5),
      'LOGIN_LOCKOUT', 'Блокировка доступа',
      'Превышено количество попыток входа (5)',
      COALESCE('IP: ' || p_ip, 'IP: неизвестен')
    );

    RETURN jsonb_build_object('success', false, 'error',
      'Превышено количество попыток (5). Вход заблокирован на 15 минут.');
  END IF;

  UPDATE public.laute_admin_auth
  SET failed_attempts = v_attempts, locked_until = NULL, updated_at = now()
  WHERE id = 'master';

  RETURN jsonb_build_object('success', false, 'error',
    'Неверный пароль. Осталось попыток: ' || (5 - v_attempts));
END;
$function$;
