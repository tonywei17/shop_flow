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
export { listRoles, createRole, updateRole, deleteRole } from "./roles";
export type { RoleRecord, CreateRoleInput, UpdateRoleInput, ListRolesParams } from "./roles";
export { listDepartments, deleteDepartment } from "./departments";
export type { DepartmentWithParent, ListDepartmentsParams } from "./departments";
export { listAdminAccounts, createAdminAccount, updateAdminAccount, deleteAdminAccount } from "./accounts";
export type {
  AdminAccount,
  ListAdminAccountsParams,
  CreateAdminAccountInput,
  UpdateAdminAccountInput,
} from "./accounts";
export {
  listAccountItems,
  createAccountItem,
  updateAccountItem,
  deleteAccountItem,
} from "./account-items";
export type {
  AccountItem,
  ListAccountItemsParams,
  UpsertAccountItemInput,
} from "./account-items";
export {
  listProductCategories,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
} from "./product-categories";
export type {
  ProductCategory,
  ListProductCategoriesParams,
  UpsertProductCategoryInput,
} from "./product-categories";
export {
  listCounterparties,
  createCounterparty,
  updateCounterparty,
  deleteCounterparty,
} from "./counterparties";
export type {
  Counterparty,
  ListCounterpartiesParams,
  UpsertCounterpartyInput,
} from "./counterparties";
