import { getSupabaseAdmin } from "./client";
import { applyDataScopeFilter, type DataScopeContext } from "./data-scope";

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
  allow_proxy_billing: boolean;
  commission_rate: number | null; // 支局分成比例（百分比）
  created_at: string | null;
};

export type DepartmentWithParent = DepartmentRecord & {
  parent_name: string | null;
};

export type SortOrder = "asc" | "desc";

export type ListDepartmentsParams = {
  limit?: number;
  offset?: number;
  search?: string;
  category?: string;
  ids?: string[];
  sortKey?: string;
  sortOrder?: SortOrder;
  /** 数据权限上下文，用于过滤可访问的部署 */
  dataScopeContext?: DataScopeContext;
};

// Valid sort keys for departments table
const VALID_SORT_KEYS = ["external_id", "name", "type", "category", "level", "manager_name", "status", "created_at", "code"] as const;

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
        "allow_proxy_billing",
        "commission_rate",
        "created_at",
      ].join(","),
      { count: "exact" },
    );

  // Apply sorting
  if (params.sortKey && VALID_SORT_KEYS.includes(params.sortKey as typeof VALID_SORT_KEYS[number])) {
    const ascending = params.sortOrder !== "desc";
    query = query.order(params.sortKey, { ascending });
  } else {
    // Default sorting
    query = query
      .order("level", { ascending: true })
      .order("external_id", { ascending: true })
      .order("name", { ascending: true });
  }

  if (params.search) {
    // 支持通过店番（code）、部署名、责任者、地域搜索
    query = query.or(
      `code.ilike.%${params.search}%,name.ilike.%${params.search}%,manager_name.ilike.%${params.search}%,city.ilike.%${params.search}%`,
    );
  }

  if (params.category) {
    query = query.eq("category", params.category);
  }

  // 应用数据权限过滤
  if (params.dataScopeContext) {
    const { shouldFilter, departmentIds } = await applyDataScopeFilter(params.dataScopeContext);
    if (shouldFilter) {
      query = query.in("id", departmentIds);
    }
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

export async function deleteDepartment(id: string): Promise<void> {
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("departments").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export async function updateDepartmentProxyBilling(
  id: string,
  allowProxyBilling: boolean
): Promise<void> {
  const sb = getSupabaseAdmin();
  const { error } = await sb
    .from("departments")
    .update({ allow_proxy_billing: allowProxyBilling })
    .eq("id", id);

  if (error) {
    throw error;
  }
}

/**
 * Update commission rate for a branch department
 * @param id Department ID
 * @param commissionRate Commission rate in percentage (e.g., 10.00 for 10%)
 */
export async function updateDepartmentCommissionRate(
  id: string,
  commissionRate: number
): Promise<void> {
  const sb = getSupabaseAdmin();
  const { error } = await sb
    .from("departments")
    .update({ commission_rate: commissionRate })
    .eq("id", id);

  if (error) {
    throw error;
  }
}

/**
 * Get branch department for a classroom (find parent branch)
 * @param classroomId Classroom department ID
 * @returns Branch department with commission rate, or null if not found
 */
export async function getBranchForClassroom(
  classroomId: string
): Promise<{ id: string; name: string; commission_rate: number } | null> {
  const sb = getSupabaseAdmin();
  
  // First get the classroom's parent_id
  const { data: classroom, error: classroomError } = await sb
    .from("departments")
    .select("parent_id")
    .eq("id", classroomId)
    .single();
  
  if (classroomError || !classroom?.parent_id) {
    return null;
  }
  
  // Get the parent branch
  const { data: branch, error: branchError } = await sb
    .from("departments")
    .select("id, name, commission_rate, type")
    .eq("id", classroom.parent_id)
    .single();
  
  if (branchError || !branch || branch.type !== "支局") {
    return null;
  }
  
  return {
    id: branch.id as string,
    name: branch.name as string,
    commission_rate: (branch.commission_rate as number) ?? 10.00,
  };
}
