# 請求書管理システム設計書

> **作成日**: 2025-12-17
> **最終更新**: 2025-12-18
> **ステータス**: 実装完了（PDF生成機能追加）

## 1. 概要

請求書管理システムは、毎月の請求書を各支局に対して一括生成・管理するためのモジュールです。

### 1.1 主要機能

- **CC会員データ管理**: 3種類のCSVファイルをインポートし、教室別の会員数を管理
- **請求書一括生成**: 全支局に対して月次請求書を自動生成
- **請求書管理**: ステータス管理、支払追跡、エクスポート

### 1.2 請求書の構成要素

請求書の金額は以下の4つの要素から構成されます：

1. **前月未払残高** - 前月以前の未払い請求書の残高
2. **教材費** - 「請求書払い」で購入された教材の合計
3. **CC会員費** - 儿童会員数 × 単価（支局: 480円/人、税抜）
4. **その他費用** - 承認済みのその他費用

## 2. データベース設計

### 2.1 テーブル一覧

| テーブル名 | 説明 |
|-----------|------|
| `invoices` | 請求書主表 |
| `invoice_items` | 請求書明細 |
| `cc_member_imports` | CC会員インポートバッチ |
| `cc_members` | CC会員データ（教室別） |
| `membership_fee_settings` | 会費設定 |

### 2.2 invoices（請求書主表）

```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE,  -- INV-YYYYMM-XXX-vN
  department_id UUID REFERENCES departments(id),
  billing_month VARCHAR(7),           -- YYYY-MM
  previous_balance NUMERIC(12,2),
  material_amount NUMERIC(12,2),
  membership_amount NUMERIC(12,2),
  other_expenses_amount NUMERIC(12,2),
  subtotal NUMERIC(12,2),
  tax_amount NUMERIC(12,2),
  total_amount NUMERIC(12,2),
  status VARCHAR(20),                 -- draft/confirmed/sent/paid/overdue
  due_date DATE,
  paid_amount NUMERIC(12,2),
  -- バージョン管理
  version INTEGER DEFAULT 1,          -- バージョン番号
  is_current BOOLEAN DEFAULT true,    -- 現行バージョンフラグ
  superseded_by UUID,                 -- 後継バージョンへの参照
  supersedes UUID,                    -- 前バージョンへの参照
  generation_reason TEXT,             -- 生成理由（initial/regeneration/correction）
  ...
);
```

### 2.2.1 バージョン管理

請求書は以下のバージョン管理ルールに従います：

| フィールド | 説明 |
|-----------|------|
| `version` | バージョン番号（1から開始） |
| `is_current` | 現行バージョンかどうか |
| `superseded_by` | このバージョンを置き換えた新バージョンのID |
| `supersedes` | このバージョンが置き換えた旧バージョンのID |
| `generation_reason` | 生成理由 |

**請求書番号フォーマット**: `INV-YYYYMM-支局コード-vN`
- 例: `INV-202512-1110-v1`, `INV-202512-1110-v2`

**再生成ルール**:
- `draft`（下書き）状態の請求書のみ再生成可能
- 再生成時、旧バージョンは `superseded` 状態に変更
- `confirmed`/`sent`/`paid` 状態の請求書は再生成不可

### 2.3 cc_members（CC会員データ）

```sql
CREATE TABLE cc_members (
  id UUID PRIMARY KEY,
  import_id UUID REFERENCES cc_member_imports(id),
  billing_month VARCHAR(7),
  classroom_code VARCHAR(20),         -- 教室番号（例: 1110001）
  classroom_name VARCHAR(255),
  branch_code VARCHAR(10),            -- 支局コード（例: 1110）
  baby_count INTEGER,                 -- ベビー/1歳児
  step1_count INTEGER,                -- Step1/2歳児
  ...
  total_count INTEGER,                -- 合計
  unit_price NUMERIC(10,2),           -- 単価
  amount NUMERIC(12,2),               -- 金額
  is_aigran BOOLEAN,                  -- アイグラン教室フラグ
  is_bank_transfer BOOLEAN,           -- 口座振替済みフラグ
  is_excluded BOOLEAN,                -- 請求対象外フラグ
  ...
);
```

## 3. CSVインポート仕様

### 3.1 ファイル種別

| 種別 | ファイル名例 | 説明 |
|------|-------------|------|
| `child_count` | 11月度チャイルド数.xlsx | 全教室の会員数 |
| `aigran` | アイグラン11月度.xlsx | アイグラン特約教室（優先） |
| `bank_transfer` | 口座振替教室一覧.xlsx | 口座振替済み教室（除外） |

### 3.2 インポート順序

1. **child_count** を最初にインポート（全教室データ）
2. **aigran** をインポート（アイグランデータで上書き）
3. **bank_transfer** をインポート（対象教室を除外フラグ設定）

### 3.3 教室コード体系

- **支局行**: `XXXX000`（末尾が000）→ 請求対象外
- **アイグラン**: `XXXX777`（末尾が777）→ アイグランフラグ設定
- **通常教室**: `XXXXXXX`（7桁）

## 4. API設計

### 4.1 CC会員API

| エンドポイント | メソッド | 説明 |
|---------------|---------|------|
| `/api/cc-members` | GET | 会員データ一覧 |
| `/api/cc-members/import` | POST | CSVインポート |
| `/api/cc-members/summary` | GET | 支局別サマリー |

### 4.2 請求書API

