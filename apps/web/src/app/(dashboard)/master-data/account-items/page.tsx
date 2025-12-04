import { Suspense } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { listAccountItems } from "@enterprise/db";
import { AccountItemsClient, type MasterPagination } from "./account-items-client";

type AccountItemsSearchParams = {
  page?: string;
  limit?: string;
  q?: string;
  sort?: string;
  order?: string;
};

type AccountItemsPageProps = {
  searchParams?: Promise<AccountItemsSearchParams>;
};

export default async function AccountItemsPage({ searchParams }: AccountItemsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  const pageParam = Number(resolvedSearchParams?.page);
  const limitParam = Number(resolvedSearchParams?.limit);

  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(Math.floor(limitParam), 100) : 20;
  const search = resolvedSearchParams?.q?.trim();
  const sortKey = resolvedSearchParams?.sort?.trim();
  const sortOrder = resolvedSearchParams?.order === "desc" ? "desc" : resolvedSearchParams?.order === "asc" ? "asc" : undefined;
  const offset = (page - 1) * limit;

  const { items, count } = await listAccountItems({ limit, offset, search, sortKey, sortOrder }).catch((error) => {
    console.error("Failed to load account items from Supabase on account items page", error);
    return { items: [], count: 0 };
  });

  const pagination: MasterPagination = {
    page,
    limit,
    count,
    search: search ?? "",
    sortKey: sortKey ?? null,
    sortOrder: sortOrder ?? null,
  };

  return (
    <div className="space-y-6">
      <DashboardHeader title="勘定項目" />
      <Suspense fallback={null}>
        <AccountItemsClient items={items} pagination={pagination} />
      </Suspense>
    </div>
  );
}
