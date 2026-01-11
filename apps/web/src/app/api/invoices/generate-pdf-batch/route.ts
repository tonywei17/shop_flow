import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@enterprise/db";
import JSZip from "jszip";
import {
  generateInvoicePDFBuffer,
  transformInvoiceData,
  generateInvoiceNo,
} from "@/lib/pdf";

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    
    const { billing_month, invoice_ids } = body;
    
    if (!billing_month && !invoice_ids) {
      return NextResponse.json(
        { error: "billing_month または invoice_ids が必要です" },
        { status: 400 }
      );
    }

    // 获取请求书列表
    let query = supabase
      .from("invoices")
      .select(`
        *,
        department:departments(
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
      .eq("is_current", true);

    if (invoice_ids && invoice_ids.length > 0) {
      query = query.in("id", invoice_ids);
    } else if (billing_month) {
      query = query.eq("billing_month", billing_month);
    }

    const { data: invoices, error: invoicesError } = await query.order("department(store_code)");

    if (invoicesError || !invoices || invoices.length === 0) {
      return NextResponse.json(
        { error: "請求書が見つかりません" },
        { status: 404 }
      );
    }

    // 获取所有store_code用于生成编号
    const allStoreCodes = invoices
      .map((inv) => {
        const dept = inv.department as { store_code?: string } | null;
        return dept?.store_code;
      })
      .filter((code): code is string => Boolean(code))
      .sort();

    // 创建ZIP文件
    const zip = new JSZip();
    const results: { invoice_id: string; invoice_number: string; status: string; error?: string }[] = [];

    for (const invoice of invoices) {
      try {
        const dept = invoice.department as { 
          id?: string; 
          name?: string; 
          store_code?: string;
          postal_code?: string;
          prefecture?: string;
          city?: string;
          address_line1?: string;
          address_line2?: string;
          manager_name?: string;
        } | null;

        const invoiceNo = generateInvoiceNo(
          dept?.store_code || "",
          allStoreCodes
        );

        // 获取CC会员数据
        const branchCode = dept?.store_code?.substring(0, 4);
        const { data: ccMembers } = await supabase
          .from("cc_members")
          .select("class_name, total_count, unit_price, total_amount")
          .eq("billing_month", invoice.billing_month)
          .eq("branch_code", branchCode)
          .eq("is_excluded", false)
          .eq("is_bank_transfer", false);

        // 获取其他费用数据
        const { data: expenses } = await supabase
          .from("expenses")
          .select("item_name, amount")
          .eq("store_code", dept?.store_code)
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
            adjustment_amount: invoice.adjustment_amount || 0,
            non_taxable_amount: invoice.non_taxable_amount || 0,
            material_return_amount: invoice.material_return_amount || 0,
            subtotal: invoice.subtotal || 0,
            tax_amount: invoice.tax_amount || 0,
            total_amount: invoice.total_amount || 0,
            department: {
              id: dept?.id || "",
              name: dept?.name || "",
              store_code: dept?.store_code || "",
              postal_code: dept?.postal_code,
              address: [dept?.prefecture, dept?.city, dept?.address_line1, dept?.address_line2].filter(Boolean).join(""),
              // 细分地址字段
              prefecture: dept?.prefecture || "",
              city: dept?.city || "",
              address_line1: dept?.address_line1 || "",
              address_line2: dept?.address_line2 || "",
              manager_name: dept?.manager_name || "",
            },
          },
          invoiceNo,
          (ccMembers || []).map((m: { class_name: string; classroom_code?: string; total_count: number; unit_price: number; total_amount: number; is_aigran?: boolean; is_bank_transfer?: boolean }) => ({
            class_name: m.class_name,
            classroom_code: m.classroom_code || "",
            total_count: m.total_count,
            unit_price: m.unit_price || 480,
            total_amount: m.total_amount,
            is_aigran: m.is_aigran || false,
            is_bank_transfer: m.is_bank_transfer || false,
          })),
          [], // materials - 暂时为空
          (expenses || []).map((e: { item_name: string; amount: number }) => ({
            item_name: e.item_name,
            amount: e.amount,
          })),
          invoice.previous_balance || 0
        );

        // 生成PDF
        const pdfBuffer = await generateInvoicePDFBuffer(pdfData);
        
        // 添加到ZIP
        const fileName = `${dept?.store_code || "unknown"}_${invoice.invoice_number}.pdf`;
        zip.file(fileName, pdfBuffer);

        results.push({
          invoice_id: invoice.id,
          invoice_number: invoice.invoice_number,
          status: "success",
        });
      } catch (error) {
        console.error(`Error generating PDF for invoice ${invoice.id}:`, error);
        results.push({
          invoice_id: invoice.id,
          invoice_number: invoice.invoice_number,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // 生成ZIP文件
    const zipBuffer = await zip.generateAsync({ type: "arraybuffer" });

    // 返回ZIP文件
    const successCount = results.filter((r) => r.status === "success").length;
    const errorCount = results.filter((r) => r.status === "error").length;

    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="invoices_${billing_month || "batch"}.zip"`,
        "X-Success-Count": String(successCount),
        "X-Error-Count": String(errorCount),
      },
    });
  } catch (error) {
    console.error("Error generating batch PDFs:", error);
    return NextResponse.json(
      { error: "PDF一括生成中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
