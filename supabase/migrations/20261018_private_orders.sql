BEGIN;
CREATE TABLE IF NOT EXISTS public.laute_order_inquiries (
  inquiry_number text PRIMARY KEY,
  data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
ALTER TABLE public.laute_order_inquiries ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.laute_order_inquiries FROM anon,authenticated;
-- Preserve existing private orders without exposing them in the content document.
INSERT INTO public.laute_order_inquiries(inquiry_number,data)
  SELECT item->>'inquiryNumber',item FROM public.laute_site_content,
    LATERAL jsonb_array_elements(CASE WHEN jsonb_typeof(data->'order_inquiries')='array' THEN data->'order_inquiries' ELSE '[]'::jsonb END) item
  WHERE coalesce(item->>'inquiryNumber','')<>'' ON CONFLICT DO NOTHING;
UPDATE public.laute_site_content SET data=data-'order_inquiries' WHERE data?'order_inquiries';

CREATE OR REPLACE FUNCTION public.laute_submit_order_inquiry(p_order jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE v_contact text:=trim(p_order->'customer'->>'contact');
BEGIN
  IF jsonb_typeof(p_order)<>'object' OR length(p_order::text)>200000 OR coalesce(p_order->>'inquiryNumber','') !~ '^LAUTE-[0-9]{8}-[0-9]{4}$'
    OR coalesce(length(v_contact),0)<3 OR length(v_contact)>200 OR jsonb_typeof(p_order->'items') IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'Некорректная заявка'; END IF;
  IF jsonb_array_length(p_order->'items')<1 OR jsonb_array_length(p_order->'items')>500 THEN RAISE EXCEPTION 'Некорректный состав заявки'; END IF;
  PERFORM pg_advisory_xact_lock(hashtext(v_contact));
  IF (SELECT count(*) FROM laute_order_inquiries WHERE data->'customer'->>'contact'=v_contact AND created_at>now()-interval '1 minute')>=3 THEN RAISE EXCEPTION 'Слишком много заявок. Повтори позже.'; END IF;
  INSERT INTO laute_order_inquiries(inquiry_number,data) VALUES(p_order->>'inquiryNumber',p_order);
  RETURN jsonb_build_object('success',true);
END $$;

CREATE OR REPLACE FUNCTION public.laute_get_orders(p_token text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
BEGIN
  IF NOT laute_check_session(p_token) THEN RAISE EXCEPTION 'Сессия недействительна'; END IF;
  RETURN jsonb_build_object('success',true,'orders',(SELECT coalesce(jsonb_agg(data ORDER BY created_at DESC),'[]'::jsonb) FROM laute_order_inquiries WHERE deleted_at IS NULL));
END $$;

CREATE OR REPLACE FUNCTION public.laute_update_order(p_token text,p_number text,p_patch jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE v_data jsonb;
BEGIN
  IF NOT laute_check_session(p_token) THEN RAISE EXCEPTION 'Сессия недействительна'; END IF;
  UPDATE laute_order_inquiries SET data=data||p_patch WHERE inquiry_number=p_number AND deleted_at IS NULL RETURNING data INTO v_data;
  IF NOT FOUND THEN RAISE EXCEPTION 'Заявка не найдена'; END IF;
  RETURN jsonb_build_object('success',true,'order',v_data);
END $$;

CREATE OR REPLACE FUNCTION public.laute_delete_order(p_token text,p_number text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
BEGIN
  IF NOT laute_check_session(p_token) THEN RAISE EXCEPTION 'Сессия недействительна'; END IF;
  UPDATE laute_order_inquiries SET deleted_at=now() WHERE inquiry_number=p_number;
  RETURN jsonb_build_object('success',true);
END $$;
REVOKE ALL ON FUNCTION public.laute_submit_order_inquiry(jsonb),public.laute_get_orders(text),public.laute_update_order(text,text,jsonb),public.laute_delete_order(text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.laute_submit_order_inquiry(jsonb),public.laute_get_orders(text),public.laute_update_order(text,text,jsonb),public.laute_delete_order(text,text) TO anon,authenticated;
COMMIT;
