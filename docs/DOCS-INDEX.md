# 文档索引与状态说明

> 目标：为 `docs/` 目录提供一个简洁的索引，标注主线文档与当前项目状态的关系。
>
> **最后更新：2026-01-11**

## 1. 核心架构与设计

- **[SYSTEM_ARCHITECTURE.md](./architecture/SYSTEM_ARCHITECTURE.md)** ⭐
  - 系统架构总览，包含架构图、技术栈、数据流及安全模型。
- **[MODULAR-ARCHITECTURE.md](./architecture/MODULAR-ARCHITECTURE.md)** ⭐ NEW
  - 模块化架构设计文档，定义可分模块打包销售的软件产品基底。包含模块配置、领域包设计、租户配置机制。
- **[TECHNICAL_ARCHITECTURE.md](./architecture/TECHNICAL_ARCHITECTURE.md)**
  - 整体技术架构蓝图（Next.js + Supabase + Turborepo）。
- **[SUPABASE-SCHEMA-STRATEGY.md](./architecture/SUPABASE-SCHEMA-STRATEGY.md)**
  - 数据库 Schema 管理与迁移策略。

## 2. 业务设计与实现

- **[PRD.md](./product/PRD.md)** & **[PRD-DETAILED.md](./product/PRD-DETAILED.md)**
  - 产品需求文档与详细功能设计。
- **[INVOICE-SYSTEM-DESIGN.md](./architecture/INVOICE-SYSTEM-DESIGN.md)**
  - 结算与请求书系统设计。
- **[DATA-SCOPE-IMPLEMENTATION.md](./architecture/DATA-SCOPE-IMPLEMENTATION.md)**
  - 组织架构与数据权限实现细节。

## 3. 开发与部署指南

- **[MY_SUPABASE_COMPLETE_GUIDE.md](./guides/MY_SUPABASE_COMPLETE_GUIDE.md)**
  - 自建 Supabase 实例连接与管理指南。
- **[PRODUCTION-DEPLOYMENT.md](./deployment/PRODUCTION-DEPLOYMENT.md)**
  - 生产环境部署手册。
- **[QUICK-START.md](./guides/QUICK-START.md)**
  - 本地开发环境快速启动。

## 4. 开发日志 (devlogs/)

详细记录了系统的演进过程，查看 [devlogs/ 目录](./devlogs/) 获取历史变更。最近更新：

| 文件 | 说明 |
|------|------|
| [DEVLOG-2026-01-11-modular-architecture.md](./devlogs/DEVLOG-2026-01-11-modular-architecture.md) | ⭐ **模块化架构改造** - 配置系统、领域逻辑下沉、模块注册与路由守卫 |
| [DEVLOG-2026-01-04-invoice-fix.md](./devlogs/DEVLOG-2026-01-04-invoice-fix.md) | **请求书 PDF 预览修复与性能优化** |
| [DEVLOG-2025-12-18-bulk-approval-fix.md](./devlogs/DEVLOG-2025-12-18-bulk-approval-fix.md) | **一括承認修正** - SuperAdmin权限、UUID类型、URI长度限制问题修复 |

---

## 生产环境信息

| 服务 | URL |
|------|-----|
| 管理端 (web) | https://eurhythmics.yohaku.cloud |
| 商店前端 (storefront) | https://eurhythmics-shop.yohaku.cloud |
| 学習プラットフォーム (learning) | https://e-learning.yohaku.cloud |
| Supabase 控制台 | https://supabase.yohaku.cloud |
