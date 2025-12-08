export const dbReady = true;
export type Id = string;
export { getSupabaseAdmin } from "./client";
export {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
} from "./products";
export type {
  Product,
  CreateProductInput,
  UpdateProductInput,
  ListProductsParams,
} from "./products";
export { listRoles, createRole, updateRole, deleteRole } from "./roles";
export type { RoleRecord, CreateRoleInput, UpdateRoleInput, ListRolesParams, DataScopeType, PriceType } from "./roles";
export { listDepartments, deleteDepartment, updateDepartmentProxyBilling, updateDepartmentCommissionRate, getBranchForClassroom } from "./departments";
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
export {
  listProductImages,
  getProductImage,
  createProductImage,
  updateProductImage,
  deleteProductImage,
  updateProductImagesOrder,
  setProductImageAsPrimary,
} from "./product-images";
export type {
  ProductImage,
  CreateProductImageInput,
  UpdateProductImageInput,
} from "./product-images";

// Data scope utilities
export {
  getAccessibleDepartmentIds,
  canAccessDepartment,
  getDataScopeFromRole,
  getDataScopeContextForUser,
  applyDataScopeFilter,
} from "./data-scope";
export type { DataScopeContext } from "./data-scope";

// Store settings
export {
  getStoreSettings,
  updateStoreSettings,
  initializeStoreSettings,
} from "./store-settings";
export type {
  StoreSettings,
  UpdateStoreSettingsInput,
  StoreStatus,
  TaxType,
  RoundingMethod,
} from "./store-settings";
