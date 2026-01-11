# Supabase Row Level Security (RLS) Implementation Guide

> **作成日**: 2026-01-11
> **目的**: Service Role Key依存からRow Level Security (RLS)ベースのアクセス制御への移行

---

## 現在の問題

### 1. Service Role Key の過剰使用

**場所**: [`packages/db/src/client.ts:8`](../../packages/db/src/client.ts#L8)

```typescript
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
```

**問題点**:
- Service Role Key はすべてのRow Level Security (RLS)ポリシーをバイパスする
- 全APIリクエストが完全なデータベース権限で実行される
- アプリケーション層のバグが直接データ漏洩につながる
- データ権限制御が完全にアプリケーションコードに依存

### 2. アプリケーション層のデータスコープフィルタリング

**場所**: [`apps/web/src/lib/auth/data-scope-context.ts`](../../apps/web/src/lib/auth/data-scope-context.ts)

**問題点**:
- データスコープフィルタが手動で適用される必要がある
- 忘れた場合に権限漏れが発生
- テストが困難

---

## 推奨アーキテクチャ: RLSベース

### アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js API Routes                    │
│  - Session verification (HMAC)                           │
│  - User JWT generation from session                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Supabase Client (Anon Key)                  │
│  - User's JWT attached to requests                       │
│  - RLS policies automatically enforced                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Supabase Database                       │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Row Level Security (RLS) Policies                │  │
│  │  - auth.uid() matches record ownership            │  │
│  │  - department_id filtering                        │  │
│  │  - role-based access control                      │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 実装ステップ

### Step 1: Supabase Auth 統合

#### 1.1 カスタムJWT生成関数の作成

**新規ファイル**: `packages/auth/src/jwt.ts`

```typescript
import { SignJWT } from 'jose';

export interface AdminJWTPayload {
  sub: string;                    // User ID
  role: 'authenticated';
  admin_account_id: string;
  department_id?: string | null;
  role_id?: string | null;
  role_code?: string | null;
  data_scope_type: 'all' | 'self_only' | 'custom';
  allowed_department_ids?: string[];
}

export async function generateAdminJWT(
  payload: AdminJWTPayload,
  secret: string
): Promise<string> {
  const jwt = await new SignJWT({
    ...payload,
    aud: 'authenticated',
    iss: 'enterprise-auth',
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(new TextEncoder().encode(secret));

  return jwt;
}
```

#### 1.2 ログイン時にJWT生成

**修正**: `apps/web/src/app/api/auth/login/route.ts`

```typescript
import { generateAdminJWT } from '@enterprise/auth';

export async function POST(request: NextRequest) {
  // ... 既存の認証ロジック ...

  // Get user's data scope context
  const dataScopeContext = await getCurrentUserDataScopeContext();

  // Generate JWT for Supabase
  const jwtSecret = process.env.SUPABASE_JWT_SECRET!;
  const jwt = await generateAdminJWT({
    sub: user.id,
    role: 'authenticated',
    admin_account_id: user.id,
    department_id: user.department_id,
    role_id: user.role_id,
    role_code: user.role_code,
    data_scope_type: dataScopeContext.dataScopeType,
    allowed_department_ids: dataScopeContext.allowedDepartmentIds,
  }, jwtSecret);

  // Store JWT in cookie
  cookies().set('supabase_jwt', jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 8 * 60 * 60, // 8 hours
  });

  // ... rest of login logic ...
}
```

### Step 2: Supabase Client のリファクタリング

#### 2.1 Per-Request Supabase Client

**修正**: `packages/db/src/client.ts`

```typescript
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Get Supabase client with Service Role Key (admin privileges)
 * ONLY use this for operations that truly need admin access
 */
export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false }
  });
}

/**
 * Get Supabase client with user's JWT (RLS enforced)
 * Use this for all user-initiated data operations
 */
export async function getSupabaseUser(): Promise<SupabaseClient> {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
  }

  const cookieStore = await cookies();
  const jwt = cookieStore.get('supabase_jwt')?.value;

  const client = createClient(url, anonKey, {
    auth: { persistSession: false },
    global: {
      headers: jwt ? {
        Authorization: `Bearer ${jwt}`,
      } : {},
    },
  });

  return client;
}
```

### Step 3: RLS ポリシーの作成

#### 3.1 基本的なRLSポリシーテンプレート

**SQL Migration**: `supabase/migrations/YYYYMMDD_enable_rls.sql`

```sql
-- Enable RLS on admin_accounts table
ALTER TABLE admin_accounts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own account
CREATE POLICY "Users can read own account"
ON admin_accounts
FOR SELECT
TO authenticated
USING (
  id = (current_setting('request.jwt.claims', true)::json->>'admin_account_id')::uuid
);

-- Policy: Admins can read all accounts
CREATE POLICY "Admins can read all accounts"
ON admin_accounts
FOR SELECT
TO authenticated
USING (
  (current_setting('request.jwt.claims', true)::json->>'role_code') = 'admin'
  OR
  (current_setting('request.jwt.claims', true)::json->>'data_scope_type') = 'all'
);

-- Policy: Department-based access
CREATE POLICY "Department-scoped read access"
ON admin_accounts
FOR SELECT
TO authenticated
USING (
  (current_setting('request.jwt.claims', true)::json->>'data_scope_type') = 'custom'
  AND
  department_id = ANY(
    ARRAY(
      SELECT jsonb_array_elements_text(
        (current_setting('request.jwt.claims', true)::json->>'allowed_department_ids')::jsonb
      )
    )::uuid[]
  )
);
```

#### 3.2 請求書テーブルのRLS

```sql
-- Enable RLS on invoices table
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Policy: Users with 'all' scope can access all invoices
CREATE POLICY "All scope can read all invoices"
ON invoices
FOR SELECT
TO authenticated
USING (
  (current_setting('request.jwt.claims', true)::json->>'data_scope_type') = 'all'
);

-- Policy: Custom scope can read department invoices
CREATE POLICY "Department-scoped invoice access"
ON invoices
FOR SELECT
TO authenticated
USING (
  (current_setting('request.jwt.claims', true)::json->>'data_scope_type') = 'custom'
  AND
  department_id = ANY(
    ARRAY(
      SELECT jsonb_array_elements_text(
        (current_setting('request.jwt.claims', true)::json->>'allowed_department_ids')::jsonb
      )
    )::uuid[]
  )
);

-- Policy: Self-only scope (no invoices visible unless explicitly granted)
CREATE POLICY "Self-only has no invoice access"
ON invoices
FOR SELECT
TO authenticated
USING (false);  -- Deny all by default
```

### Step 4: APIルートの移行

#### 4.1 Before (Service Role Key)

```typescript
export async function GET(req: NextRequest) {
  const supabase = getSupabaseAdmin();  // ❌ RLS bypassed

  const { data } = await supabase
    .from('invoices')
    .select('*')
    .eq('billing_month', billingMonth);  // Manual filtering

  return NextResponse.json({ data });
}
```

#### 4.2 After (RLS Enforced)

```typescript
export async function GET(req: NextRequest) {
  const supabase = await getSupabaseUser();  // ✅ RLS enforced

  const { data } = await supabase
    .from('invoices')
    .select('*')
    .eq('billing_month', billingMonth);

  // RLS automatically filters by user's permissions
  // No manual department_id filtering needed!

  return NextResponse.json({ data });
}
```

### Step 5: 管理者操作の特別処理

一部の操作は引き続き Service Role Key が必要:

```typescript
// ✅ Use Service Role Key for:
// - System audit logs
// - Admin clear operations
// - Account creation/deletion
// - Password reset

export async function POST(req: NextRequest) {
  // Verify admin permission first
  const validation = await validateClearDataRequest(password, operatorName);

  if ("error" in validation) {
    return validation.error;
  }

  // Use admin client for destructive operations
  const supabase = getSupabaseAdmin();

  await supabase.from('invoices').delete().eq('billing_month', month);
}
```

---

## 移行チェックリスト

### Phase 1: 準備 (1-2日)

- [ ] Supabase プロジェクトで RLS を有効化
- [ ] JWT生成関数を実装
- [ ] Per-request Supabase client を実装
- [ ] テスト環境で動作確認

### Phase 2: RLSポリシー作成 (2-3日)

- [ ] `admin_accounts` テーブルのRLSポリシー
- [ ] `invoices` テーブルのRLSポリシー
- [ ] `orders` テーブルのRLSポリシー
- [ ] `expenses` テーブルのRLSポリシー
- [ ] `cc_members` テーブルのRLSポリシー
- [ ] `departments` テーブルのRLSポリシー
- [ ] `roles` テーブルのRLSポリシー

### Phase 3: APIルート移行 (3-5日)

- [ ] `/api/invoices/*` → `getSupabaseUser()`
- [ ] `/api/orders/*` → `getSupabaseUser()`
- [ ] `/api/expenses/*` → `getSupabaseUser()`
- [ ] `/api/internal/accounts/*` → `getSupabaseUser()` (read only)
- [ ] `/api/internal/departments/*` → `getSupabaseUser()`

### Phase 4: テストと検証 (2-3日)

- [ ] 各データスコープタイプでのアクセステスト
- [ ] 権限エスカレーション攻撃のテスト
- [ ] パフォーマンステスト
- [ ] 監査ログの確認

### Phase 5: 本番デプロイ (1日)

- [ ] ステージング環境でフルテスト
- [ ] 本番環境へのマイグレーション
- [ ] モニタリングとアラート設定

---

## セキュリティ上の注意事項

### 1. JWT Secret の管理

```bash
# .env
SUPABASE_JWT_SECRET=<Supabase Dashboard → Settings → API → JWT Secret>
```

**重要**: このシークレットは Supabase の JWT Secret と完全に一致する必要があります

### 2. RLSポリシーのテスト

```sql
-- Test as specific user
SET request.jwt.claims = '{
  "admin_account_id": "123e4567-e89b-12d3-a456-426614174000",
  "role_code": "manager",
  "data_scope_type": "custom",
  "allowed_department_ids": ["dept-uuid-1", "dept-uuid-2"]
}';

-- Test query
SELECT * FROM invoices;
```

### 3. Service Role Key の使用を最小限に

**使用すべき場合**:
- システム監査ログ
- 管理者によるデータ削除操作
- アカウント作成/削除
- パスワードリセット

**使用すべきでない場合**:
- 通常のCRUD操作
- ユーザーデータの取得
- レポート生成

---

## パフォーマンス最適化

### 1. RLSポリシーのインデックス

```sql
-- Index on department_id for faster filtering
CREATE INDEX idx_invoices_department_id ON invoices(department_id);
CREATE INDEX idx_admin_accounts_department_id ON admin_accounts(department_id);
```

### 2. JWT クレームの最適化

JWTに必要最小限の情報のみを含める:
- ユーザーID
- ロールコード
- データスコープタイプ
- 許可された部署ID (最大10個程度)

---

## トラブルシューティング

### Issue 1: RLS が機能しない

**症状**: すべてのレコードが見える、または何も見えない

**解決策**:
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Check current JWT claims
SELECT current_setting('request.jwt.claims', true);
```

### Issue 2: パフォーマンス低下

**症状**: RLS有効化後にクエリが遅い

**解決策**:
```sql
-- Analyze query plan
EXPLAIN ANALYZE
SELECT * FROM invoices WHERE department_id = 'xxx';

-- Add indexes
CREATE INDEX idx_invoices_department_id ON invoices(department_id);
```

---

## 参考資料

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)

---

## 更新履歴

| 日付 | 変更内容 | 担当者 |
|------|---------|--------|
| 2026-01-11 | 初版作成 | Claude Code |
