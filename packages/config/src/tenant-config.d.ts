/**
 * @enterprise/config - Tenant Configuration Loader
 *
 * Handles loading and merging tenant-specific configurations.
 * Supports configuration files and environment variable overrides.
 */
import type { TenantConfig, TenantConfigOverrides, BusinessRules } from "./types";
/**
 * Default tenant configuration
 * Used as the base when no tenant-specific config is provided
 */
export declare const DEFAULT_TENANT_CONFIG: TenantConfig;
/**
 * Clear the tenant configuration cache
 */
export declare function clearTenantConfigCache(): void;
/**
 * Load the complete tenant configuration.
 * Merges default configuration with tenant-specific overrides.
 */
export declare function loadTenantConfig(): Promise<TenantConfig>;
/**
 * Get the current tenant configuration synchronously.
 * Returns cached config or defaults if not yet loaded.
 *
 * NOTE: Prefer using loadTenantConfig() in async contexts.
 */
export declare function getTenantConfig(): TenantConfig;
/**
 * Set the tenant configuration directly.
 * Useful for testing or programmatic configuration.
 */
export declare function setTenantConfig(config: TenantConfig): void;
/**
 * Update the tenant configuration with partial overrides.
 */
export declare function updateTenantConfig(overrides: TenantConfigOverrides): void;
/**
 * Get the enabled modules for the current tenant
 */
export declare function getTenantModules(): TenantConfig["modules"];
/**
 * Get the organization info for the current tenant
 */
export declare function getTenantOrganization(): TenantConfig["organization"];
/**
 * Get the bank info for the current tenant
 */
export declare function getTenantBankInfo(): TenantConfig["bankInfo"];
/**
 * Get the UI configuration for the current tenant
 */
export declare function getTenantUI(): TenantConfig["ui"];
/**
 * Get the business rules for the current tenant
 */
export declare function getTenantBusinessRules(): BusinessRules;
/**
 * Get form field configuration for an entity type
 */
export declare function getTenantFormFields(entityType: string): import("./types").EntityFormConfig | undefined;
/**
 * Check if a feature is enabled for the current tenant
 */
export declare function isTenantFeatureEnabled(featureKey: string): boolean;
/**
 * Get tenant metadata value
 */
export declare function getTenantMetadata<T = unknown>(key: string): T | undefined;
