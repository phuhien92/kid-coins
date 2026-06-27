import { describe, it, expect } from "vitest";
import { buildTaskPayload, toDateInputValue } from "./task-shared";

describe("task-shared", () => {
  it("formats date input values from ISO strings", () => {
    expect(toDateInputValue("2026-06-15T12:00:00.000Z")).toBe("2026-06-15");
    expect(toDateInputValue(null)).toBe("");
  });

  it("builds create payload with schedule fields", () => {
    const payload = buildTaskPayload(
      {
        kidId: "kid-1",
        title: "Brush teeth",
        emoji: "🦷",
        type: "daily",
        coinReward: 5,
        scheduledStartAt: "2026-06-15",
        durationDays: "7",
        isActive: true,
      },
      false
    );

    expect(payload.kidId).toBe("kid-1");
    expect(payload.durationDays).toBe(7);
    expect(payload.scheduledStartAt).toBeTruthy();
  });

  it("clears schedule when no start date on edit", () => {
    const payload = buildTaskPayload(
      {
        kidId: "kid-1",
        title: "Make bed",
        emoji: "🛏️",
        type: "once",
        coinReward: 10,
        scheduledStartAt: "",
        durationDays: "",
        isActive: false,
      },
      true
    );

    expect(payload).not.toHaveProperty("kidId");
    expect(payload.scheduledStartAt).toBeNull();
    expect(payload.isActive).toBe(false);
  });
});
