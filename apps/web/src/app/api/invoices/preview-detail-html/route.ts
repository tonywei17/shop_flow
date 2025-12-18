import { NextResponse } from "next/server";
import { generateInvoiceDetailPageHTML } from "@/lib/pdf/invoice-html-template";
import { InvoicePDFData } from "@/lib/pdf/invoice-types";

// Mock data for preview (same as preview-html route)
const mockData: InvoicePDFData = {
  invoiceNumber: "INV-202511-0001",
  invoiceNo: "0001",
  billingMonth: "2024-04",
  issueDate: "2025-12-18",
  recipient: {
    postalCode: "063-0023",
    address: "北海道札幌市西区平和三条7丁目1-14",
    name: "リトミック研究センター北海道第一支局",
    storeCode: "1110000",
  },
  sender: {
    postalCode: "151-0051",
    address: "東京都渋谷区千駄ヶ谷１丁目３０番８号 ダヴィンチ千駄ヶ谷５階",
    name: "特定非営利活動法人リトミック研究センター",
    phone: "03(5786)0095",
    fax: "03(5786)0096",
    registrationNumber: "T6011005001316",
  },
  amounts: {
    previousBalance: 586198,
    payment: 0,
    remainingBalance: 586198,
    ccMembershipFee: 59040,
    materialDelivery: 21600,
    materialShipping: 0,
    unitPrice: 0,
    other: 2400,
    materialReturn: 15040,
    adjustment: 23100,
    nonTaxable: 0,
    headquartersDeduction: 0,
    bankTransferDeduction: 0,
    subtotal: 631098,
    taxAmount: 6800,
    totalAmount: 637898,
  },
  details: {
    ccMembers: [
      { className: "北海道認定教室", count: 2, unitPrice: 480, amount: 960, deliveryDate: "", invoiceAmount: 960, deductionAmount: 0 },
      { className: "北海道認定教室", count: 2, unitPrice: 480, amount: 960, deliveryDate: "", invoiceAmount: 960, deductionAmount: 0 },
      { className: "北海道認定教室", count: 2, unitPrice: 480, amount: 960, deliveryDate: "", invoiceAmount: 960, deductionAmount: 0 },
      { className: "北海道認定教室", count: 2, unitPrice: 480, amount: 960, deliveryDate: "", invoiceAmount: 960, deductionAmount: 0 },
      { className: "北海道認定教室", count: 2, unitPrice: 480, amount: 960, deliveryDate: "", invoiceAmount: 960, deductionAmount: 0 },
      { className: "北海道認定教室", count: 2, unitPrice: 480, amount: 960, deliveryDate: "", invoiceAmount: 960, deductionAmount: 0 },
      { className: "北海道認定教室", count: 2, unitPrice: 480, amount: 960, deliveryDate: "", invoiceAmount: 960, deductionAmount: 0 },
      { className: "北海道認定教室", count: 2, unitPrice: 480, amount: 960, deliveryDate: "", invoiceAmount: 960, deductionAmount: 0 },
      { className: "北海道認定教室", count: 2, unitPrice: 480, amount: 960, deliveryDate: "", invoiceAmount: 960, deductionAmount: 0 },
      { className: "北海道認定教室", count: 2, unitPrice: 480, amount: 960, deliveryDate: "", invoiceAmount: 960, deductionAmount: 0 },
      { className: "北海道認定教室", count: 2, unitPrice: 480, amount: 960, deliveryDate: "", invoiceAmount: 960, deductionAmount: 0 },
      { className: "北海道認定教室", count: 2, unitPrice: 480, amount: 960, deliveryDate: "", invoiceAmount: 960, deductionAmount: 0 },
      { className: "北海道認定教室", count: 2, unitPrice: 480, amount: 960, deliveryDate: "", invoiceAmount: 960, deductionAmount: 0 },
      { className: "北海道認定教室", count: 2, unitPrice: 480, amount: 960, deliveryDate: "", invoiceAmount: 960, deductionAmount: 0 },
      { className: "北海道認定教室", count: 2, unitPrice: 480, amount: 960, deliveryDate: "", invoiceAmount: 960, deductionAmount: 0 },
      { className: "北海道認定教室", count: 2, unitPrice: 480, amount: 960, deliveryDate: "", invoiceAmount: 960, deductionAmount: 0 },
    ],
    materials: [
      { date: "04/24", slipNumber: "40377", productName: "リトミックセット５", unitPrice: 2500, quantity: 1, amount: 2500, deliveryDate: "001", invoiceAmount: 2500, deductionAmount: 250 },
      { date: "04/24", slipNumber: "40377", productName: "リトミックセット５", unitPrice: 2500, quantity: 1, amount: 2500, deliveryDate: "001", invoiceAmount: 2500, deductionAmount: 250 },
      { date: "04/24", slipNumber: "40377", productName: "リトミックセット５", unitPrice: 2500, quantity: 1, amount: 2500, deliveryDate: "001", invoiceAmount: 2500, deductionAmount: 250 },
    ],
    otherExpenses: [],
  },
};

export async function GET() {
  try {
    const html = generateInvoiceDetailPageHTML(mockData, 2);
    
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Error generating detail preview:", error);
    return NextResponse.json(
      { error: "Failed to generate detail preview" },
      { status: 500 }
    );
  }
}
