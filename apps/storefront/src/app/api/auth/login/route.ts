import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@enterprise/db";
import { verifyPassword } from "@enterprise/auth";
import { createSession } from "@/lib/auth/session";
import type { StorefrontUser, PriceType } from "@/lib/auth/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountId, password } = body;

    if (!accountId || !password) {
      return NextResponse.json(
        { error: "アカウントIDとパスワードを入力してください" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Find the account by account_id
    const { data: account, error: accountError } = await supabase
      .from("admin_accounts")
      .select(`
        id,
        account_id,
        display_name,
        email,
        status,
        department_id,
        department_name,
        role_id,
        role_code,
        password_hash
      `)
      .eq("account_id", accountId)
      .single();

    if (accountError || !account) {
      return NextResponse.json(
        { error: "アカウントIDまたはパスワードが正しくありません" },
        { status: 401 }
      );
    }

    // Check if account is active
    if (account.status !== "active" && account.status !== "有効") {
      return NextResponse.json(
        { error: "このアカウントは無効です" },
        { status: 401 }
      );
    }

    // Check if account is locked
    const lockedUntil = (account as any).locked_until as string | null;
    if (lockedUntil) {
      const lockTime = new Date(lockedUntil);
      if (lockTime > new Date()) {
        return NextResponse.json(
          { error: "このアカウントはロックされています。しばらく後に再度お試しください。" },
          { status: 429 }
        );
      }
    }

    // Get the role to check storefront access
    let priceType: PriceType = "retail";
    
    if (account.role_id) {
      const { data: role, error: roleError } = await supabase
        .from("roles")
        .select("can_access_storefront, default_price_type, status")
        .eq("id", account.role_id)
        .single();

      if (!roleError && role) {
        // Check if role allows storefront access (if field exists)
        if (role.can_access_storefront === false) {
          return NextResponse.json(
            { error: "このアカウントはオンラインストアへのアクセス権限がありません" },
            { status: 403 }
          );
        }

        // Check if role is active
        if (role.status !== "有効" && role.status !== "active") {
          return NextResponse.json(
            { error: "このロールは無効です" },
            { status: 403 }
          );
        }
        
        // Set price type from role
        if (role.default_price_type) {
          priceType = role.default_price_type as PriceType;
        }
      }
    }
    // Note: If no role_id, allow access with default retail price (for demo)

    // Verify password using bcrypt
    const passwordHash = (account as any).password_hash as string | null;
    if (!passwordHash) {
      return NextResponse.json(
        { error: "このアカウントはパスワードが設定されていません" },
        { status: 401 }
      );
    }

    const passwordMatch = await verifyPassword(password, passwordHash);
    if (!passwordMatch) {
      // Increment failed login attempts
      const failedAttempts = ((account as any).failed_login_attempts as number) || 0;
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

      await supabase.from("admin_accounts").update(updatePayload).eq("id", account.id);

      return NextResponse.json(
        { error: "アカウントIDまたはパスワードが正しくありません" },
        { status: 401 }
      );
    }

    // Create session
    const user: StorefrontUser = {
      id: account.id,
      accountId: account.account_id,
      displayName: account.display_name,
      email: account.email,
      departmentId: account.department_id,
      departmentName: account.department_name,
      roleId: account.role_id,
      roleCode: account.role_code,
      priceType: priceType,
    };

    await createSession(user);

    // Reset failed login attempts and clear lock on successful login
    await supabase
      .from("admin_accounts")
      .update({
        last_login_at: new Date().toISOString(),
        failed_login_attempts: 0,
        locked_until: null,
        last_failed_login_at: null,
      })
      .eq("id", account.id);

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "ログイン処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
