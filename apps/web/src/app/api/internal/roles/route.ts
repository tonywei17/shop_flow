import { NextRequest, NextResponse } from "next/server";
import { parsePaginationParams } from "@/lib/pagination";
import { getRoles, createRoleService } from "@/lib/services/org";
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
    const roleId = data.role_id;
    const name = data.name.trim();
    const code = data.code.trim();
    const dataScope = (data.data_scope ?? "all").trim() || "all";
    const status = (data.status ?? "active").trim() || "active";
    const description = data.description ? data.description.trim() : null;

    if (!name || !code) {
      return NextResponse.json({ error: "Missing name or code" }, { status: 400 });
    }

    const payload = await createRoleService({
      role_id:
        typeof roleId === "number"
          ? roleId
          : Number.isFinite(Number(roleId))
            ? Number(roleId)
            : null,
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
