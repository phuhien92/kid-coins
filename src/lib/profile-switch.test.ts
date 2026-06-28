import { describe, expect, it, vi, beforeEach } from "vitest";
import { prepareProfileSwitch, PROFILE_PICKER_PATH } from "./profile-switch";
import { clearKidSession } from "./kid-session";

vi.mock("./kid-session", () => ({
  clearKidSession: vi.fn(),
}));

describe("prepareProfileSwitch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("clears the kid session before profile picker navigation", () => {
    prepareProfileSwitch();
    expect(clearKidSession).toHaveBeenCalledTimes(1);
  });

  it("exports the profile picker path", () => {
    expect(PROFILE_PICKER_PATH).toBe("/profile-picker");
  });
});
