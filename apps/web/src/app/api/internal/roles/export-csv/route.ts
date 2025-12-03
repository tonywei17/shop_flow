import { NextRequest, NextResponse } from "next/server";
import type { RoleRecord } from "@enterprise/db";
import { getRoles } from "@/lib/services/org";
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

    let all: RoleRecord[] = [];

    if (ids.length) {
      const { roles } = await getRoles({ ids });
      all = roles;
    } else {
      const limit = 1000;
      let offset = 0;

      // paginate through all roles
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
      (role as any).created_at ? new Date((role as any).created_at).toISOString() : "",
    ]);

    const csv = buildCsv(header, rows);
    const timestamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "");
    const filename = `roles-${timestamp}.csv`;

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
