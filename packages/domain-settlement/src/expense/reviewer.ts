/**
 * @enterprise/domain-settlement - Expense Reviewer
 *
 * Core business logic for expense review and approval workflow.
 * Extracted from apps/web to make it reusable and testable.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

// =============================================================================
// Types
// =============================================================================

/**
 * Review action type
 */
export type ReviewAction = "approve" | "reject";

/**
 * Review status type
 */
export type ReviewStatus = "pending" | "approved" | "rejected";

/**
 * Reviewer permission check result
 */
export interface ReviewerPermission {
  hasPermission: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isHeadquarters: boolean;
  isEnvAdmin: boolean;
}

/**
 * Review options
 */
export interface ExpenseReviewOptions {
  /** Batch size for updates (default: 50) */
  batchSize?: number;
  /** Review note/comment */
  reviewNote?: string;
}

/**
 * Review result
 */
export interface ExpenseReviewResult {
  success: boolean;
  updated_count: number;
  action: ReviewAction;
  status: ReviewStatus;
  error?: string;
}

// =============================================================================
// Permission Checking
// =============================================================================

/**
 * Check if reviewer has permission to approve/reject expenses.
 *
 * Permission rules:
 * - Env admin (from ADMIN_LOGIN_ID) always has permission
 * - SuperAdmin role has permission
 * - Admin account (account_id = 'admin') has permission
 * - Headquarters department (本部) has permission
 *
 * @param supabase - Supabase client
 * @param reviewerAccountId - Reviewer's account ID
 * @param envAdminId - Environment admin ID (from env var)
 * @returns Permission check result
 */
export async function checkReviewerPermission(
  supabase: SupabaseClient,
  reviewerAccountId: string,
  envAdminId?: string
): Promise<ReviewerPermission> {
  // Check if reviewer is the env admin (special case)
  const isEnvAdmin = !!(envAdminId && reviewerAccountId === envAdminId);

  if (isEnvAdmin) {
    return {
      hasPermission: true,
      isAdmin: true,
      isSuperAdmin: false,
      isHeadquarters: false,
      isEnvAdmin: true,
    };
  }

  // Verify reviewer from database
  const { data: reviewer, error: reviewerError } = await supabase
    .from("admin_accounts")
    .select(
      `
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
    `
    )
    .eq("id", reviewerAccountId)
    .single();

  if (reviewerError || !reviewer) {
    return {
      hasPermission: false,
      isAdmin: false,
      isSuperAdmin: false,
      isHeadquarters: false,
      isEnvAdmin: false,
    };
  }

  // Check if account is active
  if (reviewer.status !== "有効" && reviewer.status !== true) {
    return {
      hasPermission: false,
      isAdmin: false,
      isSuperAdmin: false,
      isHeadquarters: false,
      isEnvAdmin: false,
    };
  }

  // Get role code
  let roleCode: string | null = reviewer.role_code || null;
  if (reviewer.role_id && !roleCode) {
    const { data: roleData } = await supabase
      .from("roles")
      .select("code")
      .eq("id", reviewer.role_id)
      .single();
    roleCode = roleData?.code || null;
  }

  // Check permissions
  const isAdmin = reviewer.account_id === "admin";
  const isSuperAdmin = roleCode === "SuperAdmin";

  const deptData = reviewer.departments;
  const dept = Array.isArray(deptData) ? deptData[0] : deptData;
  const isHeadquarters = !!(
    dept &&
    typeof dept === "object" &&
    "name" in dept &&
    typeof dept.name === "string" &&
    dept.name.includes("本部")
  );

  const hasPermission = isAdmin || isSuperAdmin || isHeadquarters;

  return {
    hasPermission,
    isAdmin,
    isSuperAdmin,
    isHeadquarters,
    isEnvAdmin: false,
  };
}

// =============================================================================
// Review Actions
// =============================================================================

/**
 * Map review action to status.
 *
 * @param action - Review action
 * @returns Review status
 */
export function mapActionToStatus(action: ReviewAction): ReviewStatus {
  return action === "approve" ? "approved" : "rejected";
}

