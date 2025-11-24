# 技术框架说明（Technical Architecture）

> 基座：Next.js + Supabase + Stripe + Langflow（AI 引擎）  
> 目标：模块化、可扩展、多租户、安全合规、可观测。
>
> **当前状态说明（2025-11-23）**：
> - 已落地：Turborepo + pnpm、`apps/web` / `apps/storefront` / `apps/learning`、`@enterprise/db` 访问 Supabase、部分 `@enterprise/domain-*` 包。  
> - UI 层：本仓库已采用 shadcn/ui + `src/components/ui/*`，不再使用独立的 `packages/ui` 包（文中如有提及，可视为早期方案）。  
> - 外部服务：Stripe / Langflow 等仍处于规划或 PoC 阶段，尚未成为强依赖；Supabase 是当前唯一落地的数据基座。

## 1. 架构概览

- **前端/服务端渲染层**：Next.js（App Router）。
- **后端与数据**：Supabase（Postgres、Auth、Storage、Edge Functions、Realtime）。
- **支付与结算**：Stripe（支付、订阅、Webhook、可选 Stripe Connect）。
- **AI 自动化**：Langflow（Flow 模板管理 + 推理服务），经统一 AI 网关接入。
- **事件与异步**：事件表 + Outbox Pattern；队列可选（Supabase Edge Functions/pg-boss/Redis）。
- **可观测与合规**：日志、指标、追踪、审计，RLS 行级权限与最小权限。

```mermaid
flowchart LR
  U[User/Admin/Store/Teacher] -->|HTTP(S)| NX[Next.js App]
  NX -- SSR/ISR/API Routes --> SB[(Supabase Postgres)]
  NX -- Auth --> SA[Supabase Auth]
  NX -- Storage --> SS[Supabase Storage]
  NX -- Webhook /api/webhooks/stripe --> ST[Stripe]
  ST --> WH[Stripe Webhook Handler]
  NX -- AI Gateway --> LF[Langflow Server]
  LF <--> Q[Queue/Workers]
  Q <--> EF[Supabase Edge Functions]
  EF <--> SB
  NX <--> RT[Supabase Realtime]
  NX --> OBS[(Logging/Tracing/Metrics)]
```

## 2. 模块化分层与边界

