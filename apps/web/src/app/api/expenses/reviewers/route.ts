import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@enterprise/db";

// 获取可作为审查者的账号列表
// 包括: admin 账号和本部账号
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    // 获取 admin 账号和本部账号作为审查者选项
    // admin 账号: account_id = 'admin' 或 role 包含管理权限
    // 本部账号: department_name 包含 '本部' 或 store_code 以 '9' 开头（本部店番）
    const { data: accounts, error } = await supabase
      .from("admin_accounts")
      .select(`
        id,
        account_id,
        display_name,
        department_id,
        departments:department_id (
          id,
          name
        )
      `)
      .eq("status", "有効")
      .eq("account_scope", "admin_portal")
      .order("display_name", { ascending: true });

    if (error) {
      console.error("Failed to fetch reviewer accounts:", error);
      return NextResponse.json({ error: "審査者の取得に失敗しました" }, { status: 500 });
    }

    // Filter accounts that can be reviewers:
    // 1. admin account (account_id = 'admin')
    // 2. Accounts with department containing '本部'
    const reviewers = (accounts || []).filter((account) => {
      // Admin account always has review permission
      if (account.account_id === "admin") return true;
      
      // Check if department name contains '本部'
      const deptData = account.departments;
      const dept = Array.isArray(deptData) ? deptData[0] : deptData;
      if (dept && typeof dept === "object" && "name" in dept && typeof dept.name === "string") {
        if (dept.name.includes("本部")) return true;
      }
      
      return false;
    }).map((account) => {
      const deptData = account.departments;
      const dept = Array.isArray(deptData) ? deptData[0] : deptData;
      const deptName = dept && typeof dept === "object" && "name" in dept ? String(dept.name) : null;
      return {
        id: account.id,
        account_id: account.account_id,
        display_name: account.display_name,
        department_name: deptName,
        is_admin: account.account_id === "admin",
      };
    });

    return NextResponse.json({
      reviewers,
      count: reviewers.length,
    });
  } catch (error) {
    console.error("Error fetching reviewers:", error);
    return NextResponse.json(
      { error: "審査者の取得中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
