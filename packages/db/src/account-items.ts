import { getSupabaseAdmin } from "./client";

export type AccountItem = {
  id: string;
  account_item_id: number;
  name: string;
  status: string;
  created_at: string | null;
};

export type ListAccountItemsParams = {
  limit?: number;
  offset?: number;
  search?: string;
  status?: string;
};

export async function listAccountItems(
  params: ListAccountItemsParams = {},
): Promise<{ items: AccountItem[]; count: number }> {
  const sb = getSupabaseAdmin();
  let query = sb
    .from("account_items")
    .select("id,account_item_id,name,status,created_at", { count: "exact" })
    .order("account_item_id", { ascending: true });

  if (params.search) {
    const search = params.search.trim();
    if (search) {
      const isNumeric = /^\d+$/.test(search);
      if (isNumeric) {
        query = query.or(
          `account_item_id.eq.${Number(search)},name.ilike.%${search}%`,
        );
      } else {
        query = query.ilike("name", `%${search}%`);
      }
    }
  }

  if (params.status) {
    query = query.eq("status", params.status);
  }

  if (typeof params.limit === "number") {
    const limit = Math.max(1, params.limit);
    const offset = Math.max(0, params.offset ?? 0);
    query = query.range(offset, offset + limit - 1);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  const items = (data as AccountItem[]) ?? [];
  return { items, count: typeof count === "number" ? count : items.length };
}

export type UpsertAccountItemInput = {
  account_item_id: number;
  name: string;
  status?: string;
};

export async function createAccountItem(input: UpsertAccountItemInput): Promise<AccountItem> {
  const sb = getSupabaseAdmin();
  const payload = {
    account_item_id: input.account_item_id,
    name: input.name,
    status: input.status ?? "有効",
  };

  const { data, error } = await sb.from("account_items").insert([payload]).select().single();
  if (error) throw error;
  return data as AccountItem;
}

export async function updateAccountItem(
  id: string,
  input: UpsertAccountItemInput,
): Promise<AccountItem> {
  const sb = getSupabaseAdmin();
  const payload = {
    account_item_id: input.account_item_id,
    name: input.name,
    status: input.status ?? "有効",
  };

  const { data, error } = await sb
    .from("account_items")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as AccountItem;
}

export async function deleteAccountItem(id: string): Promise<void> {
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("account_items").delete().eq("id", id);
  if (error) throw error;
}
