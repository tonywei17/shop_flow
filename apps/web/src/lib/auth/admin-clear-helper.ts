import { NextResponse } from "next/server";
import { verifyAdminSession } from "./verify-session";
import { getSupabaseAdmin } from "@enterprise/db";

const CLEAR_DATA_PASSWORD = process.env.ADMIN_CLEAR_DATA_PASSWORD;

if (!CLEAR_DATA_PASSWORD) {
  console.error("[SECURITY] ADMIN_CLEAR_DATA_PASSWORD is not set. Admin clear operations will be disabled.");
}

export interface AdminInfo {
  accountId: string;
  name: string;
  role: string;
}

/**
 * Validates clear data request and returns admin info
 * Returns NextResponse with error if validation fails, otherwise returns admin info
 */
export async function validateClearDataRequest(
  password: string,
  operatorName: string
): Promise<{ error: NextResponse } | { adminInfo: AdminInfo }> {
  // Check if password is configured
  if (!CLEAR_DATA_PASSWORD) {
    return {
      error: NextResponse.json(
        { error: "データ削除機能が有効化されていません。環境変数を確認してください。" },
        { status: 503 }
      ),
    };
  }

  // Validate operator name
  if (!operatorName || operatorName.trim().length < 2) {
    return {
      error: NextResponse.json(
        { error: "操作者の氏名を入力してください（2文字以上）" },
        { status: 400 }
      ),
    };
  }

  // Validate password
  if (password !== CLEAR_DATA_PASSWORD) {
    return {
      error: NextResponse.json(
        { error: "パスワードが正しくありません" },
        { status: 403 }
      ),
    };
  }

  // Verify session with HMAC signature
  const sessionResult = await verifyAdminSession();

  if (!sessionResult.isValid || !sessionResult.payload) {
    return {
      error: NextResponse.json(
        { error: "セッションが無効です。再度ログインしてください。" },
        { status: 401 }
      ),
    };
  }

  const adminAccountId = sessionResult.payload.admin_account_id;
  let adminName = "Unknown";
  let adminRole = "Unknown";

  // Get admin details
  if (adminAccountId) {
    const supabase = getSupabaseAdmin();
    const { data: adminData } = await supabase
      .from("admin_accounts")
      .select(`
        display_name,
        roles:role_id (
          name,
          code
        )
      `)
      .eq("account_id", adminAccountId)
      .single();

    if (adminData) {
      adminName = adminData.display_name || adminAccountId;
      adminRole = (adminData.roles as { code?: string })?.code || "unknown";
    }
  }

  // Check if user is SuperAdmin (role code is "admin" in the database)
  if (adminRole !== "admin") {
    return {
      error: NextResponse.json(
        { error: "この操作はスーパー管理者のみ実行できます" },
        { status: 403 }
      ),
    };
  }

  return {
    adminInfo: {
      accountId: adminAccountId,
      name: adminName,
      role: adminRole,
    },
  };
}

/**
 * Checks if current user has admin permission
 */
export async function checkAdminPermission(): Promise<{
  hasPermission: boolean;
  role?: string;
}> {
  try {
    // Verify session with HMAC signature
    const sessionResult = await verifyAdminSession();

    if (!sessionResult.isValid || !sessionResult.payload) {
      return { hasPermission: false };
    }

    const supabase = getSupabaseAdmin();
    const adminAccountId = sessionResult.payload.admin_account_id;

    if (!adminAccountId) {
      return { hasPermission: false };
    }

    const { data: adminData } = await supabase
      .from("admin_accounts")
      .select(`
        roles:role_id (
          code
        )
      `)
      .eq("account_id", adminAccountId)
      .single();

    const roleCode = (adminData?.roles as { code?: string })?.code;

    return {
      hasPermission: roleCode === "admin",
      role: roleCode,
    };
  } catch (error) {
    console.error("[checkAdminPermission] Error:", error);
    return { hasPermission: false };
  }
}
