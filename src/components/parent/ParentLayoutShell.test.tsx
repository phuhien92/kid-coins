import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ParentLayoutShell } from "./ParentLayoutShell";

const mockPathname = vi.fn(() => "/parent/home");

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/kid-session", () => ({
  clearKidSession: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("ParentLayoutShell", () => {
  beforeEach(() => {
    mockPathname.mockReturnValue("/parent/home");
  });

  it("renders persistent greeting and primary nav links", () => {
    render(
      <ParentLayoutShell>
        <p>Page body</p>
      </ParentLayoutShell>
    );

    expect(screen.getByRole("heading", { level: 1, name: /Good (morning|afternoon|evening), Sam/i })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Home" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /Approvals/i }).length).toBeGreaterThan(0);
    expect(screen.getByText("Page body")).toBeInTheDocument();
  });

  it("marks the active route in navigation", () => {
    mockPathname.mockReturnValue("/parent/kids");
    render(
      <ParentLayoutShell>
        <p>Kids page</p>
      </ParentLayoutShell>
    );

    const kidsLinks = screen.getAllByRole("link", { name: "Kids" });
    expect(kidsLinks.some((link) => link.getAttribute("aria-current") === "page")).toBe(true);
  });

  it("exposes AI coach and notification actions in the top bar", () => {
    render(
      <ParentLayoutShell>
        <p>Page body</p>
      </ParentLayoutShell>
    );

    expect(screen.getByRole("button", { name: "Set a goal with AI" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Notifications" })).toBeInTheDocument();
  });

  it("opens the mobile drawer from the menu button", async () => {
    const user = userEvent.setup();
    render(
      <ParentLayoutShell>
        <p>Page body</p>
      </ParentLayoutShell>
    );

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getByRole("button", { name: "Close menu" })).toBeInTheDocument();
  });
});
