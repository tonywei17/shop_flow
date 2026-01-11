import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@enterprise/db";
import { validateClearDataRequest, checkAdminPermission } from "@/lib/auth/admin-clear-helper";

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();

    const { password, billing_month, clear_all, operator_name } = body;

    // Validate request and get admin info
    const validation = await validateClearDataRequest(password, operator_name);

    if ("error" in validation) {
      return validation.error;
    }

    const { adminInfo } = validation;
    
    // Build query conditions
    let invoiceQuery = supabase.from("invoices").select("id");
    
    if (!clear_all && billing_month) {
      invoiceQuery = invoiceQuery.eq("billing_month", billing_month);
    }
    
    // Get invoice IDs to delete
    const { data: invoices, error: fetchError } = await invoiceQuery;
    
    if (fetchError) {
      return NextResponse.json(
        { error: "請求書データの取得に失敗しました" },
        { status: 500 }
      );
    }
    
    if (!invoices || invoices.length === 0) {
      return NextResponse.json({
        success: true,
        message: "削除対象の請求書がありません",
        deleted_count: 0,
      });
    }
    
    const invoiceIds = invoices.map((inv) => inv.id);
    
    // Delete invoice items first (foreign key constraint)
    const { error: itemsError } = await supabase
      .from("invoice_items")
      .delete()
      .in("invoice_id", invoiceIds);
    
    if (itemsError) {
      console.error("Error deleting invoice items:", itemsError);
    }
    
    // Delete invoices
    let deleteQuery = supabase.from("invoices").delete();
    
    if (!clear_all && billing_month) {
      deleteQuery = deleteQuery.eq("billing_month", billing_month);
    } else {
      deleteQuery = deleteQuery.in("id", invoiceIds);
    }
    
    const { error: deleteError } = await deleteQuery;
    
    if (deleteError) {
      return NextResponse.json(
        { error: "請求書の削除に失敗しました: " + deleteError.message },
        { status: 500 }
      );
    }
    
    // Log the operation
    const userAgent = request.headers.get("user-agent") || "";
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor?.split(",")[0] || "unknown";
    
    await supabase.from("system_audit_log").insert({
      action_type: "CLEAR_INVOICE_DATA",
      action_description: clear_all
        ? "全ての請求書データを削除しました"
        : `${billing_month} の請求書データを削除しました`,
      affected_table: "invoices, invoice_items",
      affected_count: invoiceIds.length,
      performed_by_name: adminInfo.name,
      performed_by_role: adminInfo.role,
      ip_address: ipAddress,
      user_agent: userAgent,
      metadata: {
        billing_month: billing_month || "all",
        clear_all,
        deleted_invoice_ids: invoiceIds,
        operator_name: operator_name.trim(),
      },
    });
    
    return NextResponse.json({
      success: true,
      message: clear_all 
        ? `全ての請求書データ（${invoiceIds.length}件）を削除しました`
        : `${billing_month} の請求書データ（${invoiceIds.length}件）を削除しました`,
      deleted_count: invoiceIds.length,
    });
  } catch (error) {
    console.error("Error in POST /api/admin/clear-invoices:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint to check if user has permission
export async function GET() {
  try {
    const result = await checkAdminPermission();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in GET /api/admin/clear-invoices:", error);
    return NextResponse.json({ hasPermission: false });
  }
}
