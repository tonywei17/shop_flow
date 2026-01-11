# 开发日志：模块化架构实现

> **日期**: 2025-01-11
> **开发者**: AI Assistant (Claude)
> **状态**: ✅ 完成

---

## 概述

本次开发实现了 Shop Flow 的模块化架构基础设施，支持：
- 按模块打包销售给不同客户
- 独立部署，为每个客户配置不同功能
- 微定制化开发，可配置业务规则

---

## 实现内容

### 1. packages/config 配置包扩展

**新增文件**:

| 文件 | 说明 |
|------|------|
| `src/types.ts` | 核心类型定义（ModuleId, TenantConfig, BusinessRules, UIConfig） |
| `src/env.ts` | 环境变量工具（getEnabledModules, isModuleEnabled） |
| `src/modules.ts` | 模块注册表（MODULE_REGISTRY, isRouteEnabled, isApiRouteEnabled） |
| `src/business-rules.ts` | 可配置业务规则（发票规则、组织信息、银行信息） |
| `src/ui-constants.ts` | UI常量（价格类型、Badge颜色、状态映射） |
| `src/tenant-config.ts` | 租户配置加载与缓存 |

**核心功能**:

```typescript
// 检查模块是否启用
import { isModuleEnabled, getEnabledModules } from "@enterprise/config";

if (isModuleEnabled("billing")) {
  // billing 模块相关逻辑
}

// 获取业务规则
import { getInvoiceRules } from "@enterprise/config";
const rules = getInvoiceRules();
const taxRate = rules.taxRate; // 0.1
```

### 2. 模块注册与动态导航

**修改文件**: `apps/web/src/components/dashboard/nav-items.ts`

- 添加 `requiredModule` 属性到导航项
- 实现 `getNavSections()` 函数，根据启用模块过滤导航
- 保持向后兼容的 `navSections` 导出

