import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApprovalCard } from "./ApprovalCard";

function renderCard(overrides: Partial<React.ComponentProps<typeof ApprovalCard>> = {}) {
  const props = {
    kidName: "Leo",
    avatarColor: "#F4D34E",
    title: "Movie night pick",
    subtitle: "Reward redemption",
    coins: 450,
    timeLabel: "5m ago",
    onApprove: vi.fn(),
    onDecline: vi.fn(),
    ...overrides,
  };
  render(<ApprovalCard {...props} />);
  return props;
}

describe("ApprovalCard", () => {
  it("shows the kid, title, kind, coin value and time", () => {
    renderCard();
    expect(screen.getByText("Leo")).toBeInTheDocument();
    expect(screen.getByText("Movie night pick")).toBeInTheDocument();
    expect(screen.getByText(/Reward redemption · 5m ago/)).toBeInTheDocument();
    expect(screen.getByText("450")).toBeInTheDocument();
  });

  it("calls onApprove and onDecline when the buttons are pressed", async () => {
    const user = userEvent.setup();
    const props = renderCard();

    await user.click(screen.getByRole("button", { name: /Approve/ }));
    expect(props.onApprove).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Not now" }));
    expect(props.onDecline).toHaveBeenCalledTimes(1);
  });

  it("disables both actions when busy", () => {
    renderCard({ busy: true });
    expect(screen.getByRole("button", { name: /Approve/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Not now" })).toBeDisabled();
  });

  it("shows the kid's live coin balance as a labelled chip", () => {
    renderCard({ kidBalance: 120 });
    expect(screen.getByLabelText("Leo's balance: 120 coins")).toHaveTextContent("120");
  });

  it("omits the balance chip when no balance is known for the kid", () => {
    renderCard({ kidBalance: undefined });
    expect(screen.queryByLabelText(/balance/i)).not.toBeInTheDocument();
  });

  it("keeps the balance chip out of the live-region announcements", () => {
    // One live region per row would announce the same balance N times; the page
    // Toast is the single live region for approval outcomes.
    renderCard({ kidBalance: 120 });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
