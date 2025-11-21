import { NextRequest, NextResponse } from "next/server";
import { listDepartments } from "@enterprise/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limitParam = Number(searchParams.get("limit"));
  const pageParam = Number(searchParams.get("page"));
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(1, limitParam), 100) : 20;
  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
  const offset = (page - 1) * limit;
  const search = searchParams.get("q")?.trim() || undefined;
  const category = searchParams.get("category")?.trim() || undefined;

  try {
    const { departments, count } = await listDepartments({ limit, offset, search, category });
    return NextResponse.json({ departments, count, page, limit });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
