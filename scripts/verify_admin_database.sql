-- Run as database owner. All test writes are rolled back; no credentials are returned.
BEGIN;
DO $$
DECLARE t text; r jsonb; b text; before_count integer; payload jsonb; original jsonb; failed boolean;
BEGIN
  SELECT token INTO t FROM public.laute_admin_sessions WHERE expires_at>now() ORDER BY last_seen_at DESC LIMIT 1;
  IF t IS NULL THEN RAISE EXCEPTION 'Для проверки нужна активная сессия администратора'; END IF;
  SELECT count(*) INTO before_count FROM public.laute_products;
  payload:='[{"article":"QA-ROLLBACK-ONLY","name":"QA","category":"Смесители для ванны","price":123,"currency":"₽","status":"СКРЫТ","drawingUrl":"https://example.com/drawing.png","extraSpecs":"QA"}]';
  r:=public.laute_import_products(t,payload,'[]'); b:=r->>'backupId';
  IF NOT EXISTS(SELECT 1 FROM public.laute_products WHERE article='QA-ROLLBACK-ONLY' AND category='Смесители для ванны' AND raw_data->>'drawingUrl'='https://example.com/drawing.png') THEN RAISE EXCEPTION 'Импорт потерял поля'; END IF;
  IF (SELECT count(*) FROM public.laute_products)<>before_count+1 THEN RAISE EXCEPTION 'Импорт затронул другие товары'; END IF;
  failed:=false;
  BEGIN
    PERFORM public.laute_import_products(t,'[{"article":"QA-ROLLBACK-ONLY","category":"Картриджи","price":999},{"article":"INVALID"}]','[]');
  EXCEPTION WHEN OTHERS THEN failed:=true; END;
  IF NOT failed OR (SELECT price FROM public.laute_products WHERE article='QA-ROLLBACK-ONLY')<>123 THEN RAISE EXCEPTION 'Импорт не атомарен'; END IF;
  PERFORM public.laute_restore_backup(t,b,'catalog');
  IF (SELECT count(*) FROM public.laute_products)<>before_count THEN RAISE EXCEPTION 'Откат каталога не восстановил снимок'; END IF;
  failed:=false;
  BEGIN PERFORM public.laute_restore_backup(t,b,'content'); EXCEPTION WHEN OTHERS THEN failed:=true; END;
  IF NOT failed THEN RAISE EXCEPTION 'Каталог можно записать в контент'; END IF;

  PERFORM public.laute_save_custom_pages(t,'[{"id":"qa-page","slug":"qa-rollback-only","title":"QA","status":"ЧЕРНОВИК","blocks":[]}]');
  IF NOT EXISTS(SELECT 1 FROM public.laute_custom_pages WHERE id='current' AND pages->0->>'slug'='qa-rollback-only') THEN RAISE EXCEPTION 'Страница не сохранилась'; END IF;
  SELECT id INTO b FROM public.laute_backups WHERE backup_type='pages_update' ORDER BY created_at DESC LIMIT 1;
  PERFORM public.laute_restore_backup(t,b,'pages');
  IF EXISTS(SELECT 1 FROM public.laute_custom_pages WHERE id='current' AND pages->0->>'slug'='qa-rollback-only') THEN RAISE EXCEPTION 'Откат страниц не сработал'; END IF;

  SELECT data INTO original FROM public.laute_site_content WHERE id='published';
  PERFORM public.laute_save_content_draft(t,original||'{"_qa":"persisted","hasUnpublishedChanges":true,"order_inquiries":[{"inquiryNumber":"QA-PRIVATE"}]}');
  r:=public.laute_publish_content(t); b:=r->>'backupId';
  IF r->>'success'<>'true' OR r->'content'->>'_qa'<>'persisted' THEN RAISE EXCEPTION 'Неверный ответ публикации'; END IF;
  IF EXISTS(SELECT 1 FROM public.laute_site_content WHERE id='published' AND data?'order_inquiries') THEN RAISE EXCEPTION 'В публикацию попали приватные заявки'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.laute_site_content WHERE id='draft' AND data->>'hasUnpublishedChanges'='false' AND data->'order_inquiries'->0->>'inquiryNumber'='QA-PRIVATE') THEN RAISE EXCEPTION 'Публикация потеряла заявки или статус'; END IF;
  PERFORM public.laute_restore_backup(t,b,'content');
  IF EXISTS(SELECT 1 FROM public.laute_site_content WHERE id='published' AND data?'_qa') THEN RAISE EXCEPTION 'Откат контента не сработал'; END IF;

  PERFORM public.laute_save_warehouses(t,'[{"id":"qa-warehouse","name":"QA","isActive":true}]');
  PERFORM public.laute_save_stock(t,'[{"warehouseId":"qa-warehouse","sku":"QA-SKU","quantity":7}]');
  IF NOT EXISTS(SELECT 1 FROM public.laute_warehouse_stock WHERE warehouse_id='qa-warehouse' AND quantity=7) THEN RAISE EXCEPTION 'Остаток не сохранён'; END IF;
  PERFORM public.laute_delete_warehouse(t,'qa-warehouse');
  IF EXISTS(SELECT 1 FROM public.laute_warehouses WHERE id='qa-warehouse') OR EXISTS(SELECT 1 FROM public.laute_warehouse_stock WHERE warehouse_id='qa-warehouse') THEN RAISE EXCEPTION 'Склад не удалён'; END IF;
END $$;
ROLLBACK;
SELECT 'PASS: import, atomicity, fields, catalog/pages/content restore, publish privacy, warehouses, stock. All test writes rolled back.' AS result;
