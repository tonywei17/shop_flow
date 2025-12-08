-- =====================================================
-- Add Commission Rate to Departments
-- Date: 2025-12-07
-- Description: Add commission_rate field for branch profit sharing
-- =====================================================

-- Add commission_rate column to departments table
-- This field is only meaningful for 支局 (branch) type departments
ALTER TABLE public.departments 
ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 10.00;

-- Add comment
COMMENT ON COLUMN public.departments.commission_rate IS '支局分成比例（百分比），仅对支局类型有效。教室购买商品后，总部按此比例给上级支局分成。';

-- Create index for quick lookup of branches with commission rates
CREATE INDEX IF NOT EXISTS idx_departments_commission_rate 
ON public.departments(commission_rate) 
WHERE type = '支局';
