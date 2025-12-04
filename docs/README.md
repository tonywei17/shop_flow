# Shop Flow 文档中心

> 最后更新：2025-12-04

## 📁 目录结构

```
docs/
├── README.md                 # 本文件 - 文档导航
├── DOCS-INDEX.md             # 详细文档索引与状态说明
│
├── architecture/             # 🏗️ 架构文档
│   ├── SYSTEM_ARCHITECTURE.md      # 系统架构总览 ⭐
│   ├── TECHNICAL_ARCHITECTURE.md   # 技术架构详细
│   ├── SUPABASE-SCHEMA-STRATEGY.md # 数据库策略
│   └── SYSTEM_ARCHITECTURE_MEDUSA.md # [历史] Medusa 方案
│
├── product/                  # 📋 产品文档
│   ├── PRD.md                      # 产品需求文档
│   ├── PRD-DETAILED.md             # 详细版 PRD ⭐
│   ├── DEMO-ACCOUNT-GUIDE.md       # 演示账号指南
│   ├── notification-system-summary.md # 通知系统设计
│   ├── new-features-summary.md     # 新功能汇总
│   └── QUOTE-PHASE2-LEARNING.md    # Phase2 报价
│
├── guides/                   # 📖 开发指南
│   ├── MY_SUPABASE_COMPLETE_GUIDE.md # Supabase 完整指南 ⭐
│   ├── PACKAGE-MANAGER-GUIDE.md    # 包管理规范
│   ├── QUICK-START.md              # 快速开始
│   ├── READINESS-CHECKLIST.md      # 准备清单
│   └── implementation-guide.md     # 实施指南
│
├── devlogs/                  # 📝 开发日志
│   ├── DEVLOG-2025-12-04.md        # 最新日志
│   ├── DEVLOG-2025-12-03.md
│   ├── DEVLOG-2025-11-24.md
│   ├── DEVLOG-2025-11-23.md
│   ├── DAILY-LOG-2025-11-10.md
│   └── DEVLOG-LEGACY.md            # 早期整合日志
│
├── quality/                  # ✅ 质量文档
│   ├── code-health-analysis.md     # 代码健康度分析
│   └── COMPLETED-OPTIMIZATIONS.md  # 已完成优化
│
├── data/                     # 📊 参考数据
│   ├── アカウント管理_*.xlsx       # 账号数据
│   ├── ロール管理_*.xlsx           # 角色数据
│   ├── 部署管理_*.xlsx             # 部门数据
│   ├── 勘定項目_*.*                # 会计科目
│   ├── 商品区分_*.*                # 商品分类
│   └── 相手先_*.*                  # 交易对象
│
├── platforms/                # 🔧 平台配置
│   └── Supabase/                   # Supabase MCP 等
│
└── ADRs/                     # 📐 架构决策记录
    └── .gitkeep                    # (待补充)
```

## 🚀 快速导航

### 新手入门
1. [快速开始](guides/QUICK-START.md)
2. [包管理规范](guides/PACKAGE-MANAGER-GUIDE.md)
3. [Supabase 指南](guides/MY_SUPABASE_COMPLETE_GUIDE.md)

### 了解系统
1. [系统架构](architecture/SYSTEM_ARCHITECTURE.md) ⭐ 推荐首读
2. [技术架构](architecture/TECHNICAL_ARCHITECTURE.md)
3. [产品需求](product/PRD-DETAILED.md)

### 开发参考
1. [实施指南](guides/implementation-guide.md)
2. [准备清单](guides/READINESS-CHECKLIST.md)
3. [最新开发日志](devlogs/DEVLOG-2025-12-04.md)

## 📌 文档状态说明

| 标记 | 含义 |
|------|------|
| ⭐ | 推荐阅读 / 主线文档 |
| [历史] | 历史方案，仅供参考 |
| [规划] | 规划中，尚未实现 |

## 🔄 更新记录

| 日期 | 变更 |
|------|------|
| 2025-12-04 | 新增 SYSTEM_ARCHITECTURE.md、PRD-DETAILED.md；整理目录结构 |
| 2025-12-03 | 角色权限系统文档更新 |
| 2025-11-24 | Supabase 迁移相关文档 |

---

> 💡 **提示**：如需了解某文档的详细状态和适用性，请查看 [DOCS-INDEX.md](DOCS-INDEX.md)
