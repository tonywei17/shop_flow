# CLAUDE.md

> このファイルは Claude Code（claude.ai/code）がこのリポジトリを理解するためのコンテキストを提供します。
>
> This file provides context for Claude Code (claude.ai/code) to understand this repository.

---

## プロジェクト概要 / Project Overview

**Shop Flow** は Turborepo ベースのモノレポで、企業向け内部管理システムを構築するためのプラットフォームです。モジュール化設計により、クライアントごとに異なる機能セットを提供できます。

**Shop Flow** is a Turborepo-based monorepo platform for building enterprise internal management systems. Its modular architecture allows different feature sets for different clients.

---

## 技術スタック / Tech Stack

| 分類 | 技術 |
|------|------|
| フレームワーク | Next.js 15 (App Router) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS + shadcn/ui |
| データベース | Supabase (PostgreSQL) |
| 認証 | カスタム認証（@enterprise/auth） |
| モノレポ管理 | Turborepo + pnpm |
| PDF生成 | Puppeteer + @react-pdf/renderer |

---

## ディレクトリ構造 / Directory Structure

```
shop_flow-v1.0/
├── apps/
│   ├── web/           # 管理ダッシュボード（メインアプリ）
│   ├── storefront/    # ECフロントエンド
│   ├── learning/      # 学習プラットフォーム
│   └── medusa/        # (未使用) Medusa設定
├── packages/
│   ├── config/        # モジュール・テナント設定
│   ├── db/            # Supabase クライアント
│   ├── auth/          # 認証ロジック
│   ├── domain-settlement/  # 請求書計算ロジック
│   ├── domain-org/    # 組織管理バリデーション
│   ├── domain-commerce/    # EC関連（型定義）
│   └── ui/            # 共有UIコンポーネント
├── config/            # テナント設定ファイル
│   ├── default.json
│   └── tenants/
└── docs/              # ドキュメント
```

---

## 主要コマンド / Key Commands

```bash
# 依存関係インストール / Install dependencies
pnpm install

# 開発サーバー起動 / Start development servers
pnpm dev

# 全パッケージビルド / Build all packages
pnpm build

# 単一アプリ起動 / Run single app
pnpm --filter web dev
pnpm --filter storefront dev
pnpm --filter learning dev

# 型チェック / Type check
pnpm --filter @enterprise/config build
pnpm --filter @enterprise/domain-settlement build
```

---

## モジュール化アーキテクチャ / Modular Architecture

### モジュールID / Module IDs

```typescript
type ModuleId = "billing" | "commerce" | "learning" | "system";
```

| モジュール | 説明 | 機能 |
|------------|------|------|
| `billing` | 請求書関連 | 請求書生成、CC会費管理、費用管理 |
| `commerce` | オンラインストア | 商品管理、在庫管理、注文管理 |
| `learning` | 学習プラットフォーム | 会員管理、研修管理、資格管理 |
| `system` | システム管理 | 部署管理、アカウント管理、ロール管理 |

### モジュール制御 / Module Control

環境変数でモジュールを制御：

```bash
# .env.local
ENABLED_MODULES=billing,commerce,system  # 有効なモジュール
TENANT_ID=eurhythmics                     # テナントID
```

未設定時は全モジュールが有効になります。

---

## 重要ファイル / Key Files

### 設定関連 / Configuration

| ファイル | 説明 |
|----------|------|
| `packages/config/src/modules.ts` | モジュール登録・ルート定義 |
| `packages/config/src/env.ts` | 環境変数ユーティリティ |
| `packages/config/src/business-rules.ts` | ビジネスルール設定 |
| `packages/config/src/tenant-config.ts` | テナント設定読み込み |

### ルーティング / Routing

| ファイル | 説明 |
|----------|------|
| `apps/web/src/middleware.ts` | ルートガード（モジュールアクセス制御） |
| `apps/web/src/components/dashboard/nav-items.ts` | ナビゲーション設定 |

### ドメインロジック / Domain Logic

