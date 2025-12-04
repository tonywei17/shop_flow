import { NextRequest, NextResponse } from "next/server";
import { parsePaginationParams } from "@/lib/pagination";
import {
  listAccountItems,
  createAccountItem,
  updateAccountItem,
  deleteAccountItem,
} from "@enterprise/db";
import { accountItemUpsertSchema } from "@/lib/validation/master-data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const { page, limit, offset } = parsePaginationParams(searchParams, {
    defaultLimit: 50,
    maxLimit: 500,
  });

  const search = searchParams.get("q")?.trim() || undefined;
  const status = searchParams.get("status")?.trim() || undefined;

  try {
    const { items, count } = await listAccountItems({ limit, offset, search, status });
    return NextResponse.json({ accountItems: items, count, page, limit });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => ({}));
    const parsed = accountItemUpsertSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid account item payload",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const mode = data.mode ?? "create";
    const id = data.id?.trim();

    const rawId = data.account_item_id;
    const numericId =
      typeof rawId === "number" ? rawId : Number.isFinite(Number(rawId)) ? Number(rawId) : NaN;

    if (!Number.isFinite(numericId) || numericId <= 0) {
      return NextResponse.json({ error: "Invalid account_item_id" }, { status: 400 });
    }

    const name = data.name.trim();
    const status = (data.status ?? "有効").trim() || "有効";

    if (!name) {
      return NextResponse.json({ error: "Missing name" }, { status: 400 });
    }

    if (mode === "edit") {
      if (!id) {
        return NextResponse.json({ error: "Missing id for edit mode" }, { status: 400 });
      }

      const item = await updateAccountItem(id, {
        account_item_id: numericId,
        name,
        status,
      });
      return NextResponse.json({ item, mode: "edit" }, { status: 200 });
    }

    const item = await createAccountItem({
      account_item_id: numericId,
      name,
      status,
    });

    return NextResponse.json({ item, mode: "create" }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
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
    try {
      for (const targetId of ids) {
        await deleteAccountItem(targetId);
      }
      return NextResponse.json({ ok: true, deleted: ids.length }, { status: 200 });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    await deleteAccountItem(id);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
