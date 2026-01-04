# Shop Flow 产品需求文档（详细版）

> 版本：1.0.0  
> 更新日期：2025-12-04  
> 状态：活跃开发中

## 1. 产品概述

### 1.1 产品定位

Shop Flow 是一个面向教育培训机构的综合管理平台，整合了：
- **管理后台**（Dashboard）：内部运营管理
- **学习平台**（Learning Platform）：学员在线学习
- **在线商城**（Storefront）：商品销售与订单管理

### 1.2 目标用户

| 角色 | 描述 | 主要使用场景 |
|------|------|-------------|
| 超级管理员 | 系统最高权限 | 全局配置、账号管理、权限分配 |
| 部门管理员 | 部门级管理 | 部门成员管理、业务数据查看 |
| 普通员工 | 日常操作人员 | 订单处理、会员服务、内容管理 |
| 学员/会员 | 终端用户 | 在线学习、商品购买、考试认证 |

### 1.3 技术栈

| 层级 | 技术选型 |
|------|---------|
| 前端框架 | Next.js 15 (App Router) |
| UI 组件 | shadcn/ui (new-york style) |
| 样式方案 | Tailwind CSS 4 |
| 数据库 | Supabase (PostgreSQL) |
| 认证 | Supabase Auth |
| 支付 | Stripe（规划中）|
| AI | Langflow（规划中）|
| 代码管理 | Turborepo + pnpm Monorepo |

## 2. 功能模块

### 2.1 账号与权限管理

#### 段階的なリリース計画

1. **フェーズ1**: 管理画面の基本 CRUD、閲覧・編集、認証と権限、監査ログ
2. **フェーズ2**: 通知、メール配信、テンプレート、ジョブスケジューリング
3. **フェーズ3**: BI/ダッシュボード、集計、レポート、自動アラート

## 2025-12-16 更新: 商品画像エンドツーエンド対応

- ストレージ/DB
  - Supabase bucket `product-images` を使用、`product_images` テーブルを一覧・詳細で JOIN。
  - `primary_image_url` を is_primary 優先（なければ display_order 最小）で算出。
  - `images` 配列を API から返却し、フロントでギャラリーに利用。
- 管理画面
  - 商品画像マネージャで最大10枚/5MB、アップロード・主画像設定・並び替え・削除・ALT編集をサポート。
  - Next.js 15 params 非同期問題を修正（`commerce/[id]`）。
- ストアフロント
  - `products` 一覧カードで `primary_image_url` を表示（`next/image`、溢れ防止の relative + overflow-hidden）。
  - `products/[id]` でメイン画像＋サムネイルグリッドを表示（複数枚対応）。
  - `next.config.ts` に `supabase-api.yohaku.cloud` を remotePatterns で許可。
- 環境/運用
  - `.env.local` を全アプリで統一（Supabase/MEDUSA/Admin）。dev サーバーは 3000(web)/3001(storefront)/3002(learning)。
- **批量导入**：CSV 导入账号数据

#### 2.1.1 账号管理
- **账号列表**：分页展示、搜索过滤、批量操作
- **账号详情**：基本信息、角色分配、部门归属
- **账号状态**：有效/无效切换、最后登录时间

#### 2.1.2 角色管理
- **角色定义**：角色名称、描述、权限配置
- **功能权限**：基于菜单/路由的功能访问控制
- **数据权限**：基于部门/组织的数据范围控制（规划中）

#### 2.1.3 部门管理
- **组织架构**：树形结构的部门层级
- **部门成员**：部门与账号的关联管理

### 2.2 请求书管理（结算系统）

#### 2.2.1 请求一览
- 请求书列表与状态跟踪
- 按月份/状态筛选
- 导出功能

#### 2.2.2 CC 会费管理
- 会费记录管理
- 缴费状态追踪

#### 2.2.3 其他费用管理
- 杂项费用录入
- 费用分类与统计

### 2.3 在线商城管理

#### 2.3.1 商品管理
- SPU/SKU 管理
- 价格策略配置
- 库存管理
- 上下架控制

#### 2.3.2 订单管理
- 订单列表与详情
- 订单状态流转
- 发货与物流
- 退款处理

### 2.4 学习平台管理

#### 2.4.1 会员管理
- 会员信息维护
- 学习记录查看
- 资格认证状态

#### 2.4.2 研修管理
- 研修课程配置
- 报名管理
- 出勤记录

#### 2.4.3 考试管理
- 考试配置
- 成绩管理
- 证书发放

#### 2.4.4 资格管理
- 资格类型定义
- 资格申请审核
- 有效期管理

