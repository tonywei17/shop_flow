import { cookies } from "next/headers";
import {
  decodeSignedSession,
  verifySessionPayload,
} from "@enterprise/auth";

export interface VerifiedSessionPayload {
  admin_account_id: string;
  login_id: string;
  created_at: number;
  expires_at: number;
}

export interface SessionVerificationResult {
  isValid: boolean;
  payload: VerifiedSessionPayload | null;
  error?: string;
}

/**
 * Verifies admin session from cookie with HMAC signature validation
 * This should be used in all API routes that require authentication
 */
export async function verifyAdminSession(): Promise<SessionVerificationResult> {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    return {
      isValid: false,
      payload: null,
      error: "Session secret not configured",
    };
  }

  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session");

    if (!sessionCookie) {
      return {
        isValid: false,
        payload: null,
        error: "No session cookie found",
      };
    }

    // Decode the signed session
    const signedSession = decodeSignedSession(sessionCookie.value);

    if (!signedSession) {
      return {
        isValid: false,
        payload: null,
        error: "Invalid session format",
      };
    }

    // Verify HMAC signature
    const isSignatureValid = await verifySessionPayload(signedSession, secret);

    if (!isSignatureValid) {
      return {
        isValid: false,
        payload: null,
        error: "Invalid session signature",
      };
    }

    // Parse the payload
    const payload = JSON.parse(signedSession.payload) as VerifiedSessionPayload;

    // Check expiration
    if (payload.expires_at && payload.expires_at < Date.now()) {
      return {
        isValid: false,
        payload: null,
        error: "Session expired",
      };
    }

    return {
      isValid: true,
      payload,
    };
  } catch (error) {
    console.error("[verifyAdminSession] Error:", error);
    return {
      isValid: false,
      payload: null,
      error: "Session verification failed",
    };
  }
}

/**
 * Verifies storefront session from cookie with HMAC signature validation
 */
export async function verifyStorefrontSession(): Promise<SessionVerificationResult> {
  const secret = process.env.STOREFRONT_SESSION_SECRET;

  if (!secret) {
    return {
      isValid: false,
      payload: null,
      error: "Session secret not configured",
    };
  }

  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("storefront_session");

    if (!sessionCookie) {
      return {
        isValid: false,
        payload: null,
        error: "No session cookie found",
      };
    }

    const signedSession = decodeSignedSession(sessionCookie.value);

    if (!signedSession) {
      return {
        isValid: false,
        payload: null,
        error: "Invalid session format",
      };
    }

    const isSignatureValid = await verifySessionPayload(signedSession, secret);

    if (!isSignatureValid) {
      return {
        isValid: false,
        payload: null,
        error: "Invalid session signature",
      };
    }

    const payload = JSON.parse(signedSession.payload) as VerifiedSessionPayload;

    if (payload.expires_at && payload.expires_at < Date.now()) {
      return {
        isValid: false,
        payload: null,
        error: "Session expired",
      };
    }

    return {
      isValid: true,
      payload,
    };
  } catch (error) {
    console.error("[verifyStorefrontSession] Error:", error);
    return {
      isValid: false,
      payload: null,
      error: "Session verification failed",
    };
  }
}
