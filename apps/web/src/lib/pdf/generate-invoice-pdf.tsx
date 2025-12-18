import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePDFDocument } from "./invoice-pdf-template";
import {
  InvoicePDFData,
  CCMemberDetail,
  MaterialDetail,
  OtherExpenseDetail,
  HEADQUARTERS_INFO,
} from "./invoice-types";

interface InvoiceData {
  id: string;
  invoice_number: string;
  billing_month: string;
  previous_balance: number;
  material_amount: number;
  membership_amount: number;
  other_expenses_amount: number;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  department: {
    id: string;
    name: string;
    store_code: string;
    postal_code?: string;
    address?: string;
  };
}

interface CCMemberData {
  class_name: string;
  total_count: number;
  unit_price: number;
  total_amount: number;
}

interface MaterialOrderData {
  order_date: string;
  slip_number: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  amount: number;
}

interface ExpenseData {
  item_name: string;
  amount: number;
}

// 生成请求书编号（按店番排序）
export function generateInvoiceNo(storeCode: string, allStoreCodes: string[]): string {
  const sortedCodes = [...allStoreCodes].sort();
  const index = sortedCodes.indexOf(storeCode);
  return String(index + 1).padStart(4, "0");
}

// 计算发行日期（月末+1日）
export function calculateIssueDate(billingMonth: string): string {
  const [year, month] = billingMonth.split("-").map(Number);
  // 下个月的1日
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  return `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;
}

// 转换数据库数据为PDF数据格式
export function transformInvoiceData(
  invoice: InvoiceData,
  invoiceNo: string,
  ccMembers: CCMemberData[],
  materials: MaterialOrderData[],
  expenses: ExpenseData[],
  paymentAmount: number = 0
): InvoicePDFData {
  const issueDate = calculateIssueDate(invoice.billing_month);
  
  // 计算各项金额
  const previousBalance = invoice.previous_balance || 0;
  const payment = paymentAmount;
  const remainingBalance = previousBalance - payment;
  const ccMembershipFee = invoice.membership_amount || 0;
  const materialDelivery = invoice.material_amount || 0;
  const materialShipping = 0; // 需要从订单数据中计算
  const unitPrice = 0; // 需要计算
  const other = invoice.other_expenses_amount || 0;
  const headquartersDeduction = 0; // 本部发分
  const bankTransferDeduction = 0; // 口座振替分
  
  // 差引き合計額 = ① - ② + ③ + ④ + ⑤ - ⑥ - ⑦
  const subtotal = previousBalance - payment + ccMembershipFee + materialDelivery + other - headquartersDeduction - bankTransferDeduction;
  
  // 消費税額 = (③ + ④ - ⑥) × 10%
  const taxAmount = Math.floor((ccMembershipFee + materialDelivery - headquartersDeduction) * 0.1);
  
  const totalAmount = subtotal + taxAmount;

  // 转换CC会员明细
  const ccMemberDetails: CCMemberDetail[] = ccMembers.map((member) => ({
    className: member.class_name,
    count: member.total_count,
    unitPrice: member.unit_price || 480,
    amount: member.total_amount,
    deliveryDate: "",
    invoiceAmount: member.total_amount,
    deductionAmount: 0,
  }));

  // 转换教材明细
  const materialDetails: MaterialDetail[] = materials.map((material) => ({
    date: material.order_date,
    slipNumber: material.slip_number || "",
    productName: material.product_name,
    unitPrice: material.unit_price,
    quantity: material.quantity,
    amount: material.amount,
    deliveryDate: "",
    invoiceAmount: material.amount,
    deductionAmount: 0,
  }));

  // 转换其他费用明细
  const otherExpenseDetails: OtherExpenseDetail[] = expenses.map((expense) => ({
    description: expense.item_name,
    amount: expense.amount,
  }));

  return {
    invoiceNumber: invoice.invoice_number,
    invoiceNo,
    billingMonth: invoice.billing_month,
    issueDate,
    recipient: {
      postalCode: invoice.department.postal_code || "",
      address: invoice.department.address || "",
      name: invoice.department.name,
      storeCode: invoice.department.store_code,
    },
    sender: {
      postalCode: HEADQUARTERS_INFO.postalCode,
      address: HEADQUARTERS_INFO.address,
      name: HEADQUARTERS_INFO.name,
      phone: HEADQUARTERS_INFO.phone,
      fax: HEADQUARTERS_INFO.fax,
      registrationNumber: HEADQUARTERS_INFO.registrationNumber,
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

// 生成PDF Buffer (使用react-pdf)
export async function generateInvoicePDFBuffer(data: InvoicePDFData): Promise<Buffer> {
  const document = <InvoicePDFDocument data={data} />;
  const pdfBuffer = await renderToBuffer(document);
  return Buffer.from(pdfBuffer);
}

// 生成PDF Buffer (使用Puppeteer - 更精确的布局)
export async function generateInvoicePDFBufferPuppeteer(data: InvoicePDFData): Promise<Buffer> {
  const { generateInvoicePDFFromHTML } = await import("./generate-pdf-puppeteer");
  return generateInvoicePDFFromHTML(data);
}

// 批量生成PDF
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
