import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@enterprise/db";

export const runtime = "nodejs";

export type CurrentUser = {
  id: string;
  accountId: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  departmentId: string | null;
  departmentName: string | null;
  roleId: string | null;
  roleCode: string | null;
  roleName: string | null;
  roleBadgeColor: string | null;
};

// Type for admin account from database
type AdminAccountRow = {
  id: string;
  account_id: string;
  display_name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  department_id: string | null;
  department_name: string | null;
  role_id: string | null;
  role_code: string | null;
};

// Type for role from database
type RoleRow = {
  name: string;
  badge_color: string | null;
};

export async function GET() {
  try {
    const cookieStore = await cookies();
    const adminAccountId = cookieStore.get("admin_account_id")?.value;

    if (!adminAccountId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const sb = getSupabaseAdmin();

    // Check if this is the env admin
    const envAdminId = process.env.ADMIN_LOGIN_ID;
    if (envAdminId && adminAccountId === envAdminId) {
      // Fetch badge color for admin role from database
      let adminBadgeColor: string | null = null;
      const { data: adminRole } = await sb
        .from("roles")
        .select("badge_color")
        .eq("code", "admin")
        .limit(1)
        .maybeSingle();
      const adminRoleData = adminRole as { badge_color: string | null } | null;
      adminBadgeColor = adminRoleData?.badge_color ?? null;

      // Return default super admin info
      return NextResponse.json({
        user: {
          id: envAdminId,
          accountId: "admin",
          displayName: "システム管理者",
          email: null,
          phone: null,
          avatarUrl: null,
          departmentId: null,
          departmentName: "リトミック本部",
          roleId: null,
          roleCode: "admin",
          roleName: "SuperAdmin",
          roleBadgeColor: adminBadgeColor,
        } satisfies CurrentUser,
      });
    }

    // Fetch account info
    const { data: account, error: accountError } = await sb
      .from("admin_accounts")
      .select(`
        id,
        account_id,
        display_name,
        email,
        phone,
        avatar_url,
        department_id,
        department_name,
        role_id,
        role_code
      `)
      .eq("id", adminAccountId)
      .limit(1)
      .maybeSingle();

    if (accountError || !account) {
      console.error("[auth/me] Failed to fetch account:", accountError);
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const accountData = account as AdminAccountRow;

    // Fetch role name and badge color if role_id exists
    let roleName: string | null = null;
    let roleBadgeColor: string | null = null;
    if (accountData.role_id) {
      const { data: role } = await sb
        .from("roles")
        .select("name, badge_color")
        .eq("id", accountData.role_id)
        .limit(1)
        .maybeSingle();
      const roleData = role as RoleRow | null;
      roleName = roleData?.name ?? null;
      roleBadgeColor = roleData?.badge_color ?? null;
    }

    const user: CurrentUser = {
      id: accountData.id,
      accountId: accountData.account_id,
      displayName: accountData.display_name,
      email: accountData.email,
      phone: accountData.phone,
      avatarUrl: accountData.avatar_url,
      departmentId: accountData.department_id,
      departmentName: accountData.department_name,
      roleId: accountData.role_id,
      roleCode: accountData.role_code,
      roleName,
      roleBadgeColor,
    };

    return NextResponse.json({ user });
  } catch (error) {
    console.error("[auth/me] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
