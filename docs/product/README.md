# Shop Flow 产品文档索引

> 最后更新: 2025-12-17

本目录包含 Shop Flow 平台的所有产品相关文档。

---

## 📋 文档结构

```
docs/product/
├── README.md                      # 本索引文件
├── PRD.md                         # 产品需求文档（主文档）
├── PRD-DETAILED.md                # 产品需求文档（详细版）
├── QUOTE-PHASE2-LEARNING.md       # 第二期报价：学习平台
│
├── 功能设计/
│   ├── LOGIN-MODULE-DESIGN.md     # 登录模块设计
│   ├── new-features-summary.md    # 新功能实装总结（2025-11-10）
│   └── notification-system-summary.md  # 通知系统功能总结
│
└── 使用指南/
    └── DEMO-ACCOUNT-GUIDE.md      # 演示账号使用指南
```

---

## 📚 核心文档

### 产品需求文档

| 文档 | 描述 | 状态 |
|------|------|------|
| [PRD.md](./PRD.md) | 企业内部管理系统产品需求文档（主文档） | 活跃 |
| [PRD-DETAILED.md](./PRD-DETAILED.md) | 产品需求文档详细版，包含技术栈和里程碑 | 活跃 |

### 报价与规划

| 文档 | 描述 | 状态 |
|------|------|------|
| [QUOTE-PHASE2-LEARNING.md](./QUOTE-PHASE2-LEARNING.md) | 第二期学习平台开发报价 | 参考 |

---

## 🔧 功能设计文档

### 认证与安全

| 文档 | 描述 | 实现状态 |
|------|------|----------|
| [LOGIN-MODULE-DESIGN.md](./LOGIN-MODULE-DESIGN.md) | 登录模块完整设计 | ✅ 已实现 |

**登录模块核心功能：**
- bcrypt 密码哈希
- 失败登录保护（5次失败锁定15分钟）
- HMAC-SHA256 签名会话
- HttpOnly/SameSite/Secure Cookie
- 审计日志记录

### 功能模块

| 文档 | 描述 | 实现状态 |
|------|------|----------|
| [new-features-summary.md](./new-features-summary.md) | 2025-11-10 新功能总结 | ✅ 已实现 |
| [notification-system-summary.md](./notification-system-summary.md) | 通知系统设计与实现 | ⏳ 部分实现 |

**新功能总结包含：**
- C端：课程详情页、视频学习页（Vimeo集成）
- B端：活动研修管理、动画内容管理

**通知系统包含：**
- B端：通知管理、发送表单
- C端：通知中心、Header通知图标

---

## 📖 使用指南

| 文档 | 描述 | 适用对象 |
|------|------|----------|
| [DEMO-ACCOUNT-GUIDE.md](./DEMO-ACCOUNT-GUIDE.md) | C端学习平台演示账号使用指南 | 测试/演示 |

---

## 🏗️ 系统架构

Shop Flow 是一个多应用平台：

| 应用 | 端口 | 描述 |
|------|------|------|
| **web** (Dashboard) | 3000 | 管理后台 |
| **storefront** | 3001 | 在线商城 |
| **learning** | 3002 | 学习平台 |

### 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Next.js 16 (App Router) |
| UI 组件 | shadcn/ui (new-york style) |
| 样式 | Tailwind CSS 4 |
| 数据库 | Supabase (PostgreSQL) |
| 认证 | 自定义 HMAC 会话 + Supabase Auth |
| 支付 | Stripe（规划中）|
| AI | Langflow（规划中）|

---

## 📅 开发里程碑

### 已完成

- ✅ **Phase 1**: 基础框架（Monorepo、Dashboard布局、Supabase集成）
- ✅ **Phase 2**: 权限系统（功能权限、菜单过滤、路由守卫）
- ✅ **Phase 3**: UI 标准化（shadcn/ui 组件库）
- ✅ **2025-12-17**: 安全加固（登录安全、审计日志、订单事务）

### 进行中

- 🔄 **Phase 4**: 业务功能完善
  - 请求书管理
  - 商品管理
  - 订单流程
  - 学习平台对接

### 规划中

- 📋 **Phase 5**: 高级功能
  - Stripe 支付集成
  - AI 助手（Langflow）
  - 报表与数据分析
  - 多租户支持

---

## 🔗 相关文档

- [技术架构文档](../architecture/TECHNICAL_ARCHITECTURE.md)
- [系统架构文档](../architecture/SYSTEM_ARCHITECTURE.md)
- [安全架构文档](../architecture/SECURITY-ARCHITECTURE.md)
- [Supabase Schema 策略](../architecture/SUPABASE-SCHEMA-STRATEGY.md)
- [开发日志](../devlogs/)

---

## 📝 文档维护指南

### 新增功能文档

1. 在 `docs/product/` 下创建 `[FEATURE]-DESIGN.md`
2. 更新本 README.md 索引
3. 如涉及架构变更，同步更新 `docs/architecture/`

### 文档命名规范

- 设计文档：`[MODULE]-DESIGN.md` 或 `[MODULE]-MODULE-DESIGN.md`
- 功能总结：`[feature]-summary.md`
- 使用指南：`[FEATURE]-GUIDE.md`
- 报价文档：`QUOTE-[PHASE]-[MODULE].md`
