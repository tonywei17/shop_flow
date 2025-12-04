import { Suspense } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { listAdminAccounts, listRoles, listDepartments } from "@enterprise/db";
import { AccountClient } from "./account-client";

type AccountPageSearchParams = {
  page?: string;
  limit?: string;
  q?: string;
  scope?: string;
  status?: string;
};

type AccountPageProps = {
  searchParams?: Promise<AccountPageSearchParams>;
};

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  const pageParam = Number(resolvedSearchParams?.page);
  const limitParam = Number(resolvedSearchParams?.limit);

  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(Math.floor(limitParam), 100) : 20;
  const search = resolvedSearchParams?.q?.trim();
  const scope = resolvedSearchParams?.scope?.trim();
  const status = resolvedSearchParams?.status?.trim();
  const offset = (page - 1) * limit;

  const [accountsResult, rolesResult, departmentsResult] = await Promise.all([
    listAdminAccounts({ limit, offset, search, scope, status }).catch((error) => {
      console.error("Failed to load admin accounts from Supabase on account page", error);
      return { accounts: [], count: 0 };
    }),
    listRoles({ limit: 1000 }).catch((error) => {
      console.error("Failed to load roles from Supabase on account page", error);
      return { roles: [], count: 0 };
    }),
    listDepartments({ limit: 1000 }).catch((error) => {
      console.error("Failed to load departments from Supabase on account page", error);
      return { departments: [], count: 0 };
    }),
  ]);

  const { accounts, count } = accountsResult;
  const { roles } = rolesResult;
  const { departments } = departmentsResult;

  return (
    <div className="space-y-6">
      <DashboardHeader title="アカウント管理" />
      <Suspense fallback={null}>
        <AccountClient
          accounts={accounts}
          roles={roles}
          departments={departments}
          pagination={{ page, limit, count, search: search ?? "", scope: scope ?? "", status: status ?? "" }}
        />
      </Suspense>
    </div>
  );
}
