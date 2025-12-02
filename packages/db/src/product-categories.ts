import { getSupabaseAdmin } from "./client";

export type ProductCategory = {
  id: string;
  code: string;
  name: string;
  status: string;
  created_at: string | null;
};

export type ListProductCategoriesParams = {
  limit?: number;
  offset?: number;
  search?: string;
  status?: string;
};

export async function listProductCategories(
  params: ListProductCategoriesParams = {},
): Promise<{ items: ProductCategory[]; count: number }> {
  const sb = getSupabaseAdmin();
  let query = sb
    .from("product_categories")
    .select("id,code,name,status,created_at", { count: "exact" })
    .order("code", { ascending: true });

  if (params.search) {
    const search = params.search.trim();
    if (search) {
      // 商品区分ID(コード) も名称も対象に検索
      query = query.or(`code.eq.${search},name.ilike.%${search}%`);
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

  const items = (data as ProductCategory[]) ?? [];
  return { items, count: typeof count === "number" ? count : items.length };
}

export type UpsertProductCategoryInput = {
  code: string;
  name: string;
  status?: string;
};

export async function createProductCategory(
  input: UpsertProductCategoryInput,
): Promise<ProductCategory> {
  const sb = getSupabaseAdmin();
  const payload = {
    code: input.code,
    name: input.name,
    status: input.status ?? "有効",
  };

  const { data, error } = await sb.from("product_categories").insert([payload]).select().single();
  if (error) throw error;
  return data as ProductCategory;
}

export async function updateProductCategory(
  id: string,
  input: UpsertProductCategoryInput,
): Promise<ProductCategory> {
  const sb = getSupabaseAdmin();
  const payload = {
    code: input.code,
    name: input.name,
    status: input.status ?? "有効",
  };

  const { data, error } = await sb
    .from("product_categories")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as ProductCategory;
}

export async function deleteProductCategory(id: string): Promise<void> {
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("product_categories").delete().eq("id", id);
  if (error) throw error;
}
