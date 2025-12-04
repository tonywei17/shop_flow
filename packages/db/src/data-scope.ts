import { getSupabaseAdmin } from "./client";
import type { DataScopeType } from "./roles";

/**
 * 用户数据权限上下文
 */
export type DataScopeContext = {
  /** 用户所属部署ID */
  departmentId: string | null;
  /** 用户角色ID */
  roleId: string | null;
  /** 数据范围类型 */
  dataScopeType: DataScopeType;
  /** 自定义模式下的部署ID列表 */
  allowedDepartmentIds?: string[];
};

/**
 * 获取用户可访问的部署ID列表
 * 调用数据库函数 get_user_accessible_departments
 */
export async function getAccessibleDepartmentIds(
  context: DataScopeContext
): Promise<string[]> {
  // 如果是全数据权限，返回空数组表示不需要过滤
  if (context.dataScopeType === "all") {
    return [];
  }

  // 如果是自定义模式，直接返回配置的部署列表
  if (context.dataScopeType === "custom") {
    return context.allowedDepartmentIds ?? [];
  }

  // 如果没有部署ID或角色ID，返回空数组（无权限）
  if (!context.departmentId || !context.roleId) {
    return [];
  }

  const sb = getSupabaseAdmin();

  // 调用数据库函数获取可访问的部署列表
  const { data, error } = await sb.rpc("get_user_accessible_departments", {
    user_dept_id: context.departmentId,
    user_role_id: context.roleId,
  });

  if (error) {
    console.error("[getAccessibleDepartmentIds] Error:", error);
    throw error;
  }

  // 提取部署ID列表
  const departmentIds = (data as { department_id: string }[] | null)?.map(
    (d) => d.department_id
  ) ?? [];

  return departmentIds;
}

/**
 * 检查用户是否有权限访问指定部署
 */
export async function canAccessDepartment(
  context: DataScopeContext,
  targetDepartmentId: string
): Promise<boolean> {
  // 全数据权限可以访问任何部署
  if (context.dataScopeType === "all") {
    return true;
  }

  const accessibleIds = await getAccessibleDepartmentIds(context);
  return accessibleIds.includes(targetDepartmentId);
}

/**
 * 从角色获取数据权限上下文
 */
export async function getDataScopeFromRole(
  roleId: string
): Promise<{
  dataScopeType: DataScopeType;
  allowedDepartmentIds: string[];
} | null> {
  const sb = getSupabaseAdmin();

  const { data, error } = await sb
    .from("roles")
    .select("data_scope_type, allowed_department_ids")
    .eq("id", roleId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    dataScopeType: (data.data_scope_type as DataScopeType) ?? "all",
    allowedDepartmentIds: (data.allowed_department_ids as string[]) ?? [],
  };
}

/**
 * 从用户账户获取完整的数据权限上下文
 */
export async function getDataScopeContextForUser(
  userId: string
): Promise<DataScopeContext | null> {
  const sb = getSupabaseAdmin();

  // 获取用户的部署和角色信息
  const { data: account, error: accountError } = await sb
    .from("admin_accounts")
    .select("department_id, role_id")
    .eq("id", userId)
    .single();

  if (accountError || !account) {
    return null;
  }

  const departmentId = account.department_id as string | null;
  const roleId = account.role_id as string | null;

  // 如果没有角色，默认为全数据权限
  if (!roleId) {
    return {
      departmentId,
      roleId: null,
      dataScopeType: "all",
      allowedDepartmentIds: [],
    };
  }

  // 获取角色的数据权限配置
  const roleScope = await getDataScopeFromRole(roleId);

  if (!roleScope) {
    return {
      departmentId,
      roleId,
      dataScopeType: "all",
      allowedDepartmentIds: [],
    };
  }

  return {
    departmentId,
    roleId,
    dataScopeType: roleScope.dataScopeType,
    allowedDepartmentIds: roleScope.allowedDepartmentIds,
  };
}

/**
 * 应用数据权限过滤到 Supabase 查询
 * 返回需要过滤的部署ID列表，如果为空则不需要过滤
 */
export async function applyDataScopeFilter(
  context: DataScopeContext
): Promise<{
  shouldFilter: boolean;
  departmentIds: string[];
}> {
  // 全数据权限不需要过滤
  if (context.dataScopeType === "all") {
    return { shouldFilter: false, departmentIds: [] };
  }

  const departmentIds = await getAccessibleDepartmentIds(context);

  // 如果没有可访问的部署，返回一个不可能匹配的值以确保查询返回空结果
  if (departmentIds.length === 0) {
    return { shouldFilter: true, departmentIds: ["00000000-0000-0000-0000-000000000000"] };
  }

  return { shouldFilter: true, departmentIds };
}
