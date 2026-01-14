/**
 * @enterprise/invoice-pdf - Configuration Management
 *
 * Handles configuration with defaults and custom overrides.
 * This module allows the package to be used standalone without
 * depending on external configuration systems.
 */

import type { InvoiceConfig, OrganizationInfo, BankInfo } from "./types";

// =============================================================================
// Default Configuration Values
// =============================================================================

/**
 * Default organization information
 */
export const DEFAULT_ORGANIZATION: OrganizationInfo = {
  name: "Your Company Name",
  postalCode: "000-0000",
  address: "Your Address Here",
  phone: "00-0000-0000",
  fax: "00-0000-0000",
  registrationNumber: "T0000000000000",
};

/**
 * Default bank information
 */
export const DEFAULT_BANK_INFO: BankInfo = {
  bankName: "Bank Name",
  branchName: "Branch Name",
  accountType: "普通",
  accountNumber: "0000000",
  accountHolder: "Account Holder Name",
};

/**
 * Default invoice configuration
 */
export const DEFAULT_CONFIG: Required<InvoiceConfig> = {
  taxRate: 0.1,
  ccFee: {
    defaultUnitPrice: 480,
    aigranUnitPrice: 480,
    aigranRebatePerPerson: 600,
  },
  material: {
    branchRebateEnabled: false,
    classroomRebateEnabled: true,
  },
  organization: DEFAULT_ORGANIZATION,
  bankInfo: DEFAULT_BANK_INFO,
  assets: {},
};

// =============================================================================
// Configuration State
// =============================================================================

let currentConfig: Required<InvoiceConfig> = { ...DEFAULT_CONFIG };

// =============================================================================
// Configuration Functions
// =============================================================================

/**
 * Configure the invoice PDF generator with custom settings.
 * This should be called once at application startup.
 *
 * @param config - Custom configuration options
 *
 * @example
 * ```typescript
 * import { configure } from '@enterprise/invoice-pdf';
 *
 * configure({
 *   taxRate: 0.1,
 *   organization: {
 *     name: "株式会社サンプル",
 *     postalCode: "100-0001",
 *     address: "東京都千代田区...",
 *     phone: "03-1234-5678",
 *   },
 *   bankInfo: {
 *     bankName: "三井住友銀行",
 *     branchName: "渋谷支店",
 *     accountType: "普通",
 *     accountNumber: "1234567",
 *     accountHolder: "カ）サンプル",
 *   },
 * });
 * ```
 */
export function configure(config: InvoiceConfig): void {
  currentConfig = deepMerge(DEFAULT_CONFIG, config) as Required<InvoiceConfig>;
}

/**
 * Get the current configuration.
 */
export function getConfig(): Required<InvoiceConfig> {
  return currentConfig;
}

/**
 * Reset configuration to defaults.
 */
export function resetConfig(): void {
  currentConfig = { ...DEFAULT_CONFIG };
}

/**
 * Get tax rate from configuration.
 */
export function getTaxRate(): number {
  return currentConfig.taxRate;
}

/**
 * Get CC fee configuration.
 */
export function getCCFeeConfig(): Required<InvoiceConfig>["ccFee"] {
  return currentConfig.ccFee;
}

/**
 * Get material configuration.
 */
export function getMaterialConfig(): Required<InvoiceConfig>["material"] {
  return currentConfig.material;
}

/**
 * Get organization information.
 */
export function getOrganization(): OrganizationInfo {
  return currentConfig.organization;
}

/**
 * Get bank information.
 */
export function getBankInfo(): BankInfo {
  return currentConfig.bankInfo;
}

/**
 * Get asset configuration.
 */
export function getAssets(): InvoiceConfig["assets"] {
  return currentConfig.assets;
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Deep merge two objects
 */
function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const result = { ...target } as T;

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = (result as Record<string, unknown>)[key];

      if (
        sourceValue !== null &&
        typeof sourceValue === "object" &&
        !Array.isArray(sourceValue) &&
        targetValue !== null &&
        typeof targetValue === "object" &&
        !Array.isArray(targetValue)
      ) {
        (result as Record<string, unknown>)[key] = deepMerge(
          targetValue as Record<string, unknown>,
          sourceValue as Record<string, unknown>
        );
      } else if (sourceValue !== undefined) {
        (result as Record<string, unknown>)[key] = sourceValue;
      }
    }
  }

  return result;
}
