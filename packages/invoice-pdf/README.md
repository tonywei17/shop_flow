# @enterprise/invoice-pdf

A standalone, configurable invoice PDF generation library for Japanese business invoices.

## Features

- Generate professional Japanese invoice PDFs (請求書)
- Configurable business rules (tax rate, CC fees, material rebates)
- Customizable organization and bank information
- Support for custom logos and seals
- Batch PDF generation with efficient browser reuse
- TypeScript support with full type definitions

## Installation

```bash
npm install @enterprise/invoice-pdf puppeteer
# or
pnpm add @enterprise/invoice-pdf puppeteer
# or
yarn add @enterprise/invoice-pdf puppeteer
```

## Quick Start

```typescript
import {
  configure,
  generateInvoicePDF,
  createInvoicePDFData,
} from '@enterprise/invoice-pdf';
import fs from 'fs';

// 1. Configure once at application startup
configure({
  taxRate: 0.1,
  organization: {
    name: "株式会社サンプル",
    postalCode: "100-0001",
    address: "東京都千代田区丸の内1-1-1",
    phone: "03-1234-5678",
    fax: "03-1234-5679",
    registrationNumber: "T1234567890123",
  },
  bankInfo: {
    bankName: "三井住友銀行",
    branchName: "丸の内支店",
    accountType: "普通",
    accountNumber: "1234567",
    accountHolder: "カ）サンプル",
  },
});

// 2. Create invoice data
const invoiceData = createInvoicePDFData({
  invoiceNo: "0001",
  billingMonth: "2025-01",
  recipient: {
    postalCode: "530-0001",
    address: "大阪府大阪市北区梅田1-1-1",
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
    ccMembers: [
      {
        className: "リトミック教室A",
        classroomCode: "1110001",
        count: 10,
        unitPrice: 480,
        amount: 4800,
        deliveryDate: "001",
        invoiceAmount: 4800,
        deductionAmount: 0,
        isAigran: false,
        rebateAmount: 0,
        isBankTransfer: false,
      },
    ],
    materials: [],
    otherExpenses: [],
  },
});

// 3. Generate PDF
const pdfBuffer = await generateInvoicePDF(invoiceData);
fs.writeFileSync('invoice.pdf', pdfBuffer);
```

## Configuration

### Full Configuration Options

```typescript
import { configure } from '@enterprise/invoice-pdf';

configure({
  // Tax rate (10% = 0.1)
  taxRate: 0.1,

  // CC (Child Club) fee configuration
  ccFee: {
    defaultUnitPrice: 480,      // Default price per member
    aigranUnitPrice: 480,       // Price for Aigran classrooms
    aigranRebatePerPerson: 600, // Rebate per person for Aigran
  },

  // Material sales configuration
  material: {
    branchRebateEnabled: false,    // Rebate for branch purchases
    classroomRebateEnabled: true,  // Rebate for classroom purchases
  },

  // Organization (sender) information
  organization: {
    name: "株式会社サンプル",
    postalCode: "100-0001",
    address: "東京都千代田区丸の内1-1-1",
    phone: "03-1234-5678",
    fax: "03-1234-5679",
    registrationNumber: "T1234567890123",
  },

  // Bank account for payment
  bankInfo: {
    bankName: "三井住友銀行",
    branchName: "丸の内支店",
    accountType: "普通",
    accountNumber: "1234567",
    accountHolder: "カ）サンプル",
  },

  // Assets (Base64 data URLs or file paths)
  assets: {
    logo: "data:image/png;base64,...",
    seal: "data:image/png;base64,...",
    font: "data:font/ttf;base64,...",
  },
});
```

## API Reference

### Configuration

#### `configure(config: InvoiceConfig): void`

Configure the invoice generator with custom settings. Should be called once at application startup.

#### `getConfig(): InvoiceConfig`

Get the current configuration.

#### `resetConfig(): void`

Reset configuration to defaults.

### PDF Generation

#### `generateInvoicePDF(data: InvoicePDFData, options?: PDFGenerationOptions): Promise<Buffer>`

Generate a single invoice PDF.

```typescript
const pdf = await generateInvoicePDF(invoiceData, {
  showZero: false,  // Show zero-count items
  puppeteerOptions: {
    headless: true,
    args: ['--no-sandbox'],
  },
});
```

#### `generateMultipleInvoicePDFs(dataList: InvoicePDFData[], options?: PDFGenerationOptions): Promise<Map<string, Buffer>>`

Generate multiple PDFs efficiently using a shared browser instance.

```typescript
const pdfs = await generateMultipleInvoicePDFs([invoice1, invoice2, invoice3]);

for (const [invoiceNo, pdfBuffer] of pdfs) {
  fs.writeFileSync(`invoice-${invoiceNo}.pdf`, pdfBuffer);
}
```

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

```typescript
const invoiceData = transformInvoiceData(
  invoiceRecord,    // Invoice header from database
  "0001",           // Invoice number
  ccMembers,        // CC member records
  materials,        // Material order records
  expenses,         // Expense records
  0,                // Payment amount
);
```

#### `createInvoicePDFData(data: Partial<InvoicePDFData>): InvoicePDFData`

Create invoice data from pre-calculated values.

### HTML Preview

#### `generateInvoiceHTML(data: InvoicePDFData, showZero?: boolean): string`

Generate HTML preview for browser display.

## Type Definitions

All types are fully exported and documented:

```typescript
import type {
  InvoiceConfig,
  InvoicePDFData,
  CCMemberDetail,
  MaterialDetail,
  OtherExpenseDetail,
  // ... and more
} from '@enterprise/invoice-pdf';
```

## License

MIT
