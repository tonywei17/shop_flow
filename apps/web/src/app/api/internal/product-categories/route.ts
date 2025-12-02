import { NextRequest, NextResponse } from "next/server";
import { parsePaginationParams } from "@/lib/pagination";
import {
  listProductCategories,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
} from "@enterprise/db";
import { productCategoryUpsertSchema } from "@/lib/validation/master-data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const { page, limit, offset } = parsePaginationParams(searchParams, {
    defaultLimit: 50,
    maxLimit: 500,
  });

  const search = searchParams.get("q")?.trim() || undefined;
  const status = searchParams.get("status")?.trim() || undefined;

  try {
    const { items, count } = await listProductCategories({ limit, offset, search, status });
    return NextResponse.json({ productCategories: items, count, page, limit });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => ({}));
    const parsed = productCategoryUpsertSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid product category payload",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const mode = data.mode ?? "create";
    const id = data.id?.trim();

    const code = data.code.trim();
    const name = data.name.trim();
    const status = (data.status ?? "有効").trim() || "有効";

    if (!code || !name) {
      return NextResponse.json({ error: "Missing code or name" }, { status: 400 });
    }

    if (mode === "edit") {
      if (!id) {
        return NextResponse.json({ error: "Missing id for edit mode" }, { status: 400 });
      }

      const item = await updateProductCategory(id, { code, name, status });
      return NextResponse.json({ item, mode: "edit" }, { status: 200 });
    }

    const item = await createProductCategory({ code, name, status });
    return NextResponse.json({ item, mode: "create" }, { status: 201 });
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
    await deleteProductCategory(id);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
