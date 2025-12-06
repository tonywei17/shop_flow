import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@enterprise/db";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminAccountId = cookieStore.get("admin_account_id")?.value;

    if (!adminAccountId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if this is the env admin (cannot edit)
    const envAdminId = process.env.ADMIN_LOGIN_ID;
    if (envAdminId && adminAccountId === envAdminId) {
      return NextResponse.json(
        { error: "システム管理者のプロフィールは編集できません" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { displayName, email, phone } = body;

    // Validate input
    if (!displayName || typeof displayName !== "string" || displayName.trim().length === 0) {
      return NextResponse.json({ error: "表示名は必須です" }, { status: 400 });
    }

    const sb = getSupabaseAdmin();

    // Update account
    const { error: updateError } = await sb
      .from("admin_accounts")
      .update({
        display_name: displayName.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", adminAccountId);

    if (updateError) {
      console.error("[auth/profile] Failed to update account:", updateError);
      return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[auth/profile] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
