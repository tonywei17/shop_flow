import { NextRequest, NextResponse } from "next/server";
import { listCounterparties, type Counterparty } from "@enterprise/db";
import { buildCsv } from "@/lib/csv";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawIds = searchParams.get("ids");
    const ids = rawIds
      ? rawIds
          .split(",")
          .map((value) => value.trim())
          .filter((value) => value.length > 0)
      : [];

    let all: Counterparty[] = [];

    if (ids.length) {
      const { items } = await listCounterparties({ ids });
      all = items;
    } else {
      const limit = 1000;
      let offset = 0;

      while (true) {
        const { items, count } = await listCounterparties({ limit, offset });
        if (!items.length) break;
        all = all.concat(items);
        offset += items.length;
        if (offset >= count) break;
      }
    }

    const header = ["ID", "Counterparty ID", "Name", "Status", "Created At"];

    const rows = all.map((item) => [
      item.id,
      item.counterparty_id,
      item.name ?? "",
      item.status ?? "",
      item.created_at ? new Date(item.created_at).toISOString() : "",
    ]);

    const csv = buildCsv(header, rows);
    const timestamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "");
    const filename = `counterparties-${timestamp}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
