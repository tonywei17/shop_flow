import { NextRequest, NextResponse } from "next/server";
import type { DepartmentWithParent } from "@enterprise/db";
import { getDepartments } from "@/lib/services/org";
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

    let all: DepartmentWithParent[] = [];

    if (ids.length) {
      const { departments } = await getDepartments({ ids });
      all = departments;
    } else {
      const limit = 1000;
      let offset = 0;

      // paginate through all departments
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
      (dept as any).created_at ? new Date((dept as any).created_at).toISOString() : "",
    ]);

    const csv = buildCsv(header, rows);
    const timestamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "");
    const filename = `departments-${timestamp}.csv`;

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
