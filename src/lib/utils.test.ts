import { describe, it, expect } from "vitest";
import { cn, formatCoins, formatRelativeTime } from "./utils";

describe("cn", () => {
  it("merges conditional classes and dedupes conflicts", () => {
    expect(cn("px-2", false && "hidden", "px-4")).toBe("px-4");
  });
});

describe("formatCoins", () => {
  it("adds thousands separators", () => {
    expect(formatCoins(2160)).toBe("2,160");
  });
});

describe("formatRelativeTime", () => {
  const now = new Date("2026-07-11T12:00:00Z");

  it("returns 'just now' for sub-minute differences", () => {
    expect(formatRelativeTime(new Date("2026-07-11T11:59:40Z"), now)).toBe("just now");
  });

  it("returns minutes for under an hour", () => {
    expect(formatRelativeTime(new Date("2026-07-11T11:45:00Z"), now)).toBe("15m ago");
  });

  it("returns hours for under a day", () => {
    expect(formatRelativeTime(new Date("2026-07-11T09:00:00Z"), now)).toBe("3h ago");
  });

  it("returns days for under a week", () => {
    expect(formatRelativeTime(new Date("2026-07-09T12:00:00Z"), now)).toBe("2d ago");
  });

  it("falls back to a calendar date beyond a week", () => {
    expect(formatRelativeTime(new Date("2026-06-01T12:00:00Z"), now)).toBe("Jun 1");
  });
});
