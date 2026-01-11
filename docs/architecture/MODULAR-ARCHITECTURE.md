# 模块化架构设计（Modular Architecture）

> **创建日期**: 2025-01-11
> **状态**: 已实现
> **目标**: 支持按模块打包销售、独立部署、微定制化开发

---

## 1. 概述

Shop Flow 采用模块化架构设计，允许：
- 按功能模块独立启用/禁用
- 为不同客户配置不同的业务规则
- 领域逻辑下沉到共享包，便于复用

## 2. 模块定义

### 2.1 模块类型

```typescript
type ModuleId = "billing" | "commerce" | "learning" | "system";
```

| 模块 | 说明 | 包含功能 |
|------|------|----------|
| `billing` | 请求书关连 | 请求书生成、CC会费管理、费用管理 |
| `commerce` | 在线商店管理 | 商品管理、库存管理、订单管理 |
| `learning` | 学习平台 | 会员管理、研修管理、资格管理 |
| `system` | 系统管理 | 部署管理、账户管理、角色管理 |

### 2.2 模块控制

通过环境变量控制启用的模块：

```bash
# .env.local
ENABLED_MODULES=billing,commerce,system
```

- 未设置时默认启用所有模块
- 模块访问控制在 middleware 层强制执行

## 3. 架构组件

### 3.1 packages/config

配置包提供模块化系统的核心功能：

```
packages/config/src/
├── types.ts          # 类型定义（ModuleId, TenantConfig, BusinessRules）
├── env.ts            # 环境变量工具（getEnabledModules, isModuleEnabled）
├── modules.ts        # 模块注册表（MODULE_REGISTRY, 路由检查）
├── business-rules.ts # 可配置业务规则（发票规则、组织信息）
├── ui-constants.ts   # UI常量（价格类型、状态Badge）
├── tenant-config.ts  # 租户配置加载与缓存
└── index.ts          # 统一导出
```

### 3.2 模块注册表

每个模块在 `MODULE_REGISTRY` 中注册其路由和导航：

```typescript
// packages/config/src/modules.ts
export const MODULE_REGISTRY: Record<ModuleId, ModuleDefinition> = {
  billing: {
    id: "billing",
    name: "請求書関連",
    routes: ["/billing", "/inventory"],
    apiRoutes: ["/api/invoices", "/api/expenses", "/api/cc-members"],
    navSections: BILLING_NAV_SECTIONS,
    dependencies: ["system"],
  },
  // ... other modules
};
```

### 3.3 路由守卫

Middleware 自动检查路由是否属于已启用模块：

```typescript
// apps/web/src/middleware.ts
import { isRouteEnabled, isApiRouteEnabled } from "@enterprise/config";

function isModuleRouteAllowed(pathname: string): boolean {
  if (pathname.startsWith("/api/")) {
    return isApiRouteEnabled(pathname);
  }
  return isRouteEnabled(pathname);
}
```

### 3.4 动态导航

侧边栏根据启用的模块动态过滤导航项：

```typescript
// apps/web/src/components/dashboard/nav-items.ts
const ALL_NAV_SECTIONS: NavSection[] = [
  {
    label: "請求書関連",
    requiredModule: "billing",
    items: [
      { label: "請求書生成", href: "/billing/generate", requiredModule: "billing" },
      // ...
    ],
  },
];
```

## 4. 领域逻辑下沉

### 4.1 domain-settlement

发票计算逻辑从 `apps/web` 迁移到 `packages/domain-settlement`：

```
packages/domain-settlement/src/
├── invoice/
│   ├── types.ts       # 发票类型定义
│   ├── calculator.ts  # 发票计算逻辑（transformInvoiceData, generateInvoiceNo）
│   └── index.ts       # 模块导出
└── index.ts           # 包导出
```

**使用示例**：

```typescript
import { transformInvoiceData, generateInvoiceNo } from "@enterprise/domain-settlement";

const pdfData = transformInvoiceData(invoice, invoiceNo, ccMembers, materials, expenses);
```

### 4.2 domain-org

组织管理的验证规则下沉到 `packages/domain-org`：

```
packages/domain-org/src/
├── validation/
│   ├── accounts.ts    # 账户验证规则（Zod schemas）
│   ├── departments.ts # 部门验证规则
│   ├── roles.ts       # 角色验证规则
│   └── index.ts       # 模块导出
└── index.ts           # 包导出
```

## 5. 租户配置

### 5.1 配置文件结构

```
config/
├── default.json           # 默认配置
└── tenants/
    └── eurhythmics.json   # 客户专属配置
```

### 5.2 配置内容

```json
{
  "id": "eurhythmics",
  "name": "リトミック研究センター",
  "modules": ["billing", "commerce", "learning", "system"],
  "organization": {
    "name": "特定非営利活動法人リトミック研究センター",
    "postalCode": "〒151-0051",
    "address": "東京都渋谷区千駄ヶ谷1丁目30番8号"
  },
  "businessRules": {
    "invoiceRules": {
      "ccFee": {
        "defaultUnitPrice": 480,
        "aigranRebatePerPerson": 600
      },
      "taxRate": 0.1
    }
  }
}
```

### 5.3 使用租户配置

```typescript
import { getTenantBusinessRules, getTenantOrganization } from "@enterprise/config";

const rules = getTenantBusinessRules();
const org = getTenantOrganization();
```

## 6. 部署模式

### 6.1 单客户部署

为每个客户部署独立实例：

```bash
# 客户 A
TENANT_ID=customer_a
ENABLED_MODULES=billing,system

# 客户 B
TENANT_ID=customer_b
ENABLED_MODULES=billing,commerce,system
```

### 6.2 配置定制

1. 创建客户配置文件 `config/tenants/{customer_id}.json`
2. 设置环境变量 `TENANT_ID={customer_id}`
3. 部署应用

## 7. 扩展指南

### 7.1 添加新模块

1. 在 `packages/config/src/types.ts` 添加模块 ID
2. 在 `packages/config/src/modules.ts` 注册模块路由
3. 在 `apps/web/src/components/dashboard/nav-items.ts` 添加导航项
4. 创建对应的页面和 API 路由

### 7.2 添加新的业务规则

1. 在 `packages/config/src/types.ts` 定义类型
2. 在 `packages/config/src/business-rules.ts` 添加默认值
3. 在 `config/default.json` 添加配置
4. 在业务代码中使用 `getTenantBusinessRules()`

## 8. 相关文件

| 文件 | 说明 |
|------|------|
| `packages/config/src/` | 配置包源码 |
| `packages/domain-settlement/src/` | 结算领域逻辑 |
| `packages/domain-org/src/` | 组织领域逻辑 |
| `apps/web/src/middleware.ts` | 路由守卫 |
| `apps/web/src/components/dashboard/nav-items.ts` | 导航配置 |
| `config/` | 租户配置文件 |

---

## 变更历史

| 日期 | 变更内容 |
|------|----------|
| 2025-01-11 | 初始版本，实现模块化架构基础设施 |
