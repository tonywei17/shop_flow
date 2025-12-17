-- その他費用管理テーブル
-- Other expenses management table

CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 店舗情報
  store_code VARCHAR(20) NOT NULL,           -- 店番
  store_name VARCHAR(255) NOT NULL,          -- 店名
  
  -- 費用情報
  expense_date DATE NOT NULL,                -- 費用発生日
  account_item_code VARCHAR(20) NOT NULL,    -- 勘定項目コード
  description TEXT NOT NULL,                 -- 項目名/説明
  expense_type VARCHAR(50) NOT NULL DEFAULT '課税分', -- 費用タイプ（課税分/非課税分）
  amount DECIMAL(12, 2) NOT NULL,            -- 請求金額
  
  -- 審査情報
  reviewer_account_id UUID REFERENCES public.admin_accounts(id), -- 審査者アカウントID
  review_status VARCHAR(20) DEFAULT 'pending', -- 審査ステータス: pending, approved, rejected
  reviewed_at TIMESTAMPTZ,                   -- 審査日時
  review_note TEXT,                          -- 審査メモ
  
  -- バッチインポート情報
  import_batch_id UUID,                      -- インポートバッチID（一括インポート時）
  import_source VARCHAR(50),                 -- インポート元: manual, xlsx, csv
  
  -- 請求書関連
  invoice_id UUID,                           -- 関連請求書ID（将来の請求書モジュール用）
  invoice_month VARCHAR(7),                  -- 請求月 (YYYY-MM形式)
  
  -- メタデータ
  created_by UUID REFERENCES public.admin_accounts(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_expenses_store_code ON public.expenses(store_code);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON public.expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_account_item_code ON public.expenses(account_item_code);
CREATE INDEX IF NOT EXISTS idx_expenses_review_status ON public.expenses(review_status);
CREATE INDEX IF NOT EXISTS idx_expenses_invoice_month ON public.expenses(invoice_month);
CREATE INDEX IF NOT EXISTS idx_expenses_import_batch_id ON public.expenses(import_batch_id);

-- インポートバッチ管理テーブル
CREATE TABLE IF NOT EXISTS public.expense_import_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name VARCHAR(255) NOT NULL,           -- アップロードファイル名
  file_type VARCHAR(10) NOT NULL,            -- ファイルタイプ: xlsx, csv
  total_records INT NOT NULL DEFAULT 0,      -- 総レコード数
  success_records INT NOT NULL DEFAULT 0,    -- 成功レコード数
  failed_records INT NOT NULL DEFAULT 0,     -- 失敗レコード数
  status VARCHAR(20) DEFAULT 'processing',   -- ステータス: processing, completed, failed
  error_log JSONB,                           -- エラーログ
  created_by UUID REFERENCES public.admin_accounts(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- RLSポリシー
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_import_batches ENABLE ROW LEVEL SECURITY;

-- 管理者は全てのレコードにアクセス可能
CREATE POLICY "Admin full access to expenses" ON public.expenses
  FOR ALL USING (true);

CREATE POLICY "Admin full access to expense_import_batches" ON public.expense_import_batches
  FOR ALL USING (true);

-- updated_at自動更新トリガー
CREATE OR REPLACE FUNCTION update_expenses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_expenses_updated_at();

COMMENT ON TABLE public.expenses IS 'その他費用管理テーブル - 月次請求書に含まれる各種費用を管理';
COMMENT ON TABLE public.expense_import_batches IS '費用インポートバッチ管理テーブル - ファイルアップロードの履歴を管理';