| エンドポイント | メソッド | 説明 |
|---------------|---------|------|
| `/api/invoices` | GET | 請求書一覧 |
| `/api/invoices` | POST | 請求書作成 |
| `/api/invoices/generate` | POST | 一括生成 |
| `/api/invoices/[id]` | GET/PATCH/DELETE | 個別操作 |

## 5. 画面設計

### 5.1 CC会員管理 (`/billing/cc-fees`)

- 月別フィルター
- サマリーカード（支局数、総会員数、合計請求額、口座振替済）
- 支局別一覧テーブル
- CSVインポートダイアログ

### 5.2 請求書一覧 (`/billing/invoices`)

- 月別フィルター
- サマリーカード（総件数、下書き、送付済、支払済、合計金額）
- 請求書一覧テーブル
- 一括生成ダイアログ

## 6. 業務フロー

### 6.1 月次請求書生成フロー

```
毎月5日
    ↓
1. チャイルド数CSVインポート
    ↓
2. アイグランCSVインポート
    ↓
3. 口座振替教室CSVインポート
    ↓
4. CC会員ダッシュボードで確認
    ↓
5. 請求書一括生成
    ↓
6. 請求書確認・送付
    ↓
7. 支払追跡
```

### 6.2 請求書ステータス

| ステータス | 説明 |
|-----------|------|
| `draft` | 下書き（編集可能） |
| `confirmed` | 確定（編集不可） |
| `sent` | 送付済み |
| `paid` | 支払済み |
| `partial_paid` | 一部支払 |
| `overdue` | 期限超過 |
| `cancelled` | キャンセル |

## 7. 会費計算ロジック

```typescript
// 各支局の請求額計算
for (const branch of branches) {
  // 1. 前月未払残高
  const previousBalance = getUnpaidBalance(branch.id);
  
  // 2. 教材費（請求書払い分）
  const materialAmount = getMaterialOrders(branch.id, payment_method='invoice');
  
  // 3. CC会員費
  const members = getCCMembers(branch.store_code, is_excluded=false);
  const membershipAmount = members.reduce((sum, m) => sum + m.amount, 0);
  
  // 4. その他費用
  const otherExpenses = getApprovedExpenses(branch.store_code);
  
  // 合計計算
  const subtotal = previousBalance + materialAmount + membershipAmount + otherExpenses;
  const taxAmount = (materialAmount + membershipAmount + otherExpenses) * 0.1;
  const totalAmount = subtotal + taxAmount;
}
```

## 8. 月分の概念

システム内の月選択には「月分」という概念を使用します：

| 用語 | 説明 | 例 |
|------|------|-----|
| X月 | 現在の暦月 | 2025年12月（現在） |
| Y月分 | Y月内に発生したデータの請求期間 | 2025年11月分（11月のデータ） |

**デフォルト動作**:
- 請求書生成画面は**前月分**をデフォルト表示
- 例：12月に開くと「2025年11月分」が選択される

## 9. SuperAdmin機能

### 9.1 データ削除（テスト用）

SuperAdmin（role_code = "admin"）のみが使用可能な機能：

- **パスワード保護**: 環境変数 `ADMIN_CLEAR_DATA_PASSWORD` で設定
- **削除オプション**: 選択月のみ / 全データ
- **監査ログ**: すべての削除操作は `system_audit_log` テーブルに記録

**API**: `POST /api/admin/clear-invoices`

## 10. PDF生成機能

### 10.1 技術スタック

| コンポーネント | 技術 | 説明 |
|--------------|------|------|
| HTMLテンプレート | TypeScript | 請求書のHTML生成 |
| PDF変換 | Puppeteer | HTMLからPDFへの変換 |
| フォント | Noto Serif JP (CDN) | 日本語フォント |

### 10.2 ファイル構成

```
apps/web/src/lib/pdf/
├── invoice-types.ts           # 型定義
├── invoice-html-template.ts   # HTMLテンプレート生成
├── generate-pdf-puppeteer.ts  # Puppeteer PDF生成
├── generate-invoice-pdf.tsx   # データ変換・エントリポイント
└── invoice-pdf-template.tsx   # (レガシー) react-pdf テンプレート
```

### 10.3 API エンドポイント

| エンドポイント | メソッド | 説明 |
|---------------|---------|------|
| `/api/invoices/[id]/pdf` | GET | 単一請求書PDF生成 |
| `/api/invoices/generate-pdf-batch` | POST | 一括PDF生成（ZIP） |

### 10.4 PDF構成

```
請求書PDF（2ページ）
├── 1ページ目: ご請求書
│   ├── 請求先・発行元情報
│   ├── 請求金額（税込）
│   ├── 明細サマリー（前月繰越/CC会員費/商品購入額/その他費用）
│   ├── 合計計算
│   └── 振込先情報
└── 2ページ目: ご請求明細書
    ├── CC会員費明細（教室別）
    ├── 教材費明細（注文別）
    └── 合計
```

### 10.5 UI機能

- **PDFプレビュー**: 請求書一覧の各行に「PDFプレビュー」ボタン
- **PDF一括ダウンロード**: 請求書を選択して「PDF一括ダウンロード」ボタン（ZIPファイル）

## 11. 今後の拡張予定

- [x] 請求書PDF出力
- [ ] PDF布局の1:1複製（顧客サンプルPDFに合わせる）
- [ ] メール送付機能
- [ ] 支払リマインダー
- [ ] 銀行振込データ連携
- [ ] 月次レポート自動生成
- [x] 請求書バージョン管理
- [x] SuperAdminデータ削除機能
