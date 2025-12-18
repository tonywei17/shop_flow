import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, createAuditLog } from "@enterprise/db";
import { signSessionPayload, encodeSignedSession, verifyPassword } from "@enterprise/auth";

export const runtime = "nodejs";

// Type for admin account data from Supabase
type AdminAccountData = {
  id: string;
  account_id: string;
  display_name: string | null;
  status: string | null;
  account_scope: string | null;
  password_hash: string | null;
  locked_until: string | null;
  failed_login_attempts: number | null;
};

export async function POST(req: NextRequest) {
  const adminPassword = process.env.ADMIN_LOGIN_PASSWORD;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!adminPassword || !sessionSecret) {
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

  const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || null;
  const userAgent = req.headers.get("user-agent") || null;

  // Check if this is the env super admin first (takes priority)
  const envAdminId = process.env.ADMIN_LOGIN_ID;
  if (envAdminId && account === envAdminId) {
    // Log successful super admin login
    await createAuditLog({
      action: "login_success",
      actorId: null,
      actorType: "admin",
      targetType: "super_admin",
      targetId: envAdminId,
      details: { account },
      ipAddress,
      userAgent,
    });

    const res = NextResponse.json({
      ok: true,
      accountId: envAdminId,
      displayName: "システム管理者",
    });

    const sessionPayload = JSON.stringify({ admin_account_id: envAdminId });
    const signed = await signSessionPayload(sessionPayload, sessionSecret);
    const encodedSession = encodeSignedSession(signed);

    res.cookies.set({
      name: "admin_session",
      value: encodedSession,
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

  try {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("admin_accounts")
      .select("id, account_id, display_name, status, account_scope, password_hash, locked_until, failed_login_attempts")
      .eq("account_id", account)
      .eq("account_scope", "admin_portal")
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("[auth/login] Failed to fetch admin_accounts", error);
      return NextResponse.json({ error: "アカウント情報の取得に失敗しました" }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "アカウントが存在しません" }, { status: 401 });
    }

    const accountData = data as AdminAccountData;
    const status = accountData.status;
    if (status && status !== "有効" && status !== "active") {
      return NextResponse.json({ error: "このアカウントは無効です" }, { status: 403 });
    }

    // Check if account is locked
    const lockedUntil = accountData.locked_until;
    if (lockedUntil) {
      const lockTime = new Date(lockedUntil);
      if (lockTime > new Date()) {
        await createAuditLog({
          action: "login_locked",
          actorId: data.id,
          actorType: "admin",
          targetType: "admin_account",
          targetId: data.id,
          details: { account, lockedUntil },
          ipAddress,
          userAgent,
        });
        return NextResponse.json(
          { error: "このアカウントはロックされています。しばらく後に再度お試しください。" },
          { status: 429 }
        );
      }
    }

    // Verify password using bcrypt for database accounts
    const passwordHash = accountData.password_hash;
    if (passwordHash) {
      const passwordMatch = await verifyPassword(password, passwordHash);
      if (!passwordMatch) {
        // Increment failed login attempts
        const failedAttempts = accountData.failed_login_attempts || 0;
        const newFailedAttempts = failedAttempts + 1;
        const MAX_FAILED_ATTEMPTS = 5;
        const LOCK_DURATION_MINUTES = 15;

        const updatePayload: Record<string, unknown> = {
          failed_login_attempts: newFailedAttempts,
          last_failed_login_at: new Date().toISOString(),
        };

        // Lock account if max attempts exceeded
        if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
          const lockUntil = new Date();
          lockUntil.setMinutes(lockUntil.getMinutes() + LOCK_DURATION_MINUTES);
          updatePayload.locked_until = lockUntil.toISOString();
        }

        await sb.from("admin_accounts").update(updatePayload).eq("id", data.id);

        await createAuditLog({
          action: newFailedAttempts >= MAX_FAILED_ATTEMPTS ? "login_locked" : "login_failed",
          actorId: data.id,
          actorType: "admin",
          targetType: "admin_account",
          targetId: data.id,
          details: { account, failedAttempts: newFailedAttempts },
          ipAddress,
          userAgent,
        });

        return NextResponse.json({ error: "アカウントまたはパスワードが正しくありません" }, { status: 401 });
      }
    }

    const res = NextResponse.json({
      ok: true,
      accountId: accountData.account_id,
      displayName: accountData.display_name,
    });

    const sessionPayload = JSON.stringify({ admin_account_id: String(accountData.id) });
    const signed = await signSessionPayload(sessionPayload, sessionSecret);
    const encodedSession = encodeSignedSession(signed);

    res.cookies.set({
      name: "admin_session",
      value: encodedSession,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 hours
    });

    res.cookies.set({
      name: "admin_account_id",
      value: String(accountData.id),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    // Reset failed login attempts and clear lock on successful login
    await sb
      .from("admin_accounts")
      .update({
        failed_login_attempts: 0,
        locked_until: null,
        last_failed_login_at: null,
      })
      .eq("id", data.id);

    await createAuditLog({
      action: "login_success",
      actorId: data.id,
      actorType: "admin",
      targetType: "admin_account",
      targetId: data.id,
      details: { account: accountData.account_id },
      ipAddress,
      userAgent,
    });

    return res;
  } catch (error) {
    console.error("[auth/login] Unexpected error during admin login", error);
    return NextResponse.json({ error: "アカウント情報の取得に失敗しました" }, { status: 500 });
  }
}

