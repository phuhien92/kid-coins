import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MASCOT_ART } from "@/lib/brand";
import { StepCard } from "./StepCard";

describe("StepCard", () => {
  it("tells one step of the story with its robot slot", () => {
    render(<StepCard step="choose" />);
    expect(screen.getByRole("heading", { name: "Learn through decisions." })).toBeInTheDocument();
    expect(screen.getByText(/4 · Choose/)).toBeInTheDocument();
    expect(screen.getByText("Explore the difference between spending now and saving.")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: MASCOT_ART.choose.alt })).toBeInTheDocument();
  });
});
