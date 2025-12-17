-- =====================================================
-- Sample Order Data for Testing
-- Date: 2025-12-17
-- Description: Insert a sample order with order items for testing
-- =====================================================

-- First, get a valid user_id and product_id from existing data
-- You may need to adjust these IDs based on your actual data

DO $$
DECLARE
  v_user_id UUID;
  v_product_id UUID;
  v_order_id UUID;
  v_order_number TEXT;
BEGIN
  -- Get the first available user
  SELECT id INTO v_user_id FROM public.admin_accounts LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No user found in admin_accounts table';
  END IF;
  
  -- Get the first available product
  SELECT id INTO v_product_id FROM public.products LIMIT 1;
  
  IF v_product_id IS NULL THEN
    RAISE EXCEPTION 'No product found in products table';
  END IF;

  -- Generate order ID
  v_order_id := gen_random_uuid();
  
  -- Insert the order
  INSERT INTO public.orders (
    id,
    user_id,
    status,
    subtotal,
    tax_amount,
    shipping_fee,
    total_amount,
    price_type,
    shipping_address,
    payment_status,
    payment_method,
    created_at,
    updated_at,
    paid_at
  ) VALUES (
    v_order_id,
    v_user_id,
    'processing',
    15000,
    1500,
    500,
    17000,
    'retail',
    '{"recipientName": "山田 太郎", "postalCode": "100-0001", "prefecture": "東京都", "city": "千代田区", "addressLine1": "丸の内1-1-1", "addressLine2": "サンプルビル 3F", "phone": "03-1234-5678"}'::jsonb,
    'paid',
    'stripe',
    NOW(),
    NOW(),
    NOW()
  )
  RETURNING order_number INTO v_order_number;

  -- Insert order items
  INSERT INTO public.order_items (
    order_id,
    product_id,
    product_code,
    product_name,
    quantity,
    unit_price,
    tax_rate,
    subtotal
  ) VALUES (
    v_order_id,
    v_product_id,
    'PRD-001',
    'リトミック教材セット',
    2,
    5000,
    10.00,
    10000
  );

  INSERT INTO public.order_items (
    order_id,
    product_id,
    product_code,
    product_name,
    quantity,
    unit_price,
    tax_rate,
    subtotal
  ) VALUES (
    v_order_id,
    v_product_id,
    'PRD-002',
    '指導者用テキスト',
    1,
    5000,
    10.00,
    5000
  );

  RAISE NOTICE 'Created order: % (ID: %)', v_order_number, v_order_id;
END $$;

-- Show the created order
SELECT id, order_number, status, payment_status, total_amount, created_at 
FROM public.orders 
ORDER BY created_at DESC 
LIMIT 1;
