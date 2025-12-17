-- 請求書管理システム
-- Invoice Management System for Monthly Billing

-- ============================================
-- 1. 請求書主表 (invoices)
-- ============================================
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 請求書基本情報
  invoice_number VARCHAR(50) NOT NULL UNIQUE,  -- 請求書番号: INV-YYYYMM-XXX
  department_id UUID NOT NULL REFERENCES public.departments(id),
  billing_month VARCHAR(7) NOT NULL,           -- 請求月 (YYYY-MM形式)
  
  -- 金額明細
  previous_balance NUMERIC(12,2) DEFAULT 0,    -- 前月未払残高
  material_amount NUMERIC(12,2) DEFAULT 0,     -- 教材費用
  membership_amount NUMERIC(12,2) DEFAULT 0,   -- CC会員費用
  other_expenses_amount NUMERIC(12,2) DEFAULT 0, -- その他費用
  subtotal NUMERIC(12,2) DEFAULT 0,            -- 小計（税抜）
  tax_amount NUMERIC(12,2) DEFAULT 0,          -- 消費税
  total_amount NUMERIC(12,2) DEFAULT 0,        -- 合計金額
  
  -- ステータス管理
  status VARCHAR(20) DEFAULT 'draft',          -- draft/confirmed/sent/paid/partial_paid/overdue/cancelled
  due_date DATE,                               -- 支払期限
  
  -- 支払情報
  paid_amount NUMERIC(12,2) DEFAULT 0,         -- 支払済金額
  paid_at TIMESTAMPTZ,                         -- 支払日時
  payment_method VARCHAR(50),                  -- 支払方法
  payment_note TEXT,                           -- 支払メモ
  
  -- 確認・送付情報
  confirmed_by UUID REFERENCES public.admin_accounts(id),
  confirmed_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  sent_method VARCHAR(50),                     -- 送付方法: email/mail/fax
  
  -- メタデータ
  notes TEXT,
  created_by UUID REFERENCES public.admin_accounts(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_invoices_department_id ON public.invoices(department_id);
CREATE INDEX IF NOT EXISTS idx_invoices_billing_month ON public.invoices(billing_month);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.invoices(due_date);

-- ============================================
-- 2. 請求書明細表 (invoice_items)
-- ============================================
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  
  -- 明細情報
  item_type VARCHAR(30) NOT NULL,              -- previous_balance/material/membership/other_expense
  description TEXT,                            -- 項目説明
  quantity INTEGER DEFAULT 1,                  -- 数量
  unit_price NUMERIC(12,2),                    -- 単価
  amount NUMERIC(12,2) NOT NULL,               -- 金額（税抜）
  tax_rate NUMERIC(5,2) DEFAULT 10,            -- 税率
  tax_amount NUMERIC(12,2) DEFAULT 0,          -- 税額
  
  -- 参照情報
  reference_type VARCHAR(50),                  -- orders/expenses/cc_members/invoices
  reference_id UUID,                           -- 参照元ID
  
  -- 表示順
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_item_type ON public.invoice_items(item_type);

-- ============================================
-- 3. CC会員インポートバッチ (cc_member_imports)
-- ============================================
CREATE TABLE IF NOT EXISTS public.cc_member_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- インポート情報
  import_month VARCHAR(7) NOT NULL,            -- 対象月 (YYYY-MM)
  file_name VARCHAR(255) NOT NULL,             -- ファイル名
  file_type VARCHAR(50) NOT NULL,              -- child_count/aigran/bank_transfer (3種類)
  
  -- 処理結果
  row_count INTEGER DEFAULT 0,                 -- 総行数
  success_count INTEGER DEFAULT 0,             -- 成功数
  error_count INTEGER DEFAULT 0,               -- エラー数
  status VARCHAR(20) DEFAULT 'pending',        -- pending/processing/completed/failed
  error_log JSONB,                             -- エラーログ
  
  -- メタデータ
  imported_by UUID REFERENCES public.admin_accounts(id),
  imported_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_cc_member_imports_import_month ON public.cc_member_imports(import_month);
CREATE INDEX IF NOT EXISTS idx_cc_member_imports_file_type ON public.cc_member_imports(file_type);
CREATE INDEX IF NOT EXISTS idx_cc_member_imports_status ON public.cc_member_imports(status);

-- ============================================
-- 4. CC会員データ (cc_members)
-- ============================================
CREATE TABLE IF NOT EXISTS public.cc_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- インポート参照
  import_id UUID REFERENCES public.cc_member_imports(id) ON DELETE CASCADE,
  billing_month VARCHAR(7) NOT NULL,           -- 対象月
  
  -- 教室情報
  classroom_code VARCHAR(20) NOT NULL,         -- 教室番号 (例: 1110001)
  classroom_name VARCHAR(255),                 -- 教室名
  branch_code VARCHAR(10),                     -- 支局コード (例: 1110)
  branch_name VARCHAR(255),                    -- 支局名
  
  -- 会員数詳細
  baby_count INTEGER DEFAULT 0,                -- ベビー/1歳児
  step1_count INTEGER DEFAULT 0,               -- Step1/2歳児
  step2_count INTEGER DEFAULT 0,               -- Step2/3歳児
  step3_count INTEGER DEFAULT 0,               -- Step3/4歳児
  step4_count INTEGER DEFAULT 0,               -- Step4/5歳児
  step5_count INTEGER DEFAULT 0,               -- Step5
  other_count INTEGER DEFAULT 0,               -- その他＆小学生以上
  total_count INTEGER DEFAULT 0,               -- 合計
  
  -- 会費計算
  unit_price NUMERIC(10,2) DEFAULT 480,        -- 単価（税抜）
  amount NUMERIC(12,2),                        -- 金額（total_count × unit_price）
  
  -- フラグ
  is_aigran BOOLEAN DEFAULT false,             -- アイグラン教室フラグ
  is_bank_transfer BOOLEAN DEFAULT false,      -- 口座振替済みフラグ（請求対象外）
  is_excluded BOOLEAN DEFAULT false,           -- 請求対象外フラグ
  
  -- 元データ
  raw_data JSONB,                              -- 元のCSV行データ
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_cc_members_billing_month ON public.cc_members(billing_month);
CREATE INDEX IF NOT EXISTS idx_cc_members_classroom_code ON public.cc_members(classroom_code);
CREATE INDEX IF NOT EXISTS idx_cc_members_branch_code ON public.cc_members(branch_code);
CREATE INDEX IF NOT EXISTS idx_cc_members_is_bank_transfer ON public.cc_members(is_bank_transfer);
CREATE INDEX IF NOT EXISTS idx_cc_members_import_id ON public.cc_members(import_id);

-- ユニーク制約（同月・同教室は1レコードのみ）
CREATE UNIQUE INDEX IF NOT EXISTS idx_cc_members_unique_classroom_month 
  ON public.cc_members(billing_month, classroom_code);

-- ============================================
-- 5. 会費設定 (membership_fee_settings)
-- ============================================
CREATE TABLE IF NOT EXISTS public.membership_fee_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 設定情報
  fee_type VARCHAR(50) NOT NULL,               -- branch/headquarters/aigran/other
  fee_name VARCHAR(100),                       -- 設定名
  unit_price NUMERIC(10,2) NOT NULL,           -- 単価（税抜）
  tax_rate NUMERIC(5,2) DEFAULT 10,            -- 税率
  tax_included BOOLEAN DEFAULT false,          -- 税込みフラグ
  
  -- 有効期間
  effective_from DATE NOT NULL,
  effective_to DATE,
  
  -- メタデータ
  notes TEXT,
  created_by UUID REFERENCES public.admin_accounts(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- デフォルト会費設定を挿入
INSERT INTO public.membership_fee_settings (fee_type, fee_name, unit_price, tax_rate, tax_included, effective_from, notes)
VALUES 
  ('branch', '支局向けCC会員費', 480, 10, false, '2025-01-01', '支局向け標準単価（税抜480円）'),
  ('aigran', 'アイグラン向けCC会員費', 600, 10, false, '2025-01-01', 'アイグラン特約教室向け単価')
ON CONFLICT DO NOTHING;

-- ============================================
-- 6. RLSポリシー
-- ============================================
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cc_member_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cc_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_fee_settings ENABLE ROW LEVEL SECURITY;

-- 管理者フルアクセス
CREATE POLICY "Admin full access to invoices" ON public.invoices FOR ALL USING (true);
CREATE POLICY "Admin full access to invoice_items" ON public.invoice_items FOR ALL USING (true);
CREATE POLICY "Admin full access to cc_member_imports" ON public.cc_member_imports FOR ALL USING (true);
CREATE POLICY "Admin full access to cc_members" ON public.cc_members FOR ALL USING (true);
CREATE POLICY "Admin full access to membership_fee_settings" ON public.membership_fee_settings FOR ALL USING (true);

-- ============================================
-- 7. updated_at自動更新トリガー
-- ============================================
CREATE OR REPLACE FUNCTION update_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_invoices_updated_at();

CREATE TRIGGER trigger_cc_members_updated_at
  BEFORE UPDATE ON public.cc_members
  FOR EACH ROW
  EXECUTE FUNCTION update_invoices_updated_at();

CREATE TRIGGER trigger_membership_fee_settings_updated_at
  BEFORE UPDATE ON public.membership_fee_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_invoices_updated_at();

-- ============================================
-- 8. コメント
-- ============================================
COMMENT ON TABLE public.invoices IS '請求書主表 - 月次請求書を管理';
COMMENT ON TABLE public.invoice_items IS '請求書明細 - 請求書の各項目を管理';
COMMENT ON TABLE public.cc_member_imports IS 'CC会員インポートバッチ - CSVインポート履歴を管理';
COMMENT ON TABLE public.cc_members IS 'CC会員データ - 教室別の会員数と会費を管理';
COMMENT ON TABLE public.membership_fee_settings IS '会費設定 - 単価と税率の設定を管理';

-- ============================================
-- 9. expenses表にinvoice_id外部キー追加（既存テーブル更新）
-- ============================================
-- expenses.invoice_id に外部キー制約を追加
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_expenses_invoice_id' 
    AND table_name = 'expenses'
  ) THEN
    ALTER TABLE public.expenses 
    ADD CONSTRAINT fk_expenses_invoice_id 
    FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================
-- 10. 請求書番号生成関数
-- ============================================
CREATE OR REPLACE FUNCTION generate_invoice_number(p_billing_month VARCHAR(7))
RETURNS VARCHAR(50) AS $$
DECLARE
  v_count INTEGER;
  v_number VARCHAR(50);
BEGIN
  -- 該当月の請求書数をカウント
  SELECT COUNT(*) + 1 INTO v_count
  FROM public.invoices
  WHERE billing_month = p_billing_month;
  
  -- 番号生成: INV-YYYYMM-XXX
  v_number := 'INV-' || REPLACE(p_billing_month, '-', '') || '-' || LPAD(v_count::TEXT, 3, '0');
  
  RETURN v_number;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_invoice_number IS '請求書番号を自動生成（INV-YYYYMM-XXX形式）';
