import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@enterprise/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const adminPassword = process.env.ADMIN_LOGIN_PASSWORD;
  const sessionToken = process.env.ADMIN_SESSION_TOKEN;

  if (!adminPassword || !sessionToken) {
    return NextResponse.json(
      { error: "Admin login is not configured" },
      { status: 500 },
    );
  }

  const body = (await req.json().catch(() => null)) as
    | { account?: unknown; password?: unknown }
    | null;

  const account = typeof body?.account === "string" ? body.account.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!account || !password) {
    return NextResponse.json(
      { error: "アカウントとパスワードを入力してください" },
      { status: 400 },
    );
  }

  if (password !== adminPassword) {
    return NextResponse.json({ error: "アカウントまたはパスワードが正しくありません" }, { status: 401 });
  }

  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("admin_accounts")
    .select("id, account_id, display_name, status, account_scope")
    .eq("account_id", account)
    .eq("account_scope", "admin_portal")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[auth/login] Failed to fetch admin_accounts", error);
    const message = (error as any)?.message;
    const isUnauthorized = typeof message === "string" && message.toLowerCase().includes("401");
    const envAdminId = process.env.ADMIN_LOGIN_ID;

    if (envAdminId && account === envAdminId && password === adminPassword && isUnauthorized) {
      const res = NextResponse.json({
        ok: true,
        accountId: envAdminId,
        displayName: "システム管理者",
      });

      res.cookies.set({
        name: "admin_session",
        value: sessionToken,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 8,
      });

      res.cookies.set({
        name: "admin_account_id",
        value: envAdminId,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 8,
      });

      return res;
    }

    return NextResponse.json({ error: "アカウント情報の取得に失敗しました" }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "アカウントが存在しません" }, { status: 401 });
  }

  const status = (data as any).status as string | null;
  if (status && status !== "有効" && status !== "active") {
    return NextResponse.json({ error: "このアカウントは無効です" }, { status: 403 });
  }

  const res = NextResponse.json({
    ok: true,
    accountId: (data as any).account_id,
    displayName: (data as any).display_name,
  });

  res.cookies.set({
    name: "admin_session",
    value: sessionToken,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });

  res.cookies.set({
    name: "admin_account_id",
    value: String((data as any).id),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return res;
}
