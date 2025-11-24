import { NextRequest, NextResponse } from "next/server";
import type { RoleRecord } from "@enterprise/db";
import { getRoles } from "@/lib/services/org";
import { exportToSheet } from "@/lib/google-sheets";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ROLES_SPREADSHEET_ID;
  const sheetName = process.env.GOOGLE_SHEETS_ROLES_SHEET_NAME || "Roles";

  if (!spreadsheetId) {
    return NextResponse.json(
      { error: "GOOGLE_SHEETS_ROLES_SPREADSHEET_ID is not configured" },
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

    let all: RoleRecord[] = [];

    if (ids.length) {
      const { roles } = await getRoles({ ids });
      all = roles;
    } else {
      const limit = 1000;
      let offset = 0;

      // paginate through all roles
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { roles, count } = await getRoles({ limit, offset });
        if (!roles.length) break;
        all = all.concat(roles);
        offset += roles.length;
        if (offset >= count) break;
      }
    }

    const header = [
      "ID",
      "Role ID",
      "Code",
      "Name",
      "Data Scope",
      "Status",
      "Description",
      "Created At",
    ];

    const rows = all.map((role) => [
      role.id,
      role.role_id ?? "",
      role.code,
      role.name,
      role.data_scope ?? "",
      role.status ?? "",
      role.description ?? "",
      // created_at is string | null in the record type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (role as any).created_at ? new Date((role as any).created_at).toISOString() : "",
    ]);

    await exportToSheet(spreadsheetId, sheetName, header, rows);

    return NextResponse.json({ ok: true, rowCount: all.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
