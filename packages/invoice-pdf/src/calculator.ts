/**
 * @enterprise/invoice-pdf - Invoice Calculator
 *
 * Core business logic for invoice amount calculations.
 * All calculation rules are configurable through the config module.
 */

import type {
  InvoicePDFData,
  InvoiceData,
  CCMemberData,
  MaterialOrderData,
  ExpenseData,
  CCMemberDetail,
  MaterialDetail,
  OtherExpenseDetail,
  InvoiceConfig,
} from "./types";
import {
  getConfig,
  getTaxRate,
  getCCFeeConfig,
  getMaterialConfig,
  getOrganization,
} from "./config";

// =============================================================================
// Invoice Number Generation
// =============================================================================

/**
 * Generate invoice number based on store code position in sorted list.
 *
 * @param storeCode - The store code to generate number for
 * @param allStoreCodes - List of all store codes in the batch
 * @returns Sequential invoice number (e.g., "0001")
 */
export function generateInvoiceNo(
  storeCode: string,
  allStoreCodes: string[]
): string {
  const sortedCodes = [...allStoreCodes].sort();
  const index = sortedCodes.indexOf(storeCode);
  return String(index + 1).padStart(4, "0");
}

// =============================================================================
// Date Calculations
// =============================================================================

/**
 * Calculate the issue date for an invoice.
 * Issue date is the 1st of the current month.
 *
 * @returns Issue date in YYYY-MM-DD format
 */
export function calculateIssueDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return `${year}-${String(month).padStart(2, "0")}-01`;
}

/**
 * Format a date for display in material details.
 *
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date in MM/DD format
 */
export function formatMaterialDate(dateString: string): string {
  if (!dateString) return "";
  const parts = dateString.split("-");
  if (parts.length >= 3) {
    const month = parts[1];
    const day = parts[2];
    return `${month}/${day}`;
  }
  return dateString;
}

// =============================================================================
// CC Member Calculations
// =============================================================================

/**
 * Calculate CC member totals and rebates.
 *
 * @param ccMembers - CC member data from database
 * @param options - Optional calculation options override
 * @returns Object with total amount and Aigran rebate
 */
export function calculateCCMemberTotals(
  ccMembers: CCMemberData[],
  options?: InvoiceConfig
): { totalAmount: number; aigranRebate: number } {
  const ccFeeConfig = getCCFeeConfig();
  const aigranRebatePerPerson =
    options?.ccFee?.aigranRebatePerPerson ?? ccFeeConfig.aigranRebatePerPerson ?? 600;

  const totalAmount = ccMembers.reduce(
    (sum, m) => sum + (m.total_amount || 0),
    0
  );

  const aigranRebate = ccMembers.reduce((sum, m) => {
    const isAigran = m.is_aigran || false;
    return sum + (isAigran ? m.total_count * aigranRebatePerPerson : 0);
  }, 0);

  return { totalAmount, aigranRebate };
}

/**
 * Transform CC member data to detail format for PDF.
 *
 * @param members - CC member data from database
 * @param options - Optional calculation options override
 * @returns Array of CC member details
 */
export function transformCCMemberDetails(
  members: CCMemberData[],
  options?: InvoiceConfig
): CCMemberDetail[] {
  const ccFeeConfig = getCCFeeConfig();
  const aigranRebatePerPerson =
    options?.ccFee?.aigranRebatePerPerson ?? ccFeeConfig.aigranRebatePerPerson ?? 600;

  return members.map((member) => {
    const isAigran = member.is_aigran || false;
    const isBankTransfer = member.is_bank_transfer || false;
    const rebateAmount = isAigran
      ? member.total_count * aigranRebatePerPerson
      : 0;

    // Delivery code: last 3 digits of classroom code
    // If ends with "000" (branch itself), show "00"
    const lastThree = member.classroom_code
      ? member.classroom_code.slice(-3)
      : "";
    const deliveryCode = lastThree === "000" ? "00" : lastThree;

    return {
      className: member.class_name,
      classroomCode: member.classroom_code || "",
      count: member.total_count,
      unitPrice: member.unit_price || 480,
      amount: member.total_amount,
      deliveryDate: deliveryCode,
      invoiceAmount: member.total_amount,
      deductionAmount: 0,
      isAigran,
      rebateAmount,
      isBankTransfer,
    };
  });
}

