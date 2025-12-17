# Shop Flow 产品文档

> 最后更新: 2025-12-17

---

## 📋 文档结构

```
docs/product/
├── README.md                  # 本索引
├── PRD.md                     # 产品需求文档（主）
├── LOGIN-MODULE-DESIGN.md     # 登录模块设计
├── QUOTE-PHASE2-LEARNING.md   # 第二期报价
├── DEMO-ACCOUNT-GUIDE.md      # 演示账号指南
└── archived/                  # 归档文档
    ├── new-features-summary.md
    └── notification-system-summary.md
```

---

## 📚 核心文档

| 文档 | 描述 |
|------|------|
| [PRD.md](./PRD.md) | 产品需求文档（含里程碑记录） |
| [LOGIN-MODULE-DESIGN.md](./LOGIN-MODULE-DESIGN.md) | 登录安全模块设计 |
| [QUOTE-PHASE2-LEARNING.md](./QUOTE-PHASE2-LEARNING.md) | 学习平台报价 |
| [DEMO-ACCOUNT-GUIDE.md](./DEMO-ACCOUNT-GUIDE.md) | 演示账号使用指南 |

---

## 🏗️ 系统概览

| 应用 | 端口 | 描述 |
|------|------|------|
| web | 3000 | 管理后台 |
| storefront | 3001 | 在线商城 |
| learning | 3002 | 学习平台 |

**技术栈**: Next.js 16 + shadcn/ui + Tailwind CSS 4 + Supabase

---

## 🔗 相关文档

- [安全架构](../architecture/SECURITY-ARCHITECTURE.md)
- [技术架构](../architecture/TECHNICAL_ARCHITECTURE.md)
- [开发日志](../devlogs/)
