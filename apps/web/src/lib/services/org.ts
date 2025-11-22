import {
  listAdminAccounts,
  createAdminAccount,
  updateAdminAccount,
  listDepartments,
  listRoles,
  createRole,
  type AdminAccount,
  type DepartmentWithParent,
  type RoleRecord,
  type ListAdminAccountsParams,
  type ListDepartmentsParams,
  type ListRolesParams,
  type CreateAdminAccountInput,
  type UpdateAdminAccountInput,
  type CreateRoleInput,
} from "@enterprise/db";

export async function getAdminAccounts(
  params: ListAdminAccountsParams = {},
): Promise<{ accounts: AdminAccount[]; count: number }> {
  return listAdminAccounts(params);
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
