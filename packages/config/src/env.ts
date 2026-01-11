/**
 * @enterprise/config - Environment Variable Utilities
 *
 * Functions for reading and parsing environment variables,
 * including module enablement configuration.
 */

import { type ModuleId, ALL_MODULE_IDS, isValidModuleId } from "./types";

/**
 * Get an environment variable value with optional fallback
 */
export function getEnv(key: string, fallback?: string): string {
  return process.env[key] ?? fallback ?? "";
}

/**
 * Get an environment variable as a boolean
 */
export function getEnvBoolean(key: string, fallback: boolean = false): boolean {
  const value = process.env[key];
  if (value === undefined) return fallback;
  return value.toLowerCase() === "true" || value === "1";
}

/**
 * Get an environment variable as a number
 */
export function getEnvNumber(key: string, fallback: number): number {
  const value = process.env[key];
  if (value === undefined) return fallback;
  const parsed = Number(value);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Get an environment variable as an array (comma-separated)
 */
export function getEnvArray(key: string, fallback: string[] = []): string[] {
  const value = process.env[key];
  if (!value) return fallback;
  return value
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean);
}

// =============================================================================
// Module Configuration
// =============================================================================

/**
 * Get the list of enabled modules from environment variable.
 *
 * Environment variable: ENABLED_MODULES
 * Format: comma-separated module IDs (e.g., "billing,commerce,system")
 *
 * If not set, all modules are enabled by default.
 *
 * @example
 * // ENABLED_MODULES=billing,system
 * getEnabledModules() // => ['billing', 'system']
 *
 * // ENABLED_MODULES not set
 * getEnabledModules() // => ['billing', 'commerce', 'learning', 'system']
 */
export function getEnabledModules(): ModuleId[] {
  const envValue = process.env.ENABLED_MODULES;

  // If not set, enable all modules by default
  if (!envValue) {
    return [...ALL_MODULE_IDS];
  }

  // Parse and validate module IDs
  const moduleIds = envValue
    .split(",")
    .map((s: string) => s.trim().toLowerCase())
    .filter(isValidModuleId);

  // If parsing resulted in empty array, fall back to all modules
  if (moduleIds.length === 0) {
    console.warn(
      `[config] Invalid ENABLED_MODULES value: "${envValue}". Enabling all modules.`
    );
    return [...ALL_MODULE_IDS];
  }

  return moduleIds;
}

/**
 * Check if a specific module is enabled
 */
export function isModuleEnabled(moduleId: ModuleId): boolean {
  return getEnabledModules().includes(moduleId);
}

/**
 * Get disabled modules (complement of enabled modules)
 */
export function getDisabledModules(): ModuleId[] {
  const enabled = getEnabledModules();
  return ALL_MODULE_IDS.filter((id) => !enabled.includes(id));
}

// =============================================================================
// Tenant Configuration
// =============================================================================

/**
 * Get the current tenant ID from environment variable.
 *
 * Environment variable: TENANT_ID
 * Default: "default"
 */
export function getTenantId(): string {
  return getEnv("TENANT_ID", "default");
}

/**
 * Get the tenant configuration path from environment variable.
 *
 * Environment variable: TENANT_CONFIG_PATH
 * Default: "./config/tenants"
 */
export function getTenantConfigPath(): string {
  return getEnv("TENANT_CONFIG_PATH", "./config/tenants");
}

// =============================================================================
// Application Environment
// =============================================================================

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Check if running in test mode
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === "test";
}

/**
 * Get the application base URL
 */
export function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return getEnv("NEXT_PUBLIC_BASE_URL", "http://localhost:3000");
}
