import { describe, it, expect, vi, beforeEach } from "vitest";

const mockKidFindFirst = vi.fn();
const mockSelect = vi.fn();
const mockUpdate = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      kidProfiles: { findFirst: (...args: unknown[]) => mockKidFindFirst(...args) },
    },
    select: (...args: unknown[]) => mockSelect(...args),
    transaction: vi.fn(),
  },
}));

import { getKidEffectiveBalance, creditBalance, debitBalance } from "./kid-balance";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getKidEffectiveBalance", () => {
  it("returns null when kid is missing", async () => {
    mockKidFindFirst.mockResolvedValueOnce(null);
    await expect(getKidEffectiveBalance("kid-1")).resolves.toBeNull();
  });

  it("subtracts pending redemption reservations", async () => {
    mockKidFindFirst.mockResolvedValueOnce({ balance: 50 });
    mockSelect.mockReturnValueOnce({
      from: () => ({
        where: async () => [{ reserved: 15 }],
      }),
    });

    await expect(getKidEffectiveBalance("kid-1")).resolves.toBe(35);
  });
});

describe("creditBalance", () => {
  it("issues an atomic increment update", async () => {
    const setFn = vi.fn().mockReturnThis();
    const whereFn = vi.fn().mockResolvedValue(undefined);
    mockUpdate.mockReturnValue({ set: setFn });
    setFn.mockReturnValue({ where: whereFn });

    await creditBalance(
      { update: mockUpdate } as unknown as Parameters<Parameters<typeof import("@/lib/db").db.transaction>[0]>[0],
      "kid-1",
      25
    );

    expect(mockUpdate).toHaveBeenCalledOnce();
    expect(setFn).toHaveBeenCalledOnce();
    expect(whereFn).toHaveBeenCalledOnce();
  });
});

describe("debitBalance", () => {
  it("issues an atomic decrement-with-floor update", async () => {
    const setFn = vi.fn().mockReturnThis();
    const whereFn = vi.fn().mockResolvedValue(undefined);
    mockUpdate.mockReturnValue({ set: setFn });
    setFn.mockReturnValue({ where: whereFn });

    await debitBalance(
      { update: mockUpdate } as unknown as Parameters<Parameters<typeof import("@/lib/db").db.transaction>[0]>[0],
      "kid-1",
      10
    );

    expect(mockUpdate).toHaveBeenCalledOnce();
    expect(setFn).toHaveBeenCalledOnce();
    expect(whereFn).toHaveBeenCalledOnce();
  });
});
