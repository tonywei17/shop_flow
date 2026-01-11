/**
 * @enterprise/domain-settlement - Invoice Generator
 *
 * Core business logic for generating invoices.
 * Extracted from apps/web to make it reusable and testable.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

// =============================================================================
// Types
// =============================================================================

/**
 * Result of invoice generation for a single department
 */
export interface InvoiceGenerationResult {
  department_id: string;
  department_name: string;
  invoice_id: string;
  invoice_number: string;
  total_amount: number;
  status: "created" | "error";
  error?: string;
}

/**
 * Department data needed for invoice generation
 */
export interface Department {
  id: string;
  name: string;
  store_code: string | null;
}

/**
 * Invoice generation options
 */
export interface InvoiceGenerationOptions {
  /** Tax rate (decimal, e.g., 0.1 for 10%) */
  taxRate?: number;
  /** CC membership unit price */
  ccMembershipUnitPrice?: number;
}

// =============================================================================
// Invoice Number Generation
// =============================================================================

/**
 * Generate invoice number based on billing month and sequential count.
 *
 * Format: INV-YYYYMM-XXX
 * Example: INV-202501-001
 *
 * @param billingMonth - Billing month in YYYY-MM format
 * @param sequenceNumber - Sequential number within the month
 * @returns Invoice number string
 */
export function generateInvoiceNumber(
  billingMonth: string,
  sequenceNumber: number
): string {
  const monthPart = billingMonth.replace("-", "");
  const seqPart = String(sequenceNumber).padStart(3, "0");
  return `INV-${monthPart}-${seqPart}`;
}

// =============================================================================
// Due Date Calculation
// =============================================================================

/**
 * Calculate invoice due date.
 * Due date is the last day of the next month.
 *
 * @param billingMonth - Billing month in YYYY-MM format
 * @returns Due date in YYYY-MM-DD format
 *
 * @example
 * calculateDueDate("2025-01") // "2025-02-28"
 * calculateDueDate("2025-12") // "2026-01-31"
 */
export function calculateDueDate(billingMonth: string): string {
  const [year, month] = billingMonth.split("-").map(Number);
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  // Last day of next month = 0th day of the month after next month
  const lastDay = new Date(nextYear, nextMonth, 0);

  return lastDay.toISOString().split("T")[0];
}

// =============================================================================
// Amount Calculations
// =============================================================================

/**
 * Calculate previous balance from unpaid invoices.
 *
 * @param supabase - Supabase client
 * @param departmentId - Department ID
 * @param billingMonth - Current billing month (to find invoices before this)
 * @returns Total unpaid amount from previous invoices
 */
export async function calculatePreviousBalance(
  supabase: SupabaseClient,
  departmentId: string,
  billingMonth: string
): Promise<number> {
  const { data: unpaidInvoices } = await supabase
    .from("invoices")
    .select("total_amount, paid_amount")
    .eq("department_id", departmentId)
    .lt("billing_month", billingMonth)
    .in("status", ["sent", "overdue", "partial_paid"]);

  if (!unpaidInvoices) return 0;

  return unpaidInvoices.reduce((sum: number, inv: any) => {
    return sum + ((inv.total_amount || 0) - (inv.paid_amount || 0));
  }, 0);
}

/**
 * Calculate material amount from orders.
 * Currently returns 0 as placeholder - needs order-department linking.
 *
 * @param supabase - Supabase client
 * @param departmentId - Department ID
 * @param billingMonth - Billing month
 * @returns Total material amount
 */
export async function calculateMaterialAmount(
  supabase: SupabaseClient,
  departmentId: string,
  billingMonth: string
): Promise<number> {
  // TODO: Implement order-department linking
  // Get orders with payment_method = 'invoice' for the billing month
  return 0;
}

/**
 * Calculate CC membership amount.
 *
 * @param supabase - Supabase client
 * @param storeCode - Store code of the department
 * @param billingMonth - Billing month
 * @returns Total CC membership fees
 */
export async function calculateMembershipAmount(
  supabase: SupabaseClient,
  storeCode: string | null,
  billingMonth: string
): Promise<number> {
  if (!storeCode) return 0;

  const { data: members } = await supabase
    .from("cc_members")
    .select("amount")
    .eq("billing_month", billingMonth)
    .eq("branch_code", storeCode)
    .eq("is_excluded", false);

  if (!members) return 0;

  return members.reduce((sum: number, m: any) => sum + (m.amount || 0), 0);
}

