import {
  getDataScopeContextForUser,
  getDataScopeFromRole,
  type DataScopeContext,
  type DataScopeType,
} from "@enterprise/db";

export type { DataScopeContext, DataScopeType };

/**
 * 模拟当前用户信息
 * TODO: 替换为实际的认证系统获取用户信息
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
 * 获取当前用户（模拟）
 * TODO: 替换为实际的认证逻辑
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  // 模拟用户 - 实际应从 session/cookie/token 获取
  // 这里返回一个默认的管理员用户
  return {
    id: "mock-user-id",
    accountId: "admin",
    displayName: "管理者",
    departmentId: null, // null 表示本部/全局
    departmentName: "本部",
    roleId: null, // null 表示超级管理员
    roleCode: "admin",
  };
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

  // 如果没有角色，默认为全数据权限（超级管理员）
  if (!user.roleId) {
    return {
      departmentId: user.departmentId,
      roleId: null,
      dataScopeType: "all",
      allowedDepartmentIds: [],
    };
  }

  // 从角色获取数据权限配置
  const roleScope = await getDataScopeFromRole(user.roleId);

  if (!roleScope) {
    return {
      departmentId: user.departmentId,
      roleId: user.roleId,
      dataScopeType: "all",
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
