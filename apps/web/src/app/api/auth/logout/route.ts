import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Clear admin session cookies
    cookieStore.delete("admin_session");
    cookieStore.delete("admin_account_id");
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[auth/logout] Error during logout:", error);
    return NextResponse.json(
      { error: "ログアウト処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
