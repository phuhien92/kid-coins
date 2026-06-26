import { describe, it, expect, beforeEach } from "vitest";
import {
  clearKidSession,
  kidSessionHeaders,
  KID_AVATAR_COLOR_KEY,
  KID_SESSION_TOKEN_KEY,
} from "./kid-session";

const ALL_KEYS = [
  "earnie_char",
  "earnie_kid_id",
  "earnie_kid_name",
  KID_AVATAR_COLOR_KEY,
  KID_SESSION_TOKEN_KEY,
];

beforeEach(() => {
  localStorage.clear();
});

describe("clearKidSession", () => {
  it("removes all earnie session keys from localStorage", () => {
    for (const key of ALL_KEYS) {
      localStorage.setItem(key, "some-value");
    }

    clearKidSession();

    for (const key of ALL_KEYS) {
      expect(localStorage.getItem(key)).toBeNull();
    }
  });

  it("does not throw when keys are already absent", () => {
    expect(() => clearKidSession()).not.toThrow();
  });

  it("does not remove unrelated keys", () => {
    localStorage.setItem("other-app-key", "keep-me");
    clearKidSession();
    expect(localStorage.getItem("other-app-key")).toBe("keep-me");
  });
});

describe("kidSessionHeaders", () => {
  it("always includes the x-kid-id header", () => {
    const headers = kidSessionHeaders("kid-123") as Record<string, string>;
    expect(headers["x-kid-id"]).toBe("kid-123");
  });

  it("includes the session token when stored in localStorage", () => {
    localStorage.setItem(KID_SESSION_TOKEN_KEY, "my-token");
    const headers = kidSessionHeaders("kid-123") as Record<string, string>;
    expect(headers["x-kid-session-token"]).toBe("my-token");
  });

  it("sends empty string for token when nothing is stored", () => {
    const headers = kidSessionHeaders("kid-123") as Record<string, string>;
    expect(headers["x-kid-session-token"]).toBe("");
  });
});
