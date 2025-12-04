import { NextRequest, NextResponse } from "next/server";
import { listProductCategories, type ProductCategory } from "@enterprise/db";
import { exportToSheet } from "@/lib/google-sheets";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const spreadsheetId = process.env.GOOGLE_SHEETS_PRODUCT_CATEGORIES_SPREADSHEET_ID;
  const sheetName = process.env.GOOGLE_SHEETS_PRODUCT_CATEGORIES_SHEET_NAME || "ProductCategories";

  if (!spreadsheetId) {
    return NextResponse.json(
      { error: "GOOGLE_SHEETS_PRODUCT_CATEGORIES_SPREADSHEET_ID is not configured" },
      { status: 500 },
    );
  }

  try {
    const body = (await req.json().catch(() => null)) as { ids?: unknown } | null;
    const ids = Array.isArray(body?.ids)
      ? (body?.ids as unknown[])
          .map((value) => (typeof value === "string" ? value.trim() : ""))
          .filter((value) => value.length > 0)
      : [];

    let all: ProductCategory[] = [];

    if (ids.length) {
      const { items } = await listProductCategories({ ids });
      all = items;
    } else {
      const limit = 1000;
      let offset = 0;

      while (true) {
        const { items, count } = await listProductCategories({ limit, offset });
        if (!items.length) break;
        all = all.concat(items);
        offset += items.length;
        if (offset >= count) break;
      }
    }

    const header = ["ID", "Code", "Name", "Status", "Created At"];

    const rows = all.map((item) => [
      item.id,
      item.code,
      item.name,
      item.status ?? "",
      item.created_at ? new Date(item.created_at).toISOString() : "",
    ]);

    await exportToSheet(spreadsheetId, sheetName, header, rows);

    return NextResponse.json({ ok: true, rowCount: all.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
