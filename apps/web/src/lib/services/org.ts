import {
  listAdminAccounts,
  createAdminAccount,
  updateAdminAccount,
  deleteAdminAccount,
  listDepartments,
  deleteDepartment,
  updateDepartmentProxyBilling,
  listRoles,
  createRole,
  updateRole,
  deleteRole,
  type AdminAccount,
  type DepartmentWithParent,
  type RoleRecord,
  type ListAdminAccountsParams,
  type ListDepartmentsParams,
  type ListRolesParams,
  type CreateAdminAccountInput,
  type UpdateAdminAccountInput,
  type CreateRoleInput,
  type UpdateRoleInput,
  type DataScopeContext,
} from "@enterprise/db";
import { getCurrentUserDataScopeContext } from "@/lib/auth/data-scope-context";

export type { DataScopeContext };

export async function getAdminAccounts(
  params: ListAdminAccountsParams = {},
): Promise<{ accounts: AdminAccount[]; count: number }> {
  return listAdminAccounts(params);
}

/**
 * 获取管理员账户列表（带数据权限过滤）
 * 自动应用当前用户的数据权限
 */
export async function getAdminAccountsWithScope(
  params: Omit<ListAdminAccountsParams, "dataScopeContext"> = {},
): Promise<{ accounts: AdminAccount[]; count: number }> {
  const dataScopeContext = await getCurrentUserDataScopeContext();
  return listAdminAccounts({ ...params, dataScopeContext });
}

export async function createAdminAccountService(
  input: CreateAdminAccountInput,
): Promise<{ id: string }> {
  return createAdminAccount(input);
}

export async function updateAdminAccountService(
  id: string,
  input: UpdateAdminAccountInput,
): Promise<void> {
  return updateAdminAccount(id, input);
}

export async function getDepartments(
  params: ListDepartmentsParams = {},
): Promise<{ departments: DepartmentWithParent[]; count: number }> {
  return listDepartments(params);
}

/**
 * 获取部署列表（带数据权限过滤）
 * 自动应用当前用户的数据权限
 */
export async function getDepartmentsWithScope(
  params: Omit<ListDepartmentsParams, "dataScopeContext"> = {},
): Promise<{ departments: DepartmentWithParent[]; count: number }> {
  const dataScopeContext = await getCurrentUserDataScopeContext();
  return listDepartments({ ...params, dataScopeContext });
}

export async function getRoles(
  params: ListRolesParams = {},
): Promise<{ roles: RoleRecord[]; count: number }> {
  return listRoles(params);
}

export async function createRoleService(
  input: CreateRoleInput,
): Promise<RoleRecord> {
  return createRole(input);
}

export async function updateRoleService(
  id: string,
  input: UpdateRoleInput,
): Promise<RoleRecord> {
  return updateRole(id, input);
}

export async function deleteRoleService(id: string): Promise<void> {
  return deleteRole(id);
}

export async function deleteAdminAccountService(id: string): Promise<void> {
  return deleteAdminAccount(id);
}

export async function deleteDepartmentService(id: string): Promise<void> {
  return deleteDepartment(id);
}

export async function updateDepartmentProxyBillingService(
  id: string,
  allowProxyBilling: boolean
): Promise<void> {
  return updateDepartmentProxyBilling(id, allowProxyBilling);
}
