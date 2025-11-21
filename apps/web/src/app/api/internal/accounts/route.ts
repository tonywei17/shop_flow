import { NextRequest, NextResponse } from "next/server";
import { listAdminAccounts, createAdminAccount, updateAdminAccount } from "@enterprise/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pageParam = Number(searchParams.get("page"));
  const limitParam = Number(searchParams.get("limit"));
  const scope = searchParams.get("scope")?.trim() || undefined;
  const status = searchParams.get("status")?.trim() || undefined;
  const search = searchParams.get("q")?.trim() || undefined;

  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(Math.floor(limitParam), 50) : 20;
  const offset = (page - 1) * limit;

  try {
    const { accounts, count } = await listAdminAccounts({ limit, offset, search, scope, status });
    return NextResponse.json({ accounts, count, page, limit });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const mode = body.mode === "edit" ? "edit" : "create";
    const id = typeof body.id === "string" ? body.id : undefined;

    const accountId = typeof body.account_id === "string" ? body.account_id.trim() : "";
    const displayName = typeof body.display_name === "string" ? body.display_name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const statusRaw = body.status;
    const status =
      statusRaw === true || statusRaw === "有効" || statusRaw === "active" ? "有効" : "無効";
    const roleCode = typeof body.role_code === "string" ? body.role_code.trim() : "";
    const departmentName =
      typeof body.department_name === "string" ? body.department_name.trim() : "";
    const accountScopeRaw =
      typeof body.account_scope === "string" ? body.account_scope.trim() : "";
    const accountScope = accountScopeRaw || "admin_portal";

    if (!accountId || !displayName) {
      return NextResponse.json({ error: "Missing account_id or display_name" }, { status: 400 });
    }

    if (mode === "edit") {
      if (!id) {
        return NextResponse.json({ error: "Missing id for edit mode" }, { status: 400 });
      }

      await updateAdminAccount(id, {
        display_name: displayName,
        email: email || null,
        phone: phone || null,
        status,
        role_code: roleCode || null,
        department_name: departmentName || null,
        account_scope: accountScope,
      });

      return NextResponse.json({ ok: true, mode: "edit" }, { status: 200 });
    }

    const { id: newId } = await createAdminAccount({
      account_id: accountId,
      display_name: displayName,
      email: email || null,
      phone: phone || null,
      status,
      role_code: roleCode || null,
      department_name: departmentName || null,
      account_scope: accountScope,
    });

    return NextResponse.json({ ok: true, mode: "create", id: newId }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
