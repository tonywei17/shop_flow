import { NextRequest, NextResponse } from "next/server";
import { parsePaginationParams } from "@/lib/pagination";
import {
  getAdminAccountsWithScope,
  createAdminAccountService,
  updateAdminAccountService,
  deleteAdminAccountService,
} from "@/lib/services/org";
import { accountUpsertSchema } from "@/lib/validation/accounts";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const { page, limit, offset } = parsePaginationParams(searchParams, {
    defaultLimit: 20,
    maxLimit: 100,
  });
  const scope = searchParams.get("scope")?.trim() || undefined;
  const status = searchParams.get("status")?.trim() || undefined;
  const search = searchParams.get("q")?.trim() || undefined;

  try {
    // 应用数据权限过滤
    const { accounts, count } = await getAdminAccountsWithScope({ limit, offset, search, scope, status });
    return NextResponse.json({ accounts, count, page, limit });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => ({}));
    const parsed = accountUpsertSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid account payload",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const mode = data.mode ?? "create";
    const id = data.id;

    const accountId = data.account_id.trim();
    const displayName = data.display_name.trim();
    const email = (data.email ?? "").trim();
    const phone = (data.phone ?? "").trim();

    const statusRaw = data.status;
    const status =
      statusRaw === true || statusRaw === "有効" || statusRaw === "active" ? "有効" : "無効";

    const departmentId = data.department_id ?? null;
    const departmentName = (data.department_name ?? "").trim();
    const roleId = data.role_id ?? null;
    const roleCode = (data.role_code ?? "").trim();
    const accountScopeRaw = (data.account_scope ?? "").trim();
    const accountScope = accountScopeRaw || "admin_portal";

    if (!accountId || !displayName) {
      return NextResponse.json({ error: "Missing account_id or display_name" }, { status: 400 });
    }

    if (mode === "edit") {
      if (!id) {
        return NextResponse.json({ error: "Missing id for edit mode" }, { status: 400 });
      }

      await updateAdminAccountService(id, {
        display_name: displayName,
        email: email || null,
        phone: phone || null,
        status,
        department_id: departmentId,
        department_name: departmentName || null,
        role_id: roleId,
        role_code: roleCode || null,
        account_scope: accountScope,
      });

      return NextResponse.json({ ok: true, mode: "edit" }, { status: 200 });
    }

    const { id: newId } = await createAdminAccountService({
      account_id: accountId,
      display_name: displayName,
      email: email || null,
      phone: phone || null,
      status,
      department_id: departmentId,
      department_name: departmentName || null,
      role_id: roleId,
      role_code: roleCode || null,
      account_scope: accountScope,
    });

    return NextResponse.json({ ok: true, mode: "create", id: newId }, { status: 201 });
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
    await deleteAdminAccountService(id);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
