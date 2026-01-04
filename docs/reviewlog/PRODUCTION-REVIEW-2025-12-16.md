# 生産環境レビュー & デプロイメント準備
> **作成日**: 2025-12-16  
> **対象**: shop_flow v1.0 生産環境更新

---

## 📊 プロジェクト概要

### 基本情報
| 項目 | 値 |
|------|-----|
| **プロジェクト名** | shop_flow (Enterprise Internal System) |
| **開発期間** | 2025-10-01 ~ 現在 (約 2.5 ヶ月) |
| **総コミット数** | 52+ |
| **コード規模** | 39,000+ 行 (TypeScript/JavaScript) |
| **Git状態** | main ブランチ、origin/main と同期済み |
| **ワーキングツリー** | クリーン（未コミット変更なし） |

### 技術スタック
- **フロントエンド**: Next.js 15/16 (App Router), Tailwind CSS v4, shadcn/ui
- **バックエンド**: Supabase (PostgreSQL), Next.js API Routes
- **インフラ**: Docker Compose, Traefik (リバースプロキシ), Let's Encrypt
- **パッケージ管理**: pnpm 9.15.0, Turborepo
- **デプロイ**: Docker Compose v2.35.1

---

## 🏗️ アーキテクチャ構成

### 3つのメインアプリケーション

#### 1. **管理後台 (Dashboard) - apps/web**
- **URL**: https://eurhythmics.yohaku.cloud
- **ポート**: 3009 (本番)
- **機能**: 24+ 管理モジュール
  - 商品管理 (4段階価格体系)
  - 注文管理
  - 商店設定
  - 会員管理
  - 部門・ロール・権限管理
  - 通知システム
  - 学習分析
  - マスタデータ管理

#### 2. **オンラインストア (Storefront) - apps/storefront**
- **URL**: https://eurhythmics-shop.yohaku.cloud
- **ポート**: 3001 (本番)
- **機能**:
  - 商品一覧・検索
  - 商品詳細表示
  - カート機能
  - チェックアウト
  - 注文管理
  - マイページ
  - ロールベース価格表示

#### 3. **学習プラットフォーム (Learning) - apps/learning**
- **URL**: https://e-learning.yohaku.cloud
- **ポート**: 3002 (本番)
- **機能**:
  - ホームページ (AI共学テーマ)
  - 認証 (ソーシャルログイン対応)
  - 動画学習 (Vimeo連携)
  - AIアシスタント
  - アクティビティ管理

### 共有パッケージ (13個)
- `@enterprise/db` - Supabase データベース層
- `@enterprise/auth` - 認証モジュール
- `@enterprise/ai` - AI 機能
- `@enterprise/config` - 設定管理
- `@enterprise/types` - 型定義
- `@enterprise/domain-*` - ドメイン固有ロジック (commerce, crm, lms, org, settlement)

---

## 📝 最新開発状況

### 直近のマイルストーン (2025-12-04 ~ 12-09)

| 日付 | マイルストーン | 主要変更 |
|------|-------------|--------|
| 2025-12-04 | shadcn/ui 導入 | UI コンポーネント統一化 |
| 2025-12-05 | 商品管理強化 | 4段階価格体系、画像アップロード |
| 2025-12-06 | ストアフロント構築 | 認証、カート、注文機能実装 |
| 2025-12-07 | 商店設定モジュール | 送料計算、税率設定、コード品質改善 |
| 2025-12-09 | Learning 首页改版 | Vimeo連携、AI アシスタント、ソーシャルログイン |

### 最新コミット (2025-12-16)
```
dc9ad81 (HEAD -> main, origin/main) chore: sync latest change
9a0b03d chore: protect storefront product access and tidy UI
aee0841 chore(storefront): protect product pages, simplify home
fd1d023 feat(inventory): add inventory module
953f536 chore(security): stop tracking env files
c8c84ec fix(learning): update register page styles for dark mode
da7a74d fix(build): downgrade pnpm to 9.15.0 and update docs
9abc05a feat(learning): enhance homepage, auth, and activity details
5874979 security: upgrade Next.js to fix CVE-2025-55182 (CVSS 10.0)
```

### ビルド状態
- ✅ **Build**: 成功 (15 tasks)
- ✅ **Lint**: 成功
- ✅ **TypeScript**: エラーなし
- ✅ **本番デプロイ**: 完了

---

## 🚀 生産環境情報

### サーバー構成
| 項目 | 値 |
|------|-----|
| **サーバー** | VPS (Tailscale 経由) |
| **IP アドレス** | 100.112.168.22 |
| **OS** | Ubuntu/Debian |
| **プロジェクトパス** | `/root/shop_flow` |
| **Docker Compose** | v2.35.1 |

### サービス状態
| サービス | URL | ポート | 状態 |
|---------|-----|--------|------|
| 管理後台 (web) | https://eurhythmics.yohaku.cloud | 3009 | ✅ 運行中 |
| ストアフロント | https://eurhythmics-shop.yohaku.cloud | 3001 | ✅ 運行中 |
| Learning | https://e-learning.yohaku.cloud | 3002 | ✅ 運行中 |
| PostgreSQL | 内部のみ | 5432 | ✅ 運行中 |
| Redis | 内部のみ | 6379 | ✅ 運行中 |

### 同一サーバー上の他プロジェクト
⚠️ **注意**: デプロイ時は shop_flow 関連のコンテナのみを操作してください。

