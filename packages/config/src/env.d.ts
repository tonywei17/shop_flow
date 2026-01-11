/**
 * @enterprise/config - Environment Variable Utilities
 *
 * Functions for reading and parsing environment variables,
 * including module enablement configuration.
 */
import { type ModuleId } from "./types";
/**
 * Get an environment variable value with optional fallback
 */
export declare function getEnv(key: string, fallback?: string): string;
/**
 * Get an environment variable as a boolean
 */
export declare function getEnvBoolean(key: string, fallback?: boolean): boolean;
/**
 * Get an environment variable as a number
 */
export declare function getEnvNumber(key: string, fallback: number): number;
/**
 * Get an environment variable as an array (comma-separated)
 */
export declare function getEnvArray(key: string, fallback?: string[]): string[];
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
export declare function getEnabledModules(): ModuleId[];
/**
 * Check if a specific module is enabled
 */
export declare function isModuleEnabled(moduleId: ModuleId): boolean;
/**
 * Get disabled modules (complement of enabled modules)
 */
export declare function getDisabledModules(): ModuleId[];
/**
 * Get the current tenant ID from environment variable.
 *
 * Environment variable: TENANT_ID
 * Default: "default"
 */
export declare function getTenantId(): string;
/**
 * Get the tenant configuration path from environment variable.
 *
 * Environment variable: TENANT_CONFIG_PATH
 * Default: "./config/tenants"
 */
export declare function getTenantConfigPath(): string;
/**
 * Check if running in development mode
 */
export declare function isDevelopment(): boolean;
/**
 * Check if running in production mode
 */
export declare function isProduction(): boolean;
/**
 * Check if running in test mode
 */
export declare function isTest(): boolean;
/**
 * Get the application base URL
 */
export declare function getBaseUrl(): string;
