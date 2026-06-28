import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { KidSidebarFooter } from "./KidSidebarFooter";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/context/KidContext", () => ({
  useKid: () => ({
    kid: { name: "Maya", avatarColor: "#F4D34E" },
  }),
}));

vi.mock("@/lib/kid-session", () => ({
  clearKidSession: vi.fn(),
}));

describe("KidSidebarFooter", () => {
  it("renders the shared sidebar footer with kid identity", () => {
    render(<KidSidebarFooter />);
    expect(screen.getByText("Maya")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Switch profile/i })).toBeInTheDocument();
  });
});
