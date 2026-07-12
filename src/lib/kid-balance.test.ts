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

import {
  getKidEffectiveBalance,
  creditBalance,
  debitBalance,
  debitBalanceIfAffordable,
  type Tx,
} from "./kid-balance";

/** Stands in for a transaction whose guarded UPDATE returns `debited`. */
function fakeTx(debited: Array<{ id: string }>) {
  return {
    update: () => ({
      set: () => ({
        where: () => ({ returning: async () => debited }),
      }),
    }),
  } as unknown as Tx;
}

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

describe("debitBalanceIfAffordable", () => {
  it("reports success when the guarded update debits a row", async () => {
    await expect(
      debitBalanceIfAffordable(fakeTx([{ id: "kid-1" }]), "kid-1", 10)
    ).resolves.toBe(true);
  });

  it("reports failure when the balance no longer covers the amount", async () => {
    // The coins were spent by a concurrent approval after the caller's advisory
    // check, so the UPDATE matches no row and nothing is debited.
    await expect(debitBalanceIfAffordable(fakeTx([]), "kid-1", 10)).resolves.toBe(false);
  });
});
