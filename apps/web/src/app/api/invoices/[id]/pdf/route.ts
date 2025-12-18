import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@enterprise/db";
import {
  generateInvoicePDFBufferPuppeteer,
  transformInvoiceData,
  generateInvoiceNo,
} from "@/lib/pdf/generate-invoice-pdf";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();

    // 获取请求书数据
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
          address_line2
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

    // 获取CC会员数据
    const branchCode = department?.store_code?.substring(0, 4);
    const { data: ccMembers } = await supabase
      .from("cc_members")
      .select("class_name, total_count, unit_price, total_amount")
      .eq("billing_month", invoice.billing_month)
      .eq("branch_code", branchCode)
      .eq("is_excluded", false)
      .eq("is_bank_transfer", false);

    // 获取教材订单数据
    const { data: materials } = await supabase
      .from("order_items")
      .select(`
        quantity,
        unit_price,
        total_price,
        product:products(name),
        order:orders(created_at, order_number)
      `)
      .eq("orders.user_id", department?.id)
      .gte("orders.created_at", `${invoice.billing_month}-01`)
      .lt("orders.created_at", getNextMonth(invoice.billing_month));

    // 获取其他费用数据
    const { data: expenses } = await supabase
      .from("expenses")
      .select("item_name, amount")
      .eq("store_code", department?.store_code)
      .eq("invoice_month", invoice.billing_month)
      .eq("review_status", "approved");

    // 转换数据
    const pdfData = transformInvoiceData(
      {
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        billing_month: invoice.billing_month,
        previous_balance: invoice.previous_balance || 0,
        material_amount: invoice.material_amount || 0,
        membership_amount: invoice.membership_amount || 0,
        other_expenses_amount: invoice.other_expenses_amount || 0,
        subtotal: invoice.subtotal || 0,
        tax_amount: invoice.tax_amount || 0,
        total_amount: invoice.total_amount || 0,
        department: {
          id: department?.id || "",
          name: department?.name || "",
          store_code: department?.store_code || "",
          postal_code: department?.postal_code,
          address: department?.address,
        },
      },
      invoiceNo,
      (ccMembers || []).map((m: { class_name: string; total_count: number; unit_price: number; total_amount: number }) => ({
        class_name: m.class_name,
        total_count: m.total_count,
        unit_price: m.unit_price || 480,
        total_amount: m.total_amount,
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
      (expenses || []).map((e: { item_name: string; amount: number }) => ({
        item_name: e.item_name,
        amount: e.amount,
      })),
      invoice.previous_balance || 0 // 假设全额支付
    );

    // 生成PDF (使用Puppeteer)
    const pdfBuffer = await generateInvoicePDFBufferPuppeteer(pdfData);

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
