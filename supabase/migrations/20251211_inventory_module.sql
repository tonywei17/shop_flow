-- Inventory management module: adjustments table, function, and optional view

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.inventory_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  delta INTEGER NOT NULL,
  stock_before INTEGER NOT NULL,
  stock_after INTEGER NOT NULL,
  reason TEXT NOT NULL,
  note TEXT,
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_product
  ON public.inventory_adjustments(product_id);

CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_created_at
  ON public.inventory_adjustments(created_at);

CREATE OR REPLACE FUNCTION public.adjust_product_stock(
  p_product_id UUID,
  p_delta INTEGER,
  p_reason TEXT,
  p_note TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL
) RETURNS public.inventory_adjustments
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_before INTEGER;
  v_after INTEGER;
  v_adjustment public.inventory_adjustments;
BEGIN
  SELECT stock INTO v_before
  FROM public.products
  WHERE id = p_product_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found for id=%', p_product_id;
  END IF;

  v_after := GREATEST(0, v_before + p_delta);

  UPDATE public.products
    SET stock = v_after,
        updated_at = now()
    WHERE id = p_product_id;

  INSERT INTO public.inventory_adjustments (
    product_id, delta, stock_before, stock_after, reason, note, user_id
  ) VALUES (
    p_product_id, p_delta, v_before, v_after, p_reason, p_note, p_user_id
  )
  RETURNING * INTO v_adjustment;

  RETURN v_adjustment;
END;
$$;

CREATE OR REPLACE VIEW public.v_product_inventory AS
SELECT
  p.*,
  CASE
    WHEN p.stock <= 0 THEN 'out_of_stock'
    WHEN p.stock_alert_threshold IS NOT NULL AND p.stock <= p.stock_alert_threshold THEN 'low_stock'
    ELSE 'ok'
  END AS stock_status
FROM public.products p;
