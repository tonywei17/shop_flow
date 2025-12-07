import { getSupabaseAdmin } from "./client";

export type AccountItem = {
  id: string;
  account_item_id: number;
  name: string;
  status: string;
  created_at: string | null;
};

export type SortOrder = "asc" | "desc";

export type ListAccountItemsParams = {
  limit?: number;
  offset?: number;
  search?: string;
  status?: string;
  ids?: string[];
  sortKey?: string;
  sortOrder?: SortOrder;
};

// Valid sort keys for account_items table
const VALID_SORT_KEYS = ["account_item_id", "name", "status", "created_at"] as const;

export async function listAccountItems(
  params: ListAccountItemsParams = {},
): Promise<{ items: AccountItem[]; count: number }> {
  const sb = getSupabaseAdmin();
  let query = sb
    .from("account_items")
    .select("id,account_item_id,name,status,created_at", { count: "exact" });

  // Apply sorting
  const sortKey = params.sortKey && VALID_SORT_KEYS.includes(params.sortKey as typeof VALID_SORT_KEYS[number])
    ? params.sortKey
    : "account_item_id";
  const ascending = params.sortOrder !== "desc";
  query = query.order(sortKey, { ascending });

  if (params.search) {
    const search = params.search.trim();
    if (search) {
      // 勘定項目ID（数値）と名称の両方で部分一致検索
      // account_item_id は integer なので、数値の場合は完全一致も試す
      const isNumeric = /^\d+$/.test(search);
      if (isNumeric) {
        // 数値の場合：完全一致 OR 名称部分一致 OR ID文字列として部分一致
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

  if (params.ids && params.ids.length) {
    query = query.in("id", params.ids);
  } else if (typeof params.limit === "number") {
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