// =============================================================================
// Material Calculations
// =============================================================================

/**
 * Calculate material delivery and return amounts.
 *
 * Business rules:
 * - Branch purchases (is_branch_order=true): Count as delivery, no rebate
 * - Classroom purchases: No delivery amount, but get margin as rebate
 *
 * @param materials - Material order data from database
 * @param options - Optional calculation options override
 * @returns Object with delivery amount and return amount
 */
export function calculateMaterialTotals(
  materials: MaterialOrderData[],
  options?: InvoiceConfig
): { deliveryAmount: number; returnAmount: number } {
  const materialConfig = getMaterialConfig();
  const classroomRebateEnabled =
    options?.material?.classroomRebateEnabled ??
    materialConfig.classroomRebateEnabled;

  // Delivery amount: only branch purchases
  const deliveryAmount = materials.reduce((sum, m) => {
    const isBranch = m.is_branch_order === true;
    return sum + (isBranch ? m.amount : 0);
  }, 0);

  // Return amount: classroom purchase margin (retail price - classroom price) × quantity
  const returnAmount = materials.reduce((sum, m) => {
    const isBranch = m.is_branch_order === true;
    if (isBranch) return sum; // Branch purchases don't get rebate

    if (!classroomRebateEnabled) return sum;

    const priceRetail = m.price_retail || 0;
    const margin = (priceRetail - m.unit_price) * m.quantity;
    return sum + (margin > 0 ? margin : 0);
  }, 0);

  return { deliveryAmount, returnAmount };
}

/**
 * Transform material order data to detail format for PDF.
 *
 * @param materials - Material order data from database
 * @returns Array of material details
 */
export function transformMaterialDetails(
  materials: MaterialOrderData[]
): MaterialDetail[] {
  return materials.map((material) => {
    const isBranchOrder = material.is_branch_order || false;

    // For classroom purchases, display retail price; for branch, display actual unit price
    const displayUnitPrice = isBranchOrder
      ? material.unit_price
      : material.price_retail || material.unit_price;

    // Margin = (retail - classroom) × quantity (only for classroom purchases)
    const margin = isBranchOrder
      ? 0
      : ((material.price_retail || 0) - material.unit_price) * material.quantity;

    return {
      date: formatMaterialDate(material.order_date),
      slipNumber: material.slip_number || "",
      productName: material.product_name,
      unitPrice: displayUnitPrice,
      quantity: material.quantity,
      // For classroom purchases, use retail price for delivery amount
      amount: isBranchOrder
        ? material.amount
        : (material.price_retail || material.unit_price) * material.quantity,
      deliveryTo: material.delivery_to || "",
      invoiceAmount: isBranchOrder ? material.amount : 0,
      deductionAmount: margin > 0 ? margin : 0,
    };
  });
}

// =============================================================================
// Expense Calculations
// =============================================================================

/**
 * Transform expense data to detail format for PDF.
 *
 * @param expenses - Expense data from database
 * @returns Array of other expense details
 */
export function transformExpenseDetails(
  expenses: ExpenseData[]
): OtherExpenseDetail[] {
  return expenses.map((expense) => ({
    description: expense.item_name,
    amount: expense.amount,
  }));
}

// =============================================================================
// Main Invoice Transformation
// =============================================================================

/**
 * Transform database data into complete invoice PDF data structure.
 *
 * This is the main function that orchestrates all calculations and
 * produces the final data structure for PDF generation.
 *
 * @param invoice - Invoice header data from database
 * @param invoiceNo - Sequential invoice number
 * @param ccMembers - CC member data
 * @param materials - Material order data
 * @param expenses - Expense data
 * @param paymentAmount - Payment amount (default: 0)
 * @param options - Optional calculation options override
 * @returns Complete invoice PDF data
 */
