/**
 * @enterprise/invoice-pdf - Configuration Management
 *
 * Handles configuration with defaults and custom overrides.
 * This module allows the package to be used standalone without
 * depending on external configuration systems.
 */

import type { InvoiceConfig, OrganizationInfo, BankInfo } from "./types";

// =============================================================================
// Preset Configuration for リトミック研究センター
// =============================================================================

/**
 * Organization information for リトミック研究センター
 */
export const RHYTHMIC_ORGANIZATION: OrganizationInfo = {
  name: "特定非営利活動法人\nリトミック研究センター",
  postalCode: "〒151-0051",
  address: "東京都渋谷区千駄ヶ谷1丁目30番8号\nダヴィンチ千駄ヶ谷1階5号室",
  phone: "03-5411-3815",
  fax: "03-5411-3816",
  registrationNumber: "T6011005001316",
};

/**
 * Bank information for リトミック研究センター
 */
export const RHYTHMIC_BANK_INFO: BankInfo = {
  bankName: "三井住友銀行",
  branchName: "渋谷駅前支店",
  accountType: "普通",
  accountNumber: "0380624",
  accountHolder: "特定非営利活動法人リトミック研究センター",
};

// =============================================================================
// Default Configuration Values (Generic placeholders)
// =============================================================================

/**
 * Default organization information (placeholder)
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
 * Default bank information (placeholder)
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

/**
 * Preset configuration for リトミック研究センター
 * Use this as a starting point for the same company
 */
export const RHYTHMIC_CONFIG: InvoiceConfig = {
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
  organization: RHYTHMIC_ORGANIZATION,
  bankInfo: RHYTHMIC_BANK_INFO,
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
 * import { configure, RHYTHMIC_CONFIG, loadAssetsFromDirectory } from '@enterprise/invoice-pdf';
 *
 * // For リトミック研究センター (same company)
 * configure({
 *   ...RHYTHMIC_CONFIG,
 *   assets: loadAssetsFromDirectory('./assets'),
 * });
 * ```
 */
export function configure(config: InvoiceConfig): void {
  currentConfig = deepMerge(DEFAULT_CONFIG, config) as Required<InvoiceConfig>;
}

/**
 * Quick setup for リトミック研究センター
 * Loads preset configuration and assets from the specified directory.
 *
 * @param assetsDir - Directory containing logo.jpg and seal.jpg
 *
 * @example
 * ```typescript
 * import { configureRhythmic } from '@enterprise/invoice-pdf';
 *
 * // One-line setup for リトミック研究センター
 * configureRhythmic('./assets');
 * ```
 */
export function configureRhythmic(assetsDir?: string): void {
  const assets = assetsDir ? loadAssetsFromDirectory(assetsDir) : {};
  configure({
    ...RHYTHMIC_CONFIG,
    assets,
  });
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
// Asset Loading Utilities
// =============================================================================

/**
 * Load image file as Base64 data URL.
 *
 * @param filePath - Path to image file
 * @returns Base64 data URL or empty string if file not found
 */
export function loadImageAsBase64(filePath: string): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require("fs");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require("path");

    if (!fs.existsSync(filePath)) {
      return "";
    }

    const imageBuffer = fs.readFileSync(filePath);
    const base64 = imageBuffer.toString("base64");
    const ext = path.extname(filePath).toLowerCase().slice(1);
    const mimeType = ext === "png" ? "image/png" : "image/jpeg";
    return `data:${mimeType};base64,${base64}`;
  } catch {
    return "";
  }
}

/**
 * Load assets from a directory.
 * Expects logo.jpg and seal.jpg in the directory.
 *
 * @param directory - Directory containing asset files
 * @returns Asset configuration object
 *
 * @example
 * ```typescript
 * const assets = loadAssetsFromDirectory('./assets');
 * // Returns { logo: 'data:image/jpeg;base64,...', seal: 'data:image/jpeg;base64,...' }
 * ```
 */
export function loadAssetsFromDirectory(directory: string): NonNullable<InvoiceConfig["assets"]> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const path = require("path");

  return {
    logo: loadImageAsBase64(path.join(directory, "logo.jpg")),
    seal: loadImageAsBase64(path.join(directory, "seal.jpg")),
  };
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
