# Shop Flow 系统架构文档

> 版本：1.1.0
> 更新日期：2026-02-19

## 1. 系统概览

### 1.1 架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                         用户层                                   │
├─────────────────────────────────────────────────────────────────┤
│  管理员/员工          学员/会员           访客                    │
│      │                   │                 │                    │
│      ▼                   ▼                 ▼                    │
│  ┌─────────┐      ┌─────────────┐    ┌─────────────┐           │
│  │ apps/   │      │ apps/       │    │ apps/       │           │
│  │ web     │      │ learning    │    │ storefront  │           │
│  │(Dashboard)     │(学習PF)     │    │(オンライン   │           │
│  └────┬────┘      └──────┬──────┘    │ ストア)     │           │
│       │                  │           └──────┬──────┘           │
└───────┼──────────────────┼──────────────────┼───────────────────┘
        │                  │                  │
        ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API 层 (Next.js Route Handlers)            │
├─────────────────────────────────────────────────────────────────┤
│  /api/internal/*     /api/learning/*     /api/storefront/*      │
│  (内部管理API)        (学習API)           (商城API)              │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      共享包层 (packages/*)                       │
├─────────────────────────────────────────────────────────────────┤
│  @enterprise/db        数据库访问层                              │
│  @enterprise/domain-*  领域逻辑包                                │
│  @enterprise/auth      认证工具                                  │
│  @enterprise/config    配置管理                                  │
│  @enterprise/invoice-pdf 請求書PDF生成                            │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      数据层                                      │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Supabase                              │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │   │
│  │  │PostgreSQL│  │   Auth   │  │ Storage  │  │Realtime │ │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 前端框架 | Next.js | 15.x |
| React | React | 19.x |
| UI 组件 | shadcn/ui | latest |
| 样式 | Tailwind CSS | 4.x |
| 数据库 | PostgreSQL (Supabase) | 15.x |
| 认证 | Supabase Auth | - |
| 包管理 | pnpm | 9.x |
| Monorepo | Turborepo | 2.x |
| 语言 | TypeScript | 5.x |

## 2. 应用架构

### 2.1 Monorepo 结构

```
shop_flow/
├── apps/
│   ├── web/                 # 管理后台 Dashboard
│   │   ├── src/
│   │   │   ├── app/         # Next.js App Router
│   │   │   │   ├── (dashboard)/  # Dashboard 路由组
│   │   │   │   ├── api/     # API Routes
│   │   │   │   └── ...
│   │   │   ├── components/  # 应用级组件
│   │   │   │   └── ui/      # shadcn/ui 组件
│   │   │   └── lib/         # 工具函数
│   │   ├── components.json  # shadcn/ui 配置
│   │   └── package.json
│   │
│   ├── learning/            # 学習プラットフォーム
│   │   └── ...
│   │
│   └── storefront/          # オンラインストア
│       └── ...
│
├── packages/
│   ├── db/                  # 数据库访问层
│   ├── domain-org/          # 组织领域
│   ├── domain-commerce/     # 商城领域
│   ├── domain-settlement/   # 結算領域
│   ├── domain-org/          # 組織管理領域
│   ├── auth/                # 認証ツール（セッション検証ファクトリ）
│   ├── config/              # 設定管理（モジュール・テナント）
│   ├── invoice-pdf/         # 請求書PDF生成
│   └── db/                  # データベースアクセス層
│
├── src/
│   ├── components/
│   │   └── ui/              # 共享 UI 组件（旧）
│   └── lib/
│       └── utils.ts         # 共享工具函数
│
├── supabase/                # Supabase 配置
│   ├── migrations/
│   └── functions/
│
├── docs/                    # 文档
│   ├── architecture/
│   ├── product/
│   ├── devlogs/
│   └── ...
│
├── turbo.json               # Turborepo 配置
├── pnpm-workspace.yaml      # pnpm 工作区配置
└── package.json
```

### 2.2 apps/web 详细结构

```
apps/web/src/
├── app/
│   ├── (dashboard)/         # Dashboard 路由组
│   │   ├── layout.tsx       # Dashboard 布局（Sidebar + Header）
│   │   ├── page.tsx         # 首页
│   │   ├── account/         # 账号管理
│   │   ├── roles/           # 角色管理
│   │   ├── departments/     # 部门管理
│   │   ├── billing/         # 请求书管理
│   │   ├── commerce/        # 商品管理
│   │   ├── members/         # 会员管理
│   │   └── ...
│   │
│   ├── api/
│   │   ├── internal/        # 内部管理 API
│   │   │   ├── accounts/
│   │   │   ├── roles/
│   │   │   └── ...
│   │   └── webhooks/        # Webhook 端点
│   │
│   ├── globals.css          # 全局样式 + CSS 变量
│   └── layout.tsx           # 根布局
│
├── components/
│   ├── ui/                  # shadcn/ui 组件
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── select.tsx
│   │   └── ...
│   └── dashboard/           # Dashboard 专用组件
│       ├── sidebar.tsx
│       ├── header.tsx
│       └── feature-guard.tsx
│
└── lib/
    ├── utils.ts             # cn() 等工具函数
    └── validation/          # Zod schemas
```

## 3. 数据流

### 3.1 请求处理流程

```
用户操作
    │
    ▼
React 组件 (Client Component)
    │
    ├─── 读取操作 ───► Server Component / Server Action
    │                        │
    │                        ▼
    │                  packages/db
    │                        │
    │                        ▼
    │                    Supabase
    │
    └─── 写入操作 ───► API Route Handler
                             │
                             ▼
                       withErrorHandler (@/lib/api-utils)
                             │
                             ▼
                       Validation (Zod)
                             │
                             ▼
                       packages/db
                             │
                             ▼
                         Supabase
```

### 3.2 认证流程

```
登录请求
    │
    ▼
/api/auth/login
    │
    ▼
验证凭据 (admin_accounts 表)
    │
    ├─── 成功 ───► 设置 Cookie (admin_account_id)
    │                    │
    │                    ▼
    │              重定向到 Dashboard
    │
    └─── 失败 ───► 返回错误信息
```

### 3.3 权限检查流程

```
页面请求
    │
    ▼
Dashboard Layout
    │
    ▼
读取 Cookie (admin_account_id)
    │
    ▼
查询 admin_accounts + roles
    │
    ▼
获取 feature_permissions
    │
    ├─── 是超级管理员 ───► allowedFeatureIds = undefined (全部允许)
    │
    └─── 普通用户 ───► allowedFeatureIds = feature_permissions
                              │
                              ▼
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
              Sidebar 过滤        FeatureGuard 检查
              (菜单显示)          (路由访问)
```

## 4. 组件架构

### 4.1 UI 组件层次

```
shadcn/ui 基础组件 (apps/web/src/components/ui/)
    │
    ├── 原子组件：Button, Input, Label, Badge, ...
    │
    ├── 复合组件：Dialog, Select, DropdownMenu, ...
    │
    └── 布局组件：Card, Table, Tabs, Sheet, ...

Dashboard 组件 (apps/web/src/components/dashboard/)
    │
    ├── Sidebar：导航菜单
    │
    ├── Header：顶部栏
    │
    └── FeatureGuard：权限守卫

页面组件 (apps/web/src/app/(dashboard)/*/page.tsx)
    │
    └── 业务页面组件
