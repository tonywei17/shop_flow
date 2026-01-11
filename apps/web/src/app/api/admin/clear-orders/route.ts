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

    // Build query conditions for orders
    let ordersQuery = supabase.from("orders").select("id", { count: "exact" });

    if (!clear_all && billing_month) {
      // Filter by month using created_at
      const startDate = `${billing_month}-01`;
      const endDate = new Date(billing_month + "-01");
      endDate.setMonth(endDate.getMonth() + 1);
      const endDateStr = endDate.toISOString().split("T")[0];

      ordersQuery = ordersQuery
        .gte("created_at", startDate)
        .lt("created_at", endDateStr);
    }

    // Get orders to delete
    const { data: orders, count: ordersCount, error: fetchError } = await ordersQuery;

    if (fetchError) {
      return NextResponse.json(
        { error: "注文データの取得に失敗しました" },
        { status: 500 }
      );
    }

    if (!ordersCount || ordersCount === 0) {
      return NextResponse.json({
        success: true,
        message: "削除対象の注文データがありません",
        deleted_count: 0,
      });
    }

    const orderIds = orders?.map((o) => o.id) || [];

    // Delete order_items first (foreign key constraint)
    if (orderIds.length > 0) {
      const { error: itemsError } = await supabase
        .from("order_items")
        .delete()
        .in("order_id", orderIds);

      if (itemsError) {
        console.error("Error deleting order items:", itemsError);
      }
    }

    // Delete orders
    let deleteQuery = supabase.from("orders").delete();

    if (!clear_all && billing_month) {
      const startDate = `${billing_month}-01`;
      const endDate = new Date(billing_month + "-01");
      endDate.setMonth(endDate.getMonth() + 1);
      const endDateStr = endDate.toISOString().split("T")[0];

      deleteQuery = deleteQuery
        .gte("created_at", startDate)
        .lt("created_at", endDateStr);
    } else {
      deleteQuery = deleteQuery.in("id", orderIds);
    }

    const { error: deleteError } = await deleteQuery;

    if (deleteError) {
      return NextResponse.json(
        { error: "注文データの削除に失敗しました: " + deleteError.message },
        { status: 500 }
      );
    }

    // Log the operation
    const userAgent = request.headers.get("user-agent") || "";
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor?.split(",")[0] || "unknown";

    await supabase.from("system_audit_log").insert({
      action_type: "CLEAR_ORDERS_DATA",
      action_description: clear_all
        ? "全ての注文データを削除しました"
        : `${billing_month} の注文データを削除しました`,
      affected_table: "orders, order_items",
      affected_count: ordersCount,
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
        ? `全ての注文データ（${ordersCount}件）を削除しました`
        : `${billing_month} の注文データ（${ordersCount}件）を削除しました`,
      deleted_count: ordersCount,
    });
  } catch (error) {
    console.error("Error in POST /api/admin/clear-orders:", error);
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
    console.error("Error in GET /api/admin/clear-orders:", error);
    return NextResponse.json({ hasPermission: false });
  }
}
