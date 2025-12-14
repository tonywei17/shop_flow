import { getSupabaseAdmin } from "./client";
import type { Product } from "./products";

export type InventoryStatus = "all" | "ok" | "low_stock" | "out_of_stock";

export type InventoryRow = Product & {
  stock_status: "ok" | "low_stock" | "out_of_stock";
};

export type ListInventoryParams = {
  search?: string;
  category_id?: string;
  status?: InventoryStatus;
  limit?: number;
  offset?: number;
};

export async function listInventory(
  params: ListInventoryParams = {},
): Promise<{ items: InventoryRow[]; count: number }> {
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
    );

  if (params.search) {
    const term = params.search.trim();
    if (term) {
      query = query.or(
        `code.ilike.%${term}%,name.ilike.%${term}%`,
      );
    }
  }

  if (params.category_id) {
    query = query.eq("category_id", params.category_id);
  }

  const { data, error } = await query;

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

  const allItems: InventoryRow[] = records.map((record) => {
    let stockStatus: InventoryRow["stock_status"] = "ok";
    if (record.stock <= 0) {
      stockStatus = "out_of_stock";
    } else if (
      record.stock_alert_threshold !== null &&
      record.stock <= record.stock_alert_threshold
    ) {
      stockStatus = "low_stock";
    }

    return {
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
      stock_status: stockStatus,
    };
  });

  let filtered = allItems;

  if (params.status && params.status !== "all") {
    filtered = filtered.filter((item) => item.stock_status === params.status);
  }

  const totalCount = filtered.length;

  if (typeof params.offset === "number" && typeof params.limit === "number") {
    filtered = filtered.slice(params.offset, params.offset + params.limit);
  } else if (typeof params.limit === "number") {
    filtered = filtered.slice(0, params.limit);
  }

  return { items: filtered, count: totalCount };
}

export type AdjustInventoryInput = {
  productId: string;
  delta: number;
  reason: string;
  note?: string;
  userId?: string;
};

export async function adjustInventory(input: AdjustInventoryInput) {
  const sb = getSupabaseAdmin();

  const { data, error } = await sb.rpc("adjust_product_stock", {
    p_product_id: input.productId,
    p_delta: input.delta,
    p_reason: input.reason,
    p_note: input.note ?? null,
    p_user_id: input.userId ?? null,
  });

  if (error) {
    throw error;
  }

  return data;
}

export type InventoryAdjustment = {
  id: string;
  product_id: string;
  delta: number;
  stock_before: number;
  stock_after: number;
  reason: string;
  note: string | null;
  user_id: string | null;
  created_at: string | null;
};

export type ListInventoryAdjustmentsParams = {
  productId: string;
  limit?: number;
  offset?: number;
};

export async function listInventoryAdjustments(
  params: ListInventoryAdjustmentsParams,
): Promise<{ items: InventoryAdjustment[]; count: number }> {
  const sb = getSupabaseAdmin();

  let query = sb
    .from("inventory_adjustments")
    .select("*", { count: "exact" })
    .eq("product_id", params.productId)
    .order("created_at", { ascending: false });

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

  const items = (data ?? []) as InventoryAdjustment[];

  return { items, count: typeof count === "number" ? count : items.length };
}
