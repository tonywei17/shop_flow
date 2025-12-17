-- Create order with items and stock adjustment in a single transaction
CREATE OR REPLACE FUNCTION create_order_with_stock_adjustment(
  p_order_number TEXT,
  p_user_id UUID,
  p_subtotal NUMERIC,
  p_tax_amount NUMERIC,
  p_shipping_fee NUMERIC,
  p_total_amount NUMERIC,
  p_price_type TEXT,
  p_shipping_address JSONB,
  p_payment_method TEXT,
  p_items JSONB
) RETURNS JSONB AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
  v_product_id UUID;
  v_quantity INTEGER;
  v_current_stock INTEGER;
  v_result JSONB;
BEGIN
  -- Validate stock availability for all items first
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'productId')::UUID;
    v_quantity := (v_item->>'quantity')::INTEGER;
    
    SELECT stock INTO v_current_stock FROM products WHERE id = v_product_id FOR UPDATE;
    
    IF v_current_stock IS NULL THEN
      RAISE EXCEPTION 'Product not found: %', v_product_id;
    END IF;
    
    IF v_current_stock < v_quantity THEN
      RAISE EXCEPTION 'Insufficient stock for product %: available %, requested %', 
        v_product_id, v_current_stock, v_quantity;
    END IF;
  END LOOP;

  -- Create order
  INSERT INTO orders (
    order_number,
    user_id,
    status,
    subtotal,
    tax_amount,
    shipping_fee,
    total_amount,
    price_type,
    shipping_address,
    payment_status,
    payment_method
  ) VALUES (
    p_order_number,
    p_user_id,
    'pending',
    p_subtotal,
    p_tax_amount,
    p_shipping_fee,
    p_total_amount,
    p_price_type,
    p_shipping_address,
    'unpaid',
    p_payment_method
  ) RETURNING id INTO v_order_id;

  -- Create order items and adjust stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'productId')::UUID;
    v_quantity := (v_item->>'quantity')::INTEGER;
    
    -- Insert order item
    INSERT INTO order_items (
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
      v_item->>'productCode',
      v_item->>'productName',
      v_quantity,
      (v_item->>'unitPrice')::NUMERIC,
      (v_item->>'taxRate')::NUMERIC,
      (v_item->>'unitPrice')::NUMERIC * v_quantity
    );
    
    -- Adjust stock
    UPDATE products 
    SET stock = stock - v_quantity,
        updated_at = NOW()
    WHERE id = v_product_id;
    
    -- Record inventory adjustment
    INSERT INTO inventory_adjustments (
      product_id,
      delta,
      stock_before,
      stock_after,
      reason,
      note,
      user_id
    ) SELECT
      v_product_id,
      -v_quantity,
      stock + v_quantity,
      stock,
      'order',
      'Order: ' || p_order_number,
      p_user_id
    FROM products WHERE id = v_product_id;
  END LOOP;

  v_result := jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'order_number', p_order_number
  );
  
  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$ LANGUAGE plpgsql;
