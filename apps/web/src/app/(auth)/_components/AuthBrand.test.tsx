import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AuthBrand } from "./AuthBrand";

describe("AuthBrand", () => {
  it("renders the kid-coin wordmark as a top-level heading", () => {
    render(<AuthBrand />);
    expect(
      screen.getByRole("heading", { level: 1, name: "kid-coin" })
    ).toBeInTheDocument();
  });
});

describe("AuthBrand tagline", () => {
  it("shows the brand tagline", () => {
    render(<AuthBrand />);
    expect(screen.getByText("Little wins. Big money habits.")).toBeInTheDocument();
  });
});
