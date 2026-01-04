import { NextRequest } from "next/server";
import { parsePaginationParams } from "@/lib/pagination";
import { hashPassword } from "@enterprise/auth";
import {
  getAdminAccountsWithScope,
  createAdminAccountService,
  updateAdminAccountService,
  deleteAdminAccountService,
  type UpdateAdminAccountInput,
  type CreateAdminAccountInput,
} from "@/lib/services/org";
import { accountUpsertSchema } from "@/lib/validation/accounts";
import {
  successResponse,
  validationErrorResponse,
  serverErrorResponse,
  withErrorHandler,
  errorResponse,
} from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(req.url);
    const { page, limit, offset } = parsePaginationParams(searchParams, {
      defaultLimit: 20,
      maxLimit: 100,
    });
    const scope = searchParams.get("scope")?.trim() || undefined;
    const status = searchParams.get("status")?.trim() || undefined;
    const search = searchParams.get("q")?.trim() || undefined;

    // 应用数据权限过滤
    const { accounts, count } = await getAdminAccountsWithScope({
      limit,
      offset,
      search,
      scope,
      status,
    });
    return successResponse(accounts, { page, limit, total: count });
  });
}

export async function POST(req: NextRequest) {
  return withErrorHandler(async () => {
    const rawBody = await req.json().catch(() => ({}));
    const parsed = accountUpsertSchema.safeParse(rawBody);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const data = parsed.data;
    const mode = data.mode ?? "create";
    const id = data.id;

    const accountId = data.account_id.trim();
    const displayName = data.display_name.trim();
    const email = (data.email ?? "").trim();
    const phone = (data.phone ?? "").trim();
    const password = (data.password ?? "").trim();

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
      return errorResponse("Missing account_id or display_name", 400);
    }

    let passwordHash: string | null = null;
    if (password) {
      passwordHash = await hashPassword(password);
    }

    if (mode === "edit") {
      if (!id) {
        return errorResponse("Missing id for edit mode", 400);
      }

      const updatePayload: UpdateAdminAccountInput = {
        display_name: displayName,
        email: email || null,
        phone: phone || null,
        status,
        department_id: departmentId,
        department_name: departmentName || null,
        role_id: roleId,
        role_code: roleCode || null,
        account_scope: accountScope,
      };

      if (passwordHash) {
        updatePayload.password_hash = passwordHash;
      }

      await updateAdminAccountService(id, updatePayload);

      return { ok: true, mode: "edit" };
    }

    const createPayload: CreateAdminAccountInput = {
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
    };

    if (passwordHash) {
      createPayload.password_hash = passwordHash;
    }

    const { id: newId } = await createAdminAccountService(createPayload);

    return { ok: true, mode: "create", id: newId };
  });
}

export async function DELETE(req: NextRequest) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id")?.trim();

    if (!id) {
      return errorResponse("Missing id", 400);
    }

    await deleteAdminAccountService(id);
    return { ok: true };
  });
}
