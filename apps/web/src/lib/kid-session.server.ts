import { createHmac, timingSafeEqual } from "crypto";

const KID_SESSION_SECRET =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "dev-fallback-secret-do-not-use-in-prod";

const KID_SESSION_TOKEN_HEADER = "x-kid-session-token";
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function sign(payload: string): string {
  return createHmac("sha256", KID_SESSION_SECRET).update(payload).digest("hex");
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
    if (Date.now() > parseInt(expiresStr, 10)) return false;
    const expected = sign(payload);
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}
