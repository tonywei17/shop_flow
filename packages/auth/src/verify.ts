import { decodeSignedSession, verifySessionPayload } from "./session";

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

export interface SessionVerifierConfig {
  cookieName: string;
  secretEnvKey: string;
}

/**
 * Factory that creates a session verifier for a given cookie/secret pair.
 * Eliminates duplicated logic between admin and storefront verifiers.
 *
 * Usage:
 *   const verifyAdmin = createSessionVerifier({
 *     cookieName: "admin_session",
 *     secretEnvKey: "ADMIN_SESSION_SECRET",
 *   });
 *   const result = await verifyAdmin(getCookie);
 */
export function createSessionVerifier(config: SessionVerifierConfig) {
  return async (
    getCookie: (name: string) => string | undefined,
  ): Promise<SessionVerificationResult> => {
    const secret = process.env[config.secretEnvKey];

    if (!secret) {
      return { isValid: false, payload: null, error: "Session secret not configured" };
    }

    const cookieValue = getCookie(config.cookieName);

    if (!cookieValue) {
      return { isValid: false, payload: null, error: "No session cookie found" };
    }

    try {
      const signedSession = decodeSignedSession(cookieValue);

      if (!signedSession) {
        return { isValid: false, payload: null, error: "Invalid session format" };
      }

      const isSignatureValid = await verifySessionPayload(signedSession, secret);

      if (!isSignatureValid) {
        return { isValid: false, payload: null, error: "Invalid session signature" };
      }

      const payload = JSON.parse(signedSession.payload) as VerifiedSessionPayload;

      if (payload.expires_at && payload.expires_at < Date.now()) {
        return { isValid: false, payload: null, error: "Session expired" };
      }

      return { isValid: true, payload };
    } catch (error) {
      console.error(`[${config.cookieName}] Session verification error:`, error);
      return { isValid: false, payload: null, error: "Session verification failed" };
    }
  };
}
