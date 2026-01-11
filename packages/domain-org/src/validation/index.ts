/**
 * @enterprise/domain-org - Validation Module
 *
 * Exports all validation schemas for organization entities.
 */

// Account validation
export {
  accountUpsertSchema,
  accountLoginSchema,
  passwordChangeSchema,
  type AccountUpsertInput,
  type AccountLoginInput,
  type PasswordChangeInput,
} from "./accounts";

// Department validation
export {
  departmentUpsertSchema,
  departmentTypeSchema,
  departmentStatusSchema,
  type DepartmentUpsertInput,
  type DepartmentType,
  type DepartmentStatus,
} from "./departments";

// Role validation
export {
  dataScopeTypeSchema,
  priceTypeSchema,
  roleCreateSchema,
  featurePermissionSchema,
  type DataScopeType,
  type PriceType,
  type RoleCreateInput,
  type FeaturePermissionInput,
} from "./roles";
