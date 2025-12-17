import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@enterprise/db";

// Lookup department by code (店番) to get name (店名)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "店番が必要です" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: department, error } = await supabase
      .from("departments")
      .select("id, code, name, type")
      .eq("code", code)
      .single();

    if (error) {
      // Not found is not an error, just return null
      if (error.code === "PGRST116") {
        return NextResponse.json({ department: null });
      }
      console.error("Failed to lookup department:", error);
      return NextResponse.json({ error: "部署の検索に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({
      department: {
        id: department.id,
        code: department.code,
        name: department.name,
        type: department.type,
      },
    });
  } catch (error) {
    console.error("Error looking up department:", error);
    return NextResponse.json(
      { error: "部署の検索中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
