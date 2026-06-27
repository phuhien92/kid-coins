import { describe, it, expect, vi, beforeEach } from "vitest";

const mockKidFindFirst = vi.fn();
const mockSelect = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      kidProfiles: { findFirst: (...args: unknown[]) => mockKidFindFirst(...args) },
    },
    select: (...args: unknown[]) => mockSelect(...args),
  },
}));

import { getKidEffectiveBalance } from "./kid-balance";

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
