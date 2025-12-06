import { getSupabaseAdmin } from "./client";

export type DataScopeType = "all" | "self_and_descendants" | "self_only" | "custom";
export type PriceType = "hq" | "branch" | "classroom" | "retail";

export type RoleRecord = {
  id: string;
  role_id: number | null;
  name: string;
  code: string;
  data_scope: string;
  data_scope_type?: DataScopeType; // Optional for backward compatibility
  allowed_department_ids?: string[] | null; // Optional for backward compatibility
  status: string;
  description: string | null;
  feature_permissions: string[] | null;
  // Storefront access settings
  can_access_storefront?: boolean;
  default_price_type?: PriceType;
  created_at: string | null;
};

export type CreateRoleInput = {
  role_id: number | null;
  name: string;
  code: string;
  data_scope: string;
  data_scope_type: DataScopeType;
  allowed_department_ids?: string[] | null;
  status: string;
  description?: string | null;
  feature_permissions?: string[] | null;
  // Storefront access settings
  can_access_storefront?: boolean;
  default_price_type?: PriceType;
};

export type UpdateRoleInput = {
  role_id: number | null;
  name: string;
  code: string;
  data_scope: string;
  data_scope_type: DataScopeType;
  allowed_department_ids?: string[] | null;
  status: string;
  description?: string | null;
  feature_permissions?: string[] | null;
  // Storefront access settings
  can_access_storefront?: boolean;
  default_price_type?: PriceType;
};

export type SortOrder = "asc" | "desc";

export type ListRolesParams = {
  limit?: number;
  offset?: number;
  search?: string;
  ids?: string[];
  sortKey?: string;
  sortOrder?: SortOrder;
};

// Valid sort keys for roles table
const VALID_SORT_KEYS = ["role_id", "name", "code", "data_scope", "status", "created_at"] as const;

export async function listRoles(params: ListRolesParams = {}): Promise<{ roles: RoleRecord[]; count: number }> {
  const sb = getSupabaseAdmin();
  let query = sb
    .from("roles")
    .select("*", { count: "exact" });

  // Apply sorting
  if (params.sortKey && VALID_SORT_KEYS.includes(params.sortKey as typeof VALID_SORT_KEYS[number])) {
    const ascending = params.sortOrder !== "desc";
    query = query.order(params.sortKey, { ascending });
  } else {
    // Default sorting
    query = query
      .order("role_id", { ascending: true })
      .order("created_at", { ascending: true });
  }

  if (params.search) {
    query = query.ilike("name", `%${params.search}%`);
  }

  if (params.ids && params.ids.length) {
    query = query.in("id", params.ids);
  } else if (typeof params.limit === "number") {
    const limit = Math.max(1, params.limit);
    const offset = Math.max(0, params.offset ?? 0);
    const to = offset + limit - 1;
    query = query.range(offset, to);
  }

  const { data, error, count } = await query;

  if (error) {
    throw error;
  }

  // Normalize roles to ensure data_scope_type has a default value
  const roles = ((data as RoleRecord[]) ?? []).map(role => ({
    ...role,
    data_scope_type: role.data_scope_type ?? inferDataScopeType(role.data_scope),
    allowed_department_ids: role.allowed_department_ids ?? [],
    can_access_storefront: role.can_access_storefront ?? false,
    default_price_type: role.default_price_type ?? 'retail',
  }));
  return { roles, count: typeof count === "number" ? count : roles.length };
}

// Helper to infer data_scope_type from legacy data_scope value
function inferDataScopeType(dataScope: string): DataScopeType {
  if (dataScope === 'すべてのデータ権限' || dataScope === 'all' || dataScope === 'すべてのデータ' || dataScope === '全データ') {
    return 'all';
  }
  if (dataScope === '所属部署と下位部署' || dataScope === 'self_and_descendants' || dataScope === '部署+下位') {
    return 'self_and_descendants';
  }
  if (dataScope === '所属部署のみ' || dataScope === 'self_only' || dataScope === '部署のみ') {
    return 'self_only';
  }
  if (dataScope === 'カスタムデータ権限' || dataScope === 'custom' || dataScope === 'カスタム') {
    return 'custom';
  }
  return 'all';
}

export async function createRole(input: CreateRoleInput): Promise<RoleRecord> {
  const sb = getSupabaseAdmin();
  const payload = {
    role_id: input.role_id,
    name: input.name,
    code: input.code,
    data_scope: input.data_scope,
    data_scope_type: input.data_scope_type,
    allowed_department_ids: input.allowed_department_ids ?? [],
    status: input.status,
    description: input.description ?? null,
    feature_permissions: input.feature_permissions ?? null,
    can_access_storefront: input.can_access_storefront ?? false,
    default_price_type: input.default_price_type ?? 'retail',
  };

  const { data, error } = await sb.from("roles").insert([payload]).select().single();

  if (error) {
    throw error;
  }

  return data as RoleRecord;
}

export async function deleteRole(id: string): Promise<void> {
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("roles").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export async function updateRole(
  id: string,
  input: UpdateRoleInput,
): Promise<RoleRecord> {
  const sb = getSupabaseAdmin();
  const payload = {
    role_id: input.role_id,
    name: input.name,
    code: input.code,
    data_scope: input.data_scope,
    data_scope_type: input.data_scope_type,
    allowed_department_ids: input.allowed_department_ids ?? [],
    status: input.status,
    description: input.description ?? null,
    feature_permissions: input.feature_permissions ?? null,
    can_access_storefront: input.can_access_storefront ?? false,
    default_price_type: input.default_price_type ?? 'retail',
  };

  const { data, error } = await sb
    .from("roles")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as RoleRecord;
}
