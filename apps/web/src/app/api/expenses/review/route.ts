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

    // Check if reviewer is the env admin (special case)
    const envAdminId = process.env.ADMIN_LOGIN_ID;
    const isEnvAdmin = envAdminId && body.reviewer_account_id === envAdminId;

    let isAdmin = false;
    let isSuperAdmin = false;
    let isHeadquarters = false;

    if (isEnvAdmin) {
      // Env admin has full permission
      isAdmin = true;
    } else {
      // Verify reviewer has permission from database
      const { data: reviewer, error: reviewerError } = await supabase
        .from("admin_accounts")
        .select(`
          id,
          account_id,
          department_id,
          role_id,
          role_code,
          status,
          departments:department_id (
            id,
            name
          )
        `)
        .eq("id", body.reviewer_account_id)
        .single();

      if (reviewerError || !reviewer) {
        console.error("Reviewer lookup error:", reviewerError, "reviewer_account_id:", body.reviewer_account_id);
        return NextResponse.json({ error: "審査者が見つかりません" }, { status: 404 });
      }

      // Check if account is active
      if (reviewer.status !== "有効" && reviewer.status !== true) {
        return NextResponse.json({ error: "アカウントが無効です" }, { status: 403 });
      }

      // If role_id exists, fetch role details
      let roleCode: string | null = reviewer.role_code || null;
      if (reviewer.role_id && !roleCode) {
        const { data: roleData } = await supabase
          .from("roles")
          .select("code")
          .eq("id", reviewer.role_id)
          .single();
        roleCode = roleData?.code || null;
      }

      // Check if reviewer has permission (SuperAdmin, admin account, or 本部)
      isAdmin = reviewer.account_id === "admin";
      isSuperAdmin = roleCode === "SuperAdmin";
      
      const deptData = reviewer.departments;
      const dept = Array.isArray(deptData) ? deptData[0] : deptData;
      isHeadquarters = !!(dept && typeof dept === "object" && "name" in dept && 
        typeof dept.name === "string" && dept.name.includes("本部"));
    }

    if (!isAdmin && !isSuperAdmin && !isHeadquarters) {
      return NextResponse.json({ error: "審査権限がありません" }, { status: 403 });
    }

    const newStatus = body.action === "approve" ? "approved" : "rejected";
    const reviewedAt = new Date().toISOString();

    // For env admin, reviewer_account_id is not a valid UUID, so we set it to null
    // The review is still valid because we've verified the permission above
    const reviewerAccountId = isEnvAdmin ? null : body.reviewer_account_id;

    // Update expenses in batches to avoid "URI too long" error
    const BATCH_SIZE = 50;
    const expenseIds = body.expense_ids;
    const allUpdated: { id: string }[] = [];
    
    for (let i = 0; i < expenseIds.length; i += BATCH_SIZE) {
      const batchIds = expenseIds.slice(i, i + BATCH_SIZE);
      
      const { data: updated, error: updateError } = await supabase
        .from("expenses")
        .update({
          review_status: newStatus,
          reviewer_account_id: reviewerAccountId,
          reviewed_at: reviewedAt,
          review_note: body.review_note || (isEnvAdmin ? "システム管理者による承認" : null),
        })
        .in("id", batchIds)
        .select("id");

      if (updateError) {
        console.error("Failed to update expenses batch:", updateError);
        console.error("Update details:", {
          newStatus,
          reviewerAccountId,
          batchIndex: i / BATCH_SIZE,
          batchSize: batchIds.length,
          isEnvAdmin,
        });
        return NextResponse.json({ 
          error: "審査の更新に失敗しました",
          details: updateError.message 
        }, { status: 500 });
      }
      
      if (updated) {
        allUpdated.push(...updated);
      }
    }

    return NextResponse.json({
      success: true,
      updated_count: allUpdated.length,
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
