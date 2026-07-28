import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const mockUseJars = vi.fn();
const mockUseSavingsJarsFlag = vi.fn();

vi.mock("@/hooks/useJars", () => ({
  useJars: (...args: unknown[]) => mockUseJars(...args),
}));
vi.mock("@/hooks/useSavingsJarsFlag", () => ({
  useSavingsJarsFlag: () => mockUseSavingsJarsFlag(),
}));

import { KidJarsSection } from "./KidJarsSection";

const LOADED = {
  loading: false,
  error: "",
  jars: { spend: 40, save: 100, give: 5 },
  interest: { rateBps: 500, projectedNextWeek: 5 },
  allocate: vi.fn(),
  withdraw: vi.fn(),
  refresh: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockUseSavingsJarsFlag.mockReturnValue(true);
  mockUseJars.mockReturnValue(LOADED);
});

describe("KidJarsSection", () => {
  it("renders nothing when the flag is off", () => {
    mockUseSavingsJarsFlag.mockReturnValue(false);
    const { container } = render(<KidJarsSection kidId="kid-1" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the three jars with their balances when enabled", () => {
    render(<KidJarsSection kidId="kid-1" />);
    expect(screen.getByText("Spend")).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
    expect(screen.getByText("Give")).toBeInTheDocument();
    expect(screen.getByText("40")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("shows the projected-interest nudge on the Save jar", () => {
    render(<KidJarsSection kidId="kid-1" />);
    expect(screen.getByText("Earns 5 more next week")).toBeInTheDocument();
  });

  it("shows an error message when the jars fail to load", () => {
    mockUseJars.mockReturnValue({ ...LOADED, jars: null, error: "Couldn't load your jars. Please try again." });
    render(<KidJarsSection kidId="kid-1" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Couldn't load your jars");
  });

  it("passes the resolved kid id to the data hook", () => {
    render(<KidJarsSection kidId="kid-42" />);
    expect(mockUseJars).toHaveBeenCalledWith("kid-42");
  });
});