export function transformInvoiceData(
  invoice: InvoiceData,
  invoiceNo: string,
  ccMembers: CCMemberData[],
  materials: MaterialOrderData[],
  expenses: ExpenseData[],
  paymentAmount: number = 0,
  options?: InvoiceConfig
): InvoicePDFData {
  const config = getConfig();
  const taxRate = options?.taxRate ?? config.taxRate;
  const organizationInfo = options?.organization ?? getOrganization();

  const issueDate = calculateIssueDate();

  // Calculate CC member totals
  const ccTotals = calculateCCMemberTotals(ccMembers, options);
  const ccMembershipFee = ccTotals.totalAmount - ccTotals.aigranRebate;

  // Calculate material totals
  const materialTotals = calculateMaterialTotals(materials, options);
  const materialDelivery = materialTotals.deliveryAmount;
  const materialReturn = materialTotals.returnAmount;

  // Get values from invoice record
  const previousBalance = invoice.previous_balance || 0;
  const payment = paymentAmount;
  const remainingBalance = previousBalance - payment;
  const other = invoice.other_expenses_amount || 0;
  const adjustment = invoice.adjustment_amount || 0;
  const nonTaxable = invoice.non_taxable_amount || 0;
  const materialShipping = 0;
  const unitPrice = 0;
  const headquartersDeduction = 0;
  const bankTransferDeduction = 0;

  // Calculate subtotal: ⑧ = ① + ② + ③ + ④ + ⑦ - ⑤ - ⑥
  const subtotal =
    remainingBalance +
    ccMembershipFee +
    materialDelivery +
    other +
    nonTaxable -
    materialReturn -
    adjustment;

  // Calculate tax: ⑨ = (② + ③ + ④ - ⑤) × tax rate
  const taxableBase = ccMembershipFee + materialDelivery + other - materialReturn;
  const taxAmount = Math.floor(taxableBase * taxRate);

  // Total amount = ⑧ + ⑨
  const totalAmount = subtotal + taxAmount;

  // Transform detail items
  const ccMemberDetails = transformCCMemberDetails(ccMembers, options);
  const materialDetails = transformMaterialDetails(materials);
  const otherExpenseDetails = transformExpenseDetails(expenses);

  return {
    invoiceNumber: invoice.invoice_number,
    invoiceNo,
    billingMonth: invoice.billing_month,
    issueDate,
    recipient: {
      postalCode: invoice.department.postal_code || "",
      address: invoice.department.address || "",
      prefecture: invoice.department.prefecture || "",
      city: invoice.department.city || "",
      addressLine1: invoice.department.address_line1 || "",
      addressLine2: invoice.department.address_line2 || "",
      name: invoice.department.name,
      storeCode: invoice.department.store_code,
      managerName: invoice.department.manager_name || "",
    },
    sender: {
      postalCode: organizationInfo.postalCode,
      address: organizationInfo.address,
      name: organizationInfo.name,
      phone: organizationInfo.phone,
      fax: organizationInfo.fax || "",
      registrationNumber: organizationInfo.registrationNumber || "",
    },
    amounts: {
      previousBalance,
      payment,
      remainingBalance,
      ccMembershipFee,
      materialDelivery,
      materialShipping,
      unitPrice,
      other,
      materialReturn,
      adjustment,
      nonTaxable,
      headquartersDeduction,
      bankTransferDeduction,
      subtotal,
      taxAmount,
      totalAmount,
    },
    details: {
      ccMembers: ccMemberDetails,
      materials: materialDetails,
      otherExpenses: otherExpenseDetails,
    },
  };
}

/**
 * Create invoice PDF data directly from pre-calculated values.
 * Use this when you already have all the calculated amounts.
 *
 * @param data - Pre-calculated invoice data
 * @returns Complete invoice PDF data
 */
export function createInvoicePDFData(
  data: Partial<InvoicePDFData> & Pick<InvoicePDFData, "invoiceNo" | "billingMonth" | "recipient" | "amounts">
): InvoicePDFData {
  const organizationInfo = getOrganization();

  return {
    invoiceNumber: data.invoiceNumber || `INV-${data.billingMonth}-${data.invoiceNo}`,
    invoiceNo: data.invoiceNo,
    billingMonth: data.billingMonth,
    issueDate: data.issueDate || calculateIssueDate(),
    recipient: data.recipient,
    sender: data.sender || {
      postalCode: organizationInfo.postalCode,
      address: organizationInfo.address,
      name: organizationInfo.name,
      phone: organizationInfo.phone,
      fax: organizationInfo.fax || "",
      registrationNumber: organizationInfo.registrationNumber || "",
    },
    amounts: data.amounts,
    details: data.details || {
      ccMembers: [],
      materials: [],
      otherExpenses: [],
    },
  };
}
