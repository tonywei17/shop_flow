import { cookies } from "next/headers";
import {
  createSessionVerifier,
  type SessionVerificationResult,
  type VerifiedSessionPayload,
} from "@enterprise/auth";

export type { VerifiedSessionPayload, SessionVerificationResult };

const _verifyAdmin = createSessionVerifier({
  cookieName: "admin_session",
  secretEnvKey: "ADMIN_SESSION_SECRET",
});

const _verifyStorefront = createSessionVerifier({
  cookieName: "storefront_session",
  secretEnvKey: "STOREFRONT_SESSION_SECRET",
});

/**
 * Verifies admin session from cookie with HMAC signature validation.
 * Uses the shared factory from @enterprise/auth.
 */
export async function verifyAdminSession(): Promise<SessionVerificationResult> {
  const cookieStore = await cookies();
  return _verifyAdmin((name) => cookieStore.get(name)?.value);
}

/**
 * Verifies storefront session from cookie with HMAC signature validation.
 */
export async function verifyStorefrontSession(): Promise<SessionVerificationResult> {
  const cookieStore = await cookies();
  return _verifyStorefront((name) => cookieStore.get(name)?.value);
}
