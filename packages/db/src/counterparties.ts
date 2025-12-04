import { getSupabaseAdmin } from "./client";

export type Counterparty = {
  id: string;
  counterparty_id: number;
  name: string | null;
  status: string;
  created_at: string | null;
};

export type SortOrder = "asc" | "desc";

export type ListCounterpartiesParams = {
  limit?: number;
  offset?: number;
  search?: string;
  status?: string;
  ids?: string[];
  sortKey?: string;
  sortOrder?: SortOrder;
};

// Valid sort keys for counterparties table
const VALID_SORT_KEYS = ["counterparty_id", "name", "status", "created_at"] as const;

export async function listCounterparties(
  params: ListCounterpartiesParams = {},
): Promise<{ items: Counterparty[]; count: number }> {
  const sb = getSupabaseAdmin();
  let query = sb
    .from("counterparties")
    .select("id,counterparty_id,name,status,created_at", { count: "exact" });

  // Apply sorting
  const sortKey = params.sortKey && VALID_SORT_KEYS.includes(params.sortKey as typeof VALID_SORT_KEYS[number])
    ? params.sortKey
    : "counterparty_id";
  const ascending = params.sortOrder !== "desc";
  query = query.order(sortKey, { ascending });

  if (params.search) {
    const search = params.search.trim();
    if (search) {
      const isNumeric = /^\d+$/.test(search);
      if (isNumeric) {
        query = query.or(
          `counterparty_id.eq.${Number(search)},name.ilike.%${search}%`,
        );
      } else {
        query = query.ilike("name", `%${search}%`);
      }
    }
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
  if (error) throw error;

  const items = (data as Counterparty[]) ?? [];
  return { items, count: typeof count === "number" ? count : items.length };
}

export type UpsertCounterpartyInput = {
  counterparty_id: number;
  name?: string | null;
  status?: string;
};

export async function createCounterparty(
  input: UpsertCounterpartyInput,
): Promise<Counterparty> {
  const sb = getSupabaseAdmin();
  const payload = {
    counterparty_id: input.counterparty_id,
    name: input.name ?? null,
    status: input.status ?? "有効",
  };

  const { data, error } = await sb.from("counterparties").insert([payload]).select().single();
  if (error) throw error;
  return data as Counterparty;
}

export async function updateCounterparty(
  id: string,
  input: UpsertCounterpartyInput,
): Promise<Counterparty> {
  const sb = getSupabaseAdmin();
  const payload = {
    counterparty_id: input.counterparty_id,
    name: input.name ?? null,
    status: input.status ?? "有効",
  };

  const { data, error } = await sb
    .from("counterparties")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Counterparty;
}

export async function deleteCounterparty(id: string): Promise<void> {
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("counterparties").delete().eq("id", id);
  if (error) throw error;
}
