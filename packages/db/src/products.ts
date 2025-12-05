import { getSupabaseAdmin } from "./client";

// ============================================================
// 商品管理 - 类型定义
// ============================================================

export type Product = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category_id: string | null;
  category_name?: string | null;
  price_hq: number;
  price_branch: number;
  price_classroom: number;
  price_retail: number;
  stock: number;
  stock_alert_threshold: number | null;
  is_active: boolean;
  is_taxable: boolean;
  tax_rate: number | null;
  min_order_quantity: number | null;
  max_order_quantity: number | null;
  order_unit: string | null;
  external_id: string | null;
  display_order: number | null;
  created_at: string | null;
  updated_at: string | null;
};

export type CreateProductInput = {
  code: string;
  name: string;
  description?: string | null;
  category_id?: string | null;
  price_hq?: number;
  price_branch?: number;
  price_classroom?: number;
  price_retail?: number;
  stock?: number;
  stock_alert_threshold?: number | null;
  is_active?: boolean;
  is_taxable?: boolean;
  tax_rate?: number | null;
  min_order_quantity?: number | null;
  max_order_quantity?: number | null;
  order_unit?: string | null;
  external_id?: string | null;
  display_order?: number | null;
};

export type UpdateProductInput = Partial<CreateProductInput>;

export type SortOrder = "asc" | "desc";

export type ListProductsParams = {
  limit?: number;
  offset?: number;
  search?: string;
  category_id?: string;
  is_active?: boolean;
  sortKey?: string;
  sortOrder?: SortOrder;
};

// 有效的排序字段
const VALID_SORT_KEYS = ["code", "name", "price_retail", "stock", "is_active", "created_at", "display_order"] as const;

// ============================================================
// 商品管理 - 数据库操作
// ============================================================

export async function listProducts(
  params: ListProductsParams = {},
): Promise<{ products: Product[]; count: number }> {
  const sb = getSupabaseAdmin();

  let query = sb
    .from("products")
    .select(
      `
        id,
        code,
        name,
        description,
        category_id,
        price_hq,
        price_branch,
        price_classroom,
        price_retail,
        stock,
        stock_alert_threshold,
        is_active,
        is_taxable,
        tax_rate,
        min_order_quantity,
        max_order_quantity,
        order_unit,
        external_id,
        display_order,
        created_at,
        updated_at,
        product_categories(name)
      `,
      { count: "exact" },
    );

  // 搜索
  if (params.search) {
    query = query.or(
      `code.ilike.%${params.search}%,name.ilike.%${params.search}%`,
    );
  }

  // 分类筛选
  if (params.category_id) {
    query = query.eq("category_id", params.category_id);
  }

  // 状态筛选
  if (params.is_active !== undefined) {
    query = query.eq("is_active", params.is_active);
  }

  // 排序
  const sortKey = params.sortKey && VALID_SORT_KEYS.includes(params.sortKey as typeof VALID_SORT_KEYS[number])
    ? params.sortKey
    : "display_order";
  const ascending = params.sortKey ? params.sortOrder !== "desc" : true;
  query = query.order(sortKey, { ascending });

  // 分页
  if (typeof params.limit === "number") {
    query = query.limit(params.limit);
  }
  if (typeof params.offset === "number" && typeof params.limit === "number") {
    query = query.range(params.offset, params.offset + params.limit - 1);
  }

  const { data, count, error } = await query;

  if (error) {
    throw error;
  }

  type ProductRecord = {
    id: string;
    code: string;
    name: string;
    description: string | null;
    category_id: string | null;
    price_hq: number;
    price_branch: number;
    price_classroom: number;
    price_retail: number;
    stock: number;
    stock_alert_threshold: number | null;
    is_active: boolean;
    is_taxable: boolean;
    tax_rate: number | null;
    min_order_quantity: number | null;
    max_order_quantity: number | null;
    order_unit: string | null;
    external_id: string | null;
    display_order: number | null;
    created_at: string | null;
    updated_at: string | null;
    product_categories: { name: string } | null;
  };

  const records = (data ?? []) as unknown as ProductRecord[];

  const products: Product[] = records.map((record) => ({
    id: record.id,
    code: record.code,
    name: record.name,
    description: record.description,
    category_id: record.category_id,
    category_name: record.product_categories?.name ?? null,
    price_hq: record.price_hq,
    price_branch: record.price_branch,
    price_classroom: record.price_classroom,
    price_retail: record.price_retail,
    stock: record.stock,
    stock_alert_threshold: record.stock_alert_threshold,
    is_active: record.is_active,
    is_taxable: record.is_taxable,
    tax_rate: record.tax_rate,
    min_order_quantity: record.min_order_quantity,
    max_order_quantity: record.max_order_quantity,
    order_unit: record.order_unit,
    external_id: record.external_id,
    display_order: record.display_order,
    created_at: record.created_at,
    updated_at: record.updated_at,
  }));

  return { products, count: typeof count === "number" ? count : products.length };
}

