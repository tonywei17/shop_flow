# 文档索引与状态说明

> 目标：为 `docs/` 目录提供一个简洁的索引，标注主线文档与当前项目状态的关系。

## 1. 核心架构与设计

- **[SYSTEM_ARCHITECTURE.md](./architecture/SYSTEM_ARCHITECTURE.md)** ⭐
  - 系统架构总览，包含架构图、技术栈、数据流及安全模型。
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
- **[2026-01-04 - 请求书 PDF 预览修复与性能优化](./devlogs/DEVLOG-2026-01-04-invoice-fix.md)**

---

## 生产环境信息

| 服务 | URL |
|------|-----|
| 管理端 (web) | https://eurhythmics.yohaku.cloud |
| 商店前端 (storefront) | https://eurhythmics-shop.yohaku.cloud |
| 学習プラットフォーム (learning) | https://e-learning.yohaku.cloud |
| Supabase 控制台 | https://supabase.yohaku.cloud |
