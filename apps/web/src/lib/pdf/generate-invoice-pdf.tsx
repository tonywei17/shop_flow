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
  adjustment_amount: number; // 調整・ご返金
  non_taxable_amount: number; // 非課税分
  material_return_amount: number; // 教材販売割戻し
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  department: {
    id: string;
    name: string;
    store_code: string;
    postal_code?: string;
    address?: string;
    // 细分地址字段
    prefecture?: string;
    city?: string;
    address_line1?: string;
    address_line2?: string;
    manager_name?: string; // 責任者名
  };
}

interface CCMemberData {
  class_name: string;
  classroom_code: string;
  total_count: number;
  unit_price: number;
  total_amount: number;
  is_aigran?: boolean; // アイグラン教室かどうか
  is_bank_transfer?: boolean; // 口座振替教室かどうか
}

interface MaterialOrderData {
  order_date: string;
  slip_number: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  amount: number;
  delivery_to?: string; // 纳入先：支局购买"00"，教室购买显示店番后三位
  is_branch_order?: boolean; // 是否是支局购买（用于计算请求额）
  price_retail?: number; // 一般価格（用于计算教室购买的マージン）
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

// 计算发行日期（生成月份的1号，例如12月生成的请求书显示12月1日）
export function calculateIssueDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 当前月份
  return `${year}-${String(month).padStart(2, "0")}-01`;
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
  const issueDate = calculateIssueDate();
  
  // 计算CC会员的总额和割戻し总額
  const AIGRAN_REBATE_UNIT_PRICE = 600;
  const ccMemberTotal = ccMembers.reduce((sum, m) => sum + (m.total_amount || 0), 0); // CC会員ご請求总額
  const aigranRebateTotal = ccMembers.reduce((sum, m) => {
    const isAigran = m.is_aigran || false;
    return sum + (isAigran ? m.total_count * AIGRAN_REBATE_UNIT_PRICE : 0);
  }, 0); // 割戻し总額
  
  // 计算教材相关金额（从教材明细中计算）
  // ③ 教材お買い上げ = 只计算支局购买的订单请求额
  const materialDelivery = materials.reduce((sum, m) => {
    const isBranch = m.is_branch_order === true;
    return sum + (isBranch ? m.amount : 0);
  }, 0);
  // ⑤ 教材販売割戻し = 只计算教室购买的マージン（一般価格 - 教室価格）× 数量
  // 支局购买不返现
  const materialReturn = materials.reduce((sum, m) => {
    const isBranch = m.is_branch_order === true;
    if (isBranch) return sum; // 支局购买不返现
    // 教室购买：マージン = (price_retail - unit_price) × quantity
    const priceRetail = m.price_retail || 0;
    const margin = (priceRetail - m.unit_price) * m.quantity;
    return sum + (margin > 0 ? margin : 0); // 确保マージン不为负数
  }, 0);
  
  // 计算各项金额
  const previousBalance = invoice.previous_balance || 0; // a 前月ご請求額
  const payment = paymentAmount; // b ご入金額
  const remainingBalance = previousBalance - payment; // ① ご入金後残額 = a - b
  const ccMembershipFee = ccMemberTotal - aigranRebateTotal; // ② チャイルドクラブ会費 = ご請求总額 - 割戻し总額
  const materialShipping = 0; // 教材発送費用
  const unitPrice = 0; // 単価×口数
  const other = invoice.other_expenses_amount || 0; // ④ その他（課税分）
  const adjustment = invoice.adjustment_amount || 0; // ⑥ 調整・ご返金
  const nonTaxable = invoice.non_taxable_amount || 0; // ⑦ 非課税分
  const headquartersDeduction = 0; // 本部発分
  const bankTransferDeduction = 0; // 口座振替分
  
  // 差引き合計額 ⑧ = ① + ② + ③ + ④ + ⑦ - ⑤ - ⑥
  const subtotal = remainingBalance + ccMembershipFee + materialDelivery + other + nonTaxable - materialReturn - adjustment;
  
  // 消費税額 ⑨ = (② + ③ + ④ - ⑤) × 10%
  const taxAmount = Math.floor((ccMembershipFee + materialDelivery + other - materialReturn) * 0.1);
  
  // ご請求額 = ⑧ + ⑨
  const totalAmount = subtotal + taxAmount;

  // 转换CC会员明细
  // アイグラン教室の場合：請求480円/人、割戻し600円/人
  // 納入先：店番後三位，支局自己（以000结尾）显示为"00"
  const ccMemberDetails: CCMemberDetail[] = ccMembers.map((member) => {
    const isAigran = member.is_aigran || false;
    const isBankTransfer = member.is_bank_transfer || false;
    const rebateAmount = isAigran ? member.total_count * AIGRAN_REBATE_UNIT_PRICE : 0;
    // 納入先は店番の後三位（例：1110002 → 002）
    // 支局自己（以000结尾）显示为"00"
    const lastThree = member.classroom_code ? member.classroom_code.slice(-3) : "";
    const deliveryCode = lastThree === "000" ? "00" : lastThree;
    return {
      className: member.class_name,
      classroomCode: member.classroom_code || "",
      count: member.total_count,
      unitPrice: member.unit_price || 480,
      amount: member.total_amount,
      deliveryDate: deliveryCode,
      invoiceAmount: member.total_amount,
      deductionAmount: 0,
      isAigran,
      rebateAmount,
      isBankTransfer,
    };
  });

  // 转换教材明细
  // 支局购买：计算请求额，不返现
  // 教室购买：不计算请求额，返现 = (一般価格 - 教室価格) × 数量
  const materialDetails: MaterialDetail[] = materials.map((material) => {
    const isBranchOrder = material.is_branch_order || false;
    // 教室购买时显示一般価格，支局购买时显示实际单价
    const displayUnitPrice = isBranchOrder ? material.unit_price : (material.price_retail || material.unit_price);
    // マージン = (一般価格 - 教室価格) × 数量（只有教室购买才计算）
    const margin = isBranchOrder ? 0 : ((material.price_retail || 0) - material.unit_price) * material.quantity;
    
    return {
      date: material.order_date,
      slipNumber: material.slip_number || "",
      productName: material.product_name,
      unitPrice: displayUnitPrice, // 教室购买显示一般価格
      quantity: material.quantity,
      amount: isBranchOrder ? material.amount : (material.price_retail || material.unit_price) * material.quantity, // 教室购买用一般価格计算纳入额
      deliveryTo: material.delivery_to || "", // 纳入先
      invoiceAmount: isBranchOrder ? material.amount : 0, // 只有支局购买才计算请求额
      deductionAmount: margin, // 返现金额（只有教室购买才计算）
    };
  });

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
      // 细分地址字段（用于换行显示）
      prefecture: invoice.department.prefecture || "",
      city: invoice.department.city || "",
      addressLine1: invoice.department.address_line1 || "",
      addressLine2: invoice.department.address_line2 || "",
      name: invoice.department.name,
      storeCode: invoice.department.store_code,
      managerName: invoice.department.manager_name || "",
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
      materialReturn,
      adjustment,
      nonTaxable,
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
export async function generateInvoicePDFBufferPuppeteer(data: InvoicePDFData, showZero = false): Promise<Buffer> {
  const { generateInvoicePDFFromHTML } = await import("./generate-pdf-puppeteer");
  return generateInvoicePDFFromHTML(data, showZero);
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
