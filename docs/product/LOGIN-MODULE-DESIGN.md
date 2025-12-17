# 登录模块设计文档

> 版本: 1.0  
> 更新日期: 2025-12-17  
> 状态: 已实现

---

## 1. 概述

本文档描述 shop_flow 平台的登录认证模块设计，涵盖管理后台（Admin）和店铺前台（Storefront）两个应用的认证机制。

### 1.1 设计目标

- **安全性**: 防止暴力破解、会话劫持、密码泄露
- **可用性**: 简洁的登录流程，清晰的错误提示
- **可维护性**: 模块化设计，便于扩展和审计

### 1.2 适用范围

| 应用 | 端口 | 用户类型 |
|------|------|----------|
| Admin (web) | 3000 | 管理员账户 |
| Storefront | 3001 | 普通用户 |

---

## 2. 认证流程

### 2.1 管理后台登录流程

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   用户输入   │────▶│   验证账户   │────▶│  创建会话   │
│  账号密码    │     │   密码校验   │     │  设置Cookie │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  失败处理   │
                    │ 计数/锁定   │
                    └─────────────┘
```

### 2.2 详细流程

1. **用户提交凭证**
   - 账号 (account_id)
   - 密码 (password)

2. **超级管理员检查**
   - 优先检查环境变量中的超级管理员
   - `ADMIN_LOGIN_ID` + `ADMIN_LOGIN_PASSWORD`
   - 匹配则直接创建会话，跳过数据库查询

3. **数据库账户验证**
   - 查询 `admin_accounts` 表
   - 条件: `account_id` + `account_scope = 'admin_portal'`

4. **账户状态检查**
   - 账户是否存在
   - 账户是否启用 (`status = '有効'` 或 `'active'`)
   - 账户是否被锁定 (`locked_until > NOW()`)

5. **密码验证**
   - 使用 bcrypt 比对密码哈希
   - 失败则记录失败次数

6. **会话创建**
   - 生成 HMAC 签名的会话令牌
   - 设置 HttpOnly Cookie

---

## 3. 安全机制

### 3.1 密码存储

使用 **bcrypt** 算法进行密码哈希：

```typescript
// 哈希参数
const SALT_ROUNDS = 10;

// 哈希函数
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// 验证函数
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

**安全特性**:
- 自动加盐，防止彩虹表攻击
- 计算成本可调，抵御暴力破解
- 单向哈希，无法逆向还原

### 3.2 失败登录保护

| 参数 | 值 | 说明 |
|------|-----|------|
| 最大失败次数 | 5 | 连续失败次数上限 |
| 锁定时长 | 15 分钟 | 达到上限后的锁定时间 |
| 重置条件 | 登录成功 | 成功登录后清零 |

**数据库字段**:

```sql
ALTER TABLE admin_accounts ADD COLUMN
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  last_failed_login_at TIMESTAMPTZ;
```

**处理逻辑**:

```typescript
// 检查锁定状态
if (lockedUntil && new Date(lockedUntil) > new Date()) {
  return { error: "账户已锁定，请稍后再试", status: 429 };
}

// 密码验证失败
if (!passwordMatch) {
  const newAttempts = failedAttempts + 1;
  
  if (newAttempts >= MAX_FAILED_ATTEMPTS) {
    // 锁定账户
    await lockAccount(accountId, LOCK_DURATION_MINUTES);
  }
  
  await incrementFailedAttempts(accountId);
  return { error: "账号或密码错误", status: 401 };
}

// 登录成功，重置计数
await resetFailedAttempts(accountId);
```

### 3.3 会话管理

#### HMAC 签名

使用 **HMAC-SHA256** 对会话载荷进行签名：

```typescript
// 签名算法
const HMAC_ALGORITHM = "SHA-256";

async function signSessionPayload(payload: string, secret: string): Promise<SignedSession> {
  const signature = await hmacSign(payload, secret);
  return { payload, signature };
}

async function verifySessionPayload(session: SignedSession, secret: string): Promise<boolean> {
  const expectedSignature = await hmacSign(session.payload, secret);
  return timingSafeEqual(session.signature, expectedSignature);
}
```

**安全特性**:
- 使用 Web Crypto API，兼容 Edge Runtime
- 时间安全比较，防止时序攻击
- 密钥存储于环境变量

#### Cookie 配置

```typescript
res.cookies.set({
  name: "admin_session",
  value: encodedSession,
  httpOnly: true,      // 防止 XSS 访问
  sameSite: "lax",     // CSRF 保护
  secure: true,        // 仅 HTTPS (生产环境)
  path: "/",           // 全站有效
  maxAge: 60 * 60 * 8, // 8 小时过期
});
```

| 属性 | 值 | 安全作用 |
|------|-----|----------|
| `httpOnly` | `true` | 防止 JavaScript 访问 Cookie |
| `sameSite` | `lax` | 防止跨站请求伪造 |
| `secure` | `true` | 仅通过 HTTPS 传输 |
| `maxAge` | 8h | 限制会话有效期 |

---

## 4. 审计日志

