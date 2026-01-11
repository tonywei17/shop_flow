/**
 * @enterprise/domain-settlement - Invoice Types
 *
 * Type definitions for invoice generation and PDF data.
 * These types are used across the invoice calculation and generation pipeline.
 */

// =============================================================================
// Invoice PDF Data Types
// =============================================================================

/**
 * Complete data structure for generating invoice PDF
 */
export interface InvoicePDFData {
  // Basic information
  invoiceNumber: string;
  invoiceNo: string; // Sequential number like "0001"
  billingMonth: string; // Format: YYYY-MM
  issueDate: string; // Issue date: YYYY-MM-DD

  // Recipient (branch/store information)
  recipient: RecipientInfo;

  // Sender (headquarters information)
  sender: SenderInfo;

  // Amount summary
  amounts: InvoiceAmounts;

  // Detail items
  details: InvoiceDetails;
}

/**
 * Invoice recipient (branch/store) information
 */
export interface RecipientInfo {
  postalCode: string;
  address: string;
  // Detailed address fields for multi-line display
  prefecture?: string;
  city?: string;
  addressLine1?: string;
  addressLine2?: string;
  name: string;
  storeCode: string;
  managerName?: string; // Manager name (XX様方)
}

/**
 * Invoice sender (headquarters) information
 */
export interface SenderInfo {
  postalCode: string;
  address: string;
  name: string;
  phone: string;
  fax: string;
  registrationNumber: string; // Tax registration number
}

/**
 * Invoice amount summary
 */
export interface InvoiceAmounts {
  previousBalance: number; // 前月請求額 (a)
  payment: number; // ご入金額 (b)
  remainingBalance: number; // ご入金後残額 ① = a - b
  ccMembershipFee: number; // チャイルドクラブ会費 ②
  materialDelivery: number; // 教材お買い上げ ③
  materialShipping: number; // 教材発送費用
  unitPrice: number; // 単価×口数
  other: number; // その他 ④
  materialReturn: number; // 教材販売割戻し ⑤
  adjustment: number; // 調整・ご返金 ⑥
  nonTaxable: number; // 非課税分 ⑦
  headquartersDeduction: number; // 本部発分
  bankTransferDeduction: number; // 口座振替分
  subtotal: number; // 差引き合計額 ⑧
  taxAmount: number; // 消費税額 ⑨
  totalAmount: number; // ご請求額合計 ⑧ + ⑨
}

/**
 * Invoice detail sections
 */
export interface InvoiceDetails {
  ccMembers: CCMemberDetail[];
  materials: MaterialDetail[];
  otherExpenses: OtherExpenseDetail[];
}

// =============================================================================
// Detail Item Types
// =============================================================================

/**
 * CC (Child Club) member detail
 */
export interface CCMemberDetail {
  className: string; // Classroom name
  classroomCode: string; // Classroom code (store number)
  count: number; // Number of members
  unitPrice: number; // Unit price per member
  amount: number; // Total amount
  deliveryDate: string; // Delivery destination (last 3 digits of store number)
  invoiceAmount: number; // Invoice amount
  deductionAmount: number; // Deduction amount
  isAigran: boolean; // Is Aigran classroom
  rebateAmount: number; // Rebate amount (for Aigran: count × 600)
  isBankTransfer: boolean; // Is bank transfer classroom
}

/**
 * Material (teaching material) order detail
 */
export interface MaterialDetail {
  date: string; // Order date (MM/DD format)
  slipNumber: string; // Slip number (numeric part only)
  productName: string; // Product name or description
  unitPrice: number; // Unit price
  quantity: number; // Quantity
  amount: number; // Delivery amount
  deliveryTo: string; // Delivery destination ("00" for branch, last 3 digits for classroom)
  invoiceAmount: number; // Invoice amount (only for branch purchases)
  deductionAmount: number; // Rebate/deduction amount (margin for classroom purchases)
}

/**
 * Other expense detail
 */
export interface OtherExpenseDetail {
  description: string; // Description/summary
  amount: number; // Amount
}

// =============================================================================
// Input Data Types (from database)
// =============================================================================

/**
 * Invoice data from database
 */
export interface InvoiceData {
  id: string;
  invoice_number: string;
  billing_month: string;
  previous_balance: number;
  material_amount: number;
  membership_amount: number;
  other_expenses_amount: number;
  adjustment_amount: number;
  non_taxable_amount: number;
  material_return_amount: number;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  department: DepartmentInfo;
}

/**
 * Department/branch information from database
 */
export interface DepartmentInfo {
  id: string;
  name: string;
  store_code: string;
  postal_code?: string;
  address?: string;
  prefecture?: string;
  city?: string;
  address_line1?: string;
  address_line2?: string;
  manager_name?: string;
}

/**
 * CC member data from database
 */
export interface CCMemberData {
  class_name: string;
  classroom_code: string;
  total_count: number;
  unit_price: number;
  total_amount: number;
  is_aigran?: boolean;
  is_bank_transfer?: boolean;
}

/**
 * Material order data from database
 */
export interface MaterialOrderData {
  order_date: string;
  slip_number: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  amount: number;
  delivery_to?: string;
  is_branch_order?: boolean;
  price_retail?: number; // General price for margin calculation
}

/**
 * Expense data from database
 */
export interface ExpenseData {
  item_name: string;
  amount: number;
}

// =============================================================================
// Calculation Options
// =============================================================================

/**
 * Options for invoice calculation
 */
export interface InvoiceCalculationOptions {
  // Tax rate (decimal, e.g., 0.1 for 10%)
  taxRate?: number;

  // CC fee rules
  ccFee?: {
    defaultUnitPrice?: number;
    aigranUnitPrice?: number;
    aigranRebatePerPerson?: number;
  };

  // Material rules
  material?: {
    branchRebateEnabled?: boolean;
    classroomRebateEnabled?: boolean;
  };
}
