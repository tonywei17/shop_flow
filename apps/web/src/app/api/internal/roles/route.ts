import { NextRequest } from "next/server";
import { parsePaginationParams } from "@/lib/pagination";
import {
  getRoles,
  createRoleService,
  updateRoleService,
  deleteRoleService,
  type CreateRoleInput,
  type UpdateRoleInput,
} from "@/lib/services/org";
import { roleCreateSchema } from "@enterprise/domain-org";
import {
  successResponse,
  validationErrorResponse,
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
    const search = searchParams.get("q")?.trim() || undefined;

    const { roles, count } = await getRoles({ limit, offset, search });
    return successResponse(roles, { page, limit, total: count });
  });
}

export async function POST(req: NextRequest) {
  return withErrorHandler(async () => {
    const rawBody = await req.json().catch(() => ({}));
    const parsed = roleCreateSchema.safeParse(rawBody);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error as any);
    }

    const data = parsed.data;
    const mode = data.mode ?? "create";
    const id = data.id?.trim?.() ?? "";

    const roleId = data.role_id;
    const name = data.name.trim();
    const code = data.code.trim();
    const dataScope = (data.data_scope ?? "すべてのデータ").trim() || "すべてのデータ";
    const dataScopeType = (data.data_scope_type ?? "all").trim() || "all";
    const allowedDepartmentIds = Array.isArray(data.allowed_department_ids) ? data.allowed_department_ids : [];
    const status = (data.status ?? "active").trim() || "active";
    const description = data.description ? data.description.trim() : null;
    const featurePermissions = data.feature_permissions ?? [];
    const badgeColor = data.badge_color ?? null;
    const canAccessStorefront = data.can_access_storefront ?? false;
    const defaultPriceType = data.default_price_type ?? "retail";

    if (!name || !code) {
      return errorResponse("Missing name or code", 400);
    }

    const numericRoleId =
      typeof roleId === "number"
        ? roleId
        : Number.isFinite(Number(roleId))
          ? Number(roleId)
          : null;

    if (mode === "edit") {
      if (!id) {
        return errorResponse("Missing id for edit mode", 400);
      }

      const roleInput: UpdateRoleInput = {
        role_id: numericRoleId,
        name,
        code,
        data_scope: dataScope,
        data_scope_type: dataScopeType as any,
        allowed_department_ids: allowedDepartmentIds,
        status: status || "active",
        description,
        feature_permissions: featurePermissions,
        badge_color: badgeColor,
        can_access_storefront: canAccessStorefront,
        default_price_type: defaultPriceType as any,
      };

      const updated = await updateRoleService(id, roleInput);

      return { role: updated, mode: "edit" };
    }

    const roleInput: CreateRoleInput = {
      role_id: numericRoleId,
      name,
      code,
      data_scope: dataScope,
      data_scope_type: dataScopeType as any,
      allowed_department_ids: allowedDepartmentIds,
      status: status || "active",
      description,
      feature_permissions: featurePermissions,
      badge_color: badgeColor,
      can_access_storefront: canAccessStorefront,
      default_price_type: defaultPriceType as any,
    };

    const created = await createRoleService(roleInput);

    return { role: created, mode: "create" };
  });
}

export async function DELETE(req: NextRequest) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id")?.trim();

    if (!id) {
      return errorResponse("Missing id", 400);
    }

    await deleteRoleService(id);
    return { ok: true };
  });
}
