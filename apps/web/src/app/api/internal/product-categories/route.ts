import { NextRequest } from "next/server";
import { parsePaginationParams } from "@/lib/pagination";
import {
  listProductCategories,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
} from "@enterprise/db";
import { productCategoryUpsertSchema } from "@/lib/validation/master-data";
import {
  successResponse,
  validationErrorResponse,
  withErrorHandler,
  errorResponse,
} from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(req.url);
    const { page, limit, offset } = parsePaginationParams(searchParams, {
      defaultLimit: 50,
      maxLimit: 500,
    });

    const search = searchParams.get("q")?.trim() || undefined;
    const status = searchParams.get("status")?.trim() || undefined;

    const { items, count } = await listProductCategories({ limit, offset, search, status });
    return successResponse(items, { page, limit, total: count });
  });
}

export async function POST(req: NextRequest) {
  return withErrorHandler(async () => {
    const rawBody = await req.json().catch(() => ({}));
    const parsed = productCategoryUpsertSchema.safeParse(rawBody);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const data = parsed.data;
    const mode = data.mode ?? "create";
    const id = data.id?.trim();

    const code = data.code.trim();
    const name = data.name.trim();
    const status = (data.status ?? "有効").trim() || "有効";

    if (!code || !name) {
      return errorResponse("Missing code or name", 400);
    }

    if (mode === "edit") {
      if (!id) {
        return errorResponse("Missing id for edit mode", 400);
      }

      const item = await updateProductCategory(id, { code, name, status });
      return { item, mode: "edit" };
    }

    const item = await createProductCategory({ code, name, status });
    return { item, mode: "create" };
  });
}

export async function DELETE(req: NextRequest) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id")?.trim();
    let ids: string[] = [];

    try {
      const body = (await req.json().catch(() => null)) as { ids?: unknown } | null;
      if (Array.isArray(body?.ids)) {
        ids = (body.ids as unknown[])
          .map((value) => (typeof value === "string" ? value.trim() : ""))
          .filter((value) => value.length > 0);
      }
    } catch {
      // ignore body parse errors and fall back to query param path
    }

    if (ids.length) {
      for (const targetId of ids) {
        await deleteProductCategory(targetId);
      }
      return { ok: true, deleted: ids.length };
    }

    if (!id) {
      return errorResponse("Missing id", 400);
    }

    await deleteProductCategory(id);
    return { ok: true };
  });
}
