import { describe, it, expect, vi, beforeEach } from "vitest";

const mockDebitIfAffordable = vi.fn();
const mockCreditBalance = vi.fn();

vi.mock("@/lib/kid-balance", () => ({
  debitBalanceIfAffordable: (...args: unknown[]) => mockDebitIfAffordable(...args),
  creditBalance: (...args: unknown[]) => mockCreditBalance(...args),
}));

import type { Tx } from "@/lib/db";
import {
  calculateInterest,
  weeksElapsed,
  allocateToJar,
  withdrawFromSaveJar,
  WEEK_MS,
} from "./jars";

/**
 * Records jar UPDATEs. The guarded jar write returns `returning`, and the
 * post-move Spend read returns `kidBalance`.
 */
function fakeTx({
  returning = [{ balance: 25 }] as Array<{ balance: number }>,
  kidBalance = 15,
}: { returning?: Array<{ balance: number }>; kidBalance?: number } = {}) {
  const setSpy = vi.fn();
  const tx = {
    update: () => ({
      set: (v: unknown) => {
        setSpy(v);
        return {
          where: () => ({ returning: async () => returning }),
        };
      },
    }),
    select: () => ({ from: () => ({ where: async () => [{ balance: kidBalance }] }) }),
  } as unknown as Tx;
  return { tx, setSpy };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("weeksElapsed", () => {
  const base = new Date("2026-01-01T00:00:00Z");

  it("returns 0 for the same instant or a past 'to'", () => {
    expect(weeksElapsed(base, base)).toBe(0);
    expect(weeksElapsed(base, new Date(base.getTime() - WEEK_MS))).toBe(0);
  });

  it("counts only whole weeks, discarding the remainder", () => {
    expect(weeksElapsed(base, new Date(base.getTime() + WEEK_MS - 1))).toBe(0);
    expect(weeksElapsed(base, new Date(base.getTime() + WEEK_MS))).toBe(1);
    expect(weeksElapsed(base, new Date(base.getTime() + 3 * WEEK_MS + 5))).toBe(3);
  });
});

describe("calculateInterest", () => {
  it("is zero when balance, rate, or weeks are non-positive", () => {
    expect(calculateInterest(0, 500, 4)).toBe(0);
    expect(calculateInterest(100, 0, 4)).toBe(0);
    expect(calculateInterest(100, 500, 0)).toBe(0);
    expect(calculateInterest(-50, 500, 4)).toBe(0);
  });

  it("floors each week, so a balance too small to earn a coin never grows", () => {
    // 5% of 19 = 0.95 → floors to 0 every week.
    expect(calculateInterest(19, 500, 10)).toBe(0);
  });

  it("compounds week over week", () => {
    // 100 @ 5%/wk: 100→105→110 (floor(105*.05)=5) → interest = 10 over 2 weeks.
    expect(calculateInterest(100, 500, 2)).toBe(10);
    // Single week is a plain floored percentage.
    expect(calculateInterest(100, 500, 1)).toBe(5);
  });
});

describe("allocateToJar", () => {
  it("rejects non-positive amounts without touching balances", async () => {
    const { tx } = fakeTx();
    await expect(allocateToJar(tx, "kid-1", "save", 0)).resolves.toBeNull();
    expect(mockDebitIfAffordable).not.toHaveBeenCalled();
  });

  it("credits the jar after Spend is debited and returns post-move balances", async () => {
    mockDebitIfAffordable.mockResolvedValueOnce(true);
    const { tx, setSpy } = fakeTx({ returning: [{ balance: 125 }], kidBalance: 15 });

    await expect(allocateToJar(tx, "kid-1", "save", 25)).resolves.toEqual({
      spend: 15,
      jarBalance: 125,
    });
    expect(mockDebitIfAffordable).toHaveBeenCalledWith(tx, "kid-1", 25);
    expect(setSpy).toHaveBeenCalledOnce(); // the jar increment ran
  });

  it("does not credit the jar when Spend cannot afford the move", async () => {
    mockDebitIfAffordable.mockResolvedValueOnce(false);
    const { tx, setSpy } = fakeTx();

    await expect(allocateToJar(tx, "kid-1", "give", 25)).resolves.toBeNull();
    expect(setSpy).not.toHaveBeenCalled(); // jar never touched
  });

  it("throws when the jar row is missing after Spend was debited", async () => {
    // Spend was debited but the guarded jar credit matched no row, so throwing
    // rolls the whole transaction back rather than losing the coins.
    mockDebitIfAffordable.mockResolvedValueOnce(true);
    const { tx } = fakeTx({ returning: [] });

    await expect(allocateToJar(tx, "kid-1", "save", 25)).rejects.toThrow(/Missing save jar/);
  });
});

describe("withdrawFromSaveJar", () => {
  it("rejects non-positive amounts", async () => {
    const { tx } = fakeTx();
    await expect(withdrawFromSaveJar(tx, "kid-1", 0)).resolves.toBeNull();
    expect(mockCreditBalance).not.toHaveBeenCalled();
  });

  it("credits Spend when the guarded jar debit applied and returns balances", async () => {
    const { tx } = fakeTx({ returning: [{ balance: 70 }], kidBalance: 90 });
    await expect(withdrawFromSaveJar(tx, "kid-1", 10)).resolves.toEqual({
      spend: 90,
      jarBalance: 70,
    });
    expect(mockCreditBalance).toHaveBeenCalledWith(tx, "kid-1", 10);
  });

  it("does not credit Spend when the jar lacked the coins", async () => {
    const { tx } = fakeTx({ returning: [] }); // guarded UPDATE matched no row
    await expect(withdrawFromSaveJar(tx, "kid-1", 10)).resolves.toBeNull();
    expect(mockCreditBalance).not.toHaveBeenCalled();
  });
});
