# Security Architecture

> Last updated: 2025-12-17

## Overview

This document describes the security architecture implemented across the shop_flow platform, covering authentication, session management, and audit logging.

---

## 1. Authentication

### 1.1 Password Hashing

All passwords are hashed using **bcrypt** with a cost factor of 10.

```typescript
// @enterprise/auth/src/password.ts
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### 1.2 Failed Login Protection

| Setting | Value |
|---------|-------|
| Max failed attempts | 5 |
| Lockout duration | 15 minutes |
| Tracking fields | `failed_login_attempts`, `locked_until`, `last_failed_login_at` |

**Flow:**
1. User submits credentials
2. If account is locked (`locked_until > now`), reject with 429
3. Verify password with bcrypt
4. On failure: increment `failed_login_attempts`
5. If attempts >= 5: set `locked_until` to now + 15 minutes
6. On success: reset all tracking fields

### 1.3 Super Admin Access

Environment-based super admin for emergency access:

```env
ADMIN_LOGIN_ID=admin
ADMIN_LOGIN_PASSWORD=<strong-password>
```

This bypasses database lookup but still uses HMAC-signed sessions.

---

## 2. Session Management

### 2.1 HMAC-Signed Sessions

Sessions are signed using **HMAC-SHA256** via the Web Crypto API (Edge Runtime compatible).

```typescript
// @enterprise/auth/src/session.ts
const HMAC_ALGORITHM = "SHA-256";

async function hmacSign(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: HMAC_ALGORITHM },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
```

### 2.2 Cookie Configuration

| Attribute | Value | Purpose |
|-----------|-------|---------|
| `httpOnly` | `true` | Prevent XSS access |
| `sameSite` | `lax` | CSRF protection |
| `secure` | `true` (prod) | HTTPS only |
| `maxAge` | 8 hours | Session expiry |
| `path` | `/` | Site-wide |

### 2.3 Session Cookies

**Admin (web app):**
- `admin_session` - HMAC-signed session payload
- `admin_account_id` - Account identifier

**Storefront:**
- `storefront_session` - HMAC-signed session payload

---

## 3. Audit Logging

### 3.1 Audit Log Schema

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  actor_id UUID,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('admin', 'user', 'system')),
  target_type TEXT,
  target_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.2 Tracked Actions

| Action | Description |
|--------|-------------|
| `login_success` | Successful authentication |
| `login_failed` | Failed authentication attempt |
| `login_locked` | Account locked due to failed attempts |
| `order_created` | New order placed |
| `order_cancelled` | Order cancelled |
| `order_status_changed` | Order status updated |
| `inventory_adjusted` | Stock level changed |
| `product_created` | New product added |
| `product_updated` | Product modified |
| `product_deleted` | Product removed |
| `settings_updated` | Store settings changed |
| `account_created` | New admin account |
| `account_updated` | Admin account modified |
| `password_changed` | Password updated |

### 3.3 Usage

```typescript
import { createAuditLog } from "@enterprise/db";

await createAuditLog({
  action: "login_success",
  actorId: user.id,
  actorType: "admin",
  targetType: "admin_account",
  targetId: user.id,
  details: { account: user.account_id },
  ipAddress: req.headers.get("x-forwarded-for"),
  userAgent: req.headers.get("user-agent"),
});
```

---

## 4. Environment Security

### 4.1 Secret Management

| Variable | Exposure | Notes |
|----------|----------|-------|
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Never expose to client |
| `ADMIN_SESSION_SECRET` | Server only | Min 32 characters |
| `STOREFRONT_SESSION_SECRET` | Server only | Min 32 characters |
| `STRIPE_SECRET_KEY` | Server only | API routes only |

### 4.2 Client-Safe Variables

Only variables prefixed with `NEXT_PUBLIC_` are exposed to the client:
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_MEDUSA_BACKEND_URL`

---

## 5. API Security

### 5.1 Authentication Middleware

All protected routes verify session signatures:

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const session = request.cookies.get("admin_session")?.value;
  const decoded = decodeSignedSession(session);
  
  if (!decoded || !(await verifySessionPayload(decoded, sessionSecret))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
```

### 5.2 Input Validation

- Zod schemas for request validation
- SQL injection prevention via Supabase parameterized queries
- XSS prevention via React's automatic escaping

---

## 6. Database Security

### 6.1 Row Level Security (RLS)

Supabase RLS policies restrict data access:
- Users can only access their own orders/addresses
- Admin accounts require `admin_portal` scope

### 6.2 Transactional Integrity

Critical operations use PostgreSQL functions:
- `create_order_with_stock_adjustment` - Atomic order + inventory
- `cancel_order_with_stock_restore` - Atomic cancellation + restore
- `update_order_status` - Validated status transitions

---

## 7. Security Checklist

- [x] Password hashing with bcrypt
- [x] Failed login attempt tracking
- [x] Account lockout mechanism
- [x] HMAC-signed session cookies
- [x] HttpOnly/SameSite/Secure cookies
- [x] Audit logging for critical operations
- [x] Environment variable protection
- [x] Input validation
- [x] Transactional database operations
- [ ] Rate limiting (TODO)
- [ ] CSRF tokens for forms (TODO)
- [ ] Content Security Policy headers (TODO)
