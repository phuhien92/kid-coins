import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskForm } from "./TaskForm";

const kids = [
  { id: "kid-1", name: "Sam", avatarColor: "#F4D34E", balance: 20 },
];

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("TaskForm", () => {
  it("blocks submit when title is empty", async () => {
    const user = userEvent.setup();
    render(
      <TaskForm
        kids={kids}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: "Create task" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Title is required");
  });

  it("submits create payload to POST /api/tasks", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          task: {
            id: "task-1",
            kidId: "kid-1",
            title: "Brush teeth",
            emoji: "🦷",
            type: "daily",
            coinReward: 5,
            scheduledStartAt: null,
            durationDays: null,
            expiresAt: null,
            isActive: true,
            createdAt: "2026-06-01T00:00:00.000Z",
          },
        }),
        { status: 201 }
      )
    );

    render(
      <TaskForm
        kids={kids}
        onSuccess={onSuccess}
        onCancel={vi.fn()}
      />
    );

    await user.type(screen.getByLabelText("Title"), "Brush teeth");
    await user.click(screen.getByRole("button", { name: "Choose 🦷" }));
    await user.clear(screen.getByLabelText("Coin reward"));
    await user.type(screen.getByLabelText("Coin reward"), "5");
    await user.click(screen.getByRole("button", { name: "Create task" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/tasks",
        expect.objectContaining({ method: "POST" })
      );
    });

    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Brush teeth", coinReward: 5 })
    );
  });
});
