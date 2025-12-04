import { Suspense } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { listDepartments } from "@enterprise/db";
import { DepartmentsClient } from "./departments-client";

type DepartmentsPageSearchParams = {
  page?: string;
  limit?: string;
  q?: string;
  sort?: string;
  order?: string;
};

type DepartmentsPageProps = {
  searchParams?: Promise<DepartmentsPageSearchParams>;
};

export default async function DepartmentsPage({ searchParams }: DepartmentsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  const pageParam = Number(resolvedSearchParams?.page);
  const limitParam = Number(resolvedSearchParams?.limit);

  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(Math.floor(limitParam), 100) : 20;
  const search = resolvedSearchParams?.q?.trim();
  const sortKey = resolvedSearchParams?.sort?.trim();
  const sortOrder = resolvedSearchParams?.order === "desc" ? "desc" : resolvedSearchParams?.order === "asc" ? "asc" : undefined;
  const offset = (page - 1) * limit;

  const { departments, count } = await listDepartments({ limit, offset, search, sortKey, sortOrder }).catch((error) => {
    console.error("Failed to load departments from Supabase on departments page", error);
    return { departments: [], count: 0 };
  });

  return (
    <div className="space-y-6">
      <DashboardHeader title="部署管理" />
      <Suspense fallback={null}>
        <DepartmentsClient
          departments={departments}
          pagination={{ page, limit, count, search: search ?? "", sortKey: sortKey ?? null, sortOrder: sortOrder ?? null }}
        />
      </Suspense>
    </div>
  );
}
