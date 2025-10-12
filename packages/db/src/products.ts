import { getSupabaseAdmin } from "./client";

export type ProductInput = {
  tenant_id?: string | null;
  sku: string;
  title: string;
  description?: string | null;
  price_retail_cents?: number;
  price_member_cents?: number;
  price_wholesale_cents?: number;
  price_discount_cents?: number;
  currency_code?: string; // default JPY
  stock?: number;
  active?: boolean;
  external_id?: string | null;
  external_source?: string | null;
};

export type ProductRow = ProductInput & {
  id: string;
  created_at: string;
  updated_at: string;
};

export async function listProducts(params?: {
  tenant_id?: string;
  limit?: number;
  offset?: number;
  q?: string; // search in sku/title
}): Promise<{ items: ProductRow[]; count: number }>
{
  const sb = getSupabaseAdmin();
  let query = sb.from("products").select("*", { count: "exact" });
  if (params?.tenant_id) query = query.eq("tenant_id", params.tenant_id);
  if (params?.q) {
    // simple search on sku or title
    query = query.or(`sku.ilike.%${params.q}%,title.ilike.%${params.q}%`);
  }
  if (typeof params?.limit === "number") query = query.limit(params.limit);
  if (typeof params?.offset === "number") query = query.range(params.offset, (params.offset + (params.limit ?? 10) - 1));
  const { data, count, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return { items: (data as ProductRow[]) ?? [], count: count ?? 0 };
}

export async function getProduct(id: string): Promise<ProductRow | null> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from("products").select("*").eq("id", id).single();
  if (error && error.code !== "PGRST116") throw error; // not found
  return (data as ProductRow) ?? null;
}

export async function createProduct(input: ProductInput): Promise<ProductRow> {
  const sb = getSupabaseAdmin();

  const priceCents = input.price_retail_cents ?? 0;
  const stock = input.stock ?? 0;
  const currency = input.currency_code ?? "JPY";

  const payload = {
    currency_code: currency,
    stock: Math.max(0, stock),
    active: input.active ?? true,
    ...input,
    price_retail_cents: priceCents,
    external_id: input.external_id ?? null,
    external_source: input.external_source ?? null,
  };

  const { data, error } = await sb
    .from("products")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as ProductRow;
}

export async function updateProduct(id: string, patch: Partial<ProductInput>): Promise<ProductRow> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from("products").update(patch).eq("id", id).select("*").single();
  if (error) throw error;
  return data as ProductRow;
}

export async function adjustStock(id: string, delta: number): Promise<ProductRow> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.rpc("sql", {
    // fallback: atomic update using update with expression via RPC is not available by default
  });
  // Since generic SQL RPC isn't set, do a safe single-row update with fetch-then-update
  const current = await getProduct(id);
  if (!current) throw new Error("Product not found");
  const nextStock = Math.max(0, (current.stock ?? 0) + delta);
  return updateProduct(id, { stock: nextStock });
}
