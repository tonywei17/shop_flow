import { NextRequest, NextResponse } from "next/server";
import { parsePaginationParams } from "@/lib/pagination";
import { getRoles, createRoleService, updateRoleService, deleteRoleService } from "@/lib/services/org";
import { roleCreateSchema } from "@/lib/validation/roles";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const { page, limit, offset } = parsePaginationParams(searchParams, {
    defaultLimit: 20,
    maxLimit: 100,
  });
  const search = searchParams.get("q")?.trim() || undefined;

  try {
    const { roles, count } = await getRoles({ limit, offset, search });
    return NextResponse.json({ roles, count, page, limit });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => ({}));
    const parsed = roleCreateSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid role payload",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
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
      return NextResponse.json({ error: "Missing name or code" }, { status: 400 });
    }

    const numericRoleId =
      typeof roleId === "number"
        ? roleId
        : Number.isFinite(Number(roleId))
          ? Number(roleId)
          : null;

    if (mode === "edit") {
      if (!id) {
        return NextResponse.json({ error: "Missing id for edit mode" }, { status: 400 });
      }

      const updated = await updateRoleService(id, {
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
      });

      return NextResponse.json({ role: updated, mode: "edit" }, { status: 200 });
    }

    const created = await createRoleService({
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
    });

    return NextResponse.json({ role: created, mode: "create" }, { status: 201 });
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
    await deleteRoleService(id);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
