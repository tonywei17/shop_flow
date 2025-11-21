import { NextRequest, NextResponse } from "next/server";
import { listRoles, createRole } from "@enterprise/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.max(1, Math.min(100, Number(searchParams.get("limit")) || 20));
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const offset = (page - 1) * limit;
  const search = searchParams.get("q")?.trim() || undefined;

  try {
    const { roles, count } = await listRoles({ limit, offset, search });
    return NextResponse.json({ roles, count, page, limit });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const roleId = body.role_id;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const code = typeof body.code === "string" ? body.code.trim() : "";
    const dataScope = typeof body.data_scope === "string" ? body.data_scope.trim() : "all";
    const status = typeof body.status === "string" ? body.status.trim() : "active";
    const description = typeof body.description === "string" ? body.description.trim() : null;

    if (!name || !code) {
      return NextResponse.json({ error: "Missing name or code" }, { status: 400 });
    }

    const payload = await createRole({
      role_id: Number.isFinite(Number(roleId)) ? Number(roleId) : null,
      name,
      code,
      data_scope: dataScope || "all",
      status: status || "active",
      description,
    });

    return NextResponse.json({ role: payload }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
