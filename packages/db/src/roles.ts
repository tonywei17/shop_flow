import { getSupabaseAdmin } from "./client";

export type RoleRecord = {
  id: string;
  role_id: number | null;
  name: string;
  code: string;
  data_scope: string;
  status: string;
  description: string | null;
  feature_permissions: string[] | null;
  created_at: string | null;
};

export type CreateRoleInput = {
  role_id: number | null;
  name: string;
  code: string;
  data_scope: string;
  status: string;
  description?: string | null;
  feature_permissions?: string[] | null;
};

export type UpdateRoleInput = {
  role_id: number | null;
  name: string;
  code: string;
  data_scope: string;
  status: string;
  description?: string | null;
  feature_permissions?: string[] | null;
};

export type ListRolesParams = {
  limit?: number;
  offset?: number;
  search?: string;
  ids?: string[];
};

export async function listRoles(params: ListRolesParams = {}): Promise<{ roles: RoleRecord[]; count: number }> {
  const sb = getSupabaseAdmin();
  let query = sb
    .from("roles")
    .select("id,role_id,name,code,data_scope,status,description,feature_permissions,created_at", { count: "exact" })
    .order("role_id", { ascending: true })
    .order("created_at", { ascending: true });

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

  const roles = (data as RoleRecord[]) ?? [];
  return { roles, count: typeof count === "number" ? count : roles.length };
}

export async function createRole(input: CreateRoleInput): Promise<RoleRecord> {
  const sb = getSupabaseAdmin();
  const payload = {
    role_id: input.role_id,
    name: input.name,
    code: input.code,
    data_scope: input.data_scope,
    status: input.status,
    description: input.description ?? null,
    feature_permissions: input.feature_permissions ?? null,
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
    status: input.status,
    description: input.description ?? null,
    feature_permissions: input.feature_permissions ?? null,
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
