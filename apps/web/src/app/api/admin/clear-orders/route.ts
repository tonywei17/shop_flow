import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@enterprise/db";
import { cookies } from "next/headers";

// SuperAdmin password for clearing data (should be in env in production)
const CLEAR_DATA_PASSWORD = process.env.ADMIN_CLEAR_DATA_PASSWORD || "CLEAR_TEST_DATA_2025";

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    
    const { password, billing_month, clear_all, operator_name } = body;
    
    // Validate operator name
    if (!operator_name || operator_name.trim().length < 2) {
      return NextResponse.json(
        { error: "操作者の氏名を入力してください（2文字以上）" },
        { status: 400 }
      );
    }
    
    // Validate password
    if (password !== CLEAR_DATA_PASSWORD) {
      return NextResponse.json(
        { error: "パスワードが正しくありません" },
        { status: 403 }
      );
    }
    
    // Get current user from session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session");
    let adminAccountId: string | null = null;
    let adminName = "Unknown";
    let adminRole = "Unknown";
    
    if (sessionCookie) {
      try {
        const sessionData = JSON.parse(
          Buffer.from(sessionCookie.value, "base64").toString()
        );
        const payload = JSON.parse(sessionData.payload);
        adminAccountId = payload.admin_account_id;
        
        // Get admin details
        if (adminAccountId) {
          const { data: adminData } = await supabase
            .from("admin_accounts")
            .select(`
              display_name,
              roles:role_id (
                name,
                code
              )
            `)
            .eq("account_id", adminAccountId)
            .single();
          
          if (adminData) {
            adminName = adminData.display_name || adminAccountId;
            adminRole = (adminData.roles as { code?: string })?.code || "unknown";
          }
        }
      } catch {
        // Session parsing failed
      }
    }
    
    // Check if user is SuperAdmin (role code is "admin" in the database)
    if (adminRole !== "admin") {
      return NextResponse.json(
        { error: "この操作はスーパー管理者のみ実行できます" },
        { status: 403 }
      );
    }
    
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
      performed_by_name: adminName,
      performed_by_role: adminRole,
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
    const supabase = getSupabaseAdmin();
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session");
    
    if (!sessionCookie) {
      return NextResponse.json({ hasPermission: false });
    }
    
    try {
      const sessionData = JSON.parse(
        Buffer.from(sessionCookie.value, "base64").toString()
      );
      const payload = JSON.parse(sessionData.payload);
      const adminAccountId = payload.admin_account_id;
      
      if (!adminAccountId) {
        return NextResponse.json({ hasPermission: false });
      }
      
      const { data: adminData } = await supabase
        .from("admin_accounts")
        .select(`
          roles:role_id (
            code
          )
        `)
        .eq("account_id", adminAccountId)
        .single();
      
      const roleCode = (adminData?.roles as { code?: string })?.code;
      
      return NextResponse.json({
        hasPermission: roleCode === "admin",
        role: roleCode,
      });
    } catch {
      return NextResponse.json({ hasPermission: false });
    }
  } catch (error) {
    console.error("Error in GET /api/admin/clear-orders:", error);
    return NextResponse.json({ hasPermission: false });
  }
}
