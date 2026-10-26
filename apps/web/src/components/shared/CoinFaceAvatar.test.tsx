import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CoinFaceAvatar } from "./CoinFaceAvatar";

describe("CoinFaceAvatar", () => {
  it("renders with an accessible label", () => {
    render(<CoinFaceAvatar />);
    expect(screen.getByRole("img", { name: "Parent coin" })).toBeInTheDocument();
  });

  it("renders the SVG coin face", () => {
    const { container } = render(<CoinFaceAvatar />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("applies picker size by default (52px)", () => {
    const { container } = render(<CoinFaceAvatar />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("52");
    expect(svg?.getAttribute("height")).toBe("52");
  });
});