/**
 * Update expenses in batches to avoid "URI too long" error.
 *
 * @param supabase - Supabase client
 * @param expenseIds - Array of expense IDs to update
 * @param reviewStatus - New review status
 * @param reviewerAccountId - Reviewer's account ID (null for env admin)
 * @param options - Review options
 * @returns Array of updated expense IDs
 */
export async function updateExpensesInBatches(
  supabase: SupabaseClient,
  expenseIds: string[],
  reviewStatus: ReviewStatus,
  reviewerAccountId: string | null,
  options?: ExpenseReviewOptions
): Promise<{ id: string }[]> {
  const batchSize = options?.batchSize ?? 50;
  const reviewedAt = new Date().toISOString();
  const allUpdated: { id: string }[] = [];

  for (let i = 0; i < expenseIds.length; i += batchSize) {
    const batchIds = expenseIds.slice(i, i + batchSize);

    const { data: updated, error: updateError } = await supabase
      .from("expenses")
      .update({
        review_status: reviewStatus,
        reviewer_account_id: reviewerAccountId,
        reviewed_at: reviewedAt,
        review_note: options?.reviewNote || null,
      })
      .in("id", batchIds)
      .select("id");

    if (updateError) {
      console.error("Failed to update expenses batch:", updateError);
      console.error("Update details:", {
        reviewStatus,
        reviewerAccountId,
        batchIndex: i / batchSize,
        batchSize: batchIds.length,
      });
      throw new Error(`審査の更新に失敗しました: ${updateError.message}`);
    }

    if (updated) {
      allUpdated.push(...updated);
    }
  }

  return allUpdated;
}

// =============================================================================
// Main Review Function
// =============================================================================

/**
 * Review expenses (approve or reject).
 *
 * This is the main orchestration function that:
 * 1. Validates input
 * 2. Checks reviewer permission
 * 3. Updates expenses in batches
 *
 * @param supabase - Supabase client
 * @param expenseIds - Array of expense IDs to review
 * @param action - Review action (approve or reject)
 * @param reviewerAccountId - Reviewer's account ID
 * @param envAdminId - Environment admin ID (from env var)
 * @param options - Review options
 * @returns Review result
 */
export async function reviewExpenses(
  supabase: SupabaseClient,
  expenseIds: string[],
  action: ReviewAction,
  reviewerAccountId: string,
  envAdminId?: string,
  options?: ExpenseReviewOptions
): Promise<ExpenseReviewResult> {
  // Validation
  if (!expenseIds || expenseIds.length === 0) {
    return {
      success: false,
      updated_count: 0,
      action,
      status: mapActionToStatus(action),
      error: "審査対象を選択してください",
    };
  }

  if (!action || !["approve", "reject"].includes(action)) {
    return {
      success: false,
      updated_count: 0,
      action,
      status: mapActionToStatus(action),
      error: "審査アクションを指定してください",
    };
  }

  if (!reviewerAccountId) {
    return {
      success: false,
      updated_count: 0,
      action,
      status: mapActionToStatus(action),
      error: "審査者を指定してください",
    };
  }

  // Check reviewer permission
  const permission = await checkReviewerPermission(
    supabase,
    reviewerAccountId,
    envAdminId
  );

  if (!permission.hasPermission) {
    return {
      success: false,
      updated_count: 0,
      action,
      status: mapActionToStatus(action),
      error: "審査権限がありません",
    };
  }

  // Prepare update data
  const newStatus = mapActionToStatus(action);
  // For env admin, reviewer_account_id is not a valid UUID, so we set it to null
  const reviewerIdForDb = permission.isEnvAdmin ? null : reviewerAccountId;

  // Add default review note for env admin if not provided
  const reviewOptions = {
    ...options,
    reviewNote: options?.reviewNote || (permission.isEnvAdmin ? "システム管理者による承認" : undefined),
  };

  try {
    // Update expenses in batches
    const updated = await updateExpensesInBatches(
      supabase,
      expenseIds,
      newStatus,
      reviewerIdForDb,
      reviewOptions
    );

    return {
      success: true,
      updated_count: updated.length,
      action,
      status: newStatus,
    };
  } catch (error) {
    return {
      success: false,
      updated_count: 0,
      action,
      status: newStatus,
      error: error instanceof Error ? error.message : "審査中にエラーが発生しました",
    };
  }
}
