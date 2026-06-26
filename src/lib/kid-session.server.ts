import { createHmac, timingSafeEqual } from "crypto";

function getKidSessionSecret(): string {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY must be set in production");
    }
    return "dev-fallback-secret-do-not-use-in-prod";
  }
  return secret;
}

const KID_SESSION_TOKEN_HEADER = "x-kid-session-token";
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function sign(payload: string): string {
  return createHmac("sha256", getKidSessionSecret()).update(payload).digest("hex");
}

export function issueKidSessionToken(kidId: string): string {
  const expires = Date.now() + TOKEN_TTL_MS;
  const payload = `${kidId}:${expires}`;
  const sig = sign(payload);
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

export function verifyKidSession(request: Request, kidId: string): boolean {
  const token = request.headers.get(KID_SESSION_TOKEN_HEADER);
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const lastColon = decoded.lastIndexOf(":");
    const sig = decoded.slice(lastColon + 1);
    const payload = decoded.slice(0, lastColon);
    const [tokenKidId, expiresStr] = payload.split(":");
    if (tokenKidId !== kidId) return false;
    const expiresAt = parseInt(expiresStr, 10);
    if (Number.isNaN(expiresAt) || Date.now() > expiresAt) return false;
    const expected = sign(payload);
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}
