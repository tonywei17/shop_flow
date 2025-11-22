# 系统架构说明（Medusa 集成版）

> 本文描述“模式 A：Medusa 作为电商引擎”的架构方案。电商域由 Medusa 负责（商品/价格/库存/订单/支付/退款/促销），本系统负责多租户、权限、结算与报表，并通过事件驱动对接。
>
> **当前状态说明（2025-11-23）**：
> - 代码层面已将 Dashboard 与 Storefront 的商品/订单读取切回 Supabase 直连模型，Medusa 不再作为单一事实来源。  
> - 本文保留为“历史/备选架构文档”，用于将来如需恢复或比较 Medusa 集成方案时参考；默认实现以 Supabase 为主，详情见 `TECHNICAL_ARCHITECTURE.md` 与 `SUPABASE-SCHEMA-STRATEGY.md`。

## 1. 架构总览

- **前端层**：
  - 后台 Dashboard：`apps/web/`（Next.js App Router）。
  - 顾客侧 Storefront：`apps/storefront/`（独立 Next.js App）。
- **电商引擎**：Medusa（独立服务）。
- **数据与后端**：Supabase（Postgres、Auth、Storage、Edge Functions、RLS）。
- **支付**：Medusa 插件（建议 Stripe），你的系统仅消费 Medusa 业务事件。
- **AI/Automation**：Langflow（通过统一 API 网关/代理接入）。

```mermaid
flowchart LR
  U[Customer] --> SF[Storefront (Next.js)]
  SF -- Store API --> MD[(Medusa Backend)]
  ADM[Admin (Dashboard)] --> BFF[Next.js BFF]
  BFF -- Admin API --> MD
  BFF --> SB[(Supabase Postgres)]
  MD -- Webhook --> WH[/Next.js Webhook: /api/webhooks/medusa/]
  WH --> EVT[domain_events]
  EVT --> ST[Settlement Service]
  ST --> AR[(Payables/Receivables/Invoices)]
```

## 2. Monorepo 目录结构

- `apps/web/`：后台 Dashboard。
  - `src/app/(dashboard)/commerce/page.tsx`：商品列表（Admin API）。
  - `src/app/(dashboard)/commerce/orders/page.tsx`：订单列表（Admin API）。
  - `src/app/(dashboard)/settlement/*`：结算模块页面。
  - `src/app/api/webhooks/medusa/route.ts`：Medusa Webhook 接收器（待完善签名校验与事件落库）。
- `apps/storefront/`：顾客侧 Storefront（端口 3001）。
  - `src/app/page.tsx`：商品列表（Store API）。
  - `src/app/products/[id]/page.tsx`：商品详情（Store API）。
- `packages/domain-commerce/`：电商 BFF 适配层。
  - `src/medusaClient.ts`：封装 Medusa Admin/Store API（`listProducts`、`retrieveProduct`、`listOrders` 等）。
  - `src/index.ts`：导出 `createMedusaClient`。
- `packages/domain-settlement/`：结算领域服务（事件→结算产物，待扩展）。
- `docs/`：文档目录（本文 + DEVLOG + 既有技术文档）。

## 3. 关键边界与职责

- **Medusa（电商域）**：
  - 商品/Catalog、定价、库存、购物车、订单、退换、促销、支付对接（Stripe 插件）。
  - 对外提供 Store API（顾客）与 Admin API（管理）。
- **Dashboard（本系统）**：
  - 多租户、权限、运营管理 UI。
  - 通过 `@enterprise/domain-commerce` 访问 Medusa Admin API；绝不向前端暴露 Admin Token。
- **结算（本系统）**：
  - 消费 Medusa Webhook 事件（订单已支付/退款/状态变更），写入 `domain_events` 并生成 `settlement_events`、`payables/receivables/invoices`。
  - 以事件为单一来源，可回放与对账。

## 4. 集成点实现

- **BFF 适配器**：`packages/domain-commerce/src/medusaClient.ts`
  - `listProducts(params)`：GET `/admin/products`（Admin）。
  - `retrieveProduct(id)`：GET `/admin/products/:id`（Admin）。
  - `listOrders(params)`：GET `/admin/orders`（Admin）。
  - `listStoreProducts(q)`：GET `/store/products`（Store）。
