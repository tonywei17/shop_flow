/**
 * @enterprise/domain-settlement - Expense Types
 *
 * Type definitions for expense import and management.
 */

// =============================================================================
// Expense Data Types
// =============================================================================

/**
 * Expense row from import file
 */
export interface ExpenseRow {
  store_code: string;
  store_name: string;
  expense_date: string;
  account_item_code: string;
  description: string;
  expense_type: string;
  amount: number;
  reviewer_account_id?: string;
}

/**
 * Expense record for database insertion
 */
export interface ExpenseRecord {
  store_code: string;
  store_name: string;
  expense_date: string;
  account_item_code: string;
  description: string;
  expense_type: string;
  amount: number;
  import_source: "csv" | "xlsx";
  import_batch_id: string;
  invoice_month: string;
  review_status: "pending" | "approved" | "rejected";
  reviewer_account_id: string | null;
}

/**
 * Import batch result
 */
export interface ExpenseImportResult {
  success: boolean;
  batch_id: string;
  total: number;
  successCount: number;
  failed: number;
  errors: string[];
}

/**
 * Import options
 */
export interface ExpenseImportOptions {
  /** Auto-approve imported expenses */
  autoApprove?: boolean;
  /** Chunk size for batch inserts */
  chunkSize?: number;
}
