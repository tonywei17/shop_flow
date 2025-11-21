import { DashboardHeader } from "@/components/dashboard/header";
import { listAdminAccounts } from "@enterprise/db";
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
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(Math.floor(limitParam), 50) : 20;
  const search = resolvedSearchParams?.q?.trim();
  const scope = resolvedSearchParams?.scope?.trim();
  const status = resolvedSearchParams?.status?.trim();
  const offset = (page - 1) * limit;

  const { accounts, count } = await listAdminAccounts({ limit, offset, search, scope, status });

  return (
    <div className="space-y-6">
      <DashboardHeader title="アカウント管理" />
      <AccountClient
        accounts={accounts}
        pagination={{ page, limit, count, search: search ?? "", scope: scope ?? "", status: status ?? "" }}
      />
    </div>
  );
}
