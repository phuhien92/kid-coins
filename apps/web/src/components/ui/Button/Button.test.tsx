import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button, ButtonLink } from "./Button";

describe("Button", () => {
  it("is a keyboard-reachable button that fires onClick", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Collect coins</Button>);
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Collect coins" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not fire when disabled", async () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>Locked</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Locked" }));
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe("ButtonLink", () => {
  it("renders a real link to its href", () => {
    render(<ButtonLink href="/login">Get started</ButtonLink>);
    expect(screen.getByRole("link", { name: "Get started" })).toHaveAttribute("href", "/login");
  });
});
