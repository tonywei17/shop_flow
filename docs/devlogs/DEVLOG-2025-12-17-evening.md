# Dev Log — 2025-12-17 (Evening Session)

## Summary
- Invoice versioning system implementation
- SuperAdmin data clear functionality with audit logging
- Month picker terminology update ("月分" concept)
- SuperAdmin role permissions enhancement

---

## Invoice Versioning System ✅

### Schema Updates
Added versioning columns to `invoices` table:
- `version` (INTEGER, default 1) - Version number
- `is_current` (BOOLEAN, default true) - Whether this is the current version
- `superseded_by` (UUID) - Reference to newer version
- `supersedes` (UUID) - Reference to older version
- `generation_reason` (TEXT) - Reason for generation (initial/regeneration/correction)

### Invoice Number Format
Changed from `INV-YYYYMM-支局代码` to `INV-YYYYMM-支局代码-vN`:
- Example: `INV-202512-1110-v1`, `INV-202512-1110-v2`

### Versioning Logic
- First generation: v1, `generation_reason = "initial"`
- Regeneration of draft invoices: Old version marked as `superseded`, new version created
- Confirmed/sent invoices cannot be regenerated

**Files changed:**
- `supabase/migrations/20251217_invoice_versioning.sql`
- `apps/web/src/app/api/invoices/generate-batch/route.ts`
- `apps/web/src/app/api/invoices/route.ts`

---

## SuperAdmin Data Clear Functionality ✅

### Features
- Password-protected API endpoint for clearing invoice data
- Only SuperAdmin (role_code = "admin") can access
- Two options: Clear selected month or clear all data
- All operations logged to `system_audit_log` table

### Security
- Password validation: `ADMIN_CLEAR_DATA_PASSWORD` env variable
- Default password: `CLEAR_TEST_DATA_2025`
- Role verification via session cookie
- Audit logging with IP, user agent, and metadata

**New files:**
- `apps/web/src/app/api/admin/clear-invoices/route.ts`

**Files changed:**
- `apps/web/src/app/(dashboard)/billing/invoices/invoices-client.tsx` - Added UI dialog

---

## Month Picker Terminology Update ✅

### Concept Clarification
- **X月**: Current calendar month
- **Y月分**: Billing period for data generated within month Y

### Changes
- Month picker now displays "12月分" instead of "12月"
- "今月" button changed to "今月分"
- Added helper function `getPreviousMonth()` for billing defaults
- Invoice generator now defaults to previous month (e.g., 11月分 when current is 12月)
- Added explanation text: "※「月分」は該当月内に発生したデータの請求期間を指します"

**Files changed:**
- `apps/web/src/components/billing/month-picker.tsx`
- `apps/web/src/app/(dashboard)/billing/generate/invoice-generator-client.tsx`
- `apps/web/src/app/(dashboard)/billing/invoices/invoices-client.tsx`
- `apps/web/src/app/(dashboard)/billing/cc-fees/cc-fees-client.tsx`
- `apps/web/src/app/(dashboard)/billing/expenses/expenses-client.tsx`
- `apps/web/src/app/(dashboard)/commerce/orders/orders-client.tsx`

---

## SuperAdmin Role Permissions Enhancement ✅

### Database Updates
Updated `roles` table for SuperAdmin (code = "admin"):

| Field | Old Value | New Value |
|-------|-----------|-----------|
| `can_access_storefront` | `false` | `true` |
| `default_price_type` | `retail` | `hq` |
| `feature_permissions` | Limited list | `NULL` (full access) |
| `data_scope_type` | `all` | `all` |
| `data_scope` | - | `すべてのデータ` |

### Permissions
SuperAdmin now has:
- Full feature access (no restrictions)
- Online store access
- HQ pricing tier
- All data scope access

---

## Code Health Check

### Lint Status
```
✔ 0 errors, 1 warning (pre-existing)
Warning: React.useEffect missing dependency in expenses-client.tsx
```

### TypeScript
```
✔ No type errors
```

---

## Database Migrations

New migrations to run:
1. `20251217_invoice_versioning.sql` - Invoice versioning columns
2. `system_audit_log` table creation (via SQL execution)

---

## Notes / Next Steps
- Consider adding invoice version history view in UI
- Add confirmation workflow for finalized invoices
- Monitor audit logs for data clear operations during testing phase
