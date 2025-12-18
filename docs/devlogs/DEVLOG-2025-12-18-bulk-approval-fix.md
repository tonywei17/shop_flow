# Development Log - 2025-12-18 (Bulk Expense Approval Fix)

**Date:** December 18, 2025  
**Time:** 22:00 - 23:30 UTC+09:00  
**Feature:** Bulk Expense Approval Bug Fix (その他費用管理 - 一括承認修正)

## Summary
Fixed critical bugs in the bulk expense approval feature that prevented SuperAdmin accounts from approving expenses. The issues were related to environment variable admin authentication and Supabase query limitations.

## Issues Fixed

### Issue 1: "審査者が見つかりません" (Reviewer not found)

**Symptom:** SuperAdmin account could not perform bulk approval, receiving "Reviewer not found" error.

**Root Cause Analysis:**
- The `/api/auth/me` endpoint returns `ADMIN_LOGIN_ID` (e.g., "admin") as the user ID for environment variable admin accounts
- This is a string identifier, not a UUID from the `admin_accounts` table
- The review API was querying `admin_accounts` table with `.eq("id", body.reviewer_account_id)` which failed because "admin" is not a valid UUID

**Solution:**
```typescript
// Check if reviewer is the env admin (special case)
const envAdminId = process.env.ADMIN_LOGIN_ID;
const isEnvAdmin = envAdminId && body.reviewer_account_id === envAdminId;

if (isEnvAdmin) {
  // Env admin has full permission
  isAdmin = true;
}
```

### Issue 2: "審査の更新に失敗しました" (Update failed - UUID type mismatch)

**Symptom:** After fixing Issue 1, the update still failed with a database error.

**Root Cause Analysis:**
- The `reviewer_account_id` column in `expenses` table is defined as `UUID REFERENCES public.admin_accounts(id)`
- When env admin approves, the code was trying to insert "admin" (string) into a UUID field
- PostgreSQL rejected this as an invalid UUID format

**Solution:**
```typescript
// For env admin, reviewer_account_id is not a valid UUID, so we set it to null
const reviewerAccountId = isEnvAdmin ? null : body.reviewer_account_id;

// Update with null reviewer_account_id for env admin
.update({
  review_status: newStatus,
  reviewer_account_id: reviewerAccountId,
  reviewed_at: reviewedAt,
  review_note: body.review_note || (isEnvAdmin ? "システム管理者による承認" : null),
})
```

### Issue 3: "URI too long" (Bulk update limit exceeded)

**Symptom:** When approving 300+ records at once, the API returned "URI too long" error.

**Root Cause Analysis:**
- Supabase's `.in("id", expense_ids)` generates a URL with all IDs as query parameters
- With 393 UUIDs (each ~36 characters), the URL exceeded browser/server limits
- Error message: `{"error":"審査の更新に失敗しました","details":"URI too long\n"}`

**Solution:**
```typescript
// Update expenses in batches to avoid "URI too long" error
const BATCH_SIZE = 50;
const expenseIds = body.expense_ids;
const allUpdated: { id: string }[] = [];

for (let i = 0; i < expenseIds.length; i += BATCH_SIZE) {
  const batchIds = expenseIds.slice(i, i + BATCH_SIZE);
  
  const { data: updated, error: updateError } = await supabase
    .from("expenses")
    .update({...})
    .in("id", batchIds)
    .select("id");
    
  if (updated) {
    allUpdated.push(...updated);
  }
}
```

## Files Modified

### `/apps/web/src/app/api/expenses/review/route.ts`

**Changes:**
1. Added env admin detection at the start of permission checking
2. Added special permission grant for env admin accounts
3. Changed `reviewer_account_id` to `null` for env admin approvals
4. Added automatic review note "システム管理者による承認" for env admin
5. Implemented batch processing with `BATCH_SIZE = 50`
6. Improved error logging with detailed context

**Before:**
```typescript
// Direct query without env admin check
const { data: reviewer } = await supabase
  .from("admin_accounts")
  .eq("id", body.reviewer_account_id)
  .single();

// Single update for all records
const { data: updated } = await supabase
  .from("expenses")
  .update({...})
  .in("id", body.expense_ids);
```

**After:**
```typescript
// Check for env admin first
const envAdminId = process.env.ADMIN_LOGIN_ID;
const isEnvAdmin = envAdminId && body.reviewer_account_id === envAdminId;

if (isEnvAdmin) {
  isAdmin = true;
} else {
  // Normal database lookup
}

// Batch processing
const BATCH_SIZE = 50;
for (let i = 0; i < expenseIds.length; i += BATCH_SIZE) {
  const batchIds = expenseIds.slice(i, i + BATCH_SIZE);
  // Update batch
}
```

## Testing Results

| Test Case | Before | After |
|-----------|--------|-------|
| SuperAdmin single approval | ❌ Failed | ✅ Pass |
| SuperAdmin bulk approval (20 items) | ❌ Failed | ✅ Pass |
| SuperAdmin bulk approval (393 items) | ❌ Failed | ✅ Pass |
| Regular admin approval | ✅ Pass | ✅ Pass |
| Headquarters user approval | ✅ Pass | ✅ Pass |

## Debugging Process

1. **Chrome DevTools MCP** - Used to interact with the UI and trigger bulk approval
2. **Network Request Analysis** - Identified 500 error and captured response body with error details
3. **Supabase MCP** - Directly tested database updates to confirm schema constraints
4. **Iterative Fixes** - Applied fixes one by one, testing after each change

## Lessons Learned

1. **Environment Variable Admin is Special** - The `ADMIN_LOGIN_ID` creates a "virtual" admin that doesn't exist in the database. All APIs that reference user IDs need to handle this case.

2. **Supabase URL Limits** - The `.in()` filter has practical limits. For bulk operations with many IDs, batch processing is essential.

3. **UUID Foreign Keys** - When a column references another table's UUID primary key, you cannot insert non-UUID values. Use `null` for special cases.

## Related Documentation

- Database Schema: `/supabase/migrations/20251217_expenses_schema.sql`
- Auth API: `/apps/web/src/app/api/auth/me/route.ts`
- User Context: `/apps/web/src/contexts/user-context.tsx`

## Performance Notes

- Batch size of 50 provides good balance between API calls and URL length
- 393 records processed in 8 batches (~5 seconds total)
- No noticeable UI delay for users

---

**Status:** ✅ Complete  
**Verified:** Yes (tested with 393 records)  
**Ready for Deployment:** Yes
