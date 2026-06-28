import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppNavList, AppNavBottomTabs } from "./AppNav";
import type { AppNavItem } from "./types";

const mockPathname = vi.fn(() => "/kid/home");

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
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

const ITEMS: AppNavItem[] = [
  { id: "home", href: "/kid/home", label: "Home", icon: <span aria-hidden>H</span> },
  { id: "tasks", href: "/kid/tasks", label: "Tasks", icon: <span aria-hidden>T</span>, badge: 2 },
];

describe("AppNavList", () => {
  beforeEach(() => {
    mockPathname.mockReturnValue("/kid/home");
  });

  it("marks the active route from pathname", () => {
    render(<AppNavList items={ITEMS} homeHref="/kid/home" homeAliases={["/kid"]} />);

    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: /Tasks/ })).not.toHaveAttribute("aria-current");
  });

  it("fires onSelect in controlled mode", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <AppNavList
        mode="controlled"
        items={ITEMS}
        activeId="home"
        onSelect={onSelect}
      />
    );

    await user.click(screen.getByRole("button", { name: /Tasks/ }));
    expect(onSelect).toHaveBeenCalledWith("tasks");
  });
});

describe("AppNavBottomTabs", () => {
  it("renders bottom tab labels", () => {
    render(<AppNavBottomTabs items={ITEMS} homeHref="/kid/home" />);

    expect(screen.getByRole("navigation", { name: "Primary navigation" })).toBeInTheDocument();
    expect(screen.getAllByText("Home").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Tasks").length).toBeGreaterThan(0);
  });
});
