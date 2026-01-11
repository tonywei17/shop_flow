/**
 * @enterprise/domain-settlement - Expense Importer
 *
 * Core business logic for importing expenses from Excel/CSV files.
 * Extracted from apps/web to make it reusable and testable.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ExpenseRow, ExpenseRecord, ExpenseImportOptions } from "./types";

// =============================================================================
// Column Mapping
// =============================================================================

/**
 * Column name mapping from Japanese to internal field names
 */
export const EXPENSE_COLUMN_MAP: Record<string, keyof ExpenseRow> = {
  "店番": "store_code",
  "店名": "store_name",
  "費用発生日": "expense_date",
  "勘定項目": "account_item_code",
  "項目名": "description",
  "費用タイプ": "expense_type",
  "請求金額": "amount",
  "審査者アカウントID": "reviewer_account_id",
};

// =============================================================================
// Parsing Functions
// =============================================================================

/**
 * Parse amount value from various formats.
 * Removes tabs, spaces, and currency symbols.
 *
 * @param value - Raw value from file
 * @returns Parsed number
 *
 * @example
 * parseAmount("¥1,000") // 1000
 * parseAmount(1000) // 1000
 * parseAmount("1000円") // 1000
 */
export function parseAmount(value: string | number): number {
  if (typeof value === "number") return value;
  // Remove tabs, spaces, currency symbols (¥, 円), and commas
  const cleaned = String(value).replace(/[\t\s¥円,]/g, "");
  return parseFloat(cleaned) || 0;
}

/**
 * Parse Excel serial date or date string to YYYY-MM-DD format.
 *
 * @param value - Raw date value (string, number, or Date object)
 * @param parseExcelDate - Function to parse Excel serial dates (from xlsx library)
 * @returns Date string in YYYY-MM-DD format
 *
 * @example
 * parseDate("2025-01-15") // "2025-01-15"
 * parseDate(44945, XLSX.SSF.parse_date_code) // "2025-01-15"
 */
export function parseDate(
  value: string | number | Date,
  parseExcelDate?: (serial: number) => { y: number; m: number; d: number }
): string {
  if (!value) return "";

  // If it's already a date string in YYYY-MM-DD format
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  // If it's an Excel serial date number
  if (typeof value === "number" && parseExcelDate) {
    const date = parseExcelDate(value);
    return `${date.y}-${String(date.m).padStart(2, "0")}-${String(date.d).padStart(2, "0")}`;
  }

  // Try to parse as date string
  const date = new Date(value);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split("T")[0];
  }

  return String(value);
}

/**
 * Calculate invoice month from expense date.
 *
 * @param expenseDate - Expense date in YYYY-MM-DD format
 * @returns Invoice month in YYYY-MM format
 *
 * @example
 * calculateInvoiceMonth("2025-01-15") // "2025-01"
 */
export function calculateInvoiceMonth(expenseDate: string): string {
  const date = new Date(expenseDate);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return `${year}-${String(month).padStart(2, "0")}`;
}

// =============================================================================
// Row Mapping
// =============================================================================

/**
 * Map a raw data row to ExpenseRow type.
 *
 * @param row - Raw row data (can be indexed by header name or number)
 * @param headers - Array of header names
 * @param parseExcelDate - Function to parse Excel serial dates
 * @returns Mapped expense row, or null if validation fails
 */
export function mapRowToExpense(
  row: Record<string, unknown>,
  headers: string[],
  parseExcelDate?: (serial: number) => { y: number; m: number; d: number }
): ExpenseRow | null {
  const expense: Partial<ExpenseRow> = {};

  headers.forEach((header, index) => {
    const internalKey = EXPENSE_COLUMN_MAP[header];
    if (internalKey) {
      const value = row[header] ?? row[index];
      if (value !== undefined && value !== null && value !== "") {
        if (internalKey === "amount") {
          expense[internalKey] = parseAmount(value as string | number);
        } else if (internalKey === "expense_date") {
          expense[internalKey] = parseDate(
            value as string | number | Date,
            parseExcelDate
          );
        } else {
          expense[internalKey] = String(value).trim();
        }
      }
    }
  });

  // Validate required fields
  if (
    !expense.store_code ||
    !expense.store_name ||
    !expense.expense_date ||
    !expense.account_item_code ||
    !expense.description ||
    expense.amount === undefined
  ) {
    return null;
  }

  return expense as ExpenseRow;
}

// =============================================================================
// Batch Processing
// =============================================================================

