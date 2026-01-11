import { NextRequest } from "next/server";
import { parsePaginationParams } from "@/lib/pagination";
import { getDepartmentsWithScope, deleteDepartmentService, updateDepartmentProxyBillingService, updateDepartmentCommissionRateService, createDepartmentService, updateDepartmentService } from "@/lib/services/org";
import { departmentUpsertSchema } from "@enterprise/domain-org";
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
    const category = searchParams.get("category")?.trim() || undefined;

    // 应用数据权限过滤
    const { departments, count } = await getDepartmentsWithScope({
      limit,
      offset,
      search,
      category,
    });
    return successResponse(departments, { page, limit, total: count });
  });
}

export async function DELETE(req: NextRequest) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id")?.trim();

    if (!id) {
      return errorResponse("Missing id", 400);
    }

    await deleteDepartmentService(id);
    return { ok: true };
  });
}

export async function POST(req: NextRequest) {
  return withErrorHandler(async () => {
    const rawBody = await req.json().catch(() => ({}));
    const parsed = departmentUpsertSchema.safeParse(rawBody);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error as any);
    }

    const data = parsed.data;
    const mode = data.mode ?? "create";
    const id = data.id?.trim();

    const name = data.name.trim();
    const type = data.type.trim();

    if (!name || !type) {
      return errorResponse("Missing name or type", 400);
    }

    const externalId =
      typeof data.external_id === "number"
        ? data.external_id
        : typeof data.external_id === "string" && data.external_id.trim()
          ? Number(data.external_id)
          : null;

    const parentExternalId =
      typeof data.parent_external_id === "number"
        ? data.parent_external_id
        : typeof data.parent_external_id === "string" && data.parent_external_id.trim()
          ? Number(data.parent_external_id)
          : null;

    const departmentInput = {
      external_id: externalId,
      parent_id: data.parent_id ?? null,
      parent_external_id: parentExternalId,
      name,
      type,
      category: data.category ?? null,
      code: data.code ?? null,
      level: data.level ?? 1,
      manager_name: data.manager_name ?? null,
      phone_primary: data.phone_primary ?? null,
      status: data.status ?? "有効",
      postal_code: data.postal_code ?? null,
      prefecture: data.prefecture ?? null,
      city: data.city ?? null,
      address_line1: data.address_line1 ?? null,
      address_line2: data.address_line2 ?? null,
      is_independent: data.is_independent ?? false,
      allow_proxy_billing: data.allow_proxy_billing ?? false,
      commission_rate: data.commission_rate ?? null,
    };

    if (mode === "edit") {
      if (!id) {
        return errorResponse("Missing id for edit mode", 400);
      }

      const department = await updateDepartmentService(id, departmentInput);
      return { department, mode: "edit" };
    }

    const department = await createDepartmentService(departmentInput);
    return { department, mode: "create" };
  });
}

export async function PATCH(req: NextRequest) {
  return withErrorHandler(async () => {
    const body = (await req.json().catch(() => ({}))) as {
      id?: string;
      allow_proxy_billing?: boolean;
      commission_rate?: number;
    };
    const { id, allow_proxy_billing, commission_rate } = body;

    if (!id) {
      return errorResponse("Missing id", 400);
    }

    // Update proxy billing if provided
    if (typeof allow_proxy_billing === "boolean") {
      await updateDepartmentProxyBillingService(id, allow_proxy_billing);
    }

    // Update commission rate if provided
    if (typeof commission_rate === "number") {
      if (commission_rate < 0 || commission_rate > 100) {
        return errorResponse("Commission rate must be between 0 and 100", 400);
      }
      await updateDepartmentCommissionRateService(id, commission_rate);
    }

    // At least one field must be provided
    if (typeof allow_proxy_billing !== "boolean" && typeof commission_rate !== "number") {
      return errorResponse("No valid fields to update", 400);
    }

    return { ok: true };
  });
}
