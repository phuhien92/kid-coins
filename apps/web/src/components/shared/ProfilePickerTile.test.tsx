import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProfilePickerTile, ParentPickerTile } from "./ProfilePickerTile";

// Next.js navigation mock
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }));

// framer-motion mock
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
    p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
      <p {...props}>{children}</p>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockKid = { name: "Alex", avatarColor: "#2F7A55", balance: 120 };

describe("ProfilePickerTile", () => {
  it("renders the kid name and balance", () => {
    render(<ProfilePickerTile kid={mockKid} onClick={() => {}} />);
    expect(screen.getByText("Alex")).toBeInTheDocument();
    expect(screen.getByText("120")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<ProfilePickerTile kid={mockKid} onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe("ParentPickerTile — no PIN set", () => {
  beforeEach(() => { mockPush.mockClear(); });

  it("navigates directly to /parent/home when no PIN is set", async () => {
    render(<ParentPickerTile hasPin={false} />);
    fireEvent.click(screen.getByRole("button", { name: /parent/i }));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/parent/home"));
  });

  it("shows 'Dashboard' subtitle when no PIN is set", () => {
    render(<ParentPickerTile hasPin={false} />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });
});

describe("ParentPickerTile — PIN set", () => {
  beforeEach(() => {
    mockPush.mockClear();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("shows PIN modal when hasPin is true", async () => {
    render(<ParentPickerTile hasPin={true} />);
    fireEvent.click(screen.getByRole("button", { name: /parent/i }));
    await waitFor(() =>
      expect(screen.getByText("Parent access")).toBeInTheDocument()
    );
  });

  it("shows '🔐 PIN required' subtitle", () => {
    render(<ParentPickerTile hasPin={true} />);
    expect(screen.getByText("🔐 PIN required")).toBeInTheDocument();
  });

  it("navigates to /parent/home after successful PIN verify", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), { status: 200 })
    );

    render(<ParentPickerTile hasPin={true} />);
    fireEvent.click(screen.getByRole("button", { name: /parent/i }));

    await waitFor(() => screen.getByText("Parent access"));

    // Enter 4-digit PIN
    for (const digit of ["1", "2", "3", "4"]) {
      fireEvent.click(screen.getByRole("button", { name: digit }));
    }

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/parent/home"));
  });

  it("shows wrong-PIN error on 401 response", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Wrong PIN" }), { status: 401 })
    );

    render(<ParentPickerTile hasPin={true} />);
    fireEvent.click(screen.getByRole("button", { name: /parent/i }));
    await waitFor(() => screen.getByText("Parent access"));

    for (const digit of ["9", "9", "9", "9"]) {
      fireEvent.click(screen.getByRole("button", { name: digit }));
    }

    await waitFor(() =>
      expect(screen.getByText("Wrong PIN — try again")).toBeVisible()
    );
  });
});
