import { DashboardHeader } from "@/components/dashboard/header";
import { listDepartments } from "@enterprise/db";
import { DepartmentsClient } from "./departments-client";

type DepartmentsPageSearchParams = {
  page?: string;
  limit?: string;
  q?: string;
};

type DepartmentsPageProps = {
  searchParams?: DepartmentsPageSearchParams;
};

export default async function DepartmentsPage({ searchParams }: DepartmentsPageProps) {
  const pageParam = Number(searchParams?.page);
  const limitParam = Number(searchParams?.limit);

  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(Math.floor(limitParam), 50) : 20;
  const search = searchParams?.q?.trim();
  const offset = (page - 1) * limit;

  const { departments, count } = await listDepartments({ limit, offset, search });

  return (
    <div className="space-y-6">
      <DashboardHeader title="部署管理" />
      <DepartmentsClient
        departments={departments}
        pagination={{ page, limit, count, search: search ?? "" }}
      />
    </div>
  );
}
