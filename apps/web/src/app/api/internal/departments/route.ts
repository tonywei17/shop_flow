import { NextRequest, NextResponse } from "next/server";
import { parsePaginationParams } from "@/lib/pagination";
import { getDepartmentsWithScope, deleteDepartmentService, updateDepartmentProxyBillingService } from "@/lib/services/org";

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
    const body = await req.json() as { id?: string; allow_proxy_billing?: boolean };
    const { id, allow_proxy_billing } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    if (typeof allow_proxy_billing !== "boolean") {
      return NextResponse.json({ error: "Missing allow_proxy_billing" }, { status: 400 });
    }

    await updateDepartmentProxyBillingService(id, allow_proxy_billing);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
