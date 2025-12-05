import { NextRequest, NextResponse } from "next/server";
import { parsePaginationParams } from "@/lib/pagination";
import { listProducts, createProduct, updateProduct, deleteProduct } from "@enterprise/db";
import { z } from "zod";

// 商品创建/更新验证 schema
const productUpsertSchema = z.object({
  mode: z.enum(["create", "edit"]).optional().default("create"),
  id: z.string().optional(),
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  category_id: z.string().nullable().optional(),
  price_hq: z.number().int().min(0).optional().default(0),
  price_branch: z.number().int().min(0).optional().default(0),
  price_classroom: z.number().int().min(0).optional().default(0),
  price_retail: z.number().int().min(0).optional().default(0),
  stock: z.number().int().min(0).optional().default(0),
  stock_alert_threshold: z.number().int().min(0).nullable().optional(),
  is_active: z.boolean().optional().default(true),
  is_taxable: z.boolean().optional().default(true),
  tax_rate: z.number().min(0).max(100).nullable().optional(),
  min_order_quantity: z.number().int().min(1).nullable().optional(),
  max_order_quantity: z.number().int().min(1).nullable().optional(),
  order_unit: z.string().nullable().optional(),
  external_id: z.string().nullable().optional(),
  display_order: z.number().int().nullable().optional(),
});

// 部分更新 schema（用于只更新 is_active 等单个字段）
const productPartialUpdateSchema = z.object({
  mode: z.literal("edit"),
  id: z.string().min(1),
  is_active: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const { page, limit, offset } = parsePaginationParams(searchParams, {
    defaultLimit: 20,
    maxLimit: 100,
  });
  const search = searchParams.get("q")?.trim() || undefined;
  const category_id = searchParams.get("category") || undefined;
  const is_active_param = searchParams.get("status");
  const is_active = is_active_param === "active" ? true : is_active_param === "inactive" ? false : undefined;
  const sortKey = searchParams.get("sort") || undefined;
  const sortOrder = searchParams.get("order") === "desc" ? "desc" : searchParams.get("order") === "asc" ? "asc" : undefined;

  try {
    const { products, count } = await listProducts({
      limit,
      offset,
      search,
      category_id,
      is_active,
      sortKey,
      sortOrder,
    });
    return NextResponse.json({ products, count, page, limit });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => ({}));

    // 先尝试部分更新（只更新 is_active）
    const partialParsed = productPartialUpdateSchema.safeParse(rawBody);
    if (partialParsed.success && partialParsed.data.is_active !== undefined) {
      const { id, is_active } = partialParsed.data;
      const updated = await updateProduct(id, { is_active });
      return NextResponse.json({ product: updated, mode: "edit" }, { status: 200 });
    }

    // 完整的创建/更新
    const parsed = productUpsertSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid product payload",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const mode = data.mode ?? "create";
    const id = data.id?.trim?.() ?? "";

    if (mode === "edit") {
      if (!id) {
        return NextResponse.json({ error: "Missing id for edit mode" }, { status: 400 });
      }

      const updated = await updateProduct(id, {
        code: data.code,
        name: data.name,
        description: data.description,
        category_id: data.category_id,
        price_hq: data.price_hq,
        price_branch: data.price_branch,
        price_classroom: data.price_classroom,
        price_retail: data.price_retail,
        stock: data.stock,
        stock_alert_threshold: data.stock_alert_threshold,
        is_active: data.is_active,
        is_taxable: data.is_taxable,
        tax_rate: data.tax_rate,
        min_order_quantity: data.min_order_quantity,
        max_order_quantity: data.max_order_quantity,
        order_unit: data.order_unit,
        external_id: data.external_id,
        display_order: data.display_order,
      });

      return NextResponse.json({ product: updated, mode: "edit" }, { status: 200 });
    }

    const created = await createProduct({
      code: data.code,
      name: data.name,
      description: data.description,
      category_id: data.category_id,
      price_hq: data.price_hq,
      price_branch: data.price_branch,
      price_classroom: data.price_classroom,
      price_retail: data.price_retail,
      stock: data.stock,
      stock_alert_threshold: data.stock_alert_threshold,
      is_active: data.is_active,
      is_taxable: data.is_taxable,
      tax_rate: data.tax_rate,
      min_order_quantity: data.min_order_quantity,
      max_order_quantity: data.max_order_quantity,
      order_unit: data.order_unit,
      external_id: data.external_id,
      display_order: data.display_order,
    });

    return NextResponse.json({ product: created, mode: "create" }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id")?.trim();

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    await deleteProduct(id);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
