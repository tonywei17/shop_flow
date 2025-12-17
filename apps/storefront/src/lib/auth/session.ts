import { cookies } from "next/headers";
import { signSessionPayload, encodeSignedSession, decodeSignedSession, verifySessionPayload } from "@enterprise/auth";
import type { AuthSession, StorefrontUser } from "./types";

const SESSION_COOKIE_NAME = "storefront_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function encodeSession(session: AuthSession): string {
  return Buffer.from(JSON.stringify(session)).toString("base64");
}

function decodeSessionPayload(encoded: string): AuthSession | null {
  try {
    const decoded = Buffer.from(encoded, "base64").toString("utf-8");
    return JSON.parse(decoded) as AuthSession;
  } catch {
    return null;
  }
}

export async function createSession(user: StorefrontUser): Promise<void> {
  const session: AuthSession = {
    user,
    expiresAt: Date.now() + SESSION_MAX_AGE * 1000,
  };

  const sessionSecret = process.env.STOREFRONT_SESSION_SECRET;
  if (!sessionSecret) {
    throw new Error("STOREFRONT_SESSION_SECRET is not configured");
  }

  const sessionPayload = encodeSession(session);
  const signed = await signSessionPayload(sessionPayload, sessionSecret);
  const encodedSession = encodeSignedSession(signed);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, encodedSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function getSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  const sessionSecret = process.env.STOREFRONT_SESSION_SECRET;
  if (!sessionSecret) {
    return null;
  }

  const decoded = decodeSignedSession(sessionCookie.value);
  if (!decoded || !(await verifySessionPayload(decoded, sessionSecret))) {
    await destroySession();
    return null;
  }

  const session = decodeSessionPayload(decoded.payload);

  if (!session) {
    return null;
  }

  // Check if session has expired
  if (session.expiresAt < Date.now()) {
    await destroySession();
    return null;
  }

  return session;
}

export async function getCurrentUser(): Promise<StorefrontUser | null> {
  const session = await getSession();
  return session?.user ?? null;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}