所有登录相关事件都会记录到 `audit_logs` 表：

### 4.1 记录的事件

| 事件 | action | 触发条件 |
|------|--------|----------|
| 登录成功 | `login_success` | 密码验证通过 |
| 登录失败 | `login_failed` | 密码验证失败 |
| 账户锁定 | `login_locked` | 失败次数达到上限 |

### 4.2 记录内容

```typescript
await createAuditLog({
  action: "login_success",
  actorId: account.id,
  actorType: "admin",
  targetType: "admin_account",
  targetId: account.id,
  details: { account: account.account_id },
  ipAddress: req.headers.get("x-forwarded-for"),
  userAgent: req.headers.get("user-agent"),
});
```

### 4.3 日志查询

```sql
-- 查询最近的登录失败记录
SELECT * FROM audit_logs 
WHERE action IN ('login_failed', 'login_locked')
ORDER BY created_at DESC
LIMIT 100;

-- 查询特定账户的登录历史
SELECT * FROM audit_logs 
WHERE target_id = 'account-uuid'
AND action LIKE 'login_%'
ORDER BY created_at DESC;
```

---

## 5. 环境配置

### 5.1 必需的环境变量

```env
# 超级管理员 (紧急访问)
ADMIN_LOGIN_ID=admin
ADMIN_LOGIN_PASSWORD=<强密码，至少12位>

# 会话签名密钥 (至少32字符)
ADMIN_SESSION_SECRET=<随机字符串>

# Storefront 会话密钥
STOREFRONT_SESSION_SECRET=<随机字符串>
```

### 5.2 安全要求

| 变量 | 要求 |
|------|------|
| `ADMIN_LOGIN_PASSWORD` | 至少12位，包含大小写、数字、符号 |
| `ADMIN_SESSION_SECRET` | 至少32字符，随机生成 |
| `STOREFRONT_SESSION_SECRET` | 至少32字符，随机生成 |

**生成随机密钥**:
```bash
openssl rand -base64 32
```

---

## 6. API 接口

### 6.1 管理后台登录

**请求**:
```http
POST /api/auth/login
Content-Type: application/json

{
  "account": "admin_user",
  "password": "password123"
}
```

**成功响应** (200):
```json
{
  "ok": true,
  "accountId": "admin_user",
  "displayName": "管理员"
}
```

**失败响应**:

| 状态码 | 错误 | 说明 |
|--------|------|------|
| 400 | 请输入账号和密码 | 缺少必填字段 |
| 401 | 账号或密码错误 | 认证失败 |
| 403 | 账户已禁用 | 账户状态异常 |
| 429 | 账户已锁定 | 失败次数过多 |
| 500 | 服务器错误 | 内部错误 |

### 6.2 登出

**请求**:
```http
POST /api/auth/logout
```

**响应** (200):
```json
{
  "ok": true
}
```

---

## 7. 中间件验证

### 7.1 路由保护

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const session = request.cookies.get("admin_session")?.value;
  
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  const decoded = decodeSignedSession(session);
  if (!decoded) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  const isValid = await verifySessionPayload(decoded, sessionSecret);
  if (!isValid) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|login|_next/static|_next/image|favicon.ico).*)",
  ],
};
```

### 7.2 受保护路由

- `/` - 仪表盘
- `/commerce/*` - 商品管理
- `/inventory/*` - 库存管理
- `/orders/*` - 订单管理
- `/settings/*` - 系统设置

---

## 8. 错误处理

### 8.1 用户友好提示

| 场景 | 提示信息 |
|------|----------|
| 空输入 | アカウントとパスワードを入力してください |
| 认证失败 | アカウントまたはパスワードが正しくありません |
| 账户禁用 | このアカウントは無効です |
| 账户锁定 | このアカウントはロックされています。しばらく後に再度お試しください。 |

### 8.2 安全原则

- **不泄露账户存在性**: 无论账户是否存在，都返回相同的错误信息
- **不暴露技术细节**: 错误信息不包含堆栈跟踪或内部状态
- **记录详细日志**: 服务端记录完整错误信息用于排查

---

## 9. 文件结构

```
packages/auth/
├── src/
│   ├── index.ts          # 导出入口
│   ├── password.ts       # bcrypt 密码工具
│   └── session.ts        # HMAC 会话工具
├── package.json
└── tsconfig.json

apps/web/
├── src/
│   ├── app/
│   │   └── api/
│   │       └── auth/
│   │           ├── login/route.ts   # 登录 API
│   │           └── logout/route.ts  # 登出 API
│   └── middleware.ts                # 路由保护
```

---

## 10. 未来改进

- [ ] 双因素认证 (2FA)
- [ ] OAuth 第三方登录
- [ ] 密码强度检测
- [ ] 登录设备管理
- [ ] 会话并发控制
- [ ] IP 白名单

---

## 附录: 数据库表结构

### admin_accounts 表

```sql
CREATE TABLE admin_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT '有効',
  account_scope TEXT DEFAULT 'admin_portal',
  password_hash TEXT,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  last_failed_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### audit_logs 表

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  actor_id UUID,
  actor_type TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