| ファイル | 説明 |
|----------|------|
| `packages/domain-settlement/src/invoice/calculator.ts` | 請求書計算ロジック |
| `packages/domain-settlement/src/invoice/types.ts` | 請求書型定義 |
| `packages/domain-org/src/validation/` | 組織バリデーションルール |

### API ルート / API Routes

| パス | 説明 |
|------|------|
| `apps/web/src/app/api/invoices/` | 請求書API |
| `apps/web/src/app/api/expenses/` | 費用管理API |
| `apps/web/src/app/api/cc-members/` | CC会員API |

---

## 開発ガイドライン / Development Guidelines

### 新機能追加時 / Adding New Features

1. **モジュールに属する機能**：
   - `packages/config/src/modules.ts` でルートを登録
   - `nav-items.ts` でナビゲーション項目を追加
   - `requiredModule` プロパティを設定

2. **ビジネスロジック**：
   - 計算ロジックは `packages/domain-*` に配置
   - API route からドメインパッケージをインポート
   - 設定可能な値は `business-rules.ts` に定義

3. **バリデーション**：
   - Zod スキーマを `packages/domain-*/src/validation/` に配置
   - フォームとAPIで共有

### コード規約 / Code Conventions

- **言語**: コード・コメントは英語、UI文言は日本語
- **型安全**: `any` を避け、適切な型を定義
- **インポート**: ワークスペースパッケージは `@enterprise/*` を使用
- **ファイル命名**: kebab-case を使用

---

## テナント設定 / Tenant Configuration

### 設定ファイル構造 / Config File Structure

```json
// config/tenants/eurhythmics.json
{
  "id": "eurhythmics",
  "name": "リトミック研究センター",
  "modules": ["billing", "commerce", "learning", "system"],
  "organization": {
    "name": "特定非営利活動法人リトミック研究センター",
    "postalCode": "〒151-0051",
    "address": "東京都渋谷区千駄ヶ谷1丁目30番8号"
  },
  "businessRules": {
    "invoiceRules": {
      "ccFee": {
        "defaultUnitPrice": 480,
        "aigranRebatePerPerson": 600
      },
      "taxRate": 0.1
    }
  }
}
```

### 設定の利用 / Using Configuration

```typescript
import { getTenantBusinessRules, getTenantOrganization } from "@enterprise/config";

const rules = getTenantBusinessRules();
const org = getTenantOrganization();
```

---

## ドキュメント / Documentation

| ファイル | 説明 |
|----------|------|
| `docs/architecture/MODULAR-ARCHITECTURE.md` | モジュール化アーキテクチャ詳細 |
| `docs/SYSTEM_ARCHITECTURE.md` | システムアーキテクチャ概要 |
| `docs/TECHNICAL_ARCHITECTURE.md` | 技術アーキテクチャ |
| `docs/deployment/PRODUCTION-DEPLOYMENT.md` | 本番デプロイガイド |
| `docs/devlogs/` | 開発ログ |

---

## 環境変数 / Environment Variables

### 必須 / Required

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# 認証
ADMIN_SESSION_SECRET=
```

### オプション / Optional

```bash
# モジュール制御
ENABLED_MODULES=billing,commerce,learning,system

# テナント
TENANT_ID=eurhythmics
TENANT_CONFIG_PATH=./config/tenants

# 外部サービスURL
NEXT_PUBLIC_LEARNING_URL=
NEXT_PUBLIC_STOREFRONT_URL=
```

---

## トラブルシューティング / Troubleshooting

### ビルドエラー / Build Errors

```bash
# 依存関係の再インストール
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 個別パッケージのビルド
pnpm --filter @enterprise/config build
pnpm --filter @enterprise/domain-settlement build
```

### 型エラー / Type Errors

```bash
# TypeScript パス解決の確認
# packages/*/tsconfig.json の paths 設定を確認
```

### モジュールが表示されない / Module Not Showing

1. `ENABLED_MODULES` 環境変数を確認
2. `middleware.ts` のルート設定を確認
3. `nav-items.ts` の `requiredModule` を確認

---

## 最終更新 / Last Updated

2026-01-11
