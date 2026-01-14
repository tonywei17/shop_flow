/**
 * @enterprise/invoice-pdf - Type Definitions
 *
 * Complete type definitions for invoice PDF generation.
 * This package is designed to be standalone and configurable.
 */

// =============================================================================
// Configuration Types
// =============================================================================

/**
 * Invoice generation configuration
 * All settings are optional with sensible defaults
 */
export interface InvoiceConfig {
  /**
   * Tax rate (decimal, e.g., 0.1 for 10%)
   * @default 0.1
   */
  taxRate?: number;

  /**
   * CC (Child Club) fee configuration
   */
  ccFee?: {
    /** Default unit price per member */
    defaultUnitPrice?: number;
    /** Unit price for Aigran classrooms */
    aigranUnitPrice?: number;
    /** Rebate amount per person for Aigran classrooms */
    aigranRebatePerPerson?: number;
  };

  /**
   * Material sales configuration
   */
  material?: {
    /** Enable rebate for branch purchases */
    branchRebateEnabled?: boolean;
    /** Enable rebate for classroom purchases */
    classroomRebateEnabled?: boolean;
  };

  /**
   * Organization (sender) information
   */
  organization?: OrganizationInfo;

  /**
   * Bank account information for payment
   */
  bankInfo?: BankInfo;

  /**
   * Asset configuration for PDF rendering
   */
  assets?: {
    /** Logo image as Base64 data URL or file path */
    logo?: string;
    /** Seal/stamp image as Base64 data URL or file path */
    seal?: string;
    /** Custom font as Base64 or file path */
    font?: string;
  };
}

/**
 * Organization information (invoice sender)
 */
export interface OrganizationInfo {
  name: string;
  postalCode: string;
  address: string;
  phone: string;
  fax?: string;
  registrationNumber?: string;
}

/**
 * Bank account information
 */
export interface BankInfo {
  bankName: string;
  branchName: string;
  accountType: string;
  accountNumber: string;
  accountHolder: string;
}

// =============================================================================
// Invoice PDF Data Types
// =============================================================================

/**
 * Complete data structure for generating invoice PDF
 */
export interface InvoicePDFData {
  /** Invoice number (e.g., "INV-202501-001") */
  invoiceNumber: string;
  /** Sequential display number (e.g., "0001") */
  invoiceNo: string;
  /** Billing month in YYYY-MM format */
  billingMonth: string;
  /** Issue date in YYYY-MM-DD format */
  issueDate: string;

  /** Recipient (branch/store) information */
  recipient: RecipientInfo;

  /** Sender (headquarters) information */
  sender: SenderInfo;

  /** Amount summary */
  amounts: InvoiceAmounts;

  /** Detail sections */
  details: InvoiceDetails;
}

/**
 * Invoice recipient (branch/store) information
 */
export interface RecipientInfo {
  postalCode: string;
  address: string;
  /** Prefecture (for multi-line display) */
  prefecture?: string;
  /** City (for multi-line display) */
  city?: string;
  /** Address line 1 */
  addressLine1?: string;
  /** Address line 2 */
  addressLine2?: string;
  /** Recipient name */
  name: string;
  /** Store/branch code */
  storeCode: string;
  /** Manager name (displayed as "XX様方") */
  managerName?: string;
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
  /** Tax registration number */
  registrationNumber: string;
}

/**
 * Invoice amount summary
 */
export interface InvoiceAmounts {
  /** 前月請求額 (a) - Previous month balance */
  previousBalance: number;
  /** ご入金額 (b) - Payment received */
  payment: number;
  /** ご入金後残額 ① = a - b - Remaining balance after payment */
  remainingBalance: number;
  /** チャイルドクラブ会費 ② - CC membership fee */
  ccMembershipFee: number;
  /** 教材お買い上げ ③ - Material purchases */
  materialDelivery: number;
  /** 教材発送費用 - Material shipping cost */
  materialShipping: number;
  /** 単価×口数 - Unit price × count */
  unitPrice: number;
  /** その他 ④ - Other expenses */
  other: number;
  /** 教材販売割戻し ⑤ - Material sales rebate */
  materialReturn: number;
  /** 調整・ご返金 ⑥ - Adjustment/refund */
  adjustment: number;
  /** 非課税分 ⑦ - Non-taxable amount */
  nonTaxable: number;
  /** 本部発分 - Headquarters deduction */
  headquartersDeduction: number;
  /** 口座振替分 - Bank transfer deduction */
  bankTransferDeduction: number;
  /** 差引き合計額 ⑧ - Subtotal */
  subtotal: number;
  /** 消費税額 ⑨ - Tax amount */
  taxAmount: number;
  /** ご請求額合計 ⑧ + ⑨ - Total amount */
  totalAmount: number;
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
 * CC (Child Club) member detail line item
 */
export interface CCMemberDetail {
  /** Classroom name */
  className: string;
  /** Classroom code (store number) */
  classroomCode: string;
  /** Number of members */
  count: number;
  /** Unit price per member */
  unitPrice: number;
  /** Total amount */
  amount: number;
  /** Delivery destination (last 3 digits of store number) */
  deliveryDate: string;
  /** Invoice amount */
  invoiceAmount: number;
  /** Deduction amount */
  deductionAmount: number;
  /** Is Aigran classroom (eligible for special rebate) */
  isAigran: boolean;
  /** Rebate amount (for Aigran: count × 600) */
  rebateAmount: number;
  /** Is bank transfer classroom */
  isBankTransfer: boolean;
}

/**
 * Material (teaching material) order detail line item
 */
export interface MaterialDetail {
  /** Order date (MM/DD format) */
  date: string;
  /** Slip number (numeric part only) */
  slipNumber: string;
  /** Product name or description */
  productName: string;
  /** Unit price */
  unitPrice: number;
  /** Quantity */
  quantity: number;
  /** Delivery amount */
  amount: number;
  /** Delivery destination ("00" for branch, last 3 digits for classroom) */
  deliveryTo: string;
  /** Invoice amount (only for branch purchases) */
  invoiceAmount: number;
  /** Rebate/deduction amount (margin for classroom purchases) */
  deductionAmount: number;
}

/**
 * Other expense detail line item
 */
export interface OtherExpenseDetail {
  /** Description/summary */
  description: string;
  /** Amount */
  amount: number;
}

// =============================================================================
// Input Data Types (from database or external source)
// =============================================================================

/**
 * Invoice header data from database
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
  /** General price for margin calculation */
  price_retail?: number;
}

/**
 * Expense data from database
 */
export interface ExpenseData {
  item_name: string;
  amount: number;
}

// =============================================================================
// PDF Generation Options
// =============================================================================

/**
 * Options for PDF generation
 */
export interface PDFGenerationOptions {
  /** Show zero-count items in detail section */
  showZero?: boolean;
  /** Puppeteer launch options */
  puppeteerOptions?: {
    headless?: boolean;
    args?: string[];
  };
}
