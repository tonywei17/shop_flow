import { NextRequest, NextResponse } from "next/server";
import { parsePaginationParams } from "@/lib/pagination";
import { getDepartments } from "@/lib/services/org";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const { page, limit, offset } = parsePaginationParams(searchParams, {
    defaultLimit: 20,
    maxLimit: 100,
  });
  const search = searchParams.get("q")?.trim() || undefined;
  const category = searchParams.get("category")?.trim() || undefined;

  try {
    const { departments, count } = await getDepartments({ limit, offset, search, category });
    return NextResponse.json({ departments, count, page, limit });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
