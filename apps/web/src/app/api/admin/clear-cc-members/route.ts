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
    console.error("Error in GET /api/admin/clear-cc-members:", error);
    return NextResponse.json({ hasPermission: false });
  }
}
