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

    // Build query conditions for cc_members
    let ccMembersQuery = supabase.from("cc_members").select("id", { count: "exact" });

    if (!clear_all && billing_month) {
      ccMembersQuery = ccMembersQuery.eq("billing_month", billing_month);
    }

    // Get count of records to delete
    const { count: ccMembersCount, error: fetchError } = await ccMembersQuery;

    if (fetchError) {
      return NextResponse.json(
        { error: "CC会員データの取得に失敗しました" },
        { status: 500 }
      );
    }

    if (!ccMembersCount || ccMembersCount === 0) {
      return NextResponse.json({
        success: true,
        message: "削除対象のCC会員データがありません",
        deleted_count: 0,
      });
    }

    // Delete cc_members records
    let deleteQuery = supabase.from("cc_members").delete();

    if (!clear_all && billing_month) {
      deleteQuery = deleteQuery.eq("billing_month", billing_month);
    } else {
      // Delete all - need to use a condition that matches all records
      deleteQuery = deleteQuery.gte("id", "00000000-0000-0000-0000-000000000000");
    }

    const { error: deleteError } = await deleteQuery;

    if (deleteError) {
      return NextResponse.json(
        { error: "CC会員データの削除に失敗しました: " + deleteError.message },
        { status: 500 }
      );
    }

    // Log the operation
    const userAgent = request.headers.get("user-agent") || "";
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor?.split(",")[0] || "unknown";

    await supabase.from("system_audit_log").insert({
      action_type: "CLEAR_CC_MEMBERS_DATA",
      action_description: clear_all
        ? "全てのCC会員データを削除しました"
        : `${billing_month} のCC会員データを削除しました`,
      affected_table: "cc_members",
      affected_count: ccMembersCount,
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
        ? `全てのCC会員データ（${ccMembersCount}件）を削除しました`
        : `${billing_month} のCC会員データ（${ccMembersCount}件）を削除しました`,
      deleted_count: ccMembersCount,
    });
  } catch (error) {
    console.error("Error in POST /api/admin/clear-cc-members:", error);
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
    console.error("Error in GET /api/admin/clear-cc-members:", error);
    return NextResponse.json({ hasPermission: false });
  }
}
