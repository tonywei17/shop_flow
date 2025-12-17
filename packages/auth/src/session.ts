const HMAC_ALGORITHM = "SHA-256";

export interface SignedSessionPayload {
  payload: string;
  signature: string;
}

async function hmacSign(
  payload: string,
  secret: string
): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(payload);

  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: HMAC_ALGORITHM },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, messageData);
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function signSessionPayload(
  payload: string,
  secret: string
): Promise<SignedSessionPayload> {
  const signature = await hmacSign(payload, secret);
  return { payload, signature };
}

export async function verifySessionPayload(
  signed: SignedSessionPayload,
  secret: string
): Promise<boolean> {
  const expectedSignature = await hmacSign(signed.payload, secret);
  return signed.signature === expectedSignature;
}

export function encodeSignedSession(signed: SignedSessionPayload): string {
  return Buffer.from(JSON.stringify(signed)).toString("base64");
}

export function decodeSignedSession(encoded: string): SignedSessionPayload | null {
  try {
    const decoded = Buffer.from(encoded, "base64").toString("utf-8");
    return JSON.parse(decoded) as SignedSessionPayload;
  } catch {
    return null;
  }
}
