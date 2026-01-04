import { NextResponse } from "next/server";
import { generateFullInvoiceHTML } from "@/lib/pdf/invoice-html-template";
import { InvoicePDFData } from "@/lib/pdf/invoice-types";

const getDefaultBillingMonth = () => {
  const now = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const y = prev.getFullYear();
  const m = String(prev.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};

// 模拟数据用于预览（默认显示上一月分）
const mockData: InvoicePDFData = {
  invoiceNumber: "INV-202511-0001",
  invoiceNo: "0001",
  billingMonth: getDefaultBillingMonth(),
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
      { className: "ベビークラス", classroomCode: "1110001", count: 10, unitPrice: 550, amount: 5500, deliveryDate: "001", invoiceAmount: 5500, deductionAmount: 0, isAigran: false, rebateAmount: 0, isBankTransfer: false },
      { className: "1歳児クラス", classroomCode: "1110002", count: 15, unitPrice: 550, amount: 8250, deliveryDate: "002", invoiceAmount: 8250, deductionAmount: 0, isAigran: false, rebateAmount: 0, isBankTransfer: false },
    ],
    materials: [
      { date: "2025-11-01", slipNumber: "001", productName: "リトミック教材セット", quantity: 5, unitPrice: 3000, amount: 15000, deliveryTo: "00", invoiceAmount: 15000, deductionAmount: 0 },
    ],
    otherExpenses: [
      { description: "イベント参加費", amount: 2400 },
    ],
  },
};

export async function GET() {
  try {
    const html = generateFullInvoiceHTML(mockData, false, true);
    
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Error generating preview:", error);
    return NextResponse.json(
      { error: "プレビュー生成エラー" },
      { status: 500 }
    );
  }
}
