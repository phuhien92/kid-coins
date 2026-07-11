import { beforeEach, describe, expect, it, vi } from "vitest";
import { signOutAccount } from "./auth-sign-out";
import { clearKidSession } from "./kid-session";

const signOut = vi.fn().mockResolvedValue({ error: null });

vi.mock("@/lib/supabase", () => ({
  createClient: () => ({
    auth: { signOut },
  }),
}));

vi.mock("./kid-session", () => ({
  clearKidSession: vi.fn(),
}));

describe("signOutAccount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("calls supabase signOut and clears sb- and earnie_ keys", async () => {
    localStorage.setItem("sb-test-auth", "token");
    localStorage.setItem("earnie_kid_id", "kid-1");
    localStorage.setItem("keep_me", "yes");

    await signOutAccount();

    expect(signOut).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem("sb-test-auth")).toBeNull();
    expect(localStorage.getItem("earnie_kid_id")).toBeNull();
    expect(localStorage.getItem("keep_me")).toBe("yes");
    expect(clearKidSession).toHaveBeenCalledTimes(1);
  });

  it("still clears local state when supabase signOut throws", async () => {
    signOut.mockRejectedValueOnce(new Error("network"));
    localStorage.setItem("sb-test-auth", "token");

    await signOutAccount();

    expect(localStorage.getItem("sb-test-auth")).toBeNull();
    expect(clearKidSession).toHaveBeenCalledTimes(1);
  });
});
