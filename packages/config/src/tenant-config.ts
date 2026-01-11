/**
 * @enterprise/config - Tenant Configuration Loader
 *
 * Handles loading and merging tenant-specific configurations.
 * Supports configuration files and environment variable overrides.
 */

import type { TenantConfig, TenantConfigOverrides, BusinessRules } from "./types";
import { ALL_MODULE_IDS } from "./types";
import { getTenantId, getTenantConfigPath } from "./env";
import { DEFAULT_BUSINESS_RULES } from "./types";
import { DEFAULT_HEADQUARTERS_INFO, DEFAULT_BANK_INFO } from "./business-rules";
import { DEFAULT_UI_CONSTANTS } from "./ui-constants";

// =============================================================================
// Default Configuration
// =============================================================================

/**
 * Default tenant configuration
 * Used as the base when no tenant-specific config is provided
 */
export const DEFAULT_TENANT_CONFIG: TenantConfig = {
  id: "default",
  name: "Default Tenant",
  description: "Default configuration for Shop Flow",

  modules: [...ALL_MODULE_IDS],

  organization: DEFAULT_HEADQUARTERS_INFO,
  bankInfo: DEFAULT_BANK_INFO,

  ui: {
    constants: DEFAULT_UI_CONSTANTS,
  },

  businessRules: DEFAULT_BUSINESS_RULES,

  features: {},
  metadata: {},
};

// =============================================================================
// Configuration Cache
// =============================================================================

let cachedTenantConfig: TenantConfig | null = null;

/**
 * Clear the tenant configuration cache
 */
export function clearTenantConfigCache(): void {
  cachedTenantConfig = null;
}

// =============================================================================
// Deep Merge Utility
// =============================================================================

/**
 * Deep merge two objects
 */
function deepMerge<T>(target: T, source: Partial<T>): T {
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
        // Recursively merge objects
        (result as Record<string, unknown>)[key] = deepMerge(
          targetValue as Record<string, unknown>,
          sourceValue as Record<string, unknown>
        );
      } else if (sourceValue !== undefined) {
        // Override with source value
        (result as Record<string, unknown>)[key] = sourceValue;
      }
    }
  }

  return result;
}

// =============================================================================
// Configuration Loading
// =============================================================================

/**
 * Load tenant-specific overrides from a JSON file.
 *
 * In a Node.js environment, this would read from the filesystem.
 * For now, this is a placeholder that returns null.
 *
 * @param tenantId - The tenant ID to load configuration for
 * @returns The tenant configuration overrides, or null if not found
 */
async function loadTenantOverridesFromFile(
  tenantId: string
): Promise<TenantConfigOverrides | null> {
  // This is where we would load from filesystem in a real implementation
  // For now, return null to use defaults

  // Example of what this would look like:
  // const configPath = path.join(getTenantConfigPath(), `${tenantId}.json`);
  // try {
  //   const content = await fs.readFile(configPath, 'utf-8');
  //   return JSON.parse(content);
  // } catch {
  //   return null;
  // }

  console.log(
    `[config] Loading tenant config for "${tenantId}" from ${getTenantConfigPath()}`
  );
  return null;
}

/**
 * Load the complete tenant configuration.
 * Merges default configuration with tenant-specific overrides.
 */
export async function loadTenantConfig(): Promise<TenantConfig> {
  if (cachedTenantConfig) {
    return cachedTenantConfig;
  }

  const tenantId = getTenantId();

  // Start with defaults
  let config = { ...DEFAULT_TENANT_CONFIG };

  // Load tenant-specific overrides
  const overrides = await loadTenantOverridesFromFile(tenantId);

  if (overrides) {
    config = deepMerge(config, overrides);
    config.id = tenantId; // Ensure ID matches
  } else if (tenantId !== "default") {
    console.warn(
      `[config] No configuration found for tenant "${tenantId}", using defaults`
    );
  }

  // Cache the result
  cachedTenantConfig = config;

  return config;
}

/**
 * Get the current tenant configuration synchronously.
 * Returns cached config or defaults if not yet loaded.
 *
 * NOTE: Prefer using loadTenantConfig() in async contexts.
 */
export function getTenantConfig(): TenantConfig {
  if (cachedTenantConfig) {
    return cachedTenantConfig;
  }

  // Return defaults if not yet loaded
  // This is for synchronous access scenarios
  console.warn(
    "[config] getTenantConfig called before loadTenantConfig. Using defaults."
  );
  return DEFAULT_TENANT_CONFIG;
}

/**
 * Set the tenant configuration directly.
 * Useful for testing or programmatic configuration.
 */
export function setTenantConfig(config: TenantConfig): void {
  cachedTenantConfig = config;
}

/**
 * Update the tenant configuration with partial overrides.
 */
export function updateTenantConfig(overrides: TenantConfigOverrides): void {
  const current = getTenantConfig();
  cachedTenantConfig = deepMerge(current, overrides);
}

// =============================================================================
// Configuration Getters
// =============================================================================

/**
 * Get the enabled modules for the current tenant
 */
export function getTenantModules(): TenantConfig["modules"] {
  return getTenantConfig().modules;
}

/**
 * Get the organization info for the current tenant
 */
export function getTenantOrganization(): TenantConfig["organization"] {
  return getTenantConfig().organization;
}

/**
 * Get the bank info for the current tenant
 */
export function getTenantBankInfo(): TenantConfig["bankInfo"] {
  return getTenantConfig().bankInfo;
}

/**
 * Get the UI configuration for the current tenant
 */
export function getTenantUI(): TenantConfig["ui"] {
  return getTenantConfig().ui;
}

/**
 * Get the business rules for the current tenant
 */
export function getTenantBusinessRules(): BusinessRules {
  return getTenantConfig().businessRules;
}

/**
 * Get form field configuration for an entity type
 */
export function getTenantFormFields(
  entityType: string
): import("./types").EntityFormConfig | undefined {
  const formFields = getTenantConfig().formFields;
  return formFields?.[entityType];
}

/**
 * Check if a feature is enabled for the current tenant
 */
export function isTenantFeatureEnabled(featureKey: string): boolean {
  return getTenantConfig().features?.[featureKey] ?? false;
}

/**
 * Get tenant metadata value
 */
export function getTenantMetadata<T = unknown>(key: string): T | undefined {
  return getTenantConfig().metadata?.[key] as T | undefined;
}
