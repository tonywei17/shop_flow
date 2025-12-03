import React from "react";
import { cookies } from "next/headers";
import { Sidebar } from "@/components/dashboard/sidebar";
import { FeatureGuard } from "@/components/dashboard/feature-guard";
import { getSupabaseAdmin } from "@enterprise/db";
import { navItems, type NavItem } from "@/components/dashboard/nav-items";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let allowedFeatureIds: string[] | undefined;

  try {
    const cookieStore = await cookies();
    const adminAccountId = cookieStore.get("admin_account_id")?.value;

    if (adminAccountId) {
      const sb = getSupabaseAdmin();
      const { data: account } = await sb
        .from("admin_accounts")
        .select("role_code, account_id")
        .eq("id", adminAccountId)
        .limit(1)
        .maybeSingle();

      const roleCode = (account as any)?.role_code as string | null | undefined;
      const accountId = (account as any)?.account_id as string | null | undefined;

      const envAdminId = process.env.ADMIN_LOGIN_ID;
      const isEnvSuperAdmin = envAdminId && adminAccountId === envAdminId;
      const isNamedAdmin = accountId === "admin";
      const isSuperAdmin = Boolean(isEnvSuperAdmin || isNamedAdmin);

      if (isSuperAdmin) {
        // 超级管理者：不过滤任何功能，Sidebar 和 FeatureGuard 都视为全权限
        allowedFeatureIds = undefined;
      } else if (!roleCode) {
        allowedFeatureIds = [];
      } else {
        const { data: role } = await sb
          .from("roles")
          .select("feature_permissions")
          .eq("code", roleCode)
          .limit(1)
          .maybeSingle();

        const raw = (role as any)?.feature_permissions as unknown;
        if (Array.isArray(raw)) {
          const validHrefs = new Set((navItems as NavItem[]).map((item: NavItem) => item.href));
          const safe = raw.filter((value) => typeof value === "string" && validHrefs.has(value));
          allowedFeatureIds = safe;
        } else {
          allowedFeatureIds = undefined;
        }
      }
    }
  } catch {
    allowedFeatureIds = undefined;
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar allowedFeatureIds={allowedFeatureIds} />
      <main className="flex-1 min-w-0 px-0 pb-12 pt-4 md:px-8 md:ml-[268px]">
        <FeatureGuard allowedFeatureIds={allowedFeatureIds}>{children}</FeatureGuard>
      </main>
    </div>
  );
}
