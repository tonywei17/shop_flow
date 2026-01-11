/**
 * @enterprise/config - Module Registry
 *
 * Defines all available modules and their configurations.
 * This is the central registry for the modular architecture.
 */
import type { ModuleId, ModuleDefinition, MenuSection } from "./types";
/**
 * Complete module definitions registry
 */
export declare const MODULE_REGISTRY: Record<ModuleId, ModuleDefinition>;
/**
 * Get the module definition for a given module ID
 */
export declare function getModuleDefinition(moduleId: ModuleId): ModuleDefinition | undefined;
/**
 * Get all module definitions
 */
export declare function getAllModuleDefinitions(): ModuleDefinition[];
/**
 * Get module definitions for enabled modules only
 */
export declare function getEnabledModuleDefinitions(): ModuleDefinition[];
/**
 * Get navigation sections for enabled modules
 */
export declare function getEnabledNavSections(): MenuSection[];
/**
 * Check if a route path belongs to an enabled module
 */
export declare function isRouteEnabled(pathname: string): boolean;
/**
 * Check if an API route belongs to an enabled module
 */
export declare function isApiRouteEnabled(pathname: string): boolean;
/**
 * Get the module that owns a specific route
 */
export declare function getModuleForRoute(pathname: string): ModuleId | null;
/**
 * Check if all dependencies for a module are satisfied (enabled)
 */
export declare function areModuleDependenciesSatisfied(moduleId: ModuleId): boolean;
/**
 * Get unsatisfied dependencies for a module
 */
export declare function getUnsatisfiedDependencies(moduleId: ModuleId): ModuleId[];
