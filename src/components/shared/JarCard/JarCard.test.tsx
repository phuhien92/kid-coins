import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { JarCard } from "./JarCard";

describe("JarCard", () => {
  it("renders the label and balance", () => {
    render(<JarCard emoji="🐷" label="Save" balance={125} accent="save" />);
    expect(screen.getByText("Save")).toBeInTheDocument();
    expect(screen.getByText("125")).toBeInTheDocument();
  });

  it("announces the balance as a status for assistive tech", () => {
    render(<JarCard emoji="💰" label="Spend" balance={40} />);
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("40");
  });

  it("shows a footnote when provided", () => {
    render(
      <JarCard
        emoji="🐷"
        label="Save"
        balance={100}
        footnote="Earns 5 more next week"
      />
    );
    expect(screen.getByText("Earns 5 more next week")).toBeInTheDocument();
  });

  it("omits the footnote when not provided", () => {
    render(<JarCard emoji="💝" label="Give" balance={0} />);
    expect(screen.queryByText(/next week/)).not.toBeInTheDocument();
  });
});