export async function getProduct(id: string): Promise<Product | null> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("products")
    .select(
      `
        *,
        product_categories(name)
      `,
    )
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  if (!data) return null;

  const record = data as {
    id: string;
    code: string;
    name: string;
    description: string | null;
    category_id: string | null;
    price_hq: number;
    price_branch: number;
    price_classroom: number;
    price_retail: number;
    stock: number;
    stock_alert_threshold: number | null;
    is_active: boolean;
    is_taxable: boolean;
    tax_rate: number | null;
    min_order_quantity: number | null;
    max_order_quantity: number | null;
    order_unit: string | null;
    external_id: string | null;
    display_order: number | null;
    created_at: string | null;
    updated_at: string | null;
    product_categories: { name: string } | null;
  };

  return {
    ...record,
    category_name: record.product_categories?.name ?? null,
  };
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const sb = getSupabaseAdmin();

  const payload = {
    code: input.code,
    name: input.name,
    description: input.description ?? null,
    category_id: input.category_id ?? null,
    price_hq: input.price_hq ?? 0,
    price_branch: input.price_branch ?? 0,
    price_classroom: input.price_classroom ?? 0,
    price_retail: input.price_retail ?? 0,
    stock: input.stock ?? 0,
    stock_alert_threshold: input.stock_alert_threshold ?? 10,
    is_active: input.is_active ?? true,
    is_taxable: input.is_taxable ?? true,
    tax_rate: input.tax_rate ?? 10.00,
    min_order_quantity: input.min_order_quantity ?? 1,
    max_order_quantity: input.max_order_quantity ?? null,
    order_unit: input.order_unit ?? "個",
    external_id: input.external_id ?? null,
    display_order: input.display_order ?? 0,
  };

  const { data, error } = await sb
    .from("products")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;

  return data as Product;
}

export async function updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
  const sb = getSupabaseAdmin();

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.code !== undefined) payload.code = input.code;
  if (input.name !== undefined) payload.name = input.name;
  if (input.description !== undefined) payload.description = input.description;
  if (input.category_id !== undefined) payload.category_id = input.category_id;
  if (input.price_hq !== undefined) payload.price_hq = input.price_hq;
  if (input.price_branch !== undefined) payload.price_branch = input.price_branch;
  if (input.price_classroom !== undefined) payload.price_classroom = input.price_classroom;
  if (input.price_retail !== undefined) payload.price_retail = input.price_retail;
  if (input.stock !== undefined) payload.stock = input.stock;
  if (input.stock_alert_threshold !== undefined) payload.stock_alert_threshold = input.stock_alert_threshold;
  if (input.is_active !== undefined) payload.is_active = input.is_active;
  if (input.is_taxable !== undefined) payload.is_taxable = input.is_taxable;
  if (input.tax_rate !== undefined) payload.tax_rate = input.tax_rate;
  if (input.min_order_quantity !== undefined) payload.min_order_quantity = input.min_order_quantity;
  if (input.max_order_quantity !== undefined) payload.max_order_quantity = input.max_order_quantity;
  if (input.order_unit !== undefined) payload.order_unit = input.order_unit;
  if (input.external_id !== undefined) payload.external_id = input.external_id;
  if (input.display_order !== undefined) payload.display_order = input.display_order;

  const { data, error } = await sb
    .from("products")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;

  return data as Product;
}

export async function deleteProduct(id: string): Promise<void> {
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("products").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export async function adjustStock(id: string, delta: number): Promise<Product> {
  const current = await getProduct(id);
  if (!current) throw new Error("Product not found");
  const nextStock = Math.max(0, (current.stock ?? 0) + delta);
  return updateProduct(id, { stock: nextStock });
}