- **apps/web**：面向用户/员工的主 Web 应用（Next.js）。
- **apps/admin（可选）**：独立后台（或在 web 内以 role-based routes 实现）。
- **packages/**（跨模块共享）：
  - **auth**：登录/会话/权限工具（Supabase Auth + RBAC/ABAC helper）。
  - **db**：数据库访问层（supabase-js 客户端、类型、Query Helpers）。
  - **config**：环境/Feature Flags/多租户配置读取。
  - **ai**：Langflow 网关 SDK、Flow 模板版本管理、回调与SSE。（规划中）
  - **stripe**：支付/订阅/开票/对接工具、Webhooks 验证、映射。（规划中）
  - **events**：领域事件模型、Outbox、总线发布/订阅工具。（规划/部分 PoC）
  - **reports**：报表与导出（CSV/PDF）工具。（规划中）
  - **domain-<module>**：每个业务域的服务与模型（当前已存在 `domain-org` / `domain-crm` / `domain-lms` / `domain-commerce` / `domain-settlement` 等骨架）。
- **supabase/**：迁移、种子、Edge Functions、策略与触发器。
- **flows/**：Langflow Flow 模板与版本记录（JSON + 说明）。

> 各业务模块（结算、组织/加盟、CRM、LMS、商城）在 `apps/web` 的 route 层保持独立，核心领域逻辑沉淀到 `packages/domain-*`，对外依赖经 `packages/*` 的稳定接口暴露。

## 3. 目录结构建议（Turborepo Monorepo）

```
root/
  apps/
    web/                 # Next.js App Router
    admin/               # 可选：独立后台
  packages/
    ui/
    auth/
    db/
    config/
    ai/
    stripe/
    events/
    reports/
    domain-settlement/
    domain-org/
    domain-crm/
    domain-lms/
    domain-commerce/
  supabase/
    migrations/
    functions/           # Edge Functions (Deno)
    seeds/
    policies/            # RLS 策略片段与说明
  flows/
    <flow-name>/
      v1/flow.json
      README.md
  docs/
    ADRs/                # 架构决策记录（可选）
```

## 4. 多租户设计与权限

- **租户解析**：
  - 首选：按域名/子域名（`<tenant>.example.com`）。
  - 备选：HTTP Header 或登录后选择器（在 BFF 层注入）。
- **数据隔离**：
  - 表结构包含 `tenant_id`（UUID）。
  - Supabase RLS：基于 `auth.jwt()` 与自定义 claims（`tenant_id`、`roles`）。
  - 策略示例：仅允许同租户、具备相应 role 的用户读写。
- **权限模型**：
  - RBAC（角色）+ ABAC（属性）混合。
  - 资源粒度：路由、菜单、按钮、记录、字段级（尽量由前后端共同约束）。

## 5. 数据域与核心表（摘要）

- **租户/组织**：`tenants`、`organizations`、`branches`、`stores`、`contracts`、`roles`、`user_roles`。
- **CRM/会员**：`members`、`member_tiers`、`benefits`、`points_ledger`、`vouchers`、`balances`。
- **LMS**：`courses`、`chapters`、`lessons`、`resources`、`enrollments`、`exams`、`certificates`、`instructors`、`revenue_shares`。
- **商城**：`products`（SPU）、`skus`、`prices`、`inventories`、`orders`、`order_items`、`fulfillments`、`refunds`、`promotions`。
- **结算**：`settlement_rules`、`settlement_events`、`invoices`、`payables`、`receivables`、`payouts`、`reconciliations`。
- **事件与审计**：`domain_events`（Outbox）、`audit_logs`。

> 迁移与策略：均存放于 `supabase/migrations` 与 `supabase/policies`，使用自动化脚本应用与回归测试。

## 6. API 边界与路由

- **Next.js Route Handlers**：`app/api/*` 提供 BFF 能力（合并多后端调用、缓存、鉴权）。
- **Webhooks**：`/api/webhooks/stripe` 验证签名，处理支付/订阅/发票事件，写入 `domain_events` 与对应领域表。
- **AI 网关**：`/api/ai/*` 代理/编排 Langflow 流程，支持异步回调与 SSE。
- **导出/报表**：`/api/reports/*` 触发异步任务，完成后提供下载链接（Storage 临时签名 URL）。

## 7. Stripe 集成

- **模式选择**：
  - 标准支付与订阅：使用 Products/Prices；对接税率与发票。
  - 多角色分润：评估 Stripe Connect（Standard/Express），用于讲师/加盟店分账。
- **映射**：`stripe_price_id`、`stripe_product_id` 与内部 `skus/prices` 对齐。
- **幂等与对账**：所有关键写操作使用 Idempotency-Key；Webhook 事件去重与落库；与结算系统联动生成应收/应付。
- **安全**：Webhook Secret、API Key 管理；仅服务端持有写权限。

## 8. Langflow 集成

- **网关 SDK（`packages/ai`）**：统一封装 Flow 执行、输入输出模式、错误与超时处理。
- **模板管理**：`flows/<name>/vN/flow.json`；版本可配置与灰度发布。
- **异步执行**：队列 + 回调（Webhook）或 SSE 通知；执行结果落库（如 `ai_tasks`）。
- **场景**：摘要、分类、问答、合规校验、合成题库、推荐等。

## 9. 可观测性与质量

- **日志**：结构化日志（请求/响应/业务事件）；前端 Error Boundary + 上报。
- **指标**：核心 KPI（下单、支付、结算、学习、留存）；技术指标（P95、错误率）。
- **追踪**：OpenTelemetry（可选），串联 Next.js、API、Edge Functions。
- **测试**：
  - 单元：packages 级别。
  - 集成：API + DB（使用 Supabase Test 或本地容器）。
  - 端到端：Playwright/Cypress（关键业务流）。

## 10. 安全与合规

- **RLS/Least Privilege**：默认拒绝；仅授予必要权限；管理面操作经服务端 BFF。
- **Secrets**：环境变量（Vercel/Supabase Project Secrets）；绝不提交到仓库。
- **输入校验**：Zod/Yup；API 层与 DB 层双重校验。
- **CSP/Headers**：Next.js 中配置严格的 CSP、CORS、Rate Limiting。
- **数据生命周期**：匿名化/删除、导出（GDPR/CCPA）。

## 11. 部署与环境

- **Next.js**：Vercel（推荐）或自托管容器。
- **Supabase**：托管项目；Edge Functions 用于异步与轻量后端。
- **Langflow**：托管或自建（Docker）；通过内网/专线/安全组限制访问。
- **迁移**：CI/CD 步骤包含 Supabase 迁移应用与回滚策略。

## 12. 本地开发流程

1. 克隆仓库，安装 pnpm/yarn。
2. `supabase start`（如使用本地容器）或配置远程项目 URL/Anon Key。
3. 运行迁移与种子：`supabase db reset`。
4. `cp .env.example .env` 并填充 Supabase/Stripe/Langflow 关键变量。
5. `pnpm dev` 启动 `apps/web`（以及可选 `apps/admin`）。

## 13. 扩展与插件化

- **Feature Flags**：`feature_flags` 表 + `packages/config` 读取；按租户/角色开关。
- **供应商替换**：短信/邮件/对象存储/支付渠道可通过 Adapter 模式替换。
- **模块可插拔**：以路由分组 + domain 包隔离，禁用模块不编译/不挂载路由。

## 14. 性能与缓存

- **Next.js 缓存**：`fetch` 缓存、ISR、Route 缓存；对列表页与详情页区分策略。
- **边缘缓存**：Vercel Edge/中间层缓存（权限敏感数据谨慎使用）。
- **数据库**：读写分离、索引优化、热点表拆分；必要时引入 Redis。

## 15. 里程碑落地建议（与 PRD 对齐）

1. 基座与鉴权（多租户、RLS、RBAC、UI 基础）。
2. 商城 MVP + Stripe 支付闭环 + 结算事件入库。
3. LMS MVP + 讲师分润映射（可选 Stripe Connect）。
4. 结算系统增强（分润规则、账期、审批流、发票）。
5. CRM 增强（等级/权益、积分/余额、营销）。
6. Langflow AI 能力（客服问答、报表摘要、工单自动化）。
7. 报表与可观测（KPI、审计、告警）。

## 16. 待确认的关键选项

- 是否采用 **Turborepo** + 多 `apps`/`packages` 的 Monorepo？
- 后台是独立 `apps/admin` 还是与前台合并在 `apps/web` 中按路由与权限隔离？
- 是否启用 **Stripe Connect**（讲师/加盟店分账）？
- Langflow 部署模式（托管/自建）、是否需要内网访问控制？
- 首个落地区域/数据驻留要求（影响 Stripe 税务与合规配置）。
- 异步队列的实现优先级（Edge Functions vs 轻量队列 vs 第三方）。
