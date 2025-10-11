import { NextRequest, NextResponse } from "next/server";
import { listProducts, createProduct } from "@enterprise/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenant_id = searchParams.get("tenant_id") || undefined;
  const q = searchParams.get("q") || undefined;
  const limit = searchParams.get("limit");
  const offset = searchParams.get("offset");

  const parsed = {
    tenant_id,
    q,
    limit: limit ? Math.max(1, Math.min(100, Number(limit))) : 20,
    offset: offset ? Math.max(0, Number(offset)) : 0,
  } as const;

  try {
    const data = await listProducts(parsed);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const sku = typeof body.sku === "string" ? body.sku.trim() : "";
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const price = typeof body.price === "string" || typeof body.price === "number" ? Number(body.price) : 0;
    const stock = typeof body.stock === "string" || typeof body.stock === "number" ? Number(body.stock) : 0;
    const tenant_id = typeof body.tenant_id === "string" ? body.tenant_id : undefined;

    if (!sku || !title) {
      return NextResponse.json({ error: "Missing sku or title" }, { status: 400 });
    }

    const price_retail_cents = Math.max(0, Math.round(Number(price) * 100));
    const created = await createProduct({
      tenant_id,
      sku,
      title,
      price_retail_cents,
      stock: Math.max(0, Number.isFinite(stock) ? stock : 0),
    });
    return NextResponse.json({ product: created }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
