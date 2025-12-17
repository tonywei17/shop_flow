-- =====================================================
-- Add cancelled_at field to orders table
-- Date: 2025-12-17
-- Description: Add cancelled_at timestamp to track when orders are cancelled
-- =====================================================

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

COMMENT ON COLUMN public.orders.cancelled_at IS 'Timestamp when the order was cancelled';
