import { cookies } from "next/headers";
import {
  getDataScopeContextForUser,
  getDataScopeFromRole,
  getSupabaseAdmin,
  type DataScopeContext,
  type DataScopeType,
} from "@enterprise/db";

export type { DataScopeContext, DataScopeType };

/**
 * 当前用户信息
 */
export type CurrentUser = {
  id: string;
  accountId: string;
  displayName: string;
  departmentId: string | null;
  departmentName: string | null;
  roleId: string | null;
  roleCode: string | null;
};

/**
 * 获取当前用户
 * 从 cookie 中获取 admin_account_id，然后查询数据库获取完整信息
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const cookieStore = await cookies();
    const adminAccountId = cookieStore.get("admin_account_id")?.value;

    if (!adminAccountId) {
      return null;
    }

    // Check if this is the env super admin
    const envAdminId = process.env.ADMIN_LOGIN_ID;
    if (envAdminId && adminAccountId === envAdminId) {
      return {
        id: envAdminId,
        accountId: "admin",
        displayName: "システム管理者",
        departmentId: null,
        departmentName: "リトミック本部",
        roleId: null,
        roleCode: "super_admin",
      };
    }

    const sb = getSupabaseAdmin();
    const { data: account, error } = await sb
      .from("admin_accounts")
      .select("id, account_id, display_name, department_id, department_name, role_code, role_id")
      .eq("id", adminAccountId)
      .limit(1)
      .maybeSingle();

    if (error || !account) {
      console.error("[getCurrentUser] Failed to fetch account:", error);
      return null;
    }

    return {
      id: account.id as string,
      accountId: account.account_id as string,
      displayName: account.display_name as string,
      departmentId: account.department_id as string | null,
      departmentName: account.department_name as string | null,
      roleId: account.role_id as string | null,
      roleCode: account.role_code as string | null,
    };
  } catch (error) {
    console.error("[getCurrentUser] Error:", error);
    return null;
  }
}

/**
 * 获取当前用户的数据权限上下文
 */
export async function getCurrentUserDataScopeContext(): Promise<DataScopeContext> {
  const user = await getCurrentUser();

  // 如果没有用户，返回无权限
  if (!user) {
    return {
      departmentId: null,
      roleId: null,
      dataScopeType: "self_only", // 无用户时限制为最小权限
      allowedDepartmentIds: [],
    };
  }

  // SECURITY: If user has no role, restrict to self_only access by default
  // Only the env super admin (checked above) should have "all" access without a role
  if (!user.roleId) {
    // Check if this is a special case (super admin via role_code)
    if (user.roleCode === "super_admin" || user.roleCode === "admin") {
      return {
        departmentId: user.departmentId,
        roleId: null,
        dataScopeType: "all",
        allowedDepartmentIds: [],
      };
    }

    // Default to minimum permissions for users without roles
    console.warn(`[SECURITY] User ${user.accountId} has no role. Restricting to self_only access.`);
    return {
      departmentId: user.departmentId,
      roleId: null,
      dataScopeType: "self_only",
      allowedDepartmentIds: [],
    };
  }

  // 从角色获取数据权限配置
  const roleScope = await getDataScopeFromRole(user.roleId);

  if (!roleScope) {
    // SECURITY: If role exists but has no scope config, restrict to self_only
    console.warn(`[SECURITY] Role ${user.roleId} has no data scope configuration. Restricting to self_only access.`);
    return {
      departmentId: user.departmentId,
      roleId: user.roleId,
      dataScopeType: "self_only",
      allowedDepartmentIds: [],
    };
  }

  return {
    departmentId: user.departmentId,
    roleId: user.roleId,
    dataScopeType: roleScope.dataScopeType,
    allowedDepartmentIds: roleScope.allowedDepartmentIds,
  };
}

/**
 * 创建数据权限上下文（用于测试或手动指定）
 */
export function createDataScopeContext(params: {
  departmentId: string | null;
  roleId: string | null;
  dataScopeType: DataScopeType;
  allowedDepartmentIds?: string[];
}): DataScopeContext {
  return {
    departmentId: params.departmentId,
    roleId: params.roleId,
    dataScopeType: params.dataScopeType,
    allowedDepartmentIds: params.allowedDepartmentIds ?? [],
  };
}

/**
 * 检查是否需要应用数据权限过滤
 */
export function shouldApplyDataScopeFilter(context: DataScopeContext): boolean {
  return context.dataScopeType !== "all";
}
