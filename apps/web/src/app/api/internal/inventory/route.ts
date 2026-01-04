import { NextRequest } from "next/server";
import { parsePaginationParams } from "@/lib/pagination";
import {
  listInventory,
  adjustInventory,
  type InventoryStatus,
} from "@enterprise/db";
import { z } from "zod";
import {
  successResponse,
  validationErrorResponse,
  withErrorHandler,
  errorResponse,
} from "@/lib/api-utils";

export const runtime = "nodejs";

const statusValues: InventoryStatus[] = ["all", "ok", "low_stock", "out_of_stock"];

const adjustSchema = z.object({
  productId: z.string().min(1),
  delta: z.number().int(),
  reason: z.enum(["PURCHASE", "RETURN", "STOCKTAKE", "DISPOSAL", "OTHER"]),
  note: z.string().max(500).optional().nullable(),
});

export async function GET(req: NextRequest) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(req.url);
    const { page, limit, offset } = parsePaginationParams(searchParams, {
      defaultLimit: 20,
      maxLimit: 100,
    });

    const search = searchParams.get("q")?.trim() || undefined;
    const category_id = searchParams.get("category") || undefined;
    const rawStatus = (searchParams.get("status") || "all") as InventoryStatus;
    const status: InventoryStatus = statusValues.includes(rawStatus) ? rawStatus : "all";

    const { items, count } = await listInventory({
      search,
      category_id,
      status,
      limit,
      offset,
    });

    return successResponse(items, { page, limit, total: count });
  });
}

export async function POST(req: NextRequest) {
  return withErrorHandler(async () => {
    const rawBody = await req.json().catch(() => ({}));
    const parsed = adjustSchema.safeParse(rawBody);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const data = parsed.data;

    // TODO: Connect to authenticated user ID when auth integration is available
    const adjustment = await adjustInventory({
      productId: data.productId,
      delta: data.delta,
      reason: data.reason,
      note: data.note ?? undefined,
      userId: undefined,
    });

    return { adjustment };
  });
}
