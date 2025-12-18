# 生産環境デプロイメントガイド

> **最終更新**: 2025-12-07

## 概要

shop_flow プロジェクトは Docker Compose を使用して本番環境にデプロイされています。Traefik をリバースプロキシとして使用し、Let's Encrypt で SSL 証明書を自動取得しています。

---

## サーバー情報

| 項目 | 値 |
|------|-----|
| **サーバー** | VPS (Tailscale 経由) |
| **IP アドレス** | `100.112.168.22` |
| **OS** | Ubuntu/Debian |
| **プロジェクトパス** | `/root/shop_flow` |
| **Docker Compose** | v2.35.1 |

---

## サービス構成

### shop_flow アプリケーション

| サービス | コンテナ名 | ポート | URL |
|----------|-----------|--------|-----|
| **管理端 (web)** | shop_flow-web | 3009 | https://eurhythmics.yohaku.cloud |
| **商店前端 (storefront)** | shop_flow-storefront | 3001 | https://eurhythmics-shop.yohaku.cloud |
| **学習プラットフォーム (learning)** | shop_flow-learning | 3002 | https://e-learning.yohaku.cloud |
| **PostgreSQL** | shop_flow-postgres | 5432 | 内部のみ |
| **Redis** | shop_flow-redis | 6379 | 内部のみ |

### 同一サーバー上の他プロジェクト

⚠️ **注意**: このサーバーには他のプロジェクトも稼働しています。デプロイ時は shop_flow 関連のコンテナのみを操作してください。

| プロジェクト | 主なコンテナ |
|-------------|-------------|
| Supabase | supabase-* |
| Navi Supabase | navi-supabase-* |
| Langflow | langflow, langflow_postgres |
| Hotel Translation | hotel-translation, guigang-dashboard-* |
| Mem0 | mem0_*, openmemory-api |
| Traefik | traefik |

---

## デプロイ手順

### 1. サーバーに接続

```bash
ssh root@100.112.168.22
```

### 2. プロジェクトディレクトリに移動

```bash
cd /root/shop_flow
```

### 3. 最新コードを取得

```bash
git fetch origin
git reset --hard origin/main
```

### 4. Docker イメージをビルド

```bash
# web と storefront のみビルド（他のサービスに影響なし）
docker compose -f docker-compose.prod.yml build --no-cache web storefront

# learning も更新する場合
docker compose -f docker-compose.prod.yml build --no-cache learning
```

### 5. コンテナを再起動

```bash
# web と storefront のみ再起動
docker compose -f docker-compose.prod.yml up -d web storefront

# learning も再起動する場合
docker compose -f docker-compose.prod.yml up -d learning
```

### 6. 状態確認

```bash
# コンテナ状態確認
docker ps --filter 'name=shop_flow'

# ログ確認
docker logs shop_flow-web --tail 50
docker logs shop_flow-storefront --tail 50
```

---

## ワンライナーデプロイ

ローカルから直接デプロイする場合：

```bash
# web + storefront のみ更新
ssh root@100.112.168.22 "cd /root/shop_flow && \
  git fetch origin && \
  git reset --hard origin/main && \
  docker compose -f docker-compose.prod.yml build --no-cache web storefront && \
  docker compose -f docker-compose.prod.yml up -d web storefront"
```

---

## ファイル構成

```
/root/shop_flow/
├── docker-compose.prod.yml    # 本番用 Docker Compose
├── Dockerfile                 # learning 用
├── Dockerfile.web             # web 用
├── Dockerfile.storefront      # storefront 用
├── .env.production            # 環境変数（Git 管理外）
├── ecosystem.config.js        # PM2 設定（未使用）
└── nginx-web.conf             # Nginx 設定（未使用）
```

---

## 環境変数

`.env.production` に以下の環境変数が設定されています：

```env
# Supabase
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Database
POSTGRES_PASSWORD=...
DATABASE_URL=postgresql://...

# Auth
ADMIN_LOGIN_ID=...
ADMIN_LOGIN_PASSWORD=...

# Next.js
NEXT_PUBLIC_API_URL=...
```

---

## Traefik 設定

Traefik はラベルベースでルーティングを設定しています。

### web サービス

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.shop_flow_web.rule=Host(`eurhythmics.yohaku.cloud`)"
  - "traefik.http.routers.shop_flow_web.tls=true"
  - "traefik.http.routers.shop_flow_web.entrypoints=websecure"
  - "traefik.http.routers.shop_flow_web.tls.certresolver=myresolver"
  - "traefik.http.services.shop_flow_web.loadbalancer.server.port=3009"
  - "traefik.docker.network=web"
```

### storefront サービス

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.shop_flow_storefront.rule=Host(`eurhythmics-shop.yohaku.cloud`)"
  - "traefik.http.routers.shop_flow_storefront.tls=true"
  - "traefik.http.routers.shop_flow_storefront.entrypoints=websecure"
  - "traefik.http.routers.shop_flow_storefront.tls.certresolver=myresolver"
  - "traefik.http.services.shop_flow_storefront.loadbalancer.server.port=3001"
  - "traefik.docker.network=web"
```

---

## トラブルシューティング

### コンテナが起動しない

```bash
# ログを確認
docker logs shop_flow-web

# ヘルスチェック状態を確認
docker inspect shop_flow-web --format '{{.State.Health.Status}}'
```

### ビルドエラー

```bash
# キャッシュをクリアして再ビルド
docker compose -f docker-compose.prod.yml build --no-cache web
```

### 証明書エラー

Traefik が Let's Encrypt から証明書を取得できない場合：

```bash
# Traefik ログを確認
docker logs traefik --tail 50

# DNS 設定を確認
dig eurhythmics.nexus-tech.cloud
```

### データベース接続エラー

```bash
# PostgreSQL コンテナの状態確認
docker logs shop_flow-postgres

# 接続テスト
docker exec shop_flow-postgres pg_isready -U shop_flow
```

---

## ロールバック

問題が発生した場合、以前のバージョンに戻す：

```bash
# 特定のコミットに戻す
git reset --hard <commit-hash>

# 再ビルド・再起動
docker compose -f docker-compose.prod.yml build --no-cache web storefront
docker compose -f docker-compose.prod.yml up -d web storefront
```

---

## 監視

### コンテナ状態

```bash
# 全 shop_flow コンテナの状態
docker ps --filter 'name=shop_flow' --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
```

### リソース使用量

```bash
docker stats --filter 'name=shop_flow' --no-stream
```

### ヘルスチェック

```bash
# 各サービスの HTTP 応答確認
curl -s -o /dev/null -w '%{http_code}' https://eurhythmics.yohaku.cloud/
curl -s -o /dev/null -w '%{http_code}' https://eurhythmics-shop.yohaku.cloud/
curl -s -o /dev/null -w '%{http_code}' https://e-learning.yohaku.cloud/
```

---

## 関連ドキュメント

- [STORE-SETTINGS-DESIGN.md](../architecture/STORE-SETTINGS-DESIGN.md) - 商店設定モジュール設計
- [PRODUCT-MANAGEMENT-DESIGN.md](../architecture/PRODUCT-MANAGEMENT-DESIGN.md) - 商品管理設計
- [DEVLOG-2025-12-07.md](../devlogs/DEVLOG-2025-12-07.md) - 最新の開発ログ
