export function getRemainingStock(
  quantity: number | null,
  quantityUsed: number
): number | null {
  if (quantity == null) return null;
  return Math.max(0, quantity - quantityUsed);
}

export function hasRewardStock(
  quantity: number | null,
  quantityUsed: number
): boolean {
  if (quantity == null) return true;
  return quantityUsed < quantity;
}

export function shouldDeactivateReward(
  quantity: number | null,
  quantityUsed: number
): boolean {
  if (quantity == null) return false;
  return quantityUsed >= quantity;
}
