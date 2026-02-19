# shop_flow Monorepo

多模块企业内部系统的代码仓库，基于 **Next.js + Supabase + Turborepo + pnpm** 构建。

- Dashboard：运营后台、マスタ管理、通知发送等
- Storefront：社内向けストア（演示 Supabase 商品列表）
- Learning：学习平台 UI 原型

详细技术架构请参考：`docs/TECHNICAL_ARCHITECTURE.md` 与 `docs/DOCS-INDEX.md`。

---

## 1. 目录结构概览

```text
shop_flow/
  apps/
    web/          # 主后台 Dashboard（Next.js 16, App Router, shadcn/ui）
    storefront/   # 简单社内 Storefront（Next.js 15, Supabase products）
    learning/     # Learning 平台 UI 原型
  packages/
    db/           # @enterprise/db: Supabase 访问封装
    domain-*/     # 各业务域（org/crm/lms/commerce/settlement 等）骨架
    auth, config, ai, events, reports, stripe, types ...
  docs/           # 架构说明、PRD、开发日志等
  supabase/       # 迁移（migrations）、策略（policies）、种子（seeds）目录占位
  turbo.json      # Turborepo 配置
  pnpm-workspace.yaml
```

更多文档请查看：

- `docs/DOCS-INDEX.md` – 文档总索引与状态说明
- `docs/devlogs/` – 开发日志（按日期拆分）

---

## 2. 开发环境准备

### 2.1 前置要求

- Node.js **>= 20**
- pnpm（推荐按 `package.json` 中的 `packageManager` 版本安装）

### 2.2 安装依赖

```bash
pnpm install
```

### 2.3 环境变量

根目录提供了示例：

```bash
cp .env.example .env.local
```

并为各 app 准备了自己的 `.env.local`：

- `apps/web/.env.local`
- `apps/storefront/.env.local`
- `apps/learning/.env.local`

Supabase 与自托管实例的完整说明：

- `docs/MY_SUPABASE_COMPLETE_GUIDE.md`
- `docs/SUPABASE-SCHEMA-STRATEGY.md`（如何将 schema 回归到 `supabase/migrations`）

> 注意：不要将包含真实密钥的 `.env.local` 提交到公共仓库。

---

## 3. 常用脚本

在仓库根目录：

```bash
# 启动所有 app 的开发环境（通过 Turborepo）
pnpm dev

# 构建所有 package 与 app（当前已通过）
pnpm build

# 运行 lint（由各 app/package 的 lint 脚本代理）
pnpm lint

# 清理构建产物
pnpm clean
```

单独运行某个 app：

```bash
# Dashboard（默认端口 3000）
cd apps/web
pnpm dev

# Storefront（端口 3001）
cd apps/storefront
pnpm dev

# Learning（端口 3002）
cd apps/learning
pnpm dev
```

---

## 4. Supabase 集成状态

- 数据访问通过 `packages/db` 中的 `getSupabaseAdmin()` 统一管理。
- Dashboard 的以下页面会在构建和运行时访问 Supabase：
  - `/commerce` / `/commerce/internal`
  - `/account`
  - `/departments`
  - `/roles`
- 为了在本地没有完整 Supabase schema 或凭证时仍可构建：
  - 上述页面在 Supabase 调用失败时会降级为显示“暂无数据”（并打印错误日志），不会阻塞 `pnpm build`。

要将当前自托管 Supabase 的真实 schema 同步回仓库，请参照：

- `docs/SUPABASE-SCHEMA-STRATEGY.md`

---

## 5. 贡献与开发约定

- 依赖管理：
  - 根 monorepo **统一使用 pnpm**，锁文件为 `pnpm-lock.yaml`。
  - 详情参见 `docs/PACKAGE-MANAGER-GUIDE.md`。
- 新增数据库表或字段：
  - 应在 `supabase/migrations/` 中新增迁移文件，而不是只在 Supabase Studio 中修改。
- 重要变更：
  - 建议在 `docs/devlogs/` 下新增一条 `DEVLOG-YYYY-MM-DD.md`，记录本次改动与构建状态。
