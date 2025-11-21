export const dbReady = true;
export type Id = string;
export { getSupabaseAdmin } from "./client";
export {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  adjustStock,
} from "./products";
export { listRoles, createRole } from "./roles";
export type { RoleRecord, CreateRoleInput, ListRolesParams } from "./roles";
export { listDepartments } from "./departments";
export type { DepartmentWithParent, ListDepartmentsParams } from "./departments";
export { listAdminAccounts, createAdminAccount, updateAdminAccount } from "./accounts";
export type {
  AdminAccount,
  ListAdminAccountsParams,
  CreateAdminAccountInput,
  UpdateAdminAccountInput,
} from "./accounts";
