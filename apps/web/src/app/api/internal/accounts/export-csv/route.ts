import { NextRequest, NextResponse } from "next/server";
import type { AdminAccount } from "@enterprise/db";
import { getAdminAccounts } from "@/lib/services/org";
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

    let all: AdminAccount[] = [];

    if (ids.length) {
      const { accounts } = await getAdminAccounts({ ids });
      all = accounts;
    } else {
      const limit = 1000;
      let offset = 0;

      // paginate through all accounts
      while (true) {
        const { accounts, count } = await getAdminAccounts({ limit, offset });
        if (!accounts.length) break;
        all = all.concat(accounts);
        offset += accounts.length;
        if (offset >= count) break;
      }
    }

    const header = [
      "ID",
      "Account ID",
      "Display Name",
      "Email",
      "Phone",
      "Status",
      "Department Name",
      "Role Code",
      "Account Scope",
      "Last Login IP",
      "Last Login At",
      "External ID",
      "Department ID",
      "Department External ID",
    ];

    const rows = all.map((account) => [
      account.id,
      account.account_id,
      account.display_name,
      account.email ?? "",
      account.phone ?? "",
      account.status ?? "",
      account.department_name ?? "",
      account.role_code ?? "",
      account.account_scope ?? "",
      account.last_login_ip ?? "",
      account.last_login_at ? new Date(account.last_login_at).toISOString() : "",
      account.external_id ?? "",
      account.department_id ?? "",
      account.department_external_id ?? "",
    ]);

    const csv = buildCsv(header, rows);
    const timestamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "");
    const filename = `accounts-${timestamp}.csv`;

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
