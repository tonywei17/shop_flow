import { getSupabaseAdmin } from "./client";

export type AdminAccount = {
  id: string;
  external_id: number | null;
  account_id: string;
  display_name: string;
  email: string | null;
  phone: string | null;
  status: string;
  last_login_ip: string | null;
  last_login_at: string | null;
  department_id: string | null;
  department_external_id: number | null;
  department_name: string | null;
  role_code: string | null;
  role_name: string | null;
  account_scope: string;
};

type AdminAccountRecord = {
  id: string;
  external_id: number | null;
  account_id: string;
  display_name: string;
  email: string | null;
  phone: string | null;
  status: string | null;
  last_login_ip: string | null;
  last_login_at: string | null;
  department_id: string | null;
  department_external_id: number | null;
  department_name: string | null;
  role_code: string | null;
  account_scope: string;
};

export type ListAdminAccountsParams = {
  limit?: number;
  offset?: number;
  search?: string;
  scope?: string;
  status?: string;
  ids?: string[];
};

export async function listAdminAccounts(
  params: ListAdminAccountsParams = {},
): Promise<{ accounts: AdminAccount[]; count: number }> {
  const sb = getSupabaseAdmin();

  let query = sb
    .from("admin_accounts")
    .select(
      [
        "id",
        "external_id",
        "account_id",
        "display_name",
        "email",
        "phone",
        "status",
        "last_login_ip",
        "last_login_at",
        "department_id",
        "department_external_id",
        "department_name",
        "role_code",
        "account_scope",
      ].join(","),
      { count: "exact" },
    )
    .order("created_at", { ascending: false });

  if (params.search) {
    query = query.or(
      `account_id.ilike.%${params.search}%,display_name.ilike.%${params.search}%,email.ilike.%${params.search}%`,
    );
  }

  if (params.scope) {
    query = query.eq("account_scope", params.scope);
  }

  if (params.status) {
    query = query.eq("status", params.status);
  }

  if (params.ids && params.ids.length) {
    query = query.in("id", params.ids);
  } else if (typeof params.limit === "number") {
    const limit = Math.max(1, params.limit);
    const offset = Math.max(0, params.offset ?? 0);
    query = query.range(offset, offset + limit - 1);
  }

  const { data, error, count } = await query;
  if (error) {
    throw error;
  }

  const records = Array.isArray(data) ? (data as unknown as AdminAccountRecord[]) : [];

  const roleCodes = Array.from(
    new Set(records.map((record) => record.role_code).filter((code): code is string => Boolean(code))),
  );
  const roleMap = new Map<string, string>();
  if (roleCodes.length) {
    const { data: roles, error: roleError } = await sb.from("roles").select("code,name").in("code", roleCodes);
    if (roleError) {
      throw roleError;
    }
    roles?.forEach((role) => {
      roleMap.set(role.code as string, role.name as string);
    });
  }

  const accounts: AdminAccount[] = records.map((record) => ({
    id: record.id,
    external_id: record.external_id ?? null,
    account_id: record.account_id,
    display_name: record.display_name,
    email: record.email || null,
    phone: record.phone || null,
    status: record.status ?? "active",
    last_login_ip: record.last_login_ip || null,
    last_login_at: record.last_login_at || null,
    department_id: record.department_id ?? null,
    department_external_id: record.department_external_id ?? null,
    department_name: record.department_name ?? null,
    role_code: record.role_code ?? null,
    role_name: record.role_code ? roleMap.get(record.role_code) ?? null : null,
    account_scope: record.account_scope ?? "admin_portal",
  }));

  return { accounts, count: typeof count === "number" ? count : accounts.length };
}

export type CreateAdminAccountInput = {
  account_id: string;
  display_name: string;
  email?: string | null;
  phone?: string | null;
  status?: string;
  department_name?: string | null;
  role_code?: string | null;
  account_scope?: string;
};

export type UpdateAdminAccountInput = {
  display_name?: string;
  email?: string | null;
  phone?: string | null;
  status?: string;
  department_name?: string | null;
  role_code?: string | null;
  account_scope?: string;
};

export async function createAdminAccount(
  input: CreateAdminAccountInput,
): Promise<{ id: string }> {
  const sb = getSupabaseAdmin();

  const payload = {
    account_id: input.account_id,
    display_name: input.display_name,
    email: input.email ?? null,
    phone: input.phone ?? null,
    status: input.status ?? "有効",
    department_name: input.department_name ?? null,
    role_code: input.role_code ?? null,
    account_scope: input.account_scope ?? "admin_portal",
  };

  const { data, error } = await sb
    .from("admin_accounts")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  const record = data as { id: string };
  return { id: record.id };
}

export async function updateAdminAccount(
  id: string,
  input: UpdateAdminAccountInput,
): Promise<void> {
  const sb = getSupabaseAdmin();

  const payload: Record<string, unknown> = {};

  if (typeof input.display_name === "string") {
    payload.display_name = input.display_name;
  }
  if (input.email !== undefined) {
    payload.email = input.email ?? null;
  }
  if (input.phone !== undefined) {
    payload.phone = input.phone ?? null;
  }
  if (typeof input.status === "string") {
    payload.status = input.status;
  }
  if (input.department_name !== undefined) {
    payload.department_name = input.department_name ?? null;
  }
  if (input.role_code !== undefined) {
    payload.role_code = input.role_code ?? null;
  }
  if (typeof input.account_scope === "string") {
    payload.account_scope = input.account_scope;
  }

  if (Object.keys(payload).length === 0) {
    return;
  }

  const { error } = await sb.from("admin_accounts").update(payload).eq("id", id);

  if (error) {
    throw error;
  }
}

export async function deleteAdminAccount(id: string): Promise<void> {
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("admin_accounts").delete().eq("id", id);

  if (error) {
    throw error;
  }
}