- **Dashboard 页面**：
  - `apps/web/src/app/(dashboard)/commerce/page.tsx` → `listProducts()` 渲染商品表格。
  - `apps/web/src/app/(dashboard)/commerce/orders/page.tsx` → `listOrders()` 渲染订单表格。
- `apps/web/src/components/dashboard/header.tsx` / `sidebar.tsx` / `nav-items.ts` → 日文 UI、本地化导航与面包屑映射。
- **Webhook（骨架）**：`apps/web/src/app/api/webhooks/medusa/route.ts`
  - TODO：签名校验（`MEDUSA_WEBHOOK_SECRET`）、事件类型与载荷解析、落库 `domain_events`、调用结算服务进行映射与入账。
- **Storefront**：
  - `apps/storefront/src/app/page.tsx` → `GET /store/products` 商品列表。
  - `apps/storefront/src/app/products/[id]/page.tsx` → `GET /store/products/:id` 商品详情。

## 5. 环境变量

- 根 `.env.local` 或部署环境变量（服务端使用）：
```dotenv
# Medusa Admin API（Dashboard 后台使用）
MEDUSA_BASE_URL=http://localhost:9000
MEDUSA_ADMIN_TOKEN=YOUR_MEDUSA_ADMIN_TOKEN
MEDUSA_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET

# Supabase（省略具体值）
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe（由 Medusa 插件使用；本系统仅消费事件）
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Langflow
LANGFLOW_BASE_URL=
LANGFLOW_API_KEY=
```
- Storefront（公开变量）：`apps/storefront/.env.local`
```dotenv
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

## 6. 多租户策略（选型）

- **强隔离（推荐）**：每租户一套 Medusa 实例（或实例分组），BFF 按租户路由到对应实例并注入各自 Admin Token。
- **单实例 + BFF 隔离**：在 Medusa 侧通过店铺/区域/自定义字段打标，BFF 强约束过滤（实现复杂度与风险较高）。
- **数据镜像**：从 Medusa 抽取数据到本系统进行租户过滤与聚合（会带来一致性与回放复杂度）。

> 本系统的 RLS 策略依赖 Supabase；Medusa 不建议与 Supabase 共库。推荐 Medusa 独立数据库（Postgres/SQLite）。

## 7. 事件到结算的数据流

1. Medusa 订单已支付/退款 → 发送 Webhook。
2. `POST /api/webhooks/medusa`：校验签名 → 记录至 `domain_events`。
3. 结算服务消费事件，生成 `settlement_events`、`payables/receivables`、`invoices`。
4. Dashboard 结算页面读取上述产物进行对账与导出。

## 8. 部署与运行

- **Dashboard（apps/web）**：Vercel 或容器化部署；服务端持有 `MEDUSA_ADMIN_TOKEN`。
- **Storefront（apps/storefront）**：Vercel 或容器化；仅使用 `NEXT_PUBLIC_MEDUSA_BACKEND_URL`。
- **Medusa**：独立部署（Node 或 Docker Compose），数据库建议 Postgres，支付建议 Stripe 插件。
- **Supabase**：托管项目；迁移、RLS 策略与 Edge Functions 依业务推进。

## 9. 本地开发指南（摘要）

1. 安装依赖并启动 Dashboard：
   - 根：`npm install` → `npm run dev`（http://localhost:3000）
2. 启动 Storefront：
   - `apps/storefront`: `npm run dev`（http://localhost:3001）
3. 启动 Medusa（二选一）：
   - Node 快速脚手架：`npx create-medusa-app@latest apps/medusa` → `npm run dev --prefix apps/medusa` → `npm run seed --prefix apps/medusa`
   - Docker Compose：编写 `apps/medusa/docker-compose.yml`，`docker compose up -d`，`docker compose exec medusa npm run seed`
4. 配置环境变量：根 `.env` 与 `apps/storefront/.env.local`

## 10. 待完善清单

- **Webhook**：签名校验、事件落库与重放、重试与幂等。
- **结算映射**：`@enterprise/domain-settlement` 的规则与产物落地（对接 `settlement` 页面）。
- **后台 CRUD**：商品新建/编辑、订单操作（发货/退款）Server Actions。
- **可观测**：BFF 调用日志、错误与指标上报；关键链路追踪（可选 OTEL）。
- **多租户落地**：实例与租户映射、密钥管理与按租户的 UI/功能开关。
