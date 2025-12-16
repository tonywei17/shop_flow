import { NextRequest, NextResponse } from "next/server";
import { listAdminAccounts } from "@enterprise/db";
import { sendEmail, generateCredentialsEmailHtml } from "@/lib/email/gmail";

const STOREFRONT_LOGIN_URL = process.env.STOREFRONT_URL ?? "https://store.example.com/login";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { ids, all } = body as { ids?: string[]; all?: boolean };

    let accounts: Awaited<ReturnType<typeof listAdminAccounts>>["accounts"] = [];

    if (all) {
      // Fetch all accounts (with reasonable limit)
      const result = await listAdminAccounts({ limit: 10000 });
      accounts = result.accounts;
    } else if (ids && Array.isArray(ids) && ids.length > 0) {
      // Fetch accounts by IDs
      const result = await listAdminAccounts({ ids, limit: ids.length });
      accounts = result.accounts;
    } else {
      return NextResponse.json(
        { error: "送信対象のアカウントIDを指定してください" },
        { status: 400 }
      );
    }

    if (accounts.length === 0) {
      return NextResponse.json(
        { error: "指定されたアカウントが見つかりません" },
        { status: 404 }
      );
    }

    const results: {
      accountId: string;
      email: string | null;
      success: boolean;
      error?: string;
    }[] = [];

    for (const account of accounts) {
      if (!account.email) {
        results.push({
          accountId: account.account_id,
          email: null,
          success: false,
          error: "メールアドレスが登録されていません",
        });
        continue;
      }

      // Generate password (demo mode: password = account_id)
      const password = account.account_id;

      const html = generateCredentialsEmailHtml({
        displayName: account.display_name,
        accountId: account.account_id,
        password,
        loginUrl: STOREFRONT_LOGIN_URL,
      });

      const result = await sendEmail({
        to: account.email,
        subject: "【社内ストア】アカウント情報のお知らせ",
        html,
      });

      results.push({
        accountId: account.account_id,
        email: account.email,
        success: result.success,
        error: result.error,
      });
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      ok: true,
      message: `${successCount}件のメールを送信しました${failCount > 0 ? `（${failCount}件失敗）` : ""}`,
      results,
      successCount,
      failCount,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to send credentials emails:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
