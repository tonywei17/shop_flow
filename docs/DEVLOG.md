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
