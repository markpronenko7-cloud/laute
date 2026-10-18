BEGIN;

-- Take real pre-change snapshots and keep a whole Excel import in one transaction.
CREATE OR REPLACE FUNCTION public.laute_import_products(p_token text, p_products jsonb, p_deleted_skus jsonb DEFAULT '[]'::jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_id text := 'catalog_import_' || gen_random_uuid(); v_item jsonb; v_result jsonb; v_count integer := 0;
BEGIN
  IF NOT laute_check_session(p_token) THEN RAISE EXCEPTION 'Сессия недействительна'; END IF;
  IF jsonb_typeof(p_products) <> 'array' OR jsonb_typeof(p_deleted_skus) <> 'array' THEN RAISE EXCEPTION 'Ожидаются массивы товаров и артикулов'; END IF;
  LOCK TABLE laute_products IN SHARE ROW EXCLUSIVE MODE;
  INSERT INTO laute_backups(id, backup_type, description, data, session_id)
  SELECT v_id, 'catalog_import', 'Каталог до импорта Excel', coalesce(jsonb_agg(to_jsonb(p)), '[]'::jsonb), substr(p_token,1,8) FROM laute_products p;
  DELETE FROM laute_products WHERE upper(trim(article)) IN (SELECT upper(trim(value)) FROM jsonb_array_elements_text(p_deleted_skus));
  FOR v_item IN SELECT value FROM jsonb_array_elements(p_products) LOOP
    IF coalesce(trim(v_item->>'article'),'') = '' OR coalesce(trim(v_item->>'category'),'') = '' THEN RAISE EXCEPTION 'Артикул и категория обязательны'; END IF;
    v_result := laute_save_product(p_token, v_item);
    IF v_result->>'success' IS DISTINCT FROM 'true' THEN RAISE EXCEPTION '%', v_result->>'error'; END IF;
    v_count := v_count + 1;
  END LOOP;
  RETURN jsonb_build_object('success',true,'count',v_count,'backupId',v_id);
END $$;

-- Published content never includes private orders; the draft keeps them.
CREATE OR REPLACE FUNCTION public.laute_publish_content(p_token text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_draft jsonb; v_old jsonb; v_version text; v_id text := 'content_' || gen_random_uuid();
BEGIN
  IF NOT laute_check_session(p_token) THEN RAISE EXCEPTION 'Сессия недействительна'; END IF;
  SELECT data, version INTO v_old, v_version FROM laute_site_content WHERE id='published' FOR UPDATE;
  SELECT data INTO v_draft FROM laute_site_content WHERE id='draft' FOR UPDATE;
  v_draft := coalesce(v_draft,v_old);
  IF v_draft IS NULL THEN RAISE EXCEPTION 'Нет контента для публикации'; END IF;
  IF coalesce(v_version,'') ~ '^\d+\.\d+\.\d+$' THEN
    v_version := split_part(v_version,'.',1)||'.'||split_part(v_version,'.',2)||'.'||(split_part(v_version,'.',3)::integer+1);
  ELSE v_version := '1.0.1'; END IF;
  IF v_old IS NOT NULL THEN INSERT INTO laute_backups(id,backup_type,description,data,session_id) VALUES(v_id,'content_publish','Контент до публикации '||v_version,v_old,substr(p_token,1,8)); END IF;
  v_draft := v_draft || jsonb_build_object('version',v_version,'hasUnpublishedChanges',false);
  INSERT INTO laute_site_content(id,version,data,updated_at,updated_by) VALUES('published',v_version,v_draft-'order_inquiries',now(),substr(p_token,1,8))
    ON CONFLICT(id) DO UPDATE SET version=excluded.version,data=excluded.data,updated_at=now(),updated_by=excluded.updated_by;
  INSERT INTO laute_site_content(id,version,data,updated_at,updated_by) VALUES('draft',v_version,v_draft,now(),substr(p_token,1,8))
    ON CONFLICT(id) DO UPDATE SET version=excluded.version,data=excluded.data,updated_at=now(),updated_by=excluded.updated_by;
  INSERT INTO laute_audit_log(id,action,action_title,summary,session_id,backup_id)
    VALUES('log-'||gen_random_uuid(),'CONTENT_PUBLISH','Публикация контента','Версия '||v_version,substr(p_token,1,8),v_id);
  RETURN jsonb_build_object('success',true,'version',v_version,'backupId',v_id,'content',v_draft-'order_inquiries');
END $$;

CREATE OR REPLACE FUNCTION public.laute_save_custom_pages(p_token text,p_pages jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_previous jsonb;
BEGIN
  IF NOT laute_check_session(p_token) THEN RAISE EXCEPTION 'Сессия недействительна'; END IF;
  IF jsonb_typeof(p_pages) <> 'array' THEN RAISE EXCEPTION 'Ожидается массив страниц'; END IF;
  SELECT pages INTO v_previous FROM laute_custom_pages WHERE id='current' FOR UPDATE;
  INSERT INTO laute_backups(id,backup_type,description,data,session_id)
    VALUES('pages_'||gen_random_uuid(),'pages_update','Страницы до сохранения',coalesce(v_previous,'[]'::jsonb),substr(p_token,1,8));
  INSERT INTO laute_custom_pages(id,pages,updated_at) VALUES('current',p_pages,now()) ON CONFLICT(id) DO UPDATE SET pages=excluded.pages,updated_at=now();
  RETURN jsonb_build_object('success',true);
END $$;

-- Restore a backup only to its own domain, never a product array into site content.
CREATE OR REPLACE FUNCTION public.laute_restore_backup(p_token text,p_backup_id text,p_scope text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE b record; v_item jsonb; v_current jsonb; v_private jsonb; v_result jsonb;
BEGIN
  IF NOT laute_check_session(p_token) THEN RAISE EXCEPTION 'Сессия недействительна'; END IF;
  SELECT * INTO b FROM laute_backups WHERE id=p_backup_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Резервная копия не найдена'; END IF;
  IF p_scope='content' AND b.backup_type IN ('content_publish','content_restore') AND jsonb_typeof(b.data)='object' THEN
    SELECT data INTO v_current FROM laute_site_content WHERE id='published' FOR UPDATE;
    SELECT data->'order_inquiries' INTO v_private FROM laute_site_content WHERE id='draft' FOR UPDATE;
    INSERT INTO laute_backups(id,backup_type,description,data,session_id) VALUES('content_restore_'||gen_random_uuid(),'content_restore','Контент до восстановления',v_current,substr(p_token,1,8));
    UPDATE laute_site_content SET data=(b.data-'order_inquiries')||jsonb_build_object('hasUnpublishedChanges',false),updated_at=now() WHERE id='published';
    INSERT INTO laute_site_content(id,version,data,updated_at,updated_by) VALUES('draft','draft',(b.data-'order_inquiries')||jsonb_build_object('order_inquiries',coalesce(v_private,'[]'::jsonb),'hasUnpublishedChanges',false),now(),substr(p_token,1,8)) ON CONFLICT(id) DO UPDATE SET data=excluded.data,updated_at=now();
  ELSIF p_scope='pages' AND b.backup_type IN ('pages_update','pages_restore') AND jsonb_typeof(b.data)='array' THEN
    SELECT pages INTO v_current FROM laute_custom_pages WHERE id='current' FOR UPDATE;
    INSERT INTO laute_backups(id,backup_type,description,data,session_id) VALUES('pages_restore_'||gen_random_uuid(),'pages_restore','Страницы до восстановления',coalesce(v_current,'[]'::jsonb),substr(p_token,1,8));
    INSERT INTO laute_custom_pages(id,pages,updated_at) VALUES('current',b.data,now()) ON CONFLICT(id) DO UPDATE SET pages=excluded.pages,updated_at=now();
  ELSIF p_scope='catalog' AND b.backup_type IN ('catalog_batch','catalog_import','catalog_restore','product_update') THEN
    LOCK TABLE laute_products IN SHARE ROW EXCLUSIVE MODE;
    SELECT coalesce(jsonb_agg(to_jsonb(p)),'[]'::jsonb) INTO v_current FROM laute_products p;
    INSERT INTO laute_backups(id,backup_type,description,data,session_id) VALUES('catalog_restore_'||gen_random_uuid(),'catalog_restore','Каталог до восстановления',v_current,substr(p_token,1,8));
    IF b.backup_type='product_update' THEN b.data:=jsonb_build_array(b.data);
    ELSE
      IF jsonb_typeof(b.data)<>'array' THEN RAISE EXCEPTION 'Неверный формат снимка каталога'; END IF;
      DELETE FROM laute_products WHERE article NOT IN(SELECT upper(trim(value->>'article')) FROM jsonb_array_elements(b.data));
    END IF;
    FOR v_item IN SELECT value FROM jsonb_array_elements(b.data) LOOP
      v_result := laute_save_product(p_token, coalesce(v_item->'raw_data','{}'::jsonb)||v_item);
      IF v_result->>'success' IS DISTINCT FROM 'true' THEN RAISE EXCEPTION '%',v_result->>'error'; END IF;
    END LOOP;
  ELSE RAISE EXCEPTION 'Этот снимок не подходит для выбранного раздела'; END IF;
  RETURN jsonb_build_object('success',true,'scope',p_scope,'restoredVersion',p_backup_id);
END $$;

CREATE OR REPLACE FUNCTION public.laute_rollback_content(p_token text,p_backup_id text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN RETURN laute_restore_backup(p_token,p_backup_id,'content'); END $$;

-- The existing warehouse list RPC upserts only. Deletion needs an explicit operation.
CREATE OR REPLACE FUNCTION public.laute_delete_warehouse(p_token text,p_id text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  IF NOT laute_check_session(p_token) THEN RAISE EXCEPTION 'Сессия недействительна'; END IF;
  IF NOT EXISTS(SELECT 1 FROM laute_warehouses WHERE id=p_id) THEN RAISE EXCEPTION 'Склад не найден'; END IF;
  INSERT INTO laute_backups(id,backup_type,description,data,session_id)
    SELECT 'warehouse_'||gen_random_uuid(),'warehouse_delete','Склад до удаления',jsonb_build_object('warehouse',to_jsonb(w),'stock',(SELECT coalesce(jsonb_agg(to_jsonb(s)),'[]'::jsonb) FROM laute_warehouse_stock s WHERE warehouse_id=p_id)),substr(p_token,1,8) FROM laute_warehouses w WHERE id=p_id;
  DELETE FROM laute_warehouse_stock WHERE warehouse_id=p_id;
  DELETE FROM laute_warehouses WHERE id=p_id;
  RETURN jsonb_build_object('success',true);
END $$;

-- New RPCs use the same explicit LAUTE session checks as existing admin operations.
REVOKE ALL ON FUNCTION public.laute_import_products(text,jsonb,jsonb), public.laute_restore_backup(text,text,text), public.laute_delete_warehouse(text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.laute_import_products(text,jsonb,jsonb), public.laute_restore_backup(text,text,text), public.laute_delete_warehouse(text,text) TO anon,authenticated;
COMMIT;
