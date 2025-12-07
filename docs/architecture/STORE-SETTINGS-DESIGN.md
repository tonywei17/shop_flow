# 商店設定モジュール設計

## 概要

商店設定モジュールは、オンラインストアの基本設定（税率、送料、端数処理など）を管理するためのモジュールです。管理端で設定を変更し、Storefrontでその設定を反映します。

## データモデル

### store_settings テーブル

```sql
CREATE TABLE store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 基本情報
  store_name TEXT NOT NULL DEFAULT 'オンラインストア',
  store_status TEXT NOT NULL DEFAULT 'active', -- active(営業中), maintenance(メンテナンス中)
  
  -- 税設定
  tax_rate DECIMAL(5,2) NOT NULL DEFAULT 10.00, -- 消費税率 (%)
  tax_type TEXT NOT NULL DEFAULT 'exclusive',   -- exclusive(外税), inclusive(内税)
  
  -- 配送設定
  shipping_fee INTEGER NOT NULL DEFAULT 0,      -- 固定送料（円）
  free_shipping_threshold INTEGER DEFAULT NULL, -- 送料無料の閾値（NULL=送料無料なし）
  
  -- 端数処理
  rounding_method TEXT NOT NULL DEFAULT 'round', -- round(四捨五入), floor(切り捨て), ceil(切り上げ)
  
  -- 注文制限
  minimum_order_amount INTEGER NOT NULL DEFAULT 0, -- 最低注文金額（円）
  
  -- タイムスタンプ
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 制約

```sql
-- store_status: 'active' または 'maintenance'
-- tax_type: 'exclusive' または 'inclusive'
-- rounding_method: 'round', 'floor', 'ceil'
-- tax_rate: 0〜100
-- shipping_fee: 0以上
-- minimum_order_amount: 0以上
```

## API設計

### 管理端 API

#### GET /api/internal/store-settings
商店設定を取得

**レスポンス:**
```json
{
  "settings": {
    "id": "uuid",
    "store_name": "オンラインストア",
    "store_status": "active",
    "tax_rate": 10.00,
    "tax_type": "exclusive",
    "shipping_fee": 500,
    "free_shipping_threshold": 5000,
    "rounding_method": "round",
    "minimum_order_amount": 0
  }
}
```

#### PUT /api/internal/store-settings
商店設定を更新

**リクエスト:**
```json
{
  "store_name": "オンラインストア",
  "store_status": "active",
  "tax_rate": 10,
  "tax_type": "exclusive",
  "shipping_fee": 500,
  "free_shipping_threshold": 5000,
  "rounding_method": "round",
  "minimum_order_amount": 0
}
```

### Storefront API

#### GET /api/store-settings
商店設定を取得（公開用）

## アーキテクチャ

```
┌─────────────────────────────────────────────────────────────────┐
│                        管理端 (3000)                             │
├─────────────────────────────────────────────────────────────────┤
│  /commerce/settings                                              │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  StoreSettingsClient                                        ││
│  │  - 基本設定（店舗名、状態）                                   ││
│  │  - 税設定（税率、内税/外税）                                  ││
│  │  - 配送設定（送料、送料無料閾値）                             ││
│  │  - 計算設定（端数処理、最低注文金額）                         ││
│  └─────────────────────────────────────────────────────────────┘│
│                              │                                   │
│                              ▼                                   │
│              PUT /api/internal/store-settings                    │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Supabase Database                           │
│                      store_settings テーブル                      │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Storefront (3001)                           │
├─────────────────────────────────────────────────────────────────┤
│  layout.tsx                                                      │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  StoreSettingsProvider                                      ││
│  │  - settings: StoreSettings                                  ││
│  │  - isMaintenanceMode: boolean                               ││
│  └─────────────────────────────────────────────────────────────┘│
│                              │                                   │
│                              ▼                                   │
│  /checkout                                                       │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  CheckoutContent                                            ││
│  │  - 送料計算（calculateShippingFee）                          ││
│  │  - 送料無料メッセージ表示                                     ││
│  │  - 最低注文金額バリデーション                                 ││
│  │  - メンテナンスモード表示                                     ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## ファイル構成

### 管理端 (apps/web)

```
src/
├── app/
│   ├── api/internal/store-settings/
│   │   └── route.ts              # API エンドポイント
│   └── (dashboard)/commerce/settings/
│       ├── page.tsx              # サーバーコンポーネント
│       └── store-settings-client.tsx  # クライアントコンポーネント
└── components/dashboard/
    └── nav-items.ts              # ナビゲーション（商店設定追加）
```

### Storefront (apps/storefront)

```
src/
├── app/
│   ├── api/store-settings/
│   │   └── route.ts              # 公開API
│   ├── checkout/
│   │   └── checkout-content.tsx  # 送料計算を統合
│   └── layout.tsx                # StoreSettingsProvider追加
└── lib/
    ├── store-settings.ts         # DB操作関数
    └── store-settings-context.tsx # Reactコンテキスト
```

### 共有パッケージ (packages/db)

```
src/
├── store-settings.ts             # 型定義とDB操作
└── index.ts                      # エクスポート
```

## 使用例

### 送料計算

```typescript
import { useStoreSettings, calculateShippingFee } from "@/lib/store-settings-context";

function CheckoutSummary() {
  const { settings } = useStoreSettings();
  const subtotal = 3000; // カート小計

  const shippingFee = settings
    ? calculateShippingFee(
        subtotal,
        settings.shipping_fee,
        settings.free_shipping_threshold
      )
    : 0;

  // shippingFee = 500 (3000 < 5000なので送料発生)
  // subtotal >= 5000 の場合は shippingFee = 0
}
```

### メンテナンスモード

```typescript
import { useStoreSettings } from "@/lib/store-settings-context";

function StorePage() {
  const { isMaintenanceMode } = useStoreSettings();

  if (isMaintenanceMode) {
    return <MaintenanceMessage />;
  }

  return <ProductList />;
}
```

## 今後の拡張

- [ ] 複数配送オプション（通常/速達）
- [ ] 地域別送料設定
- [ ] 支払い方法の設定
- [ ] 営業時間の設定
- [ ] 休業日カレンダー
