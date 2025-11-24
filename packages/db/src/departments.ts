import { getSupabaseAdmin } from "./client";

export type DepartmentRecord = {
  id: string;
  external_id: number | null;
  parent_id: string | null;
  parent_external_id: number | null;
  name: string;
  type: string;
  category: string | null;
  code: string | null;
  level: number;
  manager_name: string | null;
  phone_primary: string | null;
  status: string | null;
  postal_code: string | null;
  prefecture: string | null;
  city: string | null;
  address_line1: string | null;
  address_line2: string | null;
  is_independent: boolean;
  created_at: string | null;
};

export type DepartmentWithParent = DepartmentRecord & {
  parent_name: string | null;
};

export type ListDepartmentsParams = {
  limit?: number;
  offset?: number;
  search?: string;
  category?: string;
  ids?: string[];
};

export async function listDepartments(
  params: ListDepartmentsParams = {},
): Promise<{ departments: DepartmentWithParent[]; count: number }> {
  const sb = getSupabaseAdmin();
  let query = sb
    .from("departments")
    .select(
      [
        "id",
        "external_id",
        "parent_id",
        "parent_external_id",
        "name",
        "type",
        "category",
        "level",
        "manager_name",
        "phone_primary",
        "status",
        "postal_code",
        "prefecture",
        "city",
        "address_line1",
        "address_line2",
        "code",
        "is_independent",
        "created_at",
      ].join(","),
      { count: "exact" },
    )
    .order("level", { ascending: true })
    .order("external_id", { ascending: true })
    .order("name", { ascending: true });

  if (params.search) {
    query = query.or(
      `name.ilike.%${params.search}%,manager_name.ilike.%${params.search}%,city.ilike.%${params.search}%`,
    );
  }

  if (params.category) {
    query = query.eq("category", params.category);
  }

  if (params.ids && params.ids.length) {
    query = query.in("id", params.ids);
  } else if (typeof params.limit === "number") {
    const limit = Math.max(1, params.limit);
    const offset = Math.max(0, params.offset ?? 0);
    query = query.range(offset, offset + limit - 1);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  const records = Array.isArray(data) ? (data as unknown as DepartmentRecord[]) : [];

  const parentIds = Array.from(new Set(records.map((item) => item.parent_id).filter((id): id is string => Boolean(id))));
  const parentMap = new Map<string, string>();

  if (parentIds.length) {
    const { data: parents, error: parentError } = await sb
      .from("departments")
      .select("id,name")
      .in("id", parentIds);
    if (parentError) throw parentError;
    parents?.forEach((parent) => {
      parentMap.set(parent.id as string, parent.name as string);
    });
  }

  const departments: DepartmentWithParent[] = records.map((record) => ({
    ...record,
    parent_name: record.parent_id ? parentMap.get(record.parent_id) ?? null : null,
  }));

  return { departments, count: typeof count === "number" ? count : departments.length };
}
