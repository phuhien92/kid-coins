import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EarnieBrand } from "./EarnieBrand";

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

describe("EarnieBrand", () => {
  it("renders the Earnie wordmark as a home link", () => {
    render(<EarnieBrand href="/kid/home" />);
    const link = screen.getByRole("link", { name: "Earnie" });
    expect(link).toHaveAttribute("href", "/kid/home");
  });

  it("uses the same wordmark for parent and kid shells", () => {
    const { rerender } = render(<EarnieBrand href="/kid/home" register="kid" />);
    const kid = screen.getByRole("link", { name: "Earnie" });
    rerender(<EarnieBrand href="/parent/home" register="parent" />);
    const parent = screen.getByRole("link", { name: "Earnie" });
    expect(parent.textContent).toBe(kid.textContent);
    expect(parent.className).toContain("font-display");
    expect(parent.className).toContain("text-[22px]");
  });
});