- Supabase (supabase-*)
- Navi Supabase (navi-supabase-*)
- Langflow (langflow, langflow_postgres)
- Hotel Translation (hotel-translation, guigang-dashboard-*)
- Mem0 (mem0_*, openmemory-api)
- Traefik (traefik)

---

## 📋 デプロイメント準備チェックリスト

### ✅ 事前確認
- [x] Git リポジトリが main ブランチで最新状態
- [x] ワーキングツリーがクリーン（未コミット変更なし）
- [x] ビルドが成功している
- [x] TypeScript エラーなし
- [x] Lint チェック成功

### 🔧 デプロイ前の確認事項
- [ ] 本番環境の `.env.production` が最新か確認
- [ ] Supabase 接続情報が正しいか確認
- [ ] データベースマイグレーション（20251206_storefront_schema.sql など）が適用済みか確認
- [ ] SSL 証明書が有効か確認
- [ ] バックアップを取得

### 📦 デプロイ対象
- **web** (管理後台) - 最新の商店設定、コード品質改善を含む
- **storefront** (オンラインストア) - 在庫管理、アクセス保護を含む
- **learning** (学習プラットフォーム) - Vimeo連携、AI アシスタント、ソーシャルログインを含む

---

## 🔄 デプロイメント手順

### ワンライナーデプロイ (推奨)
```bash
ssh root@100.112.168.22 "cd /root/shop_flow && \
  git fetch origin && \
  git reset --hard origin/main && \
  docker compose -f docker-compose.prod.yml build --no-cache web storefront learning && \
  docker compose -f docker-compose.prod.yml up -d web storefront learning"
```

### ステップバイステップデプロイ

#### 1. サーバーに接続
```bash
ssh root@100.112.168.22
```

#### 2. プロジェクトディレクトリに移動
```bash
cd /root/shop_flow
```

#### 3. 最新コードを取得
```bash
git fetch origin
git reset --hard origin/main
```

#### 4. Docker イメージをビルド
```bash
# web, storefront, learning をビルド
docker compose -f docker-compose.prod.yml build --no-cache web storefront learning
```

#### 5. コンテナを再起動
```bash
docker compose -f docker-compose.prod.yml up -d web storefront learning
```

#### 6. 状態確認
```bash
# コンテナ状態確認
docker ps --filter 'name=shop_flow' --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'

# ログ確認
docker logs shop_flow-web --tail 50
docker logs shop_flow-storefront --tail 50
docker logs shop_flow-learning --tail 50
```

---

## 🧪 デプロイ後の検証

### ヘルスチェック
```bash
# HTTP ステータスコード確認
curl -s -o /dev/null -w '%{http_code}' https://eurhythmics.yohaku.cloud/
curl -s -o /dev/null -w '%{http_code}' https://eurhythmics-shop.yohaku.cloud/
curl -s -o /dev/null -w '%{http_code}' https://e-learning.yohaku.cloud/
```

### リソース使用量確認
```bash
docker stats --filter 'name=shop_flow' --no-stream
```

### ログ確認
```bash
# エラーログを確認
docker logs shop_flow-web | grep -i error
docker logs shop_flow-storefront | grep -i error
docker logs shop_flow-learning | grep -i error
```

---

## ⚠️ トラブルシューティング

### コンテナが起動しない
```bash
docker logs shop_flow-web
docker inspect shop_flow-web --format '{{.State.Health.Status}}'
```

### ビルドエラー
```bash
# キャッシュをクリアして再ビルド
docker compose -f docker-compose.prod.yml build --no-cache web
```

### データベース接続エラー
```bash
docker logs shop_flow-postgres
docker exec shop_flow-postgres pg_isready -U shop_flow
```

### 証明書エラー
```bash
docker logs traefik --tail 50
dig eurhythmics.yohaku.cloud
```

---

## 🔙 ロールバック手順

問題が発生した場合：

```bash
# 特定のコミットに戻す
git reset --hard <commit-hash>

# 再ビルド・再起動
docker compose -f docker-compose.prod.yml build --no-cache web storefront learning
docker compose -f docker-compose.prod.yml up -d web storefront learning
```

---

## 📚 関連ドキュメント

- `docs/deployment/PRODUCTION-DEPLOYMENT.md` - 詳細なデプロイメントガイド
- `docs/DOCS-INDEX.md` - ドキュメント総索引
- `docs/devlogs/DEVLOG-2025-12-09.md` - 最新開発ログ
- `docs/architecture/TECHNICAL_ARCHITECTURE.md` - 技術アーキテクチャ
- `docs/architecture/SUPABASE-SCHEMA-STRATEGY.md` - Supabase スキーマ戦略

---

## 📌 重要な注意事項

1. **他プロジェクトへの影響**: このサーバーには複数のプロジェクトが稼働しています。shop_flow 関連のコンテナのみを操作してください。

2. **環境変数**: `.env.production` は Git 管理外です。本番環境で正しく設定されていることを確認してください。

3. **バックアップ**: デプロイ前に必ずデータベースのバックアップを取得してください。

4. **テスト**: 本番デプロイ前に、ステージング環境でテストすることを推奨します。

---

## ✨ 次のステップ

1. **本番デプロイ実行**: 上記の手順に従ってデプロイを実行
2. **ヘルスチェック**: すべてのサービスが正常に動作しているか確認
3. **ユーザーテスト**: 実際のユーザーフローをテスト
4. **監視**: リソース使用量とログを継続的に監視
5. **ドキュメント更新**: 必要に応じてドキュメントを更新

---

**作成者**: Cascade AI  
**最終更新**: 2025-12-16
