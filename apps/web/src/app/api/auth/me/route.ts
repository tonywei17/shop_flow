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

    // Fetch role name if role_id exists
    let roleName: string | null = null;
    if ((account as any).role_id) {
      const { data: role } = await sb
        .from("roles")
        .select("name")
        .eq("id", (account as any).role_id)
        .limit(1)
        .maybeSingle();
      roleName = (role as any)?.name ?? null;
    }

    const user: CurrentUser = {
      id: (account as any).id,
      accountId: (account as any).account_id,
      displayName: (account as any).display_name,
      email: (account as any).email,
      phone: (account as any).phone,
      avatarUrl: (account as any).avatar_url,
      departmentId: (account as any).department_id,
      departmentName: (account as any).department_name,
      roleId: (account as any).role_id,
      roleCode: (account as any).role_code,
      roleName,
    };

    return NextResponse.json({ user });
  } catch (error) {
    console.error("[auth/me] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
