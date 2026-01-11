/**
 * Invoice PDF Generation
 *
 * This module provides PDF generation capabilities for invoices.
 * Core calculation logic has been moved to @enterprise/domain-settlement.
 */

import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePDFDocument } from "./invoice-pdf-template";

// Import types from domain-settlement for use in this file
import type { InvoicePDFData } from "@enterprise/domain-settlement";

// =============================================================================
// PDF Generation Functions
// =============================================================================

/**
 * Generate PDF Buffer using react-pdf
 *
 * @param data - Invoice PDF data
 * @returns PDF buffer
 */
export async function generateInvoicePDFBuffer(
  data: InvoicePDFData
): Promise<Buffer> {
  const document = <InvoicePDFDocument data={data} />;
  const pdfBuffer = await renderToBuffer(document);
  return Buffer.from(pdfBuffer);
}

/**
 * Generate PDF Buffer using Puppeteer (more precise layout)
 *
 * @param data - Invoice PDF data
 * @param showZero - Whether to show zero values
 * @returns PDF buffer
 */
export async function generateInvoicePDFBufferPuppeteer(
  data: InvoicePDFData,
  showZero = false
): Promise<Buffer> {
  const { generateInvoicePDFFromHTML } = await import("./generate-pdf-puppeteer");
  return generateInvoicePDFFromHTML(data, showZero);
}

/**
 * Batch generate PDFs for multiple invoices
 *
 * @param invoices - Array of invoice PDF data
 * @returns Map of invoice number to PDF buffer
 */
export async function generateBatchInvoicePDFs(
  invoices: InvoicePDFData[]
): Promise<Map<string, Buffer>> {
  const results = new Map<string, Buffer>();

  for (const invoice of invoices) {
    const buffer = await generateInvoicePDFBuffer(invoice);
    results.set(invoice.invoiceNumber, buffer);
  }

  return results;
}
