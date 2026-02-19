export type SessionUser = { id: string; email: string | null; tenantId?: string };
export const authReady = true;

export { hashPassword, verifyPassword } from "./password";
export {
  signSessionPayload,
  verifySessionPayload,
  encodeSignedSession,
  decodeSignedSession,
  type SignedSessionPayload,
} from "./session";
export {
  createSessionVerifier,
  type SessionVerifierConfig,
  type SessionVerificationResult,
  type VerifiedSessionPayload,
} from "./verify";
