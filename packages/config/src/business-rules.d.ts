/**
 * @enterprise/config - Business Rules
 *
 * Configurable business rules for invoice calculations,
 * pricing, and other domain-specific logic.
 */
import type { BusinessRules, InvoiceRules, PriceLevel, OrganizationInfo, BankInfo } from "./types";
/**
 * Default headquarters information
 * This is used as the sender info on invoices
 */
export declare const DEFAULT_HEADQUARTERS_INFO: OrganizationInfo;
/**
 * Default bank account information for payments
 */
export declare const DEFAULT_BANK_INFO: BankInfo;
/**
 * Clear all cached business rules (useful for testing or hot reload)
 */
export declare function clearBusinessRulesCache(): void;
/**
 * Get the current business rules.
 * Returns cached rules if available, otherwise loads from config.
 */
export declare function getBusinessRules(): BusinessRules;
/**
 * Get invoice calculation rules
 */
export declare function getInvoiceRules(): InvoiceRules;
/**
 * Get price levels configuration
 */
export declare function getPriceLevels(): PriceLevel[];
/**
 * Get organization/headquarters information
 */
export declare function getOrganizationInfo(): OrganizationInfo;
/**
 * Get bank account information
 */
export declare function getBankInfo(): BankInfo;
/**
 * Get the tax rate as a decimal (e.g., 0.1 for 10%)
 */
export declare function getTaxRate(): number;
/**
 * Get the tax rate as a percentage (e.g., 10 for 10%)
 */
export declare function getTaxRatePercent(): number;
/**
 * Calculate tax amount for a given subtotal
 */
export declare function calculateTax(subtotal: number): number;
/**
 * Get CC membership fee unit price
 */
export declare function getCCFeeUnitPrice(): number;
/**
 * Get Aigran classroom unit price
 */
export declare function getAigranUnitPrice(): number;
/**
 * Get Aigran rebate per person
 */
export declare function getAigranRebatePerPerson(): number;
/**
 * Check if branch purchases should receive rebates
 */
export declare function isBranchRebateEnabled(): boolean;
/**
 * Check if classroom purchases should receive rebates
 */
export declare function isClassroomRebateEnabled(): boolean;
/**
 * Get a price level by code
 */
export declare function getPriceLevelByCode(code: string): PriceLevel | undefined;
/**
 * Get the highest priority (lowest number) price level
 */
export declare function getHighestPriorityPriceLevel(): PriceLevel;
/**
 * Get price levels sorted by priority (ascending)
 */
export declare function getPriceLevelsSortedByPriority(): PriceLevel[];
/**
 * Override business rules with custom values.
 * This is typically called during app initialization with tenant-specific config.
 */
export declare function setBusinessRules(rules: Partial<BusinessRules>): void;
/**
 * Override organization information
 */
export declare function setOrganizationInfo(info: Partial<OrganizationInfo>): void;
/**
 * Override bank information
 */
export declare function setBankInfo(info: Partial<BankInfo>): void;