```

### 4.2 组件通信

```
Server Component (数据获取)
    │
    ├── props ───► Client Component (交互)
    │
    └── Context ───► 深层组件
```

## 5. 数据库架构

### 5.1 核心表

```sql
-- 管理账号
admin_accounts (
    id UUID PRIMARY KEY,
    account_id TEXT UNIQUE,
    email TEXT,
    name TEXT,
    role_code TEXT REFERENCES roles(code),
    department_id UUID REFERENCES departments(id),
    is_active BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)

-- 角色
roles (
    id UUID PRIMARY KEY,
    code TEXT UNIQUE,
    name TEXT,
    description TEXT,
    feature_permissions TEXT[],
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)

-- 部门
departments (
    id UUID PRIMARY KEY,
    code TEXT UNIQUE,
    name TEXT,
    parent_id UUID REFERENCES departments(id),
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
```

### 5.2 RLS 策略（规划中）

```sql
-- 基于部门的数据隔离
CREATE POLICY "Users can only see their department data"
ON some_table
FOR SELECT
USING (
    department_id IN (
        SELECT department_id FROM admin_accounts
        WHERE id = auth.uid()
    )
);
```

## 6. 部署架构

### 6.1 当前部署

```
┌─────────────────────────────────────────────────────────────┐
│                      Vercel (规划)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  apps/web   │  │apps/learning│  │apps/storefront│       │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Supabase (自建实例)                         │
│              https://supabase.yohaku.cloud                  │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 环境变量

```bash
# Supabase
SUPABASE_URL=https://supabase.yohaku.cloud
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# 应用配置
ADMIN_LOGIN_ID=admin  # 超级管理员账号
```

## 7. 安全架构

### 7.1 认证

- Cookie-based Session
- HttpOnly Cookie 存储 admin_account_id
- 服务端验证每个请求

### 7.2 授权

- 功能级：feature_permissions 数组
- 路由级：FeatureGuard 组件
- API 级：Route Handler 内检查（规划中）

### 7.3 数据安全

- HTTPS 强制
- 输入验证（Zod）
- SQL 注入防护（Supabase 参数化查询）
- XSS 防护（React 默认转义）

## 8. 监控与日志（规划中）

### 8.1 日志

- 应用日志：Next.js 内置
- 访问日志：Vercel Analytics
- 错误追踪：Sentry（规划）

### 8.2 监控

- 性能监控：Vercel Speed Insights
- 可用性监控：UptimeRobot（规划）
- 数据库监控：Supabase Dashboard

## 9. 扩展性考虑

### 9.1 水平扩展

- Vercel 自动扩展
- Supabase 连接池
- 无状态应用设计

### 9.2 功能扩展

- 模块化的 packages 结构
- Feature Flags 支持
- 插件化架构（规划）

## 10. 附录

### 10.1 相关文档

- [技术架构详细](./TECHNICAL_ARCHITECTURE.md)
- [Supabase Schema 策略](./SUPABASE-SCHEMA-STRATEGY.md)
- [PRD 详细版](../product/PRD-DETAILED.md)

### 10.2 更新记录

| 日期 | 版本 | 变更内容 |
|------|------|---------|
| 2025-12-04 | 1.0.0 | 初始版本 |
