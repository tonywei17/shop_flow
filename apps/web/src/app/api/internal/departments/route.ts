import { NextRequest, NextResponse } from "next/server";
import { parsePaginationParams } from "@/lib/pagination";
import { getDepartmentsWithScope, deleteDepartmentService, updateDepartmentProxyBillingService, updateDepartmentCommissionRateService, createDepartmentService, updateDepartmentService } from "@/lib/services/org";
import { departmentUpsertSchema } from "@/lib/validation/departments";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const { page, limit, offset } = parsePaginationParams(searchParams, {
    defaultLimit: 20,
    maxLimit: 100,
  });
  const search = searchParams.get("q")?.trim() || undefined;
  const category = searchParams.get("category")?.trim() || undefined;

  try {
    // 应用数据权限过滤
    const { departments, count } = await getDepartmentsWithScope({ limit, offset, search, category });
    return NextResponse.json({ departments, count, page, limit });
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
    await deleteDepartmentService(id);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => ({}));
    const parsed = departmentUpsertSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid department payload",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const mode = data.mode ?? "create";
    const id = data.id?.trim();

    const name = data.name.trim();
    const type = data.type.trim();

    if (!name || !type) {
      return NextResponse.json({ error: "Missing name or type" }, { status: 400 });
    }

    const externalId = typeof data.external_id === "number" 
      ? data.external_id 
      : typeof data.external_id === "string" && data.external_id.trim()
        ? Number(data.external_id)
        : null;

    const parentExternalId = typeof data.parent_external_id === "number"
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
        return NextResponse.json({ error: "Missing id for edit mode" }, { status: 400 });
      }

      const department = await updateDepartmentService(id, departmentInput);
      return NextResponse.json({ department, mode: "edit" }, { status: 200 });
    }

    const department = await createDepartmentService(departmentInput);
    return NextResponse.json({ department, mode: "create" }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json() as { 
      id?: string; 
      allow_proxy_billing?: boolean;
      commission_rate?: number;
    };
    const { id, allow_proxy_billing, commission_rate } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    // Update proxy billing if provided
    if (typeof allow_proxy_billing === "boolean") {
      await updateDepartmentProxyBillingService(id, allow_proxy_billing);
    }

    // Update commission rate if provided
    if (typeof commission_rate === "number") {
      if (commission_rate < 0 || commission_rate > 100) {
        return NextResponse.json({ error: "Commission rate must be between 0 and 100" }, { status: 400 });
      }
      await updateDepartmentCommissionRateService(id, commission_rate);
    }

    // At least one field must be provided
    if (typeof allow_proxy_billing !== "boolean" && typeof commission_rate !== "number") {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
