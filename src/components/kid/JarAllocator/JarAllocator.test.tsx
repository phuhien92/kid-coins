import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { JarAllocator } from "./JarAllocator";

function setup(overrides: Partial<React.ComponentProps<typeof JarAllocator>> = {}) {
  const onAllocate = vi.fn().mockResolvedValue(undefined);
  const onWithdraw = vi.fn().mockResolvedValue(undefined);
  const onClose = vi.fn();
  render(
    <JarAllocator
      open
      onClose={onClose}
      spend={40}
      save={100}
      onAllocate={onAllocate}
      onWithdraw={onWithdraw}
      {...overrides}
    />
  );
  return { onAllocate, onWithdraw, onClose };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("JarAllocator", () => {
  it("allocates to the Save jar by default", async () => {
    const { onAllocate, onClose } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Move coins" }));
    await waitFor(() => expect(onAllocate).toHaveBeenCalledWith("save", 1));
    expect(onClose).toHaveBeenCalled();
  });

  it("routes to the Give jar when that destination is picked", async () => {
    const { onAllocate } = setup();
    fireEvent.click(screen.getByRole("button", { name: /Into Give/ }));
    fireEvent.click(screen.getByRole("button", { name: "10" }));
    fireEvent.click(screen.getByRole("button", { name: "Move coins" }));
    await waitFor(() => expect(onAllocate).toHaveBeenCalledWith("give", 10));
  });

  it("withdraws from Save when 'Out of Save' is picked", async () => {
    const { onWithdraw } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Out of Save" }));
    fireEvent.click(screen.getByRole("button", { name: "25" }));
    fireEvent.click(screen.getByRole("button", { name: "Move coins" }));
    await waitFor(() => expect(onWithdraw).toHaveBeenCalledWith(25));
  });

  it("clamps the amount to the source bucket via the 'All' chip", async () => {
    const { onAllocate } = setup({ spend: 7 });
    fireEvent.click(screen.getByRole("button", { name: "All" }));
    fireEvent.click(screen.getByRole("button", { name: "Move coins" }));
    // Spend is 7, so the 10 and 25 presets are hidden and All == 7.
    await waitFor(() => expect(onAllocate).toHaveBeenCalledWith("save", 7));
    expect(screen.queryByRole("button", { name: "25" })).not.toBeInTheDocument();
  });

  it("surfaces the server's message and stays open on failure", async () => {
    const onAllocate = vi.fn().mockRejectedValue(new Error("Not enough coins to move"));
    render(
      <JarAllocator
        open
        onClose={vi.fn()}
        spend={40}
        save={100}
        onAllocate={onAllocate}
        onWithdraw={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Move coins" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Not enough coins to move");
  });

  it("disables moving when the source bucket is empty", () => {
    setup({ spend: 0 });
    expect(screen.getByRole("button", { name: "Move coins" })).toBeDisabled();
  });
});
