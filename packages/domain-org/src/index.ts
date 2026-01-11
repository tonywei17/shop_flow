/**
 * @enterprise/domain-org
 *
 * Organization domain package for accounts, departments, roles, and permissions.
 */

// Ready flag for package initialization checks
export const orgReady = true;

// Type aliases
export type OrgUnitId = string;

// Validation module
export * from "./validation";
