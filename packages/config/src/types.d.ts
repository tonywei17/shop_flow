/**
 * @enterprise/config - Type Definitions
 *
 * Core types for the modular configuration system.
 * These types define the structure of tenant configurations,
 * module definitions, and business rules.
 */
/**
 * Available module identifiers.
 * Each module represents a distinct functional area that can be enabled/disabled.
 */
export type ModuleId = "billing" | "commerce" | "learning" | "system";
/**
 * All available module IDs as an array (for validation)
 */
export declare const ALL_MODULE_IDS: ModuleId[];
/**
 * Check if a string is a valid ModuleId
 */
export declare function isValidModuleId(id: string): id is ModuleId;
/**
 * Navigation menu item
 */
export interface MenuItem {
    id: string;
    label: string;
    href: string;
    icon: string;
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
/**
 * Complete definition of a module including its routes and navigation
 */
export interface ModuleDefinition {
    id: ModuleId;
    name: string;
    description: string;
    navSections: MenuSection[];
    routes: string[];
    apiRoutes: string[];
    dependencies?: ModuleId[];
}
/**
 * Price level definition for multi-tier pricing
 */
export interface PriceLevel {
    id: string;
    code: string;
    label: string;
    description?: string;
    priority: number;
}
/**
 * Default price levels
 */
export declare const DEFAULT_PRICE_LEVELS: PriceLevel[];
/**
 * CC (Child Club) membership fee rules
 */
export interface CCFeeRules {
    defaultUnitPrice: number;
    aigranUnitPrice: number;
    aigranRebatePerPerson: number;
}
/**
 * Material (teaching materials) sales rules
 */
export interface MaterialRules {
    branchRebateEnabled: boolean;
    classroomRebateEnabled: boolean;
}
/**
 * Invoice calculation rules
 */
export interface InvoiceRules {
    ccFee: CCFeeRules;
    material: MaterialRules;
    taxRate: number;
}
/**
 * Default invoice rules
 */
export declare const DEFAULT_INVOICE_RULES: InvoiceRules;
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
export declare const DEFAULT_BUSINESS_RULES: BusinessRules;
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
    priceTypes: Array<{
        value: string;
        label: string;
    }>;
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
/**
 * Field types supported in dynamic forms
 */
export type FieldType = "text" | "number" | "email" | "tel" | "password" | "textarea" | "select" | "multiselect" | "date" | "datetime" | "boolean" | "checkbox" | "radio";
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
    options?: SelectOption[];
    validation?: FieldValidation;
    hidden?: boolean;
    disabled?: boolean;
    dependsOn?: {
        field: string;
        value: unknown;
    };
    group?: string;
    order?: number;
}
/**
 * Form configuration for an entity type
 */
export interface EntityFormConfig {
    entity: string;
    title?: string;
    description?: string;
    fields: FieldConfig[];
    fieldGroups?: Array<{
        id: string;
        label: string;
        collapsed?: boolean;
    }>;
}
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
    registrationNumber?: string;
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
/**
 * Complete tenant/customer configuration
 * This is the main configuration object that defines all customizable aspects
 */
export interface TenantConfig {
    id: string;
    name: string;
    description?: string;
    modules: ModuleId[];
    organization: OrganizationInfo;
    bankInfo?: BankInfo;
    ui: UIConfig;
    businessRules: BusinessRules;
    formFields?: Record<string, EntityFormConfig>;
    features?: Record<string, boolean>;
    metadata?: Record<string, unknown>;
}
/**
 * Partial tenant config for overrides
 */
export type TenantConfigOverrides = Partial<TenantConfig>;
