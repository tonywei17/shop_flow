/**
 * @enterprise/config
 *
 * Centralized configuration package for the Shop Flow modular architecture.
 * Provides environment handling, module management, business rules, and tenant configuration.
 */

// =============================================================================
// Types
// =============================================================================
export type {
  // Module types
  ModuleId,
  ModuleDefinition,
  MenuItem,
  MenuSection,
  // Business rules types
  PriceLevel,
  CCFeeRules,
  MaterialRules,
  InvoiceRules,
  BusinessRules,
  // UI types
  UIConstants,
  BadgeColor,
  StatusBadge,
  DataScopeOption,
  UIConfig,
  // Form types
  FieldType,
  SelectOption,
  FieldValidation,
  FieldConfig,
  EntityFormConfig,
  // Organization types
  OrganizationInfo,
  BankInfo,
  // Tenant types
  TenantConfig,
  TenantConfigOverrides,
} from "./types";

export {
  ALL_MODULE_IDS,
  isValidModuleId,
  DEFAULT_PRICE_LEVELS,
  DEFAULT_INVOICE_RULES,
  DEFAULT_BUSINESS_RULES,
} from "./types";

// =============================================================================
// Environment Variables
// =============================================================================
export {
  getEnv,
  getEnvBoolean,
  getEnvNumber,
  getEnvArray,
  getEnabledModules,
  isModuleEnabled,
  getDisabledModules,
  getTenantId,
  getTenantConfigPath,
  isDevelopment,
  isProduction,
  isTest,
  getBaseUrl,
} from "./env";

// =============================================================================
// Module Registry
// =============================================================================
export {
  MODULE_REGISTRY,
  getModuleDefinition,
  getAllModuleDefinitions,
  getEnabledModuleDefinitions,
  getEnabledNavSections,
  isRouteEnabled,
  isApiRouteEnabled,
  getModuleForRoute,
  areModuleDependenciesSatisfied,
  getUnsatisfiedDependencies,
} from "./modules";

// =============================================================================
// Business Rules
// =============================================================================
export {
  DEFAULT_HEADQUARTERS_INFO,
  DEFAULT_BANK_INFO,
  clearBusinessRulesCache,
  getBusinessRules,
  getInvoiceRules,
  getPriceLevels,
  getOrganizationInfo,
  getBankInfo,
  getTaxRate,
  getTaxRatePercent,
  calculateTax,
  getCCFeeUnitPrice,
  getAigranUnitPrice,
  getAigranRebatePerPerson,
  isBranchRebateEnabled,
  isClassroomRebateEnabled,
  getPriceLevelByCode,
  getHighestPriorityPriceLevel,
  getPriceLevelsSortedByPriority,
  setBusinessRules,
  setOrganizationInfo,
  setBankInfo,
} from "./business-rules";

// =============================================================================
// UI Constants
// =============================================================================
export {
  DEFAULT_PRICE_TYPES,
  DEFAULT_BADGE_COLORS,
  DEFAULT_DATA_SCOPE_OPTIONS,
  DEFAULT_STATUS_BADGES,
  DEFAULT_UI_CONSTANTS,
  clearUIConstantsCache,
  getUIConstants,
  getPriceTypes,
  getBadgeColors,
  getDataScopeOptions,
  getStatusBadges,
  getStatusBadge,
  getBadgeColorByValue,
  getBadgeClassName,
  setUIConstants,
} from "./ui-constants";

// =============================================================================
// Tenant Configuration
// =============================================================================
export {
  DEFAULT_TENANT_CONFIG,
  clearTenantConfigCache,
  loadTenantConfig,
  getTenantConfig,
  setTenantConfig,
  updateTenantConfig,
  getTenantModules,
  getTenantOrganization,
  getTenantBankInfo,
  getTenantUI,
  getTenantBusinessRules,
  getTenantFormFields,
  isTenantFeatureEnabled,
  getTenantMetadata,
} from "./tenant-config";

// =============================================================================
// Ready Flag (for package initialization checks)
// =============================================================================
export const configReady = true;
