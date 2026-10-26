import { describe, it, expect } from "vitest";
import {
  calculateCoinsEarned,
  getTaskExpiresAt,
  isTaskVisible,
  isValidApprovalTier,
} from "./tasks";

describe("isTaskVisible", () => {
  const now = new Date("2026-06-15T12:00:00Z");

  it("returns false when inactive", () => {
    expect(
      isTaskVisible(
        { isActive: false, scheduledStartAt: null, durationDays: null },
        now
      )
    ).toBe(false);
  });

  it("returns false before scheduled start", () => {
    expect(
      isTaskVisible(
        {
          isActive: true,
          scheduledStartAt: new Date("2026-06-20T00:00:00Z"),
          durationDays: null,
        },
        now
      )
    ).toBe(false);
  });

  it("returns false after duration expires", () => {
    expect(
      isTaskVisible(
        {
          isActive: true,
          scheduledStartAt: new Date("2026-06-01T00:00:00Z"),
          durationDays: 7,
        },
        now
      )
    ).toBe(false);
  });

  it("returns true for active task within schedule window", () => {
    expect(
      isTaskVisible(
        {
          isActive: true,
          scheduledStartAt: new Date("2026-06-10T00:00:00Z"),
          durationDays: 7,
        },
        now
      )
    ).toBe(true);
  });
});

describe("getTaskExpiresAt", () => {
  it("returns null when start or duration missing", () => {
    expect(getTaskExpiresAt(null, 7)).toBeNull();
    expect(getTaskExpiresAt(new Date("2026-06-01"), null)).toBeNull();
  });

  it("adds duration days to start date", () => {
    const expiresAt = getTaskExpiresAt(new Date("2026-06-01T00:00:00Z"), 7);
    expect(expiresAt?.toISOString()).toBe("2026-06-08T00:00:00.000Z");
  });
});

describe("calculateCoinsEarned", () => {
  it("calculates tiered payout with bonus", () => {
    expect(calculateCoinsEarned(10, 75, 5)).toBe(12);
    expect(calculateCoinsEarned(10, 50)).toBe(5);
    expect(calculateCoinsEarned(10, 0)).toBe(0);
  });
});

describe("isValidApprovalTier", () => {
  it("accepts valid tiers only", () => {
    expect(isValidApprovalTier(100)).toBe(true);
    expect(isValidApprovalTier(25)).toBe(false);
  });
});
