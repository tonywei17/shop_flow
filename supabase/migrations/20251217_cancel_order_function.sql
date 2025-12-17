-- Cancel order and restore stock
CREATE OR REPLACE FUNCTION cancel_order_with_stock_restore(
  p_order_id UUID,
  p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
  v_item RECORD;
BEGIN
  -- Get order and verify ownership
  SELECT id, status, order_number INTO v_order 
  FROM orders 
  WHERE id = p_order_id AND user_id = p_user_id
  FOR UPDATE;
  
  IF v_order IS NULL THEN
    RAISE EXCEPTION 'Order not found or access denied';
  END IF;
  
  IF v_order.status != 'pending' THEN
    RAISE EXCEPTION 'Only pending orders can be cancelled';
  END IF;

  -- Restore stock for each item
  FOR v_item IN 
    SELECT product_id, quantity FROM order_items WHERE order_id = p_order_id
  LOOP
    -- Restore stock
    UPDATE products 
    SET stock = stock + v_item.quantity,
        updated_at = NOW()
    WHERE id = v_item.product_id;
    
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
      v_item.product_id,
      v_item.quantity,
      stock - v_item.quantity,
      stock,
      'order_cancel',
      'Order cancelled: ' || v_order.order_number,
      p_user_id
    FROM products WHERE id = v_item.product_id;
  END LOOP;

  -- Update order status
  UPDATE orders 
  SET status = 'cancelled',
      cancelled_at = NOW(),
      updated_at = NOW()
  WHERE id = p_order_id;

  RETURN jsonb_build_object('success', true, 'order_id', p_order_id);
END;
$$ LANGUAGE plpgsql;

-- Update order status (for admin use)
CREATE OR REPLACE FUNCTION update_order_status(
  p_order_id UUID,
  p_new_status TEXT,
  p_payment_status TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
  v_valid_transitions TEXT[];
BEGIN
  SELECT id, status, order_number INTO v_order 
  FROM orders 
  WHERE id = p_order_id
  FOR UPDATE;
  
  IF v_order IS NULL THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  -- Define valid status transitions
  CASE v_order.status
    WHEN 'pending' THEN v_valid_transitions := ARRAY['paid', 'cancelled'];
    WHEN 'paid' THEN v_valid_transitions := ARRAY['processing', 'cancelled'];
    WHEN 'processing' THEN v_valid_transitions := ARRAY['shipped', 'cancelled'];
    WHEN 'shipped' THEN v_valid_transitions := ARRAY['delivered'];
    WHEN 'delivered' THEN v_valid_transitions := ARRAY[]::TEXT[];
    WHEN 'cancelled' THEN v_valid_transitions := ARRAY[]::TEXT[];
    ELSE v_valid_transitions := ARRAY[]::TEXT[];
  END CASE;

  IF NOT (p_new_status = ANY(v_valid_transitions)) THEN
    RAISE EXCEPTION 'Invalid status transition from % to %', v_order.status, p_new_status;
  END IF;

  -- Update order
  UPDATE orders 
  SET 
    status = p_new_status,
    payment_status = COALESCE(p_payment_status, payment_status),
    paid_at = CASE WHEN p_new_status = 'paid' THEN NOW() ELSE paid_at END,
    shipped_at = CASE WHEN p_new_status = 'shipped' THEN NOW() ELSE shipped_at END,
    delivered_at = CASE WHEN p_new_status = 'delivered' THEN NOW() ELSE delivered_at END,
    cancelled_at = CASE WHEN p_new_status = 'cancelled' THEN NOW() ELSE cancelled_at END,
    updated_at = NOW()
  WHERE id = p_order_id;

  RETURN jsonb_build_object('success', true, 'order_id', p_order_id, 'new_status', p_new_status);
END;
$$ LANGUAGE plpgsql;
