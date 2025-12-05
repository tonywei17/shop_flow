# 数据权限范围实现备忘录

> 创建日期: 2025-12-05
> 状态: 基础设施已完成，待业务表集成

## 概述

本文档记录了角色数据权限范围功能的设计与实现，用于指导后续业务表的开发。

## 数据权限类型

| 类型 | 枚举值 | 说明 | 适用场景 |
|------|--------|------|----------|
| 全数据 | `all` | 可访问所有部署的数据 | 本部管理员、超级管理员 |
| 所属部署+下级 | `self_and_descendants` | 可访问当前部署及其下级部署的数据 | 支局管理员 |
| 仅所属部署 | `self_only` | 只能访问当前部署的数据 | 教室管理员 |
| 自定义 | `custom` | 可访问指定部署列表的数据 | 特殊权限需求 |

## 已完成的数据库结构

### 1. roles 表字段

```sql
-- 已添加的字段
data_scope_type text NOT NULL DEFAULT 'all'
  -- 可选值: 'all', 'self_and_descendants', 'self_only', 'custom'

allowed_department_ids uuid[] DEFAULT '{}'
  -- 仅当 data_scope_type = 'custom' 时使用
```

### 2. departments 表层级结构

```sql
-- 关键字段
id uuid PRIMARY KEY
parent_id uuid REFERENCES departments(id)  -- 父部署，支持树形结构
level integer  -- 层级深度 (0=根, 1=一级, 2=二级...)
```

### 3. 已创建的数据库函数

#### get_department_descendants(dept_id uuid)
获取指定部署及其所有下级部署的ID列表。

```sql
-- 使用示例
SELECT * FROM get_department_descendants('部署UUID');
```

#### get_user_accessible_departments(user_dept_id uuid, user_role_id uuid)
根据用户的所属部署和角色，返回其可访问的部署ID列表。

```sql
-- 使用示例
SELECT * FROM get_user_accessible_departments('用户所属部署UUID', '用户角色UUID');
```

## 新建业务表时的规范

### 必须包含的字段

当创建需要按部署隔离数据的业务表时，**必须**包含以下字段：

```sql
CREATE TABLE your_business_table (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 必须：部署关联字段
  department_id uuid REFERENCES departments(id),
  
  -- 其他业务字段...
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 必须：创建索引以提升查询性能
CREATE INDEX idx_your_table_department_id ON your_business_table(department_id);
```

### 可选：启用 Row Level Security (RLS)

如果需要数据库级别的强制隔离：

```sql
-- 1. 启用 RLS
ALTER TABLE your_business_table ENABLE ROW LEVEL SECURITY;

-- 2. 创建访问策略
CREATE POLICY your_table_department_access ON your_business_table
  FOR ALL
  USING (
    department_id IN (
      SELECT get_user_accessible_departments(
        current_setting('app.user_department_id', true)::uuid,
        current_setting('app.user_role_id', true)::uuid
      )
    )
  );

-- 3. 允许 service_role 绑过 RLS（用于后台管理）
CREATE POLICY your_table_service_role ON your_business_table
  FOR ALL
  TO service_role
  USING (true);
```

## 应用层数据过滤（已实现）

### 核心模块

已创建以下模块来支持数据权限过滤：

#### 1. packages/db/src/data-scope.ts

```typescript
import { 
  getAccessibleDepartmentIds,
  canAccessDepartment,
  getDataScopeFromRole,
  getDataScopeContextForUser,
  applyDataScopeFilter,
  type DataScopeContext,
} from "@enterprise/db";
```

主要函数：
- `getAccessibleDepartmentIds(context)` - 获取用户可访问的部署ID列表
- `canAccessDepartment(context, targetDeptId)` - 检查是否有权限访问指定部署
- `applyDataScopeFilter(context)` - 返回是否需要过滤及部署ID列表

#### 2. apps/web/src/lib/auth/data-scope-context.ts

```typescript
import { 
  getCurrentUserDataScopeContext,
  createDataScopeContext,
  shouldApplyDataScopeFilter,
} from "@/lib/auth/data-scope-context";
```

### 在查询函数中使用

已更新的查询函数支持 `dataScopeContext` 参数：

```typescript
// packages/db/src/departments.ts
export type ListDepartmentsParams = {
  limit?: number;
  offset?: number;
  search?: string;
  dataScopeContext?: DataScopeContext;  // 新增
};

// packages/db/src/accounts.ts  
export type ListAdminAccountsParams = {
  limit?: number;
  offset?: number;
  search?: string;
  dataScopeContext?: DataScopeContext;  // 新增
};
```

### 服务层使用示例

```typescript
// apps/web/src/lib/services/org.ts

// 方式1：手动传入上下文
import { listDepartments, type DataScopeContext } from "@enterprise/db";

const context: DataScopeContext = {
  departmentId: "user-dept-id",
  roleId: "user-role-id", 
  dataScopeType: "self_and_descendants",
};
const { departments } = await listDepartments({ dataScopeContext: context });

// 方式2：使用自动获取上下文的函数
import { getDepartmentsWithScope } from "@/lib/services/org";

const { departments } = await getDepartmentsWithScope({ limit: 20 });
```

