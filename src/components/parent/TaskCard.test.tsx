import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TaskCard } from "./TaskCard";
import type { ParentTaskRecord } from "./task-shared";

const task: ParentTaskRecord = {
  id: "task-1",
  kidId: "kid-1",
  kidName: "Sam",
  title: "Brush teeth",
  emoji: "🦷",
  type: "daily",
  coinReward: 5,
  scheduledStartAt: "2026-06-10T00:00:00.000Z",
  durationDays: 7,
  expiresAt: "2026-06-17T00:00:00.000Z",
  isActive: true,
  createdAt: "2026-06-01T00:00:00.000Z",
};

describe("TaskCard", () => {
  it("renders task details and schedule", () => {
    render(
      <TaskCard
        task={task}
        onEdit={vi.fn()}
        onUpdated={vi.fn()}
        onDeleted={vi.fn()}
      />
    );

    expect(screen.getByText("Brush teeth")).toBeInTheDocument();
    expect(screen.getByText("Sam")).toBeInTheDocument();
    expect(screen.getByText("5 coins")).toBeInTheDocument();
    expect(screen.getByText(/Starts/i)).toBeInTheDocument();
    expect(screen.getByText(/Ends/i)).toBeInTheDocument();
  });

  it("calls onEdit when Edit is clicked", async () => {
    const onEdit = vi.fn();
    const user = (await import("@testing-library/user-event")).default.setup();

    render(
      <TaskCard
        task={task}
        onEdit={onEdit}
        onUpdated={vi.fn()}
        onDeleted={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: "Edit" }));
    expect(onEdit).toHaveBeenCalledWith(task);
  });
});
