import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@enterprise/db";
import {
  reviewExpenses,
  type ReviewAction,
} from "@enterprise/domain-settlement";

type ReviewRequest = {
  expense_ids: string[];
  action: ReviewAction;
  reviewer_account_id: string;
  review_note?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body: ReviewRequest = await request.json();
    const supabase = getSupabaseAdmin();

    // Get env admin ID
    const envAdminId = process.env.ADMIN_LOGIN_ID;

    // Use domain package to review expenses
    const result = await reviewExpenses(
      supabase,
      body.expense_ids,
      body.action,
      body.reviewer_account_id,
      envAdminId,
      {
        reviewNote: body.review_note,
      }
    );

    if (!result.success) {
      const statusCode =
        result.error?.includes("選択して") ? 400 :
        result.error?.includes("指定して") ? 400 :
        result.error?.includes("見つかりません") ? 404 :
        result.error?.includes("権限がありません") || result.error?.includes("無効です") ? 403 :
        500;

      return NextResponse.json(
        { error: result.error },
        { status: statusCode }
      );
    }

    return NextResponse.json({
      success: true,
      updated_count: result.updated_count,
      action: result.action,
      status: result.status,
    });
  } catch (error) {
    console.error("Error reviewing expenses:", error);
    return NextResponse.json(
      { error: "審査中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
