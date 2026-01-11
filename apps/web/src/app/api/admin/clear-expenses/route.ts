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

    // Build query conditions for expenses
    let expensesQuery = supabase.from("expenses").select("id", { count: "exact" });

    if (!clear_all && billing_month) {
      // Filter by invoice_month (the billing period for expenses)
      expensesQuery = expensesQuery.eq("invoice_month", billing_month);
    }

    // Get count of records to delete
    const { count: expensesCount, error: fetchError } = await expensesQuery;

    if (fetchError) {
      return NextResponse.json(
        { error: "その他費用データの取得に失敗しました" },
        { status: 500 }
      );
    }

    if (!expensesCount || expensesCount === 0) {
      return NextResponse.json({
        success: true,
        message: "削除対象のその他費用データがありません",
        deleted_count: 0,
      });
    }

    // Delete expenses records
    let deleteQuery = supabase.from("expenses").delete();

    if (!clear_all && billing_month) {
      deleteQuery = deleteQuery.eq("invoice_month", billing_month);
    } else {
      // Delete all - need to use a condition that matches all records
      deleteQuery = deleteQuery.gte("id", "00000000-0000-0000-0000-000000000000");
    }

    const { error: deleteError } = await deleteQuery;

    if (deleteError) {
      return NextResponse.json(
        { error: "その他費用データの削除に失敗しました: " + deleteError.message },
        { status: 500 }
      );
    }

    // Log the operation
    const userAgent = request.headers.get("user-agent") || "";
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor?.split(",")[0] || "unknown";

    await supabase.from("system_audit_log").insert({
      action_type: "CLEAR_EXPENSES_DATA",
      action_description: clear_all
        ? "全てのその他費用データを削除しました"
        : `${billing_month} のその他費用データを削除しました`,
      affected_table: "expenses",
      affected_count: expensesCount,
      performed_by_name: adminInfo.name,
      performed_by_role: adminInfo.role,
      ip_address: ipAddress,
      user_agent: userAgent,
      metadata: {
        billing_month: billing_month || "all",
        clear_all,
        operator_name: operator_name.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      message: clear_all
        ? `全てのその他費用データ（${expensesCount}件）を削除しました`
        : `${billing_month} のその他費用データ（${expensesCount}件）を削除しました`,
      deleted_count: expensesCount,
    });
  } catch (error) {
    console.error("Error in POST /api/admin/clear-expenses:", error);
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
    console.error("Error in GET /api/admin/clear-expenses:", error);
    return NextResponse.json({ hasPermission: false });
  }
}
