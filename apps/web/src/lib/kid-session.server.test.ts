import { describe, it, expect, vi } from "vitest";
import { issueKidSessionToken, verifyKidSession } from "./kid-session.server";

const KID_ID = "test-kid-uuid-1234";
const SESSION_HEADER = "x-kid-session-token";

function makeRequest(token: string | null): Request {
  const headers = new Headers();
  if (token !== null) headers.set(SESSION_HEADER, token);
  return new Request("http://localhost/api/test", { headers });
}

describe("issueKidSessionToken", () => {
  it("returns a non-empty base64url string", () => {
    const token = issueKidSessionToken(KID_ID);
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);
    // base64url chars only
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("embeds the kid ID in the token payload", () => {
    const token = issueKidSessionToken(KID_ID);
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    expect(decoded.startsWith(KID_ID + ":")).toBe(true);
  });
});

describe("verifyKidSession", () => {
  it("accepts a freshly issued token for the correct kid", () => {
    const token = issueKidSessionToken(KID_ID);
    const req = makeRequest(token);
    expect(verifyKidSession(req, KID_ID)).toBe(true);
  });

  it("rejects when no token header is present", () => {
    const req = makeRequest(null);
    expect(verifyKidSession(req, KID_ID)).toBe(false);
  });

  it("rejects a token issued for a different kid ID", () => {
    const token = issueKidSessionToken("other-kid-uuid");
    const req = makeRequest(token);
    expect(verifyKidSession(req, KID_ID)).toBe(false);
  });

  it("rejects a tampered token", () => {
    const token = issueKidSessionToken(KID_ID);
    const tampered = token.slice(0, -4) + "XXXX";
    const req = makeRequest(tampered);
    expect(verifyKidSession(req, KID_ID)).toBe(false);
  });

  it("rejects an expired token", () => {
    // Backdate Date.now so the token expires immediately
    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValueOnce(now - 25 * 60 * 60 * 1000); // issue 25h ago
    const token = issueKidSessionToken(KID_ID);
    vi.restoreAllMocks();

    const req = makeRequest(token);
    expect(verifyKidSession(req, KID_ID)).toBe(false);
  });

  it("rejects a garbage string", () => {
    const req = makeRequest("not-a-valid-token");
    expect(verifyKidSession(req, KID_ID)).toBe(false);
  });
});
