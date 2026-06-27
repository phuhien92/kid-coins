import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AuthBrand } from "./AuthBrand";

describe("AuthBrand", () => {
  it("renders the Earnie wordmark as a top-level heading", () => {
    render(<AuthBrand />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Earnie" })
    ).toBeInTheDocument();
  });
});
