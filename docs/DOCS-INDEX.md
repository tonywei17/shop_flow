# 文档索引

> 为 `docs/` 目录提供简洁的索引，标注主线文档与当前项目状态的关系。
>
> **最后更新：2026-01-18**

## 1. 核心架构与设计

| 文档 | 说明 |
|------|------|
| [SYSTEM_ARCHITECTURE.md](./architecture/SYSTEM_ARCHITECTURE.md) ⭐ | 系统架构总览（架构图、技术栈、数据流、安全模型） |
| [MODULAR-ARCHITECTURE.md](./architecture/MODULAR-ARCHITECTURE.md) ⭐ | 模块化架构设计（模块配置、领域包、租户配置） |
| [TECHNICAL_ARCHITECTURE.md](./architecture/TECHNICAL_ARCHITECTURE.md) | 技术架构蓝图（Next.js + Supabase + Turborepo） |
| [SECURITY-ARCHITECTURE.md](./architecture/SECURITY-ARCHITECTURE.md) | 安全架构设计 |
| [SUPABASE-SCHEMA-STRATEGY.md](./architecture/SUPABASE-SCHEMA-STRATEGY.md) | 数据库 Schema 管理与迁移策略 |

## 2. 业务设计

| 文档 | 说明 |
|------|------|
| [PRD.md](./product/PRD.md) | 产品需求文档 |
| [PRD-DETAILED.md](./product/PRD-DETAILED.md) | 详细功能设计 |
| [INVOICE-SYSTEM-DESIGN.md](./architecture/INVOICE-SYSTEM-DESIGN.md) | 结算与请求书系统设计 |
| [INVOICE-LOGIC.md](./invoice/INVOICE-LOGIC.md) | 请求书业务逻辑 |
| [DATA-SCOPE-IMPLEMENTATION.md](./architecture/DATA-SCOPE-IMPLEMENTATION.md) | 组织架构与数据权限 |

## 3. 开发与部署

| 文档 | 说明 |
|------|------|
| [MY_SUPABASE_COMPLETE_GUIDE.md](./guides/MY_SUPABASE_COMPLETE_GUIDE.md) | Supabase 实例管理指南 |
| [PRODUCTION-DEPLOYMENT.md](./deployment/PRODUCTION-DEPLOYMENT.md) | 生产环境部署手册 |
| [QUICK-START.md](./guides/QUICK-START.md) | 本地开发环境快速启动 |

## 4. 安全与审计

| 文档 | 说明 |
|------|------|
| [SUPABASE-RLS-IMPLEMENTATION.md](./security/SUPABASE-RLS-IMPLEMENTATION.md) | Row-Level Security 实现 |
| [SECURITY-FIXES-2026-01-11.md](./security/SECURITY-FIXES-2026-01-11.md) | 安全修复记录 |

## 5. UI/UX 设计

| 文档 | 说明 |
|------|------|
| [UI-DESIGN-GUIDE.md](./UI/UI-DESIGN-GUIDE.md) | UI 设计指南 |
| [UI-DESIGN-GUIDE-ZH.md](./UI/UI-DESIGN-GUIDE-ZH.md) | UI 设计指南（中文版） |

## 6. 开发日志

详细记录系统演进过程，查看 [devlogs/](./devlogs/) 目录。最近更新：

| 文件 | 说明 |
|------|------|
| [DEVLOG-2026-01-11-business-logic-migration.md](./devlogs/DEVLOG-2026-01-11-business-logic-migration.md) | 业务逻辑迁移到领域包 |
| [DEVLOG-2026-01-11-modular-architecture.md](./devlogs/DEVLOG-2026-01-11-modular-architecture.md) | 模块化架构改造 |
| [DEVLOG-2026-01-06-deployment-fix.md](./devlogs/DEVLOG-2026-01-06-deployment-fix.md) | 部署问题修复 |
| [DEVLOG-2026-01-04-invoice-fix.md](./devlogs/DEVLOG-2026-01-04-invoice-fix.md) | 请求书 PDF 修复 |

---

## 生产环境

| 服务 | URL |
|------|-----|
| 管理端 (web) | https://eurhythmics.yohaku.cloud |
| 商店前端 (storefront) | https://eurhythmics-shop.yohaku.cloud |
| 学習プラットフォーム (learning) | https://e-learning.yohaku.cloud |
| Supabase 控制台 | https://supabase.yohaku.cloud |
