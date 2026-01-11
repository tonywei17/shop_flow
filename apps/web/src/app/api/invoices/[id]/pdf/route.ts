import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@enterprise/db";
import {
  generateInvoicePDFBufferPuppeteer,
  transformInvoiceData,
  generateInvoiceNo,
} from "@/lib/pdf";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const showZero = searchParams.get("showZero") === "true";
    const supabase = getSupabaseAdmin();

    // 获取请求书数据（包含责任者名称）
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select(`
        *,
        departments(
          id,
          name,
          store_code,
          postal_code,
          prefecture,
          city,
          address_line1,
          address_line2,
          manager_name
        )
      `)
      .eq("id", id)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: "請求書が見つかりません", details: invoiceError?.message },
        { status: 404 }
      );
    }

    // 获取department数据（可能是数组或对象）
    const deptData = Array.isArray(invoice.departments) 
      ? invoice.departments[0] 
      : invoice.departments;
    
    // 组合地址
    const department = deptData ? {
      ...deptData,
      address: [deptData.prefecture, deptData.city, deptData.address_line1, deptData.address_line2]
        .filter(Boolean)
        .join("")
    } : null;

    // 获取上月请求书的总额（前月ご請求額）
    const previousMonth = getPreviousMonth(invoice.billing_month);
    const { data: previousInvoice } = await supabase
      .from("invoices")
      .select("total_amount")
      .eq("department_id", invoice.department_id)
      .eq("billing_month", previousMonth)
      .eq("is_current", true)
      .single();
    
    const previousBalance = previousInvoice?.total_amount || 0;

    // 获取同月所有支局的store_code用于生成编号
    const { data: allInvoices } = await supabase
      .from("invoices")
      .select("department:departments(store_code)")
      .eq("billing_month", invoice.billing_month)
      .eq("is_current", true);

    const allStoreCodes = (allInvoices || [])
      .map((inv: Record<string, unknown>) => {
        const dept = inv.department as { store_code?: string } | { store_code?: string }[] | null;
        if (Array.isArray(dept)) {
          return dept[0]?.store_code;
        }
        return dept?.store_code;
      })
      .filter((code): code is string => Boolean(code));

    const invoiceNo = generateInvoiceNo(
      department?.store_code || "",
      allStoreCodes
    );

    // 获取CC会员数据（非口座振替，排除is_excluded）
    const branchCode = department?.store_code?.substring(0, 4);
    const { data: normalCcMembers } = await supabase
      .from("cc_members")
      .select("classroom_name, classroom_code, total_count, unit_price, amount, is_aigran, is_bank_transfer")
      .eq("billing_month", invoice.billing_month)
      .eq("branch_code", branchCode)
      .eq("is_excluded", false)
      .eq("is_bank_transfer", false);

    // 获取口座振替教室数据（不受is_excluded影响，因为口座振替教室需要在请求书中显示）
    const { data: bankTransferCcMembers } = await supabase
      .from("cc_members")
      .select("classroom_name, classroom_code, total_count, unit_price, amount, is_aigran, is_bank_transfer")
      .eq("billing_month", invoice.billing_month)
      .eq("branch_code", branchCode)
      .eq("is_bank_transfer", true)
      .gt("total_count", 0);

    // 合并所有CC会员数据并按classroom_code排序（納入先从小到大）
    const ccMembers = [...(normalCcMembers || []), ...(bankTransferCcMembers || [])].sort(
      (a, b) => (a.classroom_code || "").localeCompare(b.classroom_code || "")
    );

    // 筛选口座振替教室数据（用于その他お取引部分）
    const bankTransferMembers = bankTransferCcMembers || [];

    // 获取教材订单数据（只获取请求书支付方式的订单，排除Stripe已支付的订单）
    // payment_method: null/bank_transfer = 请求书支付, stripe = 在线支付
    const { data: materials } = await supabase
      .from("order_items")
      .select(`
        quantity,
        unit_price,
        total_price,
        product:products(name),
        order:orders(created_at, order_number, payment_method, payment_status)
      `)
      .eq("orders.user_id", department?.id)
      .gte("orders.created_at", `${invoice.billing_month}-01`)
      .lt("orders.created_at", getNextMonth(invoice.billing_month))
      .or("orders.payment_method.is.null,orders.payment_method.eq.bank_transfer,orders.payment_method.eq.invoice");

    // 获取其他费用数据（按费用类型分类）
    // 支局请求书只计算支局本身的费用（精确匹配store_code），不包括底下教室的费用
    const { data: allExpenses } = await supabase
      .from("expenses")
      .select("description, amount, expense_type")
      .eq("store_code", department?.store_code)
      .eq("invoice_month", invoice.billing_month)
      .eq("review_status", "approved");

    // 按费用类型分类
    const taxableExpenses = (allExpenses || []).filter((e: { expense_type: string }) => e.expense_type === "課税分");
    const nonTaxableExpenses = (allExpenses || []).filter((e: { expense_type: string }) => e.expense_type === "非課税分");
    const adjustmentExpenses = (allExpenses || []).filter((e: { expense_type: string }) => e.expense_type === "調整・返金");

    // 计算各类费用总额
    const taxableTotal = taxableExpenses.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0);
    const nonTaxableTotal = nonTaxableExpenses.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0);
    const adjustmentTotal = adjustmentExpenses.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0);

    // 将口座振替教室数据转换为その他お取引格式
    // 格式：X月度チャイルドクラブ会費(口座振替分)(店番后三位)Y名分@600
    const billingMonthNum = invoice.billing_month.split("-")[1].replace(/^0/, ""); // 去掉前导0
    const bankTransferExpenses = (bankTransferMembers || []).map((m: { classroom_code: string; total_count: number; amount: number }) => {
      const storeCodeSuffix = m.classroom_code.slice(-3); // 店番后三位
      return {
        description: `${billingMonthNum}月度チャイルドクラブ会費(口座振替分)(${storeCodeSuffix})${m.total_count}名分@600`,
        amount: -(m.total_count * 600), // 口座振替单价600円（负数，因为是已收款项）
      };
    });

    // 合并所有费用用于明细显示（口座振替教室 + 課税分费用）
    const expenses = [...bankTransferExpenses, ...taxableExpenses];

    // 计算口座振替教室的负数总额
    const bankTransferTotal = bankTransferExpenses.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0);

    // 转换数据
    const pdfData = transformInvoiceData(
      {
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        billing_month: invoice.billing_month,
        previous_balance: previousBalance, // 使用上月请求书总额
        material_amount: invoice.material_amount || 0,
        membership_amount: invoice.membership_amount || 0,
        other_expenses_amount: taxableTotal + bankTransferTotal, // 課税分总额 + 口座振替负数
        adjustment_amount: adjustmentTotal, // 調整・返金总额
        non_taxable_amount: nonTaxableTotal, // 非課税分总额
        material_return_amount: invoice.material_return_amount || 0, // 教材販売割戻し
        subtotal: invoice.subtotal || 0,
        tax_amount: invoice.tax_amount || 0,
        total_amount: invoice.total_amount || 0,
        department: {
          id: department?.id || "",
          name: department?.name || "",
          store_code: department?.store_code || "",
          postal_code: department?.postal_code,
          address: department?.address,
          // 细分地址字段
          prefecture: deptData?.prefecture || "",
          city: deptData?.city || "",
          address_line1: deptData?.address_line1 || "",
          address_line2: deptData?.address_line2 || "",
          manager_name: department?.manager_name || "",
        },
      },
      invoiceNo,
      (ccMembers || []).map((m: { classroom_name: string; classroom_code: string; total_count: number; unit_price: number; amount: number; is_aigran?: boolean; is_bank_transfer?: boolean }) => ({
        class_name: m.classroom_name,
        classroom_code: m.classroom_code,
        total_count: m.total_count,
        unit_price: m.unit_price || 480, // 所有教室使用正常单价480円
        total_amount: m.is_bank_transfer ? m.total_count * 480 : m.amount, // 口座振替教室使用480円计算
        is_aigran: m.is_aigran || false,
        is_bank_transfer: m.is_bank_transfer || false,
      })),
      (materials || []).map((m: Record<string, unknown>) => {
        const order = Array.isArray(m.order) ? m.order[0] : m.order;
        const product = Array.isArray(m.product) ? m.product[0] : m.product;
        return {
          order_date: (order as { created_at?: string })?.created_at?.split("T")[0] || "",
          slip_number: (order as { order_number?: string })?.order_number || "",
          product_name: (product as { name?: string })?.name || "",
          unit_price: m.unit_price as number,
          quantity: m.quantity as number,
          amount: m.total_price as number,
        };
      }),
      (expenses || []).map((e: { description: string; amount: number }) => ({
        item_name: e.description,
        amount: e.amount,
      })),
      0 // 入金額（Stripe接入后从Stripe获取）
    );

    // 生成PDF (使用Puppeteer)
    const pdfBuffer = await generateInvoicePDFBufferPuppeteer(pdfData, showZero);

    // 返回PDF文件 - 使用inline以便在浏览器中预览
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${invoice.invoice_number}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    return NextResponse.json(
      { error: "PDF生成中にエラーが発生しました" },
      { status: 500 }
    );
  }
}

function getNextMonth(billingMonth: string): string {
  const [year, month] = billingMonth.split("-").map(Number);
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  return `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;
}

function getPreviousMonth(billingMonth: string): string {
  const [year, month] = billingMonth.split("-").map(Number);
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  return `${prevYear}-${String(prevMonth).padStart(2, "0")}`;
}
