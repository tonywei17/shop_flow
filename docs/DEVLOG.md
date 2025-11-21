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

## 2025-10-11（JST）晚间补充

### 本次进展
- **Supabase 表落地**：通过 Supabase MCP 在项目 `exdlxrjiveqlsbirgozt` 创建 `tenants/products/customers/orders/order_items` 表，添加触发器与索引，暂不启用 RLS，授予 anon/authenticated 开发期权限。
- **应用接入**：新增 `@enterprise/db`（`client.ts`、`products.ts`）及导出；实现 `GET/POST /api/internal/products`；将 `/(dashboard)/commerce/new` 改为 Server Action 调用 `createProduct()` 并跳转 `/(dashboard)/commerce/internal`；新增 `/(dashboard)/commerce/internal` 列表直读 Supabase。
- **环境变量修复**：将 Supabase 变量放置到 `apps/web/.env.local`（而非根 `.env.local`），解决 `Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/ANON_KEY` 运行时错误。
- **Storefront 对接改进**：为 Storefront 的 Store API 请求添加 `x-publishable-api-key` 支持（读取 `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`）。
- **Medusa 基础设施**：使用 Docker Compose 启动 `postgres:15` 与 `redis:7`（`apps/medusa/docker-compose.yml`）。

### 当前问题
- **Medusa 后端未就绪**：`apps/medusa/` 尚无完整后端工程（仅 compose），9000 端口一度可达但返回“需要 publishable key”，后续用户反馈“端口上不去”；需补齐 Medusa 服务启动（Node 或 Docker）与种子导入。
- **Storefront 无数据**：Storefront 源自 Medusa Store API，需 Medusa 有商品且请求头包含 Publishable Key。

### 待办
- **启动 Medusa 后端**（二选一）：
  - Node：完成 `npx create-medusa-app apps/medusa`（连接本地 Docker Postgres/Redis），`npm run dev`，`npm run seed`。
  - Docker：在 compose 中增加 Medusa 服务（配置 `DATABASE_URL`、`REDIS_URL`），容器内迁移与 seed。
- **生成 Publishable Key**：通过 Admin API 创建 `type=publishable` 的 API Key，并写入 `apps/storefront/.env.local` 的 `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`。
- **前后台联调**：验证 `http://localhost:9000/store/products`、刷新 `http://localhost:3001` 展示商品。

## 2025-10-12（JST）

### 本次进展
- **Dashboard 日文化重构**：`apps/web/src/components/dashboard/nav-items.ts`、`sidebar.tsx` 与各模块页面（`system-fields`、`permissions`、`request-forms`、`commerce/*`、`account`）全面替换为日文文案与导航结构；面包屑 `header.tsx` 增加 label 映射。
- **Storefront 文案更新**：`apps/storefront/src/app/layout.tsx` 调整为日文标题与导航链接。
- **Medusa 后端联调**：完成 `medusa/` 依赖安装、`npx medusa user` 创建管理员；生成 Secret API Key 并写入根 `.env.local`；重启 `web` 与 `storefront` 开发服务以加载 `MEDUSA_*` 变量。
- **本地服务编排**：并行启动 dashboard（3000）、storefront（3001）、Medusa（9000）；通过 Chrome MCP 打开页面调试。

### 代码健康度检查
- **ESLint**：`npm run lint` 全量通过。
- **运行验证**：Dashboard `http://localhost:3000/commerce`、Storefront `http://localhost:3001/` 可访问；Medusa Admin `http://localhost:9000/app` 正常登录（admin@example.com）。

### 待办与下一步
- `commerce/new` 与 `request-forms` 的 Server Action 需要接通 Medusa 商品创建与 Langflow API。
- Webhook `apps/web/src/app/api/webhooks/medusa/route.ts` 补充签名校验与事件落库。
- Storefront 补全购物车、结算与订单查询，使用 Publishable API Key 验证。

