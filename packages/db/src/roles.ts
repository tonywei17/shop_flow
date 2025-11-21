import { getSupabaseAdmin } from "./client";

export type RoleRecord = {
  id: string;
  role_id: number | null;
  name: string;
  code: string;
  data_scope: string;
  status: string;
  description: string | null;
  created_at: string | null;
};

export type CreateRoleInput = {
  role_id: number | null;
  name: string;
  code: string;
  data_scope: string;
  status: string;
  description?: string | null;
};

export type ListRolesParams = {
  limit?: number;
  offset?: number;
  search?: string;
};

export async function listRoles(params: ListRolesParams = {}): Promise<{ roles: RoleRecord[]; count: number }> {
  const sb = getSupabaseAdmin();
  let query = sb
    .from("roles")
    .select("id,role_id,name,code,data_scope,status,description,created_at", { count: "exact" })
    .order("role_id", { ascending: true })
    .order("created_at", { ascending: true });

  if (params.search) {
    query = query.ilike("name", `%${params.search}%`);
  }

  if (typeof params.limit === "number") {
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
  };

  const { data, error } = await sb.from("roles").insert([payload]).select().single();

  if (error) {
    throw error;
  }

  return data as RoleRecord;
}