```typescript
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

### 3. 路由守卫

**修改文件**: `apps/web/src/middleware.ts`

- 添加模块访问控制检查
- 未启用模块的路由返回 404 或重定向
- 修复静态资源（图片等）被拦截的问题

```typescript
function isModuleRouteAllowed(pathname: string): boolean {
  if (pathname.startsWith("/api/")) {
    return isApiRouteEnabled(pathname);
  }
  return isRouteEnabled(pathname);
}
```

**Matcher 配置更新**:
```typescript
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.ico$|.*\\.webp$).*)",
  ],
};
```

### 4. 领域逻辑下沉 - domain-settlement

**新增文件**:

| 文件 | 说明 |
|------|------|
| `src/invoice/types.ts` | 发票相关类型定义 |
| `src/invoice/calculator.ts` | 发票计算逻辑（从 apps/web 迁移） |
| `src/invoice/index.ts` | 模块导出 |

**迁移的功能**:
- `generateInvoiceNo()` - 生成发票编号
- `calculateIssueDate()` - 计算发行日期
- `transformInvoiceData()` - 转换发票数据为 PDF 格式

### 5. 领域逻辑下沉 - domain-org

**新增文件**:

| 文件 | 说明 |
|------|------|
| `src/validation/accounts.ts` | 账户验证规则（Zod schemas） |
| `src/validation/departments.ts` | 部门验证规则 |
| `src/validation/roles.ts` | 角色验证规则 |
| `src/validation/index.ts` | 模块导出 |

### 6. 清理 domain-commerce

- 删除废弃的 Medusa 集成代码（medusaClient.ts）
- 保留包结构用于未来扩展

### 7. 租户配置文件

**新增文件**:

| 文件 | 说明 |
|------|------|
| `config/default.json` | 默认租户配置 |
| `config/tenants/eurhythmics.json` | 当前客户（リトミック研究センター）配置 |

### 8. 向后兼容处理

**修改文件**: `apps/web/src/lib/pdf/index.ts`

统一从 `@enterprise/domain-settlement` 重新导出类型和函数，保持现有代码兼容：

```typescript
export {
  type InvoicePDFData,
  generateInvoiceNo,
  transformInvoiceData,
} from "@enterprise/domain-settlement";
```

---

## 修复的问题

### 1. Sidebar 菜单不显示

**问题**: `getNavSections()` 在客户端组件中调用时，`process.env.ENABLED_MODULES` 不可访问

**解决**: 在客户端直接使用静态的 `navSections`，模块访问控制由 middleware 强制执行

### 2. Logo 图片不显示

**问题**: Middleware matcher 没有排除静态图片文件，导致 `/eu_logo.png` 被重定向

**解决**: 更新 matcher 配置，排除常见图片格式

---

## 构建验证

```bash
# 所有包构建成功
pnpm --filter @enterprise/config build      # ✅
pnpm --filter @enterprise/domain-settlement build  # ✅
pnpm --filter @enterprise/domain-org build  # ✅
pnpm --filter web build                     # ✅
```

---

## 使用方法

### 模块控制

```bash
# .env.local
ENABLED_MODULES=billing,commerce,system  # 启用指定模块
TENANT_ID=eurhythmics                     # 租户 ID
```

### 配置定制

在 `config/tenants/{tenant-id}.json` 中配置客户专属的业务规则：

```json
{
  "businessRules": {
    "invoiceRules": {
      "ccFee": { "defaultUnitPrice": 480 },
      "taxRate": 0.1
    }
  }
}
```

---

## 修改文件列表

| 文件 | 操作 | 说明 |
|------|------|------|
| `packages/config/src/types.ts` | 新增 | 核心类型定义 |
| `packages/config/src/env.ts` | 新增 | 环境变量工具 |
| `packages/config/src/modules.ts` | 新增 | 模块注册表 |
| `packages/config/src/business-rules.ts` | 新增 | 业务规则 |
| `packages/config/src/ui-constants.ts` | 新增 | UI常量 |
| `packages/config/src/tenant-config.ts` | 新增 | 租户配置加载 |
| `packages/config/src/index.ts` | 修改 | 统一导出 |
| `packages/config/package.json` | 修改 | 添加 zod, @types/node 依赖 |
| `packages/domain-settlement/src/invoice/` | 新增 | 发票计算逻辑 |
| `packages/domain-settlement/tsconfig.json` | 修改 | 配置 paths 映射 |
| `packages/domain-org/src/validation/` | 新增 | 验证规则 |
| `packages/domain-commerce/src/index.ts` | 修改 | 清理废弃代码 |
| `apps/web/src/middleware.ts` | 修改 | 添加模块访问控制 |
| `apps/web/src/components/dashboard/nav-items.ts` | 修改 | 模块化导航 |
| `apps/web/src/components/dashboard/sidebar.tsx` | 修改 | 使用静态导航 |
| `apps/web/src/lib/pdf/index.ts` | 修改 | 重新导出 |
| `apps/web/src/lib/pdf/generate-invoice-pdf.tsx` | 修改 | 简化导入 |
| `apps/web/src/app/api/invoices/[id]/pdf/route.ts` | 修改 | 更新导入路径 |
| `apps/web/src/app/api/invoices/[id]/preview/route.ts` | 修改 | 更新导入路径 |
| `apps/web/src/app/api/invoices/generate-pdf-batch/route.ts` | 修改 | 更新导入路径 |
| `apps/web/package.json` | 修改 | 添加 @enterprise/config, domain-settlement 依赖 |
| `config/default.json` | 新增 | 默认配置 |
| `config/tenants/eurhythmics.json` | 新增 | 客户配置 |

---

## 后续扩展方向

1. **继续下沉更多业务逻辑** - 将 apps/web 中的更多业务逻辑迁移到对应的 domain 包
2. **完善租户配置加载** - 实现从文件系统实际读取配置
3. **添加更多模块** - 按需扩展 ModuleId 和 MODULE_REGISTRY
4. **配置 UI 定制** - 利用 formFields 配置实现表单字段动态化

---

## 相关文档

- [MODULAR-ARCHITECTURE.md](../architecture/MODULAR-ARCHITECTURE.md) - 模块化架构设计文档
- [TECHNICAL_ARCHITECTURE.md](../architecture/TECHNICAL_ARCHITECTURE.md) - 技术架构总览
