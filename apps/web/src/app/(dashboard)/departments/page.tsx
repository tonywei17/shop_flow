import { Suspense } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { listDepartments } from "@enterprise/db";
import { DepartmentsClient } from "./departments-client";

type DepartmentsPageSearchParams = {
  page?: string;
  limit?: string;
  q?: string;
};

type DepartmentsPageProps = {
  searchParams?: Promise<DepartmentsPageSearchParams>;
};

export default async function DepartmentsPage({ searchParams }: DepartmentsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  const pageParam = Number(resolvedSearchParams?.page);
  const limitParam = Number(resolvedSearchParams?.limit);

  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(Math.floor(limitParam), 50) : 20;
  const search = resolvedSearchParams?.q?.trim();
  const offset = (page - 1) * limit;

  const { departments, count } = await listDepartments({ limit, offset, search }).catch((error) => {
    console.error("Failed to load departments from Supabase on departments page", error);
    return { departments: [], count: 0 };
  });

  return (
    <div className="space-y-6">
      <DashboardHeader title="部署管理" />
      <Suspense fallback={null}>
        <DepartmentsClient
          departments={departments}
          pagination={{ page, limit, count, search: search ?? "" }}
        />
      </Suspense>
    </div>
  );
}
