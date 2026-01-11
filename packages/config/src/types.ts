/**
 * @enterprise/config - Type Definitions
 *
 * Core types for the modular configuration system.
 * These types define the structure of tenant configurations,
 * module definitions, and business rules.
 */

// =============================================================================
// Module System Types
// =============================================================================

/**
 * Available module identifiers.
 * Each module represents a distinct functional area that can be enabled/disabled.
 */
export type ModuleId = "billing" | "commerce" | "learning" | "system";

/**
 * All available module IDs as an array (for validation)
 */
export const ALL_MODULE_IDS: ModuleId[] = [
  "billing",
  "commerce",
  "learning",
  "system",
];

/**
 * Check if a string is a valid ModuleId
 */
export function isValidModuleId(id: string): id is ModuleId {
  return ALL_MODULE_IDS.includes(id as ModuleId);
}

// =============================================================================
// Navigation & Menu Types
// =============================================================================

/**
 * Navigation menu item
 */
export interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: string; // Icon name from lucide-react
  badge?: string;
  requiredModule?: ModuleId;
}

/**
 * Navigation section containing multiple menu items
 */
export interface MenuSection {
  id: string;
  label: string;
  items: MenuItem[];
  requiredModule?: ModuleId;
}

// =============================================================================
// Module Definition Types
// =============================================================================

/**
 * Complete definition of a module including its routes and navigation
 */
export interface ModuleDefinition {
  id: ModuleId;
  name: string;
  description: string;
  navSections: MenuSection[];
  routes: string[]; // URL path prefixes (e.g., '/billing', '/commerce')
  apiRoutes: string[]; // API route prefixes (e.g., '/api/invoices')
  dependencies?: ModuleId[]; // Other modules this module depends on
}

// =============================================================================
// Business Rules Types
// =============================================================================

/**
 * Price level definition for multi-tier pricing
 */
export interface PriceLevel {
  id: string;
  code: string;
  label: string;
  description?: string;
  priority: number; // Lower number = higher priority
}

/**
 * Default price levels
 */
export const DEFAULT_PRICE_LEVELS: PriceLevel[] = [
  {
    id: "headquarters",
    code: "headquarters",
    label: "本部価格",
    priority: 1,
  },
  { id: "branch", code: "branch", label: "支局価格", priority: 2 },
  { id: "classroom", code: "classroom", label: "教室価格", priority: 3 },
  { id: "general", code: "general", label: "一般価格", priority: 4 },
];

/**
 * CC (Child Club) membership fee rules
 */
export interface CCFeeRules {
  defaultUnitPrice: number; // Default unit price per person (e.g., 480)
  aigranUnitPrice: number; // Unit price for Aigran classrooms (e.g., 480)
  aigranRebatePerPerson: number; // Rebate per person for Aigran (e.g., 600)
}

/**
 * Material (teaching materials) sales rules
 */
export interface MaterialRules {
  branchRebateEnabled: boolean; // Whether branch purchases get rebates
  classroomRebateEnabled: boolean; // Whether classroom purchases get rebates
}

/**
 * Invoice calculation rules
 */
export interface InvoiceRules {
  ccFee: CCFeeRules;
  material: MaterialRules;
  taxRate: number; // Tax rate as decimal (e.g., 0.1 for 10%)
}

/**
 * Default invoice rules
 */
export const DEFAULT_INVOICE_RULES: InvoiceRules = {
  ccFee: {
    defaultUnitPrice: 480,
    aigranUnitPrice: 480,
    aigranRebatePerPerson: 600,
  },
  material: {
    branchRebateEnabled: false,
    classroomRebateEnabled: true,
  },
  taxRate: 0.1,
};

/**
 * All business rules combined
 */
export interface BusinessRules {
  priceLevels: PriceLevel[];
  invoiceRules: InvoiceRules;
}

/**
 * Default business rules
 */
export const DEFAULT_BUSINESS_RULES: BusinessRules = {
  priceLevels: DEFAULT_PRICE_LEVELS,
  invoiceRules: DEFAULT_INVOICE_RULES,
};

// =============================================================================
// UI Configuration Types
// =============================================================================

/**
 * Badge color configuration
 */
export interface BadgeColor {
  value: string;
  label: string;
  className: string;
}

/**
 * Status badge configuration
 */
export interface StatusBadge {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  className?: string;
}

/**
 * Data scope option for role management
 */
export interface DataScopeOption {
  value: string;
  label: string;
  description?: string;
}

/**
 * UI constants configuration
 */
export interface UIConstants {
  priceTypes: Array<{ value: string; label: string }>;
  badgeColors: BadgeColor[];
  dataScopeOptions: DataScopeOption[];
  statusBadges: Record<string, StatusBadge>;
}

/**
 * UI configuration including theme and constants
 */
export interface UIConfig {
  logo?: string;
  logoAlt?: string;
  primaryColor?: string;
  accentColor?: string;
  menuStructure?: MenuSection[];
  constants?: Partial<UIConstants>;
}

// =============================================================================
// Form Field Configuration Types
// =============================================================================

/**
 * Field types supported in dynamic forms
 */
export type FieldType =
  | "text"
  | "number"
  | "email"
  | "tel"
  | "password"
  | "textarea"
  | "select"
  | "multiselect"
  | "date"
  | "datetime"
  | "boolean"
  | "checkbox"
  | "radio";

/**
 * Select option for dropdown fields
 */
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * Validation rules for a field
 */
export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  patternMessage?: string;
}

/**
 * Configuration for a single form field
 */
export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  helpText?: string;
  defaultValue?: unknown;
  options?: SelectOption[]; // For select/radio/checkbox fields
  validation?: FieldValidation;
  hidden?: boolean;
  disabled?: boolean;
  dependsOn?: {
    // Conditional visibility
    field: string;
    value: unknown;
  };
  group?: string; // For grouping fields in the UI
  order?: number; // Display order
}

/**
 * Form configuration for an entity type
 */
export interface EntityFormConfig {
  entity: string; // e.g., 'account', 'department', 'product'
  title?: string;
  description?: string;
  fields: FieldConfig[];
  fieldGroups?: Array<{
    id: string;
    label: string;
    collapsed?: boolean;
  }>;
}

// =============================================================================
// Organization Info Types
// =============================================================================

/**
 * Organization/company information
 */
export interface OrganizationInfo {
  name: string;
  postalCode: string;
  address: string;
  phone: string;
  fax?: string;
  email?: string;
  registrationNumber?: string; // Tax registration number
  website?: string;
}

/**
 * Bank account information
 */
export interface BankInfo {
  bankName: string;
  branchName: string;
  accountType: string;
  accountNumber: string;
  accountHolder: string;
}

// =============================================================================
// Tenant Configuration Type
// =============================================================================

/**
 * Complete tenant/customer configuration
 * This is the main configuration object that defines all customizable aspects
 */
export interface TenantConfig {
  // Identity
  id: string;
  name: string;
  description?: string;

  // Module enablement
  modules: ModuleId[];

  // Organization information
  organization: OrganizationInfo;
  bankInfo?: BankInfo;

  // UI customization
  ui: UIConfig;

  // Business rules
  businessRules: BusinessRules;

  // Form field customization
  formFields?: Record<string, EntityFormConfig>;

  // Feature flags (for fine-grained control)
  features?: Record<string, boolean>;

  // Custom metadata
  metadata?: Record<string, unknown>;
}

/**
 * Partial tenant config for overrides
 */
export type TenantConfigOverrides = Partial<TenantConfig>;
