-- =====================================================
-- Storefront Schema Migration
-- Date: 2025-12-06
-- Description: Add storefront access to roles, create orders/addresses tables
-- =====================================================

-- 1. Add storefront access fields to roles table
ALTER TABLE public.roles 
ADD COLUMN IF NOT EXISTS can_access_storefront BOOLEAN DEFAULT false;

ALTER TABLE public.roles 
ADD COLUMN IF NOT EXISTS default_price_type TEXT DEFAULT 'retail';

-- Add check constraint for default_price_type
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'roles_default_price_type_check'
  ) THEN
    ALTER TABLE public.roles 
    ADD CONSTRAINT roles_default_price_type_check 
    CHECK (default_price_type IN ('hq', 'branch', 'classroom', 'retail'));
  END IF;
END $$;

-- 2. Create addresses table for shipping addresses
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.admin_accounts(id) ON DELETE CASCADE,
  label TEXT, -- e.g., "自宅", "会社"
  recipient_name TEXT NOT NULL,
  postal_code TEXT,
  prefecture TEXT,
  city TEXT,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  phone TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);

-- 3. Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL, -- Human readable order number like "ORD-20251206-0001"
  user_id UUID NOT NULL REFERENCES public.admin_accounts(id),
  
  -- Order status: pending, confirmed, processing, shipped, delivered, cancelled
  status TEXT NOT NULL DEFAULT 'pending',
  
  -- Pricing (stored in integer yen)
  subtotal INTEGER NOT NULL DEFAULT 0,
  tax_amount INTEGER NOT NULL DEFAULT 0,
  shipping_fee INTEGER NOT NULL DEFAULT 0,
  total_amount INTEGER NOT NULL DEFAULT 0,
  
  -- Price type used for this order
  price_type TEXT NOT NULL DEFAULT 'retail',
  
  -- Shipping address (snapshot at order time)
  shipping_address JSONB,
  
  -- Payment
  payment_status TEXT DEFAULT 'unpaid', -- unpaid, paid, refunded
  payment_method TEXT, -- stripe, bank_transfer, etc.
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  paid_at TIMESTAMPTZ,
  
  -- Notes
  customer_notes TEXT,
  internal_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- 4. Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  
  -- Product snapshot at order time
  product_code TEXT NOT NULL,
  product_name TEXT NOT NULL,
  
  -- Quantity and pricing
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL, -- Price per unit in yen
  tax_rate DECIMAL(5,2) DEFAULT 10.00,
  subtotal INTEGER NOT NULL, -- quantity * unit_price
  
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- 5. Create cart_items table for persistent cart (optional, can use localStorage)
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.admin_accounts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);

-- 6. Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  today_date TEXT;
  seq_num INTEGER;
  new_order_number TEXT;
BEGIN
  today_date := to_char(CURRENT_DATE, 'YYYYMMDD');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(order_number FROM 'ORD-' || today_date || '-(\d+)') AS INTEGER)
  ), 0) + 1
  INTO seq_num
  FROM public.orders
  WHERE order_number LIKE 'ORD-' || today_date || '-%';
  
  new_order_number := 'ORD-' || today_date || '-' || LPAD(seq_num::TEXT, 4, '0');
  
  RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger to auto-generate order number
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_order_number ON public.orders;
CREATE TRIGGER trigger_set_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

-- 8. Update timestamp trigger for orders
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_orders_updated_at ON public.orders;
CREATE TRIGGER trigger_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_orders_updated_at();

-- 9. Update timestamp trigger for addresses
CREATE OR REPLACE FUNCTION update_addresses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_addresses_updated_at ON public.addresses;
CREATE TRIGGER trigger_addresses_updated_at
  BEFORE UPDATE ON public.addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_addresses_updated_at();

-- 10. Comment on tables
COMMENT ON TABLE public.addresses IS 'User shipping addresses for storefront orders';
COMMENT ON TABLE public.orders IS 'Storefront orders';
COMMENT ON TABLE public.order_items IS 'Line items for each order';
COMMENT ON TABLE public.cart_items IS 'Persistent shopping cart items';
COMMENT ON COLUMN public.roles.can_access_storefront IS 'Whether users with this role can access the internal storefront';
COMMENT ON COLUMN public.roles.default_price_type IS 'Default price level visible to users with this role (hq/branch/classroom/retail)';
