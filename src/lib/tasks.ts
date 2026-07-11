export type TaskSchedule = {
  isActive: boolean;
  scheduledStartAt: Date | null;
  durationDays: number | null;
};

export function isTaskVisible(task: TaskSchedule, now = new Date()): boolean {
  if (!task.isActive) return false;

  if (task.scheduledStartAt && task.scheduledStartAt > now) {
    return false;
  }

  if (task.durationDays != null && task.scheduledStartAt) {
    const expiresAt = new Date(task.scheduledStartAt);
    expiresAt.setDate(expiresAt.getDate() + task.durationDays);
    if (expiresAt < now) return false;
  }

  return true;
}

export function getTaskExpiresAt(
  scheduledStartAt: Date | null,
  durationDays: number | null
): Date | null {
  if (!scheduledStartAt || durationDays == null) return null;
  const expiresAt = new Date(scheduledStartAt);
  expiresAt.setDate(expiresAt.getDate() + durationDays);
  return expiresAt;
}

export function calculateCoinsEarned(
  coinReward: number,
  paymentPercent: number,
  bonusCoins = 0
): number {
  return Math.floor((coinReward * paymentPercent) / 100) + bonusCoins;
}

export const APPROVAL_TIERS = [100, 75, 50, 0] as const;
export type ApprovalTier = (typeof APPROVAL_TIERS)[number];

export function isValidApprovalTier(value: number): value is ApprovalTier {
  return (APPROVAL_TIERS as readonly number[]).includes(value);
}
