import { Suspense } from "react";
import { listRoles, listDepartments } from "@enterprise/db";
import { RolesClient } from "./roles-client";

type RolesPageSearchParams = {
  page?: string;
  limit?: string;
  q?: string;
  sort?: string;
  order?: string;
};

type RolesPageProps = {
  searchParams?: Promise<RolesPageSearchParams>;
};

export default async function RolesPage({ searchParams }: RolesPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  const pageParam = Number(resolvedSearchParams?.page);
  const limitParam = Number(resolvedSearchParams?.limit);

  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(Math.floor(limitParam), 100) : 10;
  const search = resolvedSearchParams?.q?.trim();
  const sortKey = resolvedSearchParams?.sort?.trim();
  const sortOrder = resolvedSearchParams?.order === "desc" ? "desc" : resolvedSearchParams?.order === "asc" ? "asc" : undefined;
  const offset = (page - 1) * limit;

  const [rolesResult, departmentsResult] = await Promise.all([
    listRoles({ limit, offset, search, sortKey, sortOrder }).catch((error) => {
      console.error("Failed to load roles from Supabase on roles page", error);
      return { roles: [], count: 0 };
    }),
    listDepartments({ limit: 1000 }).catch((error) => {
      console.error("Failed to load departments from Supabase on roles page", error);
      return { departments: [], count: 0 };
    }),
  ]);

  const { roles, count } = rolesResult;
  const departments = departmentsResult.departments.map((d) => ({
    id: d.id,
    name: d.name,
    type: d.type,
    level: d.level,
  }));

  return (
    <Suspense fallback={null}>
      <RolesClient 
        roles={roles} 
        departments={departments}
        pagination={{ page, limit, count, search: search ?? "", sortKey: sortKey ?? null, sortOrder: sortOrder ?? null }} 
      />
    </Suspense>
  );
}
