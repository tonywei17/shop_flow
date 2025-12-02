import { NextRequest, NextResponse } from "next/server";
import { parsePaginationParams } from "@/lib/pagination";
import {
  listCounterparties,
  createCounterparty,
  updateCounterparty,
  deleteCounterparty,
} from "@enterprise/db";
import { counterpartyUpsertSchema } from "@/lib/validation/master-data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const { page, limit, offset } = parsePaginationParams(searchParams, {
    defaultLimit: 50,
    maxLimit: 500,
  });

  const search = searchParams.get("q")?.trim() || undefined;
  const status = searchParams.get("status")?.trim() || undefined;

  try {
    const { items, count } = await listCounterparties({ limit, offset, search, status });
    return NextResponse.json({ counterparties: items, count, page, limit });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => ({}));
    const parsed = counterpartyUpsertSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid counterparty payload",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const mode = data.mode ?? "create";
    const id = data.id?.trim();

    const rawId = data.counterparty_id;
    const numericId =
      typeof rawId === "number" ? rawId : Number.isFinite(Number(rawId)) ? Number(rawId) : NaN;

    if (!Number.isFinite(numericId) || numericId <= 0) {
      return NextResponse.json({ error: "Invalid counterparty_id" }, { status: 400 });
    }

    const name = data.name?.trim() || null;
    const status = (data.status ?? "有効").trim() || "有効";

    if (mode === "edit") {
      if (!id) {
        return NextResponse.json({ error: "Missing id for edit mode" }, { status: 400 });
      }

      const item = await updateCounterparty(id, {
        counterparty_id: numericId,
        name,
        status,
      });
      return NextResponse.json({ item, mode: "edit" }, { status: 200 });
    }

    const item = await createCounterparty({
      counterparty_id: numericId,
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

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    await deleteCounterparty(id);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
