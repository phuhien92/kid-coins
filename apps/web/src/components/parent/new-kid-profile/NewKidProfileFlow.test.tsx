import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NewKidProfileFlow } from "./NewKidProfileFlow";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("NewKidProfileFlow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts on the class selection step", () => {
    render(<NewKidProfileFlow />);

    expect(screen.getByRole("heading", { name: "Choose a class" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue — customize" })).toBeInTheDocument();
  });

  it("shows free wizard and locked knight classes", () => {
    render(<NewKidProfileFlow />);

    expect(screen.getByText("Free")).toBeInTheDocument();
    expect(screen.getAllByText("300 XP").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /Knight/i })).toBeDisabled();
  });

  it("moves to customize after continue", async () => {
    const user = userEvent.setup();
    render(<NewKidProfileFlow />);

    await user.click(screen.getByRole("button", { name: "Continue — customize" }));

    expect(screen.getByText(/Customize Wizard/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "1. Pick a skin" })).toBeInTheDocument();
  });
});
