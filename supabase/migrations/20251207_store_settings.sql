-- =====================================================
-- Store Settings Migration
-- Date: 2025-12-07
-- Description: Create store_settings table for managing store configuration
-- =====================================================

-- Create store_settings table
CREATE TABLE IF NOT EXISTS public.store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 基本信息
  store_name TEXT NOT NULL DEFAULT 'オンラインストア',
  store_status TEXT NOT NULL DEFAULT 'active', -- active(営業中), maintenance(メンテナンス中)
  
  -- 税設定
  tax_rate DECIMAL(5,2) NOT NULL DEFAULT 10.00, -- 消費税率 (%)
  tax_type TEXT NOT NULL DEFAULT 'exclusive', -- exclusive(外税), inclusive(内税)
  
  -- 配送設定
  shipping_fee INTEGER NOT NULL DEFAULT 0, -- 固定送料（円）
  free_shipping_threshold INTEGER DEFAULT NULL, -- 送料無料の閾値（NULL=送料無料なし）
  
  -- 端数処理
  rounding_method TEXT NOT NULL DEFAULT 'round', -- round(四捨五入), floor(切り捨て), ceil(切り上げ)
  
  -- 注文制限
  minimum_order_amount INTEGER NOT NULL DEFAULT 0, -- 最低注文金額（円）
  
  -- タイムスタンプ
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add check constraints
ALTER TABLE public.store_settings
ADD CONSTRAINT store_settings_status_check 
CHECK (store_status IN ('active', 'maintenance'));

ALTER TABLE public.store_settings
ADD CONSTRAINT store_settings_tax_type_check 
CHECK (tax_type IN ('exclusive', 'inclusive'));

ALTER TABLE public.store_settings
ADD CONSTRAINT store_settings_rounding_check 
CHECK (rounding_method IN ('round', 'floor', 'ceil'));

ALTER TABLE public.store_settings
ADD CONSTRAINT store_settings_tax_rate_check 
CHECK (tax_rate >= 0 AND tax_rate <= 100);

ALTER TABLE public.store_settings
ADD CONSTRAINT store_settings_shipping_fee_check 
CHECK (shipping_fee >= 0);

ALTER TABLE public.store_settings
ADD CONSTRAINT store_settings_minimum_order_check 
CHECK (minimum_order_amount >= 0);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_store_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_store_settings_updated_at ON public.store_settings;
CREATE TRIGGER trigger_store_settings_updated_at
  BEFORE UPDATE ON public.store_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_store_settings_updated_at();

-- Insert default settings (only one row should exist)
INSERT INTO public.store_settings (id) 
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Comments
COMMENT ON TABLE public.store_settings IS 'オンラインストアの設定';
COMMENT ON COLUMN public.store_settings.store_name IS '店舗名';
COMMENT ON COLUMN public.store_settings.store_status IS '店舗状態 (active=営業中, maintenance=メンテナンス中)';
COMMENT ON COLUMN public.store_settings.tax_rate IS '消費税率 (%)';
COMMENT ON COLUMN public.store_settings.tax_type IS '税計算方式 (exclusive=外税, inclusive=内税)';
COMMENT ON COLUMN public.store_settings.shipping_fee IS '固定送料（円）';
COMMENT ON COLUMN public.store_settings.free_shipping_threshold IS '送料無料の閾値（円）、NULLの場合は送料無料なし';
COMMENT ON COLUMN public.store_settings.rounding_method IS '端数処理方法 (round=四捨五入, floor=切り捨て, ceil=切り上げ)';
COMMENT ON COLUMN public.store_settings.minimum_order_amount IS '最低注文金額（円）';