/**
 * Convert expense rows to database records.
 *
 * @param expenses - Array of expense rows
 * @param batchId - Import batch ID
 * @param fileType - File type (csv or xlsx)
 * @param options - Import options
 * @returns Array of expense records ready for insertion
 */
export function convertExpensesToRecords(
  expenses: ExpenseRow[],
  batchId: string,
  fileType: "csv" | "xlsx",
  options?: ExpenseImportOptions
): ExpenseRecord[] {
  const reviewStatus = options?.autoApprove ? "approved" : "pending";

  return expenses.map((expense) => ({
    store_code: expense.store_code,
    store_name: expense.store_name,
    expense_date: expense.expense_date,
    account_item_code: expense.account_item_code,
    description: expense.description,
    expense_type: expense.expense_type || "課税分",
    amount: expense.amount,
    import_source: fileType,
    import_batch_id: batchId,
    invoice_month: calculateInvoiceMonth(expense.expense_date),
    review_status: reviewStatus,
    reviewer_account_id: expense.reviewer_account_id || null,
  }));
}

/**
 * Insert expense records in batches.
 *
 * @param supabase - Supabase client
 * @param records - Expense records to insert
 * @param chunkSize - Size of each batch chunk (default: 100)
 * @returns Object with successCount, failedCount, and errors
 */
export async function insertExpensesInBatches(
  supabase: SupabaseClient,
  records: ExpenseRecord[],
  chunkSize: number = 100
): Promise<{ successCount: number; failedCount: number; errors: string[] }> {
  let successCount = 0;
  let failedCount = 0;
  const errors: string[] = [];

  for (let i = 0; i < records.length; i += chunkSize) {
    const chunk = records.slice(i, i + chunkSize);
    const { error: insertError } = await supabase.from("expenses").insert(chunk);

    if (insertError) {
      // If batch insert fails, count all as failed
      failedCount += chunk.length;
      errors.push(
        `バッチ ${Math.floor(i / chunkSize) + 1}: ${insertError.message}`
      );
    } else {
      successCount += chunk.length;
    }
  }

  return { successCount, failedCount, errors };
}

// =============================================================================
// Import Batch Management
// =============================================================================

/**
 * Create import batch record.
 *
 * @param supabase - Supabase client
 * @param fileName - Name of the imported file
 * @param fileType - File type (csv or xlsx)
 * @param totalRecords - Total number of records
 * @returns Created batch record or null on error
 */
export async function createImportBatch(
  supabase: SupabaseClient,
  fileName: string,
  fileType: "csv" | "xlsx",
  totalRecords: number
): Promise<{ id: string } | null> {
  const { data: batch, error: batchError } = await supabase
    .from("expense_import_batches")
    .insert({
      file_name: fileName,
      file_type: fileType,
      total_records: totalRecords,
      status: "processing",
    })
    .select()
    .single();

  if (batchError) {
    console.error("Failed to create import batch:", batchError);
    return null;
  }

  return batch;
}

/**
 * Update import batch with results.
 *
 * @param supabase - Supabase client
 * @param batchId - Batch ID to update
 * @param successCount - Number of successfully imported records
 * @param failedCount - Number of failed records
 * @param errors - Array of error messages
 */
export async function updateImportBatch(
  supabase: SupabaseClient,
  batchId: string,
  successCount: number,
  failedCount: number,
  totalRecords: number,
  errors: string[]
): Promise<void> {
  await supabase
    .from("expense_import_batches")
    .update({
      success_records: successCount,
      failed_records: failedCount,
      status: failedCount === totalRecords ? "failed" : "completed",
      error_log: errors.length > 0 ? errors : null,
      completed_at: new Date().toISOString(),
    })
    .eq("id", batchId);
}

// =============================================================================
// Data Validation
// =============================================================================

/**
 * Validate expense row data.
 *
 * @param expense - Expense row to validate
 * @returns Validation error message, or null if valid
 */
export function validateExpenseRow(expense: Partial<ExpenseRow>): string | null {
  if (!expense.store_code) return "店番が必要です";
  if (!expense.store_name) return "店名が必要です";
  if (!expense.expense_date) return "費用発生日が必要です";
  if (!expense.account_item_code) return "勘定項目が必要です";
  if (!expense.description) return "項目名が必要です";
  if (expense.amount === undefined || expense.amount === null) {
    return "請求金額が必要です";
  }
  if (expense.amount < 0) return "請求金額は0以上である必要があります";

  return null;
}
