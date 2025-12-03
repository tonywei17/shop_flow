import { NextRequest, NextResponse } from "next/server";
import type { AdminAccount } from "@enterprise/db";
import { getAdminAccounts } from "@/lib/services/org";
import { exportToSheet } from "@/lib/google-sheets";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ACCOUNTS_SPREADSHEET_ID;
  const sheetName = process.env.GOOGLE_SHEETS_ACCOUNTS_SHEET_NAME || "Accounts";

  if (!spreadsheetId) {
    return NextResponse.json(
      { error: "GOOGLE_SHEETS_ACCOUNTS_SPREADSHEET_ID is not configured" },
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

    await exportToSheet(spreadsheetId, sheetName, header, rows);

    return NextResponse.json({ ok: true, rowCount: all.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