### API 路由使用示例

```typescript
// apps/web/src/app/api/internal/departments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDepartmentsWithScope } from "@/lib/services/org";

export async function GET(req: NextRequest) {
  // 自动应用当前用户的数据权限
  const { departments, count } = await getDepartmentsWithScope({
    limit: 20,
    offset: 0,
  });
  
  return NextResponse.json({ departments, count });
}
```

### 创建/更新时设置

创建新记录时，自动设置 `department_id`：

```typescript
export async function createBusinessRecord(input: {
  userDepartmentId: string;  // 当前用户的所属部署
  // 其他字段...
}) {
  const sb = getSupabaseAdmin();
  
  const { data, error } = await sb
    .from('your_business_table')
    .insert({
      department_id: input.userDepartmentId,  // 自动关联到用户所属部署
      // 其他字段...
    })
    .select()
    .single();
  
  return data;
}
```

## 前端集成

### 用户上下文

确保用户登录后，上下文中包含：

```typescript
type UserContext = {
  id: string;
  departmentId: string;      // 用户所属部署
  roleId: string;            // 用户角色
  dataScopeType: DataScopeType;  // 数据范围类型
  // ...
};
```

### API 请求

所有需要数据隔离的 API 请求应传递用户上下文：

```typescript
// API 路由示例
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();  // 获取当前用户
  
  const data = await listBusinessData({
    userDepartmentId: user.departmentId,
    userRoleId: user.roleId,
    // ...
  });
  
  return NextResponse.json(data);
}
```

## 需要数据隔离的业务表清单

以下业务表在创建时需要包含 `department_id` 字段：

| 表名 | 说明 | 状态 |
|------|------|------|
| `orders` | 订单 | 待创建 |
| `invoices` | 请求书 | 待创建 |
| `members` | 会员 | 待创建 |
| `trainings` | 研修 | 待创建 |
| `applications` | 申请 | 待创建 |
| `notifications` | 通知 | 待创建 |

## 测试验证

### 验证函数

```sql
-- 测试递归获取下级部署
SELECT d.name, d.type, d.level 
FROM departments d 
WHERE d.id IN (
  SELECT * FROM get_department_descendants('部署UUID')
);

-- 测试用户可访问部署
SELECT d.name, d.type 
FROM departments d 
WHERE d.id IN (
  SELECT * FROM get_user_accessible_departments('部署UUID', '角色UUID')
);
```

### 验证场景

1. **全数据权限用户**：应能看到所有部署的数据
2. **所属+下级权限用户**：只能看到自己部署及下级的数据
3. **仅所属权限用户**：只能看到自己部署的数据
4. **自定义权限用户**：只能看到指定部署列表的数据

## 相关文件

### 数据库层 (packages/db)
- `packages/db/src/data-scope.ts` - 数据权限核心逻辑
- `packages/db/src/roles.ts` - 角色类型定义
- `packages/db/src/departments.ts` - 部署查询（已集成数据权限）
- `packages/db/src/accounts.ts` - 账户查询（已集成数据权限）

### 应用层 (apps/web)
- `apps/web/src/lib/auth/data-scope-context.ts` - 用户数据权限上下文
- `apps/web/src/lib/services/org.ts` - 服务层（带数据权限的查询函数）
- `apps/web/src/lib/validation/roles.ts` - 验证 Schema

### 前端组件
- `apps/web/src/app/(dashboard)/roles/roles-client.tsx` - 角色管理页面
- `apps/web/src/components/department-multi-select.tsx` - 部署多选组件

### API 路由
- `apps/web/src/app/api/internal/roles/route.ts` - 角色 API

## 变更历史

| 日期 | 变更内容 |
|------|----------|
| 2025-12-05 | 初始版本：完成角色数据范围 UI 和数据库函数 |
| 2025-12-05 | 添加应用层数据过滤逻辑：data-scope.ts, data-scope-context.ts |
| 2025-12-05 | 更新 departments.ts 和 accounts.ts 支持 dataScopeContext 参数 |
| 2025-12-05 | 改进机能权限列表显示：按分组显示，支持"（一部）"标记 |
| 2025-12-05 | 修复 null/undefined feature_permissions 的向后兼容性处理 |
| 2025-12-05 | **权限过滤生效修复**：页面和 API 路由现在正确应用数据权限过滤 |
| 2025-12-05 | 更新 getCurrentUser 从 cookie 获取真实用户信息 |
| 2025-12-05 | 创建测试账户：test_shikyoku（支局）、test_classroom（教室）|

## 测试账户

用于验证权限系统的测试账户：

| 账户ID | 显示名 | 角色 | 数据权限 | 所属部署 |
|--------|--------|------|----------|----------|
| test_shikyoku | テスト支局管理者 | 支局 | self_and_descendants | リトミック研究センター北海道第一支局 |
| test_classroom | テスト教室管理者 | 教室 | self_only | きよ音楽教室 |

### 验证步骤

1. 设置 cookie `admin_account_id` 为测试账户的 UUID
2. 访问部署管理页面，确认只能看到权限范围内的部署
3. 访问账户管理页面，确认只能看到权限范围内的账户
