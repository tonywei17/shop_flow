# 开发日志（DEVLOG）

日期：2025-10-01（JST）
分支：main
提交范围：shadcn/ui 集成、Dashboard 框架、模块页面骨架、仓库整理、别名与构建修复

## 本次变更概览
- **UI 基底切换**：项目统一采纳 shadcn/ui 作为 UI 组件库基底（Tailwind v4）。
  - 初始化 `apps/web/components.json`，风格 `new-york`，icon 库 `lucide`。
  - 在根目录生成组件与工具：`src/components/ui/*`、`src/lib/utils.ts`。
  - 引入 `tailwindcss-animate` 插件与 HSL 主题 tokens（`apps/web/src/app/globals.css`）。
  - 在 `apps/web/src/app/layout.tsx` 挂载 `ThemeProvider` 与 `<Toaster />`。
- **移除旧 UI 包**：删除 `packages/ui/`，并从 `apps/web/next.config.ts` 的 `transpilePackages` 中去除。
- **Dashboard App Shell**：
  - 布局：`apps/web/src/app/(dashboard)/layout.tsx`（左侧 Sidebar + 右侧主体）。
  - 侧边栏：`apps/web/src/components/dashboard/sidebar.tsx`，菜单项 `nav-items.ts`。
  - 页头：`apps/web/src/components/dashboard/header.tsx`（Breadcrumb + Actions + 移动端抽屉）。
- **模块页面骨架（全部 shadcn/ui）**：
  - CRM：`/crm`、`/crm/new`、`/crm/[id]`
  - Commerce：`/commerce`、`/commerce/new`、`/commerce/[id]`
  - LMS：`/lms`、`/lms/new`、`/lms/[id]`
  - Settlement：`/settlement`、`/settlement/new`、`/settlement/[id]`
  - Org：`/org`、`/org/new`、`/org/[id]`
- **仓库结构修复**：移除 `apps/web` 嵌套 Git 仓库，作为普通目录纳入根仓库；推送至 GitHub。
- **路径别名与运行时修复**：
  - `apps/web/tsconfig.json` 增加 `baseUrl: "."`，扩展 `paths` 同时解析 `apps/web/src` 与根 `src`。
  - 将首页 `apps/web/src/app/page.tsx` 标记为客户端组件（`"use client"`），避免在服务端组件中传递 `onClick` 导致的运行时错误。
  - 移除 `any`：在 `sidebar.tsx` 使用 `ComponentType` 指定图标类型。

## 代码健康度检查
- **ESLint**：通过（修复 1 处 `no-explicit-any`）。
- **TypeScript**：`npx tsc --noEmit -p apps/web/tsconfig.json` 通过。
- **Build**：`npm run build`（Turbopack）通过，所有路由产物生成成功。
- **浏览器验证（Chrome MCP）**：主页与各 Dashboard 页面无运行时错误；控制台无报错。

## 关键提交
- `chore(ui): remove legacy packages/ui after migrating to shadcn/ui`
- `chore: fix apps/web embedded git repo; track as regular folder`
- `fix(web): mark homepage as client component; add baseUrl to tsconfig for alias`

## 重要决策
- **UI 库**：统一使用 shadcn/ui（不再保留自定义 UI 包）。
- **电商内核**：不集成 MedusaJS；商城模块采用 Supabase 原生数据模型与 RLS（后续以 `packages/domain-commerce` 实现）。

## 建议的下一步
- **API 占位**：`/api/webhooks/stripe` 与 `/api/ai/proxy`。
- **数据库**：落地 Supabase 首批迁移与 RLS（tenants、domain_events、products/orders 等）。
- **CI/CD**：配置 GitHub Actions（lint、typecheck、build、可能的 DB 检查）。

---
如需回滚或查看详细改动，请参考 GitHub 仓库 `tonywei17/shop_flow` 的 main 分支历史。

## 2025-10-11（JST）

### 本次变更概览
- **电商引擎选型与集成（模式 A）**：采用 Medusa 作为商城引擎；本系统侧负责多租户、结算与报表，通过事件对接。
- **Storefront 独立应用**：新增 `apps/storefront/`，Next.js App Router，直连 Medusa Store API 展示商品列表与详情。
- **Dashboard 后台对接 Medusa Admin API**：
  - 商品列表：`apps/web/src/app/(dashboard)/commerce/page.tsx` → `createMedusaClient().listProducts()`。
  - 订单列表：`apps/web/src/app/(dashboard)/commerce/orders/page.tsx` → `createMedusaClient().listOrders()`。
- **BFF 适配层**：`packages/domain-commerce/src/medusaClient.ts` 新增 `listProducts()`、`retrieveProduct()`，保留 `listOrders()`；由 `index.ts` 导出。
- **Webhook 骨架**：新增 `apps/web/src/app/api/webhooks/medusa/route.ts`（后续添加签名校验、事件落库、驱动结算）。
- **环境变量**：
  - 根 `.env.example` 新增 `MEDUSA_BASE_URL`、`MEDUSA_ADMIN_TOKEN`、`MEDUSA_WEBHOOK_SECRET`、`NEXT_PUBLIC_MEDUSA_BACKEND_URL`。
  - `apps/storefront/.env.local` 默认指向 `http://localhost:9000`。
- **构建/运行修复**：
  - `package.json` 增加 `"packageManager": "npm@10.0.0"`。
  - `turbo.json` 将 `pipeline` 更名为 `tasks`（Turborepo v2）。
  - 使用 Chrome MCP 启动与预览（`http://localhost:3000`，Storefront `http://localhost:3001`）。

### 受影响文件/目录
- `apps/web/src/app/(dashboard)/commerce/page.tsx`
- `apps/web/src/app/(dashboard)/commerce/orders/page.tsx`
- `apps/web/src/app/api/webhooks/medusa/route.ts`
- `packages/domain-commerce/src/medusaClient.ts`
- `packages/domain-commerce/src/index.ts`
- `apps/storefront/`（`next.config.ts`、`tsconfig.json`、`src/app/page.tsx`、`src/app/products/[id]/page.tsx`、`src/app/layout.tsx`、`src/app/globals.css`）
- `.env.example`、`package.json`、`turbo.json`

### 重要决策
- **单一事实来源**：订单/支付/退款等电商数据以 Medusa 为准；本系统通过 Webhook 事件生成结算事件与应收/应付。
- **双端分工**：
  - Storefront 面向顾客，独立应用直连 Medusa Store API；
  - Dashboard 后台在本系统内统一，调用 Medusa Admin API 管理商品/订单。

### 待办与下一步
- **Webhook 完善**：签名校验（`MEDUSA_WEBHOOK_SECRET`）→ 事件落库（`domain_events`）→ 调 `@enterprise/domain-settlement` 产出 `settlement_events/payables/receivables`。
- **后台新增/编辑**：在 `commerce/new`、`commerce/[id]` 接通创建/编辑商品（`POST /admin/products` 等）。
- **多租户策略**：确认采用多实例或 BFF 强隔离方案；落地租户-实例映射与密钥管理。
- **Medusa 开发环境**：提供 Node/Docker 两种一键启动与 seed 脚本，便于联调。
