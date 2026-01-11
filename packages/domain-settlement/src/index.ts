/**
 * @enterprise/domain-settlement
 *
 * Settlement domain package for invoice generation, billing, and payment processing.
 */

// Ready flag for package initialization checks
export const settlementReady = true;

// Type aliases
export type SettlementId = string;

// Invoice module
export * from "./invoice";

// Expense module
export * from "./expense";
