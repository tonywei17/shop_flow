import { NextRequest, NextResponse } from "next/server";
import { parsePaginationParams } from "@/lib/pagination";
import { getDepartmentsWithScope, deleteDepartmentService, updateDepartmentProxyBillingService, updateDepartmentCommissionRateService } from "@/lib/services/org";

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
