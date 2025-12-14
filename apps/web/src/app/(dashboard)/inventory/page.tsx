import { DashboardHeader } from "@/components/dashboard/header";
import { listInventory, type InventoryStatus } from "@enterprise/db";
import { InventoryClient } from "./inventory-client";

type InventorySearchParams = {
  page?: string;
  limit?: string;
  q?: string;
  status?: string;
};

type InventoryPageProps = {
  searchParams?: Promise<InventorySearchParams>;
};

export default async function InventoryPage({ searchParams }: InventoryPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  const pageParam = Number(resolvedSearchParams?.page);
  const limitParam = Number(resolvedSearchParams?.limit);

  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(Math.floor(limitParam), 100) : 20;
  const offset = (page - 1) * limit;

  const search = resolvedSearchParams?.q?.trim();
  const rawStatus = resolvedSearchParams?.status?.trim() as InventoryStatus | undefined;
  const allowedStatuses: InventoryStatus[] = ["all", "ok", "low_stock", "out_of_stock"];
  const status: InventoryStatus = rawStatus && allowedStatuses.includes(rawStatus) ? rawStatus : "all";

  const { items, count } = await listInventory({
    search: search || undefined,
    status,
    limit,
    offset,
  });

  const pagination = {
    page,
    limit,
    count,
    search: search ?? "",
    status,
  };

  return (
    <div className="space-y-6">
      <DashboardHeader title="在庫管理" />
      <InventoryClient items={items} pagination={pagination} />
    </div>
  );
}
