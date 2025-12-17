import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@enterprise/db";

type ReviewAction = "approve" | "reject";

type ReviewRequest = {
  expense_ids: string[];
  action: ReviewAction;
  reviewer_account_id: string;
  review_note?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body: ReviewRequest = await request.json();

    // Validation
    if (!body.expense_ids || body.expense_ids.length === 0) {
      return NextResponse.json({ error: "審査対象を選択してください" }, { status: 400 });
    }
    if (!body.action || !["approve", "reject"].includes(body.action)) {
      return NextResponse.json({ error: "審査アクションを指定してください" }, { status: 400 });
    }
    if (!body.reviewer_account_id) {
      return NextResponse.json({ error: "審査者を指定してください" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Verify reviewer has permission
    const { data: reviewer, error: reviewerError } = await supabase
      .from("admin_accounts")
      .select(`
        id,
        account_id,
        department_id,
        departments:department_id (
          id,
          name
        )
      `)
      .eq("id", body.reviewer_account_id)
      .eq("status", "有効")
      .single();

    if (reviewerError || !reviewer) {
      return NextResponse.json({ error: "審査者が見つかりません" }, { status: 404 });
    }

    // Check if reviewer has permission (admin or 本部)
    const isAdmin = reviewer.account_id === "admin";
    const deptData = reviewer.departments;
    const dept = Array.isArray(deptData) ? deptData[0] : deptData;
    const isHeadquarters = dept && typeof dept === "object" && "name" in dept && 
      typeof dept.name === "string" && dept.name.includes("本部");

    if (!isAdmin && !isHeadquarters) {
      return NextResponse.json({ error: "審査権限がありません" }, { status: 403 });
    }

    const newStatus = body.action === "approve" ? "approved" : "rejected";
    const reviewedAt = new Date().toISOString();

    // Update expenses
    const { data: updated, error: updateError } = await supabase
      .from("expenses")
      .update({
        review_status: newStatus,
        reviewer_account_id: body.reviewer_account_id,
        reviewed_at: reviewedAt,
        review_note: body.review_note || null,
      })
      .in("id", body.expense_ids)
      .select("id");

    if (updateError) {
      console.error("Failed to update expenses:", updateError);
      return NextResponse.json({ error: "審査の更新に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      updated_count: updated?.length || 0,
      action: body.action,
      status: newStatus,
    });
  } catch (error) {
    console.error("Error reviewing expenses:", error);
    return NextResponse.json(
      { error: "審査中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
