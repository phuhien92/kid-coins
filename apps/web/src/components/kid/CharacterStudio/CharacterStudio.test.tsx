import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DEFAULT_CHARACTER } from "@/lib/character";
import { CharacterStudio } from "./CharacterStudio";

describe("CharacterStudio", () => {
  it("renders guild preview and class/skin tabs", () => {
    render(
      <CharacterStudio
        char={{ ...DEFAULT_CHARACTER, outfit: "wizard" }}
        onChange={vi.fn()}
        onSave={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Class" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Skin" })).toBeInTheDocument();
    expect(screen.getByText(/Wizard starter kit/i)).toBeInTheDocument();
  });

  it("calls onChange when a skin color is picked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <CharacterStudio
        char={{ ...DEFAULT_CHARACTER, outfit: "wizard", color: "yellow" }}
        onChange={onChange}
        onSave={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: "Skin" }));
    await user.click(screen.getByRole("button", { name: "Mint" }));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ color: "mint" })
    );
  });

  it("disables locked classes the kid has not unlocked", () => {
    render(
      <CharacterStudio
        char={{ ...DEFAULT_CHARACTER, outfit: "wizard" }}
        onChange={vi.fn()}
        onSave={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: /Knight — locked/i })).toBeDisabled();
  });

  it("renders full-page layout with sticky preview panel", () => {
    render(
      <CharacterStudio
        char={{ ...DEFAULT_CHARACTER, outfit: "wizard" }}
        onChange={vi.fn()}
        onSave={vi.fn()}
        layout="page"
      />
    );

    expect(screen.getByText("Your character")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Customize" })).toBeInTheDocument();
  });
});