## 2025-10-13（JST）

### 本次变更概览
- **Medusa 清理**：Dashboard 与 Storefront 全量切换至 Supabase 数据源，`packages/db/src/products.ts` 移除 `createMedusaProduct()`，`apps/web/src/app/(dashboard)/commerce/page.tsx`/`orders/page.tsx`、`apps/storefront/src/app/page.tsx` 与 `products/[id]/page.tsx` 均改为读取 Supabase；`apps/web/src/app/api/webhooks/medusa/route.ts` 改为返回 410 占位响应。
- **环境变量修复**：确认 `apps/web/.env.local`、`apps/storefront/.env.local` 配置 `SUPABASE_URL`、`SUPABASE_ANON_KEY`，解决 3001 端口缺失 env 报错。
- **登录页重构**：`apps/web/src/app/page.tsx` 替换为登录界面（Logo、日文文案、账号/密码、记住密码复选框、绿色登录按钮），与提供效果图一致。

### 代码健康度检查
- **ESLint**：`npm run lint` 全量通过。
- **Build**：`npm run build` 通过（修复空 `api/webhooks/medusa` 模块后重新构建成功）。

### 待办与下一步
- 接入实际认证逻辑（Supabase Auth 或内部 API），落地登录流程。
- Dashboard 受注页接通 Supabase `orders` 数据，补完界面。
- 清理仓库中未用的 Medusa 目录与依赖。

## 2025-11-21（JST）

### 本次变更概览
- **マスタ管理機能（アカウント/部署/ロール）**：
  - 新增 Supabase 封装：`packages/db/src/accounts.ts`、`departments.ts`、`roles.ts`，并从 `packages/db/src/index.ts` 导出。
  - 后台 API：`apps/web/src/app/api/internal/{accounts,departments,roles}/route.ts`，统一分页、检索参数与错误处理。
  - Dashboard 页面：
    - アカウント管理：`/(dashboard)/account` + `account-client.tsx`，支持搜索、筛选、分页以及新规/編集（抽屉表单）。
    - 部署管理：`/(dashboard)/departments` + `departments-client.tsx`，支持搜索、分页以及层级/地址信息展示。
    - ロール管理：`/(dashboard)/roles` + `roles-client.tsx`，支持新规ロール创建、状态/データ範囲 badge 展示。
  - 通用管理用ドロワー：`apps/web/src/components/dashboard/management-drawer.tsx` 基于 `src/components/ui/sheet.tsx` 实现右侧抽屉布局。

### 受影响文件/目录
- `apps/web/src/app/(dashboard)/account/page.tsx`
- `apps/web/src/app/(dashboard)/departments/page.tsx`
- `apps/web/src/app/(dashboard)/roles/page.tsx`
- `apps/web/src/app/(dashboard)/account/account-client.tsx`
- `apps/web/src/app/(dashboard)/departments/departments-client.tsx`
- `apps/web/src/app/(dashboard)/roles/roles-client.tsx`
- `apps/web/src/app/api/internal/accounts/route.ts`
- `apps/web/src/app/api/internal/departments/route.ts`
- `apps/web/src/app/api/internal/roles/route.ts`
- `apps/web/src/components/dashboard/management-drawer.tsx`
- `src/components/ui/sheet.tsx`
- `packages/db/src/index.ts`
- `packages/db/src/accounts.ts`
- `packages/db/src/departments.ts`
- `packages/db/src/roles.ts`
- `docs/data/`（Supabase 相关导出数据，供参考）

### 待办与下一步
- 为账户/部门/ロール新增/编辑接口补齐字段校验与权限检查。
- 在列表页补充批量操作、导出等后端实现（当前按钮为 UI 占位）。
- 将账户/部门/ロール操作接入 Supabase RLS 与审计日志表。
- 在 CI 中加入 `npm run lint` / `npm run build` 检查，保证 Dashboard マスタ管理的回归质量。
