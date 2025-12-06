import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@enterprise/db";
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
        role_code
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

    // TODO: In production, implement proper password verification
    // For now, we'll use a simple check (password === account_id for demo)
    // In production, you should:
    // 1. Store hashed passwords in the database
    // 2. Use bcrypt or similar to verify passwords
    if (password !== accountId) {
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

    // Update last login
    await supabase
      .from("admin_accounts")
      .update({ last_login_at: new Date().toISOString() })
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