### 2.5 通知系统

- 站内通知
- 邮件通知（规划中）
- 通知模板管理

### 2.6 主数据管理

- 勘定项目（会计科目）
- 商品区分（商品分类）
- 相手先（交易对象）

## 3. 用户界面规范

### 3.1 设计系统

- **组件库**：shadcn/ui (new-york style)
- **图标**：Lucide React
- **颜色**：基于 CSS 变量的主题系统
- **响应式**：支持桌面端优先

### 3.2 布局结构

```
┌─────────────────────────────────────────────┐
│  Header (Logo, User Info, Theme Toggle)     │
├──────────┬──────────────────────────────────┤
│          │                                  │
│  Sidebar │         Main Content             │
│  (Nav)   │                                  │
│          │                                  │
│          │                                  │
│          │                                  │
│          │                                  │
├──────────┴──────────────────────────────────┤
│  Footer (Links to Learning/Storefront)      │
└─────────────────────────────────────────────┘
```

### 3.3 交互规范

- **表单验证**：实时验证 + 提交验证
- **加载状态**：Skeleton 占位 + Loading 指示器
- **错误处理**：Toast 通知 + 内联错误提示
- **确认操作**：危险操作需二次确认（Dialog）

## 4. 数据模型

### 4.1 核心实体

```
admin_accounts (管理账号)
├── id (UUID)
├── account_id (业务ID)
├── email
├── name
├── role_code (FK -> roles)
├── department_id (FK -> departments)
├── is_active
└── timestamps

roles (角色)
├── id (UUID)
├── code (唯一标识)
├── name
├── description
├── feature_permissions (text[])
└── timestamps

departments (部门)
├── id (UUID)
├── code
├── name
├── parent_id (自关联)
└── timestamps
```

### 4.2 权限模型

```
功能权限 (feature_permissions)
├── 基于 nav href 的白名单
├── 存储为 text[] 数组
└── 支持通配符匹配（规划中）

数据权限（规划中）
├── 基于部门的数据隔离
├── RLS 策略实现
└── 跨部门数据共享规则
```

## 5. API 设计

### 5.1 内部 API

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/internal/accounts` | GET/POST | 账号列表/创建 |
| `/api/internal/accounts/[id]` | GET/PUT/DELETE | 账号详情/更新/删除 |
| `/api/internal/roles` | GET/POST | 角色列表/创建 |
| `/api/internal/departments` | GET/POST | 部门列表/创建 |

### 5.2 认证

- Cookie-based Session（admin_account_id）
- Supabase Auth Token（规划中）

## 6. 非功能需求

### 6.1 性能

- 页面首屏加载 < 3s
- API 响应 P95 < 500ms
- 列表页支持分页（默认 20 条/页）

### 6.2 安全

- HTTPS 强制
- CSRF 防护
- XSS 防护（React 默认）
- 敏感操作日志记录

### 6.3 可用性

- 99.9% 月度可用性目标
- 错误边界防止页面崩溃
- 优雅降级策略

## 7. 里程碑

### Phase 1：基础框架（已完成）
- [x] Monorepo 架构搭建
- [x] Dashboard 基础布局
- [x] Supabase 集成
- [x] 账号/角色/部门管理

### Phase 2：权限系统（已完成）
- [x] 功能权限（feature_permissions）
- [x] 菜单过滤（Sidebar）
- [x] 路由守卫（FeatureGuard）
- [x] 超级管理员支持

### Phase 3：UI 标准化（已完成）
- [x] shadcn/ui 组件库导入
- [x] 组件样式统一
- [x] 主题系统完善

### Phase 4：业务功能（进行中）
- [ ] 请求书管理完善
- [ ] 商品管理完善
- [ ] 订单流程完善
- [ ] 学习平台对接

### Phase 5：高级功能（规划中）
- [ ] Stripe 支付集成
- [ ] AI 助手（Langflow）
- [ ] 报表与数据分析
- [ ] 多租户支持

## 8. 附录

### 8.1 术语表

| 术语 | 说明 |
|------|------|
| Dashboard | 管理后台 |
| Storefront | 在线商城前台 |
| Learning Platform | 学习平台 |
| feature_permissions | 功能权限，控制菜单和路由访问 |
| RLS | Row Level Security，行级安全策略 |

### 8.2 相关文档

- [技术架构文档](../architecture/TECHNICAL_ARCHITECTURE.md)
- [系统架构文档](../architecture/SYSTEM_ARCHITECTURE.md)
- [Supabase Schema 策略](../architecture/SUPABASE-SCHEMA-STRATEGY.md)
