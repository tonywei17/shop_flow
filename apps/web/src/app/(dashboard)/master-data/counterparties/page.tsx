import { Suspense } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { listCounterparties } from "@enterprise/db";
import { CounterpartiesClient } from "./counterparties-client";
import type { MasterPagination } from "../account-items/account-items-client";

type CounterpartiesSearchParams = {
  page?: string;
  limit?: string;
  q?: string;
};

type CounterpartiesPageProps = {
  searchParams?: Promise<CounterpartiesSearchParams>;
};

export default async function CounterpartiesPage({
  searchParams,
}: CounterpartiesPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  const pageParam = Number(resolvedSearchParams?.page);
  const limitParam = Number(resolvedSearchParams?.limit);

  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(Math.floor(limitParam), 100) : 20;
  const search = resolvedSearchParams?.q?.trim();
  const offset = (page - 1) * limit;

  const { items, count } = await listCounterparties({ limit, offset, search }).catch((error) => {
    console.error("Failed to load counterparties from Supabase on counterparties page", error);
    return { items: [], count: 0 };
  });

  const pagination: MasterPagination = {
    page,
    limit,
    count,
    search: search ?? "",
  };

  return (
    <div className="space-y-6">
      <DashboardHeader title="相手先" />
      <Suspense fallback={null}>
        <CounterpartiesClient items={items} pagination={pagination} />
      </Suspense>
    </div>
  );
}
