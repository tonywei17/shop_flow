import { Suspense } from "react";
import { listRoles } from "@enterprise/db";
import { RolesClient } from "./roles-client";

type RolesPageSearchParams = {
  page?: string;
  limit?: string;
  q?: string;
};

type RolesPageProps = {
  searchParams?: RolesPageSearchParams;
};

export default async function RolesPage({ searchParams }: RolesPageProps) {
  const pageParam = Number(searchParams?.page);
  const limitParam = Number(searchParams?.limit);

  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(Math.floor(limitParam), 50) : 10;
  const search = searchParams?.q?.trim();
  const offset = (page - 1) * limit;

  const { roles, count } = await listRoles({ limit, offset, search }).catch((error) => {
    console.error("Failed to load roles from Supabase on roles page", error);
    return { roles: [], count: 0 };
  });

  return (
    <Suspense fallback={null}>
      <RolesClient roles={roles} pagination={{ page, limit, count, search: search ?? "" }} />
    </Suspense>
  );
}
