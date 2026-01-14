/**
 * @enterprise/invoice-pdf
 *
 * A standalone, configurable invoice PDF generation library.
 *
 * Features:
 * - Generate professional Japanese invoice PDFs
 * - Configurable business rules (tax rate, CC fees, material rebates)
 * - Customizable organization and bank information
 * - Support for custom logos and seals
 * - Batch PDF generation with efficient browser reuse
 *
 * @example
 * ```typescript
 * import {
 *   configure,
 *   generateInvoicePDF,
 *   transformInvoiceData,
 * } from '@enterprise/invoice-pdf';
 *
 * // Configure once at startup
 * configure({
 *   taxRate: 0.1,
 *   organization: {
 *     name: "株式会社サンプル",
 *     postalCode: "100-0001",
 *     address: "東京都千代田区...",
 *     phone: "03-1234-5678",
 *   },
 *   bankInfo: {
 *     bankName: "三井住友銀行",
 *     branchName: "渋谷支店",
 *     accountType: "普通",
 *     accountNumber: "1234567",
 *     accountHolder: "カ）サンプル",
 *   },
 *   assets: {
 *     logo: "data:image/png;base64,...",
 *     seal: "data:image/png;base64,...",
 *   },
 * });
 *
 * // Transform data and generate PDF
 * const invoiceData = transformInvoiceData(
 *   invoice,
 *   invoiceNo,
 *   ccMembers,
 *   materials,
 *   expenses
 * );
 *
 * const pdfBuffer = await generateInvoicePDF(invoiceData);
 * ```
 *
 * @packageDocumentation
 */

// =============================================================================
// Configuration
// =============================================================================

export {
  // Configuration functions
  configure,
  configureRhythmic,
  getConfig,
  resetConfig,
  getTaxRate,
  getCCFeeConfig,
  getMaterialConfig,
  getOrganization,
  getBankInfo,
  getAssets,

  // Asset loading utilities
  loadImageAsBase64,
  loadAssetsFromDirectory,

  // Default configurations
  DEFAULT_ORGANIZATION,
  DEFAULT_BANK_INFO,
  DEFAULT_CONFIG,

  // Preset for リトミック研究センター
  RHYTHMIC_ORGANIZATION,
  RHYTHMIC_BANK_INFO,
  RHYTHMIC_CONFIG,
} from "./config";

// =============================================================================
// Types
// =============================================================================

export type {
  // Configuration types
  InvoiceConfig,
  OrganizationInfo,
  BankInfo,
  PDFGenerationOptions,

  // Invoice data types
  InvoicePDFData,
  RecipientInfo,
  SenderInfo,
  InvoiceAmounts,
  InvoiceDetails,

  // Detail item types
  CCMemberDetail,
  MaterialDetail,
  OtherExpenseDetail,

  // Input data types (from database)
  InvoiceData,
  DepartmentInfo,
  CCMemberData,
  MaterialOrderData,
  ExpenseData,
} from "./types";

// =============================================================================
// Calculator Functions
// =============================================================================

export {
  // Invoice number generation
  generateInvoiceNo,

  // Date utilities
  calculateIssueDate,
  formatMaterialDate,

  // CC member calculations
  calculateCCMemberTotals,
  transformCCMemberDetails,

  // Material calculations
  calculateMaterialTotals,
  transformMaterialDetails,

  // Expense calculations
  transformExpenseDetails,

  // Main transformation
  transformInvoiceData,
  createInvoicePDFData,
} from "./calculator";

// =============================================================================
// PDF Generation
// =============================================================================

export {
  // Simple generation
  generateInvoicePDF,
  generateMultipleInvoicePDFs,

  // Advanced generation with browser reuse
  InvoicePDFGenerator,

  // HTML preview
  generateInvoiceHTML,
} from "./generator";

// =============================================================================
// Template Functions (for advanced customization)
// =============================================================================

export {
  generateInvoiceMainPageHTML,
  generateInvoiceDetailPageHTML,
  generateFullInvoiceHTML,
} from "./templates/html-template";