/**
 * Calculate other expenses amount.
 *
 * @param supabase - Supabase client
 * @param storeCode - Store code of the department
 * @param billingMonth - Billing month
 * @returns Total approved expenses
 */
export async function calculateOtherExpenses(
  supabase: SupabaseClient,
  storeCode: string | null,
  billingMonth: string
): Promise<number> {
  if (!storeCode) return 0;

  const { data: expenses } = await supabase
    .from("expenses")
    .select("amount")
    .eq("store_code", storeCode)
    .eq("invoice_month", billingMonth)
    .eq("review_status", "approved")
    .is("invoice_id", null);

  if (!expenses) return 0;

  return expenses.reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0);
}

/**
 * Calculate tax amount.
 *
 * @param taxableAmount - Amount subject to tax
 * @param taxRate - Tax rate (decimal, e.g., 0.1 for 10%)
 * @returns Tax amount (floored to integer)
 */
export function calculateTaxAmount(
  taxableAmount: number,
  taxRate: number = 0.1
): number {
  return Math.floor(taxableAmount * taxRate);
}

// =============================================================================
// Invoice Items Creation
// =============================================================================

/**
 * Item type for invoice items
 */
export type InvoiceItemType =
  | "previous_balance"
  | "material"
  | "membership"
  | "other_expense";

/**
 * Invoice item data structure
 */
export interface InvoiceItem {
  invoice_id: string;
  item_type: InvoiceItemType;
  description: string;
  quantity?: number;
  unit_price?: number;
  amount: number;
  tax_rate: number;
  tax_amount: number;
  sort_order: number;
}

/**
 * Create invoice items based on calculated amounts.
 *
 * @param supabase - Supabase client
 * @param invoiceId - Invoice ID
 * @param department - Department data
 * @param billingMonth - Billing month
 * @param amounts - Calculated amounts
 * @param options - Generation options
 */
export async function createInvoiceItems(
  supabase: SupabaseClient,
  invoiceId: string,
  department: Department,
  billingMonth: string,
  amounts: {
    previousBalance: number;
    materialAmount: number;
    membershipAmount: number;
    otherExpensesAmount: number;
  },
  options?: InvoiceGenerationOptions
): Promise<void> {
  const items: InvoiceItem[] = [];
  let sortOrder = 0;
  const taxRate = options?.taxRate ?? 0.1;

  // Previous balance item (no tax)
  if (amounts.previousBalance > 0) {
    items.push({
      invoice_id: invoiceId,
      item_type: "previous_balance",
      description: "前月未払残高",
      amount: amounts.previousBalance,
      tax_rate: 0,
      tax_amount: 0,
      sort_order: sortOrder++,
    });
  }

  // Material amount item
  if (amounts.materialAmount > 0) {
    items.push({
      invoice_id: invoiceId,
      item_type: "material",
      description: "教材費",
      amount: amounts.materialAmount,
      tax_rate: taxRate * 100, // Store as percentage
      tax_amount: calculateTaxAmount(amounts.materialAmount, taxRate),
      sort_order: sortOrder++,
    });
  }

  // Membership amount item
  if (amounts.membershipAmount > 0) {
    // Get member count for description
    const { data: members } = await supabase
      .from("cc_members")
      .select("total_count")
      .eq("billing_month", billingMonth)
      .eq("branch_code", department.store_code)
      .eq("is_excluded", false);

    const totalMembers =
      members?.reduce((sum: number, m: any) => sum + (m.total_count || 0), 0) || 0;
    const unitPrice = options?.ccMembershipUnitPrice ?? 480;

    items.push({
      invoice_id: invoiceId,
      item_type: "membership",
      description: `CC会員費 (${totalMembers}名)`,
      quantity: totalMembers,
      unit_price: unitPrice,
      amount: amounts.membershipAmount,
      tax_rate: taxRate * 100,
      tax_amount: calculateTaxAmount(amounts.membershipAmount, taxRate),
      sort_order: sortOrder++,
    });
  }

  // Other expenses item
  if (amounts.otherExpensesAmount > 0) {
    items.push({
      invoice_id: invoiceId,
      item_type: "other_expense",
      description: "その他費用",
      amount: amounts.otherExpensesAmount,
      tax_rate: taxRate * 100,
      tax_amount: calculateTaxAmount(amounts.otherExpensesAmount, taxRate),
      sort_order: sortOrder++,
    });

    // Link expenses to this invoice
    await supabase
      .from("expenses")
      .update({ invoice_id: invoiceId })
      .eq("store_code", department.store_code)
      .eq("invoice_month", billingMonth)
      .eq("review_status", "approved")
      .is("invoice_id", null);
  }

  // Insert all items
  if (items.length > 0) {
    await supabase.from("invoice_items").insert(items);
  }
}

