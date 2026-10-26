import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KidCoinLogo } from "./KidCoinLogo";
import { KidCoinMark } from "./KidCoinMark";

describe("KidCoinLogo", () => {
  it("announces the brand name once, as written", () => {
    const { container } = render(<KidCoinLogo />);
    expect(screen.getByText("kid-coin")).toBeInTheDocument();
    // The visual wordmark is hidden from assistive tech so it isn't read twice.
    expect(container.querySelector("span[aria-hidden='true']")).toHaveTextContent("kidcoin");
  });

  it("can render the wordmark without the coin mark", () => {
    const { container } = render(<KidCoinLogo wordmarkOnly />);
    expect(container.querySelector("svg")).toBeNull();
  });
});

describe("KidCoinMark", () => {
  it("is decorative by default", () => {
    const { container } = render(<KidCoinMark />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("exposes an accessible name when given a title", () => {
    render(<KidCoinMark title="kid-coin" />);
    expect(screen.getByRole("img", { name: "kid-coin" })).toBeInTheDocument();
  });
});
