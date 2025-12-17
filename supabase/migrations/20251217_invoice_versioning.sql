-- 請求書版本管理
-- Invoice Versioning for Financial Compliance
-- 
-- 設計理念：
-- 1. 每次生成的請求書都保留，不可删除（財務合規）
-- 2. 同一支局同一月份可以有多個版本
-- 3. 只有最新版本（is_current = true）為有效版本
-- 4. 需要用戶確認後才能發送

-- ============================================
-- 1. 添加版本管理字段到 invoices 表
-- ============================================
ALTER TABLE public.invoices 
  ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_current BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS superseded_by UUID REFERENCES public.invoices(id),
  ADD COLUMN IF NOT EXISTS supersedes UUID REFERENCES public.invoices(id),
  ADD COLUMN IF NOT EXISTS generation_reason VARCHAR(100);  -- initial/recalculation/correction/adjustment

-- 更新 invoice_number 約束（允許同一支局同一月份多個版本）
-- 請求書番號格式: INV-YYYYMM-支局代碼-版本號
-- 例: INV-202512-1110-v1, INV-202512-1110-v2

-- 移除原有的 UNIQUE 約束（如果存在）
ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_invoice_number_key;

-- 添加新的複合唯一約束
CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_unique_current 
  ON public.invoices(department_id, billing_month) 
  WHERE is_current = true;

-- ============================================
-- 2. 添加版本歷史視圖
-- ============================================
CREATE OR REPLACE VIEW public.invoice_versions AS
SELECT 
  i.id,
  i.invoice_number,
  i.department_id,
  d.name as department_name,
  d.store_code,
  i.billing_month,
  i.version,
  i.is_current,
  i.total_amount,
  i.status,
  i.generation_reason,
  i.confirmed_at,
  i.confirmed_by,
  i.created_at,
  i.supersedes,
  i.superseded_by
FROM public.invoices i
LEFT JOIN public.departments d ON i.department_id = d.id
ORDER BY i.department_id, i.billing_month, i.version DESC;

-- ============================================
-- 3. 添加確認記錄表（審計追蹤）
-- ============================================
CREATE TABLE IF NOT EXISTS public.invoice_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id),
  action VARCHAR(50) NOT NULL,  -- created/confirmed/sent/paid/superseded/cancelled
  action_by UUID REFERENCES public.admin_accounts(id),
  action_at TIMESTAMPTZ DEFAULT NOW(),
  old_status VARCHAR(20),
  new_status VARCHAR(20),
  old_values JSONB,
  new_values JSONB,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_invoice_audit_log_invoice_id ON public.invoice_audit_log(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_audit_log_action_at ON public.invoice_audit_log(action_at);

-- ============================================
-- 4. 狀態流轉說明
-- ============================================
-- draft      -> 草稿（剛生成，可以重新生成新版本）
-- confirmed  -> 已確認（用戶確認後，準備發送）
-- sent       -> 已發送（發送給支局後）
-- paid       -> 已支付
-- partial_paid -> 部分支付
-- overdue    -> 逾期
-- superseded -> 已被新版本取代（舊版本的最終狀態）

COMMENT ON COLUMN public.invoices.version IS '版本號，從1開始遞增';
COMMENT ON COLUMN public.invoices.is_current IS '是否為當前有效版本';
COMMENT ON COLUMN public.invoices.superseded_by IS '被哪個新版本取代';
COMMENT ON COLUMN public.invoices.supersedes IS '取代了哪個舊版本';
COMMENT ON COLUMN public.invoices.generation_reason IS '生成原因：initial/recalculation/correction/adjustment';
