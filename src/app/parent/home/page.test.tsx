import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ParentHomePage from "./page";

describe("ParentHomePage", () => {
  it("links to approvals, tasks, kids, and settings", () => {
    render(<ParentHomePage />);

    const nav = screen.getByRole("navigation", { name: "Parent areas" });

    expect(nav.querySelector('a[href="/parent/approvals"]')).not.toBeNull();
    expect(nav.querySelector('a[href="/parent/tasks"]')).not.toBeNull();
    expect(nav.querySelector('a[href="/parent/kids"]')).not.toBeNull();
    expect(nav.querySelector('a[href="/parent/settings"]')).not.toBeNull();
  });
});
