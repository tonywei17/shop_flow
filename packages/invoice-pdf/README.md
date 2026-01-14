# @enterprise/invoice-pdf

A standalone, configurable invoice PDF generation library for Japanese business invoices.

## Features

- Generate professional Japanese invoice PDFs (請求書)
- Configurable business rules (tax rate, CC fees, material rebates)
- Customizable organization and bank information
- Support for custom logos and seals
- Batch PDF generation with efficient browser reuse
- TypeScript support with full type definitions
- **Preset configuration for リトミック研究センター**

## Installation

```bash
npm install @enterprise/invoice-pdf puppeteer
# or
pnpm add @enterprise/invoice-pdf puppeteer
# or
yarn add @enterprise/invoice-pdf puppeteer
```

## Quick Start (リトミック研究センター)

For the same company (リトミック研究センター), use the one-line setup:

```typescript
import { configureRhythmic, generateInvoicePDF, createInvoicePDFData } from '@enterprise/invoice-pdf';
import path from 'path';

// One-line setup with preset configuration
// Point to the assets directory containing logo.jpg and seal.jpg
configureRhythmic(path.join(__dirname, '../assets'));

// Create invoice data and generate PDF
const invoiceData = createInvoicePDFData({
  invoiceNo: "0001",
  billingMonth: "2025-01",
  recipient: {
    postalCode: "530-0001",
    prefecture: "大阪府",
    city: "大阪市北区",
    addressLine1: "梅田1-1-1",
    name: "田中太郎",
    storeCode: "1110000",
  },
  amounts: {
    previousBalance: 0,
    payment: 0,
    remainingBalance: 0,
    ccMembershipFee: 4800,
    materialDelivery: 10000,
    materialShipping: 0,
    unitPrice: 0,
    other: 0,
    materialReturn: 0,
    adjustment: 0,
    nonTaxable: 0,
    headquartersDeduction: 0,
    bankTransferDeduction: 0,
    subtotal: 14800,
    taxAmount: 1480,
    totalAmount: 16280,
  },
  details: {
    ccMembers: [],
    materials: [],
    otherExpenses: [],
  },
});

const pdfBuffer = await generateInvoicePDF(invoiceData);
```

## Directory Structure

```
your-project/
├── assets/
│   ├── logo.jpg    # Company logo (36x45px recommended)
│   └── seal.jpg    # Company seal (90x90px recommended)
├── src/
│   └── your-code.ts
└── package.json
```

Copy the `assets` folder from this package to your project to use the original logo and seal images.

## Preset Configuration

### リトミック研究センター Preset

The package includes preset configuration for リトミック研究センター:

```typescript
import {
  RHYTHMIC_ORGANIZATION,
  RHYTHMIC_BANK_INFO,
  RHYTHMIC_CONFIG,
} from '@enterprise/invoice-pdf';

// Organization Info
console.log(RHYTHMIC_ORGANIZATION);
// {
//   name: "特定非営利活動法人\nリトミック研究センター",
//   postalCode: "〒151-0051",
//   address: "東京都渋谷区千駄ヶ谷1丁目30番8号\nダヴィンチ千駄ヶ谷1階5号室",
//   phone: "03-5411-3815",
//   fax: "03-5411-3816",
//   registrationNumber: "T6011005001316",
// }

// Bank Info
console.log(RHYTHMIC_BANK_INFO);
// {
//   bankName: "三井住友銀行",
//   branchName: "渋谷駅前支店",
//   accountType: "普通",
//   accountNumber: "0380624",
//   accountHolder: "特定非営利活動法人リトミック研究センター",
// }
```

## Custom Configuration

For other companies, use the full configuration:

```typescript
import { configure, loadAssetsFromDirectory } from '@enterprise/invoice-pdf';

configure({
  taxRate: 0.1,

  // CC (Child Club) fee configuration
  ccFee: {
    defaultUnitPrice: 480,
    aigranUnitPrice: 480,
    aigranRebatePerPerson: 600,
  },

  // Material sales configuration
  material: {
    branchRebateEnabled: false,
    classroomRebateEnabled: true,
  },

  // Organization (sender) information
  organization: {
    name: "Your Company Name",
    postalCode: "100-0001",
    address: "Your Address",
    phone: "03-1234-5678",
    fax: "03-1234-5679",
    registrationNumber: "T1234567890123",
  },

  // Bank account for payment
  bankInfo: {
    bankName: "Your Bank",
    branchName: "Branch Name",
    accountType: "普通",
    accountNumber: "1234567",
    accountHolder: "Account Holder",
  },

  // Assets
  assets: loadAssetsFromDirectory('./assets'),
});
```

## API Reference

### Configuration

#### `configureRhythmic(assetsDir?: string): void`

Quick setup for リトミック研究センター. Loads preset configuration and assets.

```typescript
configureRhythmic('./assets');
```

#### `configure(config: InvoiceConfig): void`

Full configuration for custom settings.

#### `loadAssetsFromDirectory(directory: string): Assets`

Load logo.jpg and seal.jpg from a directory as Base64 data URLs.

#### `loadImageAsBase64(filePath: string): string`

Load a single image file as Base64 data URL.

### PDF Generation

#### `generateInvoicePDF(data: InvoicePDFData, options?: PDFGenerationOptions): Promise<Buffer>`

Generate a single invoice PDF.

```typescript
const pdf = await generateInvoicePDF(invoiceData, {
  showZero: false,  // Show zero-count items
});
```

#### `generateMultipleInvoicePDFs(dataList: InvoicePDFData[], options?): Promise<Map<string, Buffer>>`

Generate multiple PDFs efficiently using a shared browser instance.

#### `InvoicePDFGenerator` class

For maximum efficiency when generating many PDFs:

```typescript
const generator = new InvoicePDFGenerator();
await generator.initialize();

try {
  for (const invoice of invoices) {
    const pdf = await generator.generate(invoice);
    // Process PDF...
  }
} finally {
  await generator.close();
}
```

### Data Transformation

#### `transformInvoiceData(...): InvoicePDFData`

Transform database records into invoice PDF data structure.

#### `createInvoicePDFData(data): InvoicePDFData`

Create invoice data from pre-calculated values.

## Type Definitions

```typescript
import type {
  InvoiceConfig,
  InvoicePDFData,
  CCMemberDetail,
  MaterialDetail,
  OtherExpenseDetail,
  OrganizationInfo,
  BankInfo,
} from '@enterprise/invoice-pdf';
```

## Business Rules

### CC Membership Fee Calculation

- Default unit price: ¥480 per member
- Aigran classroom rebate: ¥600 per person

### Material Sales Calculation

- Branch purchases: Counted as invoice amount
- Classroom purchases: Margin calculated as rebate (retail price - classroom price)

### Tax Calculation

- Tax rate: 10%
- Formula: `⑨ = (② + ③ + ④ - ⑤) × 10%`
- Total: `⑧ + ⑨`

## License

MIT
