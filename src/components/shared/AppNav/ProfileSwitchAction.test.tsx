import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { ProfileSwitchAction } from "./ProfileSwitchAction";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
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

vi.mock("@/lib/kid-session", () => ({
  clearKidSession: vi.fn(),
}));

import { clearKidSession } from "@/lib/kid-session";

describe("ProfileSwitchAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("clears kid session and navigates to profile picker", async () => {
    const user = userEvent.setup();
    render(<ProfileSwitchAction register="kid" />);

    await user.click(screen.getByRole("button", { name: "Switch profile" }));

    expect(clearKidSession).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith("/profile-picker");
  });

  it("clears kid session and navigates to profile picker for parent", async () => {
    const user = userEvent.setup();
    render(<ProfileSwitchAction register="parent" />);

    await user.click(screen.getByRole("button", { name: "Switch profile" }));

    expect(clearKidSession).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith("/profile-picker");
  });
});
