import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StepBadge } from "./StepBadge";

describe("StepBadge", () => {
  it("spells out the step name and number for assistive tech", () => {
    const { container } = render(<StepBadge step="save" />);
    expect(container).toHaveTextContent("Step 3:");
    expect(screen.getByText("Save", { exact: false })).toBeInTheDocument();
  });

  it("can drop the number", () => {
    const { container } = render(<StepBadge step="grow" numbered={false} />);
    expect(container).toHaveTextContent(/^Grow$/);
  });
});