// =============================================================================
// Main Invoice Generation
// =============================================================================

/**
 * Generate invoice for a single department.
 *
 * This is the main orchestration function that:
 * 1. Calculates all amounts
 * 2. Generates invoice number
 * 3. Creates invoice record
 * 4. Creates invoice items
 *
 * @param supabase - Supabase client
 * @param department - Department to generate invoice for
 * @param billingMonth - Billing month in YYYY-MM format
 * @param options - Generation options
 * @returns Invoice generation result
 */
export async function generateInvoiceForDepartment(
  supabase: SupabaseClient,
  department: Department,
  billingMonth: string,
  options?: InvoiceGenerationOptions
): Promise<InvoiceGenerationResult> {
  try {
    const taxRate = options?.taxRate ?? 0.1;

    // Step 1: Calculate all amounts
    const previousBalance = await calculatePreviousBalance(
      supabase,
      department.id,
      billingMonth
    );

    const materialAmount = await calculateMaterialAmount(
      supabase,
      department.id,
      billingMonth
    );

    const membershipAmount = await calculateMembershipAmount(
      supabase,
      department.store_code,
      billingMonth
    );

    const otherExpensesAmount = await calculateOtherExpenses(
      supabase,
      department.store_code,
      billingMonth
    );

    // Step 2: Calculate totals
    const subtotal =
      previousBalance + materialAmount + membershipAmount + otherExpensesAmount;

    const taxableAmount = materialAmount + membershipAmount + otherExpensesAmount;
    const taxAmount = calculateTaxAmount(taxableAmount, taxRate);
    const totalAmount = subtotal + taxAmount;

    // Step 3: Generate invoice number
    const { data: countData } = await supabase
      .from("invoices")
      .select("id", { count: "exact" })
      .eq("billing_month", billingMonth);

    const sequenceNumber = (countData?.length || 0) + 1;
    const invoiceNumber = generateInvoiceNumber(billingMonth, sequenceNumber);

    // Step 4: Calculate due date
    const dueDate = calculateDueDate(billingMonth);

    // Step 5: Create invoice record
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        invoice_number: invoiceNumber,
        department_id: department.id,
        billing_month: billingMonth,
        previous_balance: previousBalance,
        material_amount: materialAmount,
        membership_amount: membershipAmount,
        other_expenses_amount: otherExpensesAmount,
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        status: "draft",
        due_date: dueDate,
      })
      .select()
      .single();

    if (invoiceError || !invoice) {
      throw new Error(invoiceError?.message || "Failed to create invoice");
    }

    // Step 6: Create invoice items
    await createInvoiceItems(
      supabase,
      invoice.id,
      department,
      billingMonth,
      {
        previousBalance,
        materialAmount,
        membershipAmount,
        otherExpensesAmount,
      },
      options
    );

    return {
      department_id: department.id,
      department_name: department.name,
      invoice_id: invoice.id,
      invoice_number: invoiceNumber,
      total_amount: totalAmount,
      status: "created",
    };
  } catch (error) {
    return {
      department_id: department.id,
      department_name: department.name,
      invoice_id: "",
      invoice_number: "",
      total_amount: 0,
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Generate invoices for multiple departments.
 *
 * @param supabase - Supabase client
 * @param departments - Departments to generate invoices for
 * @param billingMonth - Billing month in YYYY-MM format
 * @param options - Generation options
 * @returns Array of generation results
 */
export async function generateInvoicesBatch(
  supabase: SupabaseClient,
  departments: Department[],
  billingMonth: string,
  options?: InvoiceGenerationOptions
): Promise<InvoiceGenerationResult[]> {
  const results: InvoiceGenerationResult[] = [];

  for (const dept of departments) {
    const result = await generateInvoiceForDepartment(
      supabase,
      dept,
      billingMonth,
      options
    );
    results.push(result);
  }

  return results;
}
