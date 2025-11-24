import { NextRequest, NextResponse } from "next/server";
import type { DepartmentWithParent } from "@enterprise/db";
import { getDepartments } from "@/lib/services/org";
import { exportToSheet } from "@/lib/google-sheets";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const spreadsheetId = process.env.GOOGLE_SHEETS_DEPARTMENTS_SPREADSHEET_ID;
  const sheetName = process.env.GOOGLE_SHEETS_DEPARTMENTS_SHEET_NAME || "Departments";

  if (!spreadsheetId) {
    return NextResponse.json(
      { error: "GOOGLE_SHEETS_DEPARTMENTS_SPREADSHEET_ID is not configured" },
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

    let all: DepartmentWithParent[] = [];

    if (ids.length) {
      const { departments } = await getDepartments({ ids });
      all = departments;
    } else {
      const limit = 1000;
      let offset = 0;

      // paginate through all departments
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { departments, count } = await getDepartments({ limit, offset });
        if (!departments.length) break;
        all = all.concat(departments);
        offset += departments.length;
        if (offset >= count) break;
      }
    }

    const header = [
      "ID",
      "External ID",
      "Name",
      "Code",
      "Category",
      "Level",
      "Parent ID",
      "Parent External ID",
      "Parent Name",
      "Manager Name",
      "Phone Primary",
      "Postal Code",
      "Prefecture",
      "City",
      "Address Line 1",
      "Address Line 2",
      "Type",
      "Is Independent",
      "Status",
      "Created At",
    ];

    const rows = all.map((dept) => [
      dept.id,
      dept.external_id ?? "",
      dept.name,
      dept.code ?? "",
      dept.category ?? "",
      dept.level ?? "",
      dept.parent_id ?? "",
      dept.parent_external_id ?? "",
      dept.parent_name ?? "",
      dept.manager_name ?? "",
      dept.phone_primary ?? "",
      dept.postal_code ?? "",
      dept.prefecture ?? "",
      dept.city ?? "",
      dept.address_line1 ?? "",
      dept.address_line2 ?? "",
      dept.type ?? "",
      dept.is_independent ? "true" : "false",
      dept.status ?? "",
      // created_at is string | null in the record type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (dept as any).created_at ? new Date((dept as any).created_at).toISOString() : "",
    ]);

    await exportToSheet(spreadsheetId, sheetName, header, rows);

    return NextResponse.json({ ok: true, rowCount: all.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
