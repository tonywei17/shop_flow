/**
 * @enterprise/config - Business Rules
 *
 * Configurable business rules for invoice calculations,
 * pricing, and other domain-specific logic.
 */

import type {
  BusinessRules,
  InvoiceRules,
  PriceLevel,
  OrganizationInfo,
  BankInfo,
} from "./types";
import {
  DEFAULT_BUSINESS_RULES,
  DEFAULT_INVOICE_RULES,
  DEFAULT_PRICE_LEVELS,
} from "./types";

// =============================================================================
// Default Organization Info (can be overridden by tenant config)
// =============================================================================

/**
 * Default headquarters information
 * This is used as the sender info on invoices
 */
export const DEFAULT_HEADQUARTERS_INFO: OrganizationInfo = {
  name: "特定非営利活動法人\nリトミック研究センター",
  postalCode: "〒151-0051",
  address: "東京都渋谷区千駄ヶ谷1丁目30番8号\nダヴィンチ千駄ヶ谷1階5号室",
  phone: "03-5411-3815",
  fax: "03-5411-3816",
  registrationNumber: "T6011005001316",
};

/**
 * Default bank account information for payments
 */
export const DEFAULT_BANK_INFO: BankInfo = {
  bankName: "三井住友銀行",
  branchName: "渋谷駅前支店",
  accountType: "普通",
  accountNumber: "0380624",
  accountHolder: "特定非営利活動法人リトミック研究センター",
};

// =============================================================================
// Business Rules Cache
// =============================================================================

let cachedBusinessRules: BusinessRules | null = null;
let cachedOrganizationInfo: OrganizationInfo | null = null;
let cachedBankInfo: BankInfo | null = null;

/**
 * Clear all cached business rules (useful for testing or hot reload)
 */
export function clearBusinessRulesCache(): void {
  cachedBusinessRules = null;
  cachedOrganizationInfo = null;
  cachedBankInfo = null;
}

// =============================================================================
// Business Rules Getters
// =============================================================================

/**
 * Get the current business rules.
 * Returns cached rules if available, otherwise loads from config.
 */
export function getBusinessRules(): BusinessRules {
  if (cachedBusinessRules) {
    return cachedBusinessRules;
  }

  // In the future, this will load from tenant config
  // For now, return defaults
  cachedBusinessRules = DEFAULT_BUSINESS_RULES;
  return cachedBusinessRules;
}

/**
 * Get invoice calculation rules
 */
export function getInvoiceRules(): InvoiceRules {
  return getBusinessRules().invoiceRules;
}

/**
 * Get price levels configuration
 */
export function getPriceLevels(): PriceLevel[] {
  return getBusinessRules().priceLevels;
}

/**
 * Get organization/headquarters information
 */
export function getOrganizationInfo(): OrganizationInfo {
  if (cachedOrganizationInfo) {
    return cachedOrganizationInfo;
  }

  // In the future, this will load from tenant config
  cachedOrganizationInfo = DEFAULT_HEADQUARTERS_INFO;
  return cachedOrganizationInfo;
}

/**
 * Get bank account information
 */
export function getBankInfo(): BankInfo {
  if (cachedBankInfo) {
    return cachedBankInfo;
  }

  // In the future, this will load from tenant config
  cachedBankInfo = DEFAULT_BANK_INFO;
  return cachedBankInfo;
}

// =============================================================================
// Invoice Calculation Helpers
// =============================================================================

/**
 * Get the tax rate as a decimal (e.g., 0.1 for 10%)
 */
export function getTaxRate(): number {
  return getInvoiceRules().taxRate;
}

/**
 * Get the tax rate as a percentage (e.g., 10 for 10%)
 */
export function getTaxRatePercent(): number {
  return getTaxRate() * 100;
}

/**
 * Calculate tax amount for a given subtotal
 */
export function calculateTax(subtotal: number): number {
  return Math.floor(subtotal * getTaxRate());
}

/**
 * Get CC membership fee unit price
 */
export function getCCFeeUnitPrice(): number {
  return getInvoiceRules().ccFee.defaultUnitPrice;
}

/**
 * Get Aigran classroom unit price
 */
export function getAigranUnitPrice(): number {
  return getInvoiceRules().ccFee.aigranUnitPrice;
}

/**
 * Get Aigran rebate per person
 */
export function getAigranRebatePerPerson(): number {
  return getInvoiceRules().ccFee.aigranRebatePerPerson;
}

/**
 * Check if branch purchases should receive rebates
 */
export function isBranchRebateEnabled(): boolean {
  return getInvoiceRules().material.branchRebateEnabled;
}

/**
 * Check if classroom purchases should receive rebates
 */
export function isClassroomRebateEnabled(): boolean {
  return getInvoiceRules().material.classroomRebateEnabled;
}

// =============================================================================
// Price Level Helpers
// =============================================================================

/**
 * Get a price level by code
 */
export function getPriceLevelByCode(code: string): PriceLevel | undefined {
  return getPriceLevels().find((level) => level.code === code);
}

/**
 * Get the highest priority (lowest number) price level
 */
export function getHighestPriorityPriceLevel(): PriceLevel {
  const levels = getPriceLevels();
  return levels.reduce((highest, current) =>
    current.priority < highest.priority ? current : highest
  );
}

/**
 * Get price levels sorted by priority (ascending)
 */
export function getPriceLevelsSortedByPriority(): PriceLevel[] {
  return [...getPriceLevels()].sort((a, b) => a.priority - b.priority);
}

// =============================================================================
// Business Rules Override (for tenant customization)
// =============================================================================

/**
 * Override business rules with custom values.
 * This is typically called during app initialization with tenant-specific config.
 */
export function setBusinessRules(rules: Partial<BusinessRules>): void {
  const currentRules = getBusinessRules();
  cachedBusinessRules = {
    ...currentRules,
    ...rules,
    invoiceRules: {
      ...currentRules.invoiceRules,
      ...rules.invoiceRules,
      ccFee: {
        ...currentRules.invoiceRules.ccFee,
        ...rules.invoiceRules?.ccFee,
      },
      material: {
        ...currentRules.invoiceRules.material,
        ...rules.invoiceRules?.material,
      },
    },
    priceLevels: rules.priceLevels ?? currentRules.priceLevels,
  };
}

/**
 * Override organization information
 */
export function setOrganizationInfo(info: Partial<OrganizationInfo>): void {
  const current = getOrganizationInfo();
  cachedOrganizationInfo = { ...current, ...info };
}

/**
 * Override bank information
 */
export function setBankInfo(info: Partial<BankInfo>): void {
  const current = getBankInfo();
  cachedBankInfo = { ...current, ...info };
}
