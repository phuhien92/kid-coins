import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppNavSidebarFooter } from "./AppNavSidebarFooter";

describe("AppNavSidebarFooter", () => {
  it("renders identity and action in full mode", () => {
    render(
      <AppNavSidebarFooter
        avatar={<span data-testid="avatar">A</span>}
        primaryLabel="Alex Kim"
        action={<button type="button">Switch profile</button>}
      />
    );

    expect(screen.getByTestId("avatar")).toBeInTheDocument();
    expect(screen.getByText("Alex Kim")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Switch profile" })).toBeInTheDocument();
  });

  it("shows avatar only in compact mode", () => {
    render(
      <AppNavSidebarFooter
        compact
        avatar={<span data-testid="avatar">A</span>}
        primaryLabel="Alex Kim"
        action={<button type="button">Switch profile</button>}
      />
    );

    expect(screen.getByTestId("avatar")).toBeInTheDocument();
    expect(screen.queryByText("Alex Kim")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Switch profile" })).not.toBeInTheDocument();
  });
});
