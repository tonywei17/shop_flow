/**
 * @enterprise/invoice-pdf - PDF Generator
 *
 * Generates PDF files from invoice data using Puppeteer.
 */

import puppeteer, { Browser, Page } from "puppeteer";
import type { InvoicePDFData, PDFGenerationOptions } from "./types";
import { generateFullInvoiceHTML } from "./templates/html-template";

// =============================================================================
// PDF Generation Functions
// =============================================================================

/**
 * Generate a single invoice PDF from data.
 *
 * @param data - Invoice PDF data
 * @param options - PDF generation options
 * @returns PDF as a Buffer
 *
 * @example
 * ```typescript
 * import { generateInvoicePDF, configure } from '@enterprise/invoice-pdf';
 *
 * // Configure once at startup
 * configure({
 *   organization: { ... },
 *   bankInfo: { ... },
 * });
 *
 * // Generate PDF
 * const pdfBuffer = await generateInvoicePDF(invoiceData);
 * fs.writeFileSync('invoice.pdf', pdfBuffer);
 * ```
 */
export async function generateInvoicePDF(
  data: InvoicePDFData,
  options: PDFGenerationOptions = {}
): Promise<Buffer> {
  const { showZero = false, puppeteerOptions = {} } = options;

  const html = generateFullInvoiceHTML(data, showZero);

  const browser = await puppeteer.launch({
    headless: puppeteerOptions.headless ?? true,
    args: puppeteerOptions.args ?? ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "networkidle0",
    });

    // Wait for fonts to load
    await page.evaluateHandle("document.fonts.ready");

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0",
      },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

/**
 * Generate multiple invoice PDFs efficiently using a shared browser instance.
 *
 * @param dataList - Array of invoice PDF data
 * @param options - PDF generation options
 * @returns Map of invoice number to PDF buffer
 *
 * @example
 * ```typescript
 * const invoices = [invoice1, invoice2, invoice3];
 * const pdfs = await generateMultipleInvoicePDFs(invoices);
 *
 * for (const [invoiceNo, pdfBuffer] of pdfs) {
 *   fs.writeFileSync(`invoice-${invoiceNo}.pdf`, pdfBuffer);
 * }
 * ```
 */
export async function generateMultipleInvoicePDFs(
  dataList: InvoicePDFData[],
  options: PDFGenerationOptions = {}
): Promise<Map<string, Buffer>> {
  const { showZero = false, puppeteerOptions = {} } = options;
  const results = new Map<string, Buffer>();

  const browser = await puppeteer.launch({
    headless: puppeteerOptions.headless ?? true,
    args: puppeteerOptions.args ?? ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    for (const data of dataList) {
      const html = generateFullInvoiceHTML(data, showZero);
      const page = await browser.newPage();

      await page.setContent(html, {
        waitUntil: "networkidle0",
      });

      await page.evaluateHandle("document.fonts.ready");

      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "0",
          right: "0",
          bottom: "0",
          left: "0",
        },
      });

      results.set(data.invoiceNo, Buffer.from(pdfBuffer));
      await page.close();
    }

    return results;
  } finally {
    await browser.close();
  }
}

// =============================================================================
// Advanced PDF Generation with Browser Reuse
// =============================================================================

/**
 * PDF Generator class for efficient batch processing.
 * Reuses a single browser instance for multiple PDF generations.
 *
 * @example
 * ```typescript
 * const generator = new InvoicePDFGenerator();
 * await generator.initialize();
 *
 * try {
 *   for (const invoice of invoices) {
 *     const pdf = await generator.generate(invoice);
 *     // Process PDF...
 *   }
 * } finally {
 *   await generator.close();
 * }
 * ```
 */
export class InvoicePDFGenerator {
  private browser: Browser | null = null;
  private options: PDFGenerationOptions;

  constructor(options: PDFGenerationOptions = {}) {
    this.options = options;
  }

  /**
   * Initialize the generator by launching the browser.
   */
  async initialize(): Promise<void> {
    const { puppeteerOptions = {} } = this.options;

    this.browser = await puppeteer.launch({
      headless: puppeteerOptions.headless ?? true,
      args: puppeteerOptions.args ?? ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }

  /**
   * Generate a PDF from invoice data.
   * Must call initialize() first.
   */
  async generate(data: InvoicePDFData, showZero = false): Promise<Buffer> {
    if (!this.browser) {
      throw new Error("Generator not initialized. Call initialize() first.");
    }

    const html = generateFullInvoiceHTML(data, showZero);
    const page = await this.browser.newPage();

    try {
      await page.setContent(html, {
        waitUntil: "networkidle0",
      });

      await page.evaluateHandle("document.fonts.ready");

      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "0",
          right: "0",
          bottom: "0",
          left: "0",
        },
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await page.close();
    }
  }

  /**
   * Close the browser and clean up resources.
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

// =============================================================================
// HTML Preview Generation
// =============================================================================

/**
 * Generate HTML preview of the invoice (for browser display).
 *
 * @param data - Invoice PDF data
 * @param showZero - Show zero-count items
 * @returns HTML string
 */
export function generateInvoiceHTML(
  data: InvoicePDFData,
  showZero = false
): string {
  return generateFullInvoiceHTML(data, showZero);
}
