export type UserRole = "parent" | "kid";

// ── Kid-facing types ───────────────────────────────────────────────────────

export interface KidProfile {
  id: string;
  name: string;
  balance: number;
  avatarColor: string;
  familyId: string;
}

export interface Task {
  id: string;
  kidId: string;
  title: string;
  type: "daily" | "once";
  coinReward: number;
  isActive: boolean;
  completedToday?: boolean;       // derived: pending or approved completion exists for today
  pendingCompletionId?: string;   // set when there's a pending taskCompletion awaiting approval
}

export interface Reward {
  id: string;
  familyId: string;
  title: string;
  description?: string;
  coinCost: number;
  emoji: string;
  isActive: boolean;
  pendingRedemptionId?: string;   // set when kid has a pending redemption for this reward
}

export interface Goal {
  id: string;
  kidId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;          // derived from kidProfiles.balance
  emoji: string;
  isActive: boolean;
}

export interface CharacterState {
  color: string;
  hat: string;
  eye: string;
  extra: string;
  bg: string;
  outfit: string;
}

// ── Task completion / approval ─────────────────────────────────────────────

export type TaskCompletionStatus = "pending" | "approved" | "denied";

export interface TaskCompletion {
  id: string;
  taskId: string;
  taskTitle: string;
  kidId: string;
  kidName: string;
  coinsEarned: number;
  status: TaskCompletionStatus;
  rejectionReason?: string;
  completedAt: string;
  resolvedAt?: string;
}

// ── Redemption / reward approval ───────────────────────────────────────────

export type RedemptionStatus = "pending" | "approved" | "denied";

export interface RedemptionRequest {
  id: string;
  kidId: string;
  kidName: string;
  rewardId: string;
  rewardTitle: string;
  coinsSpent: number;
  status: RedemptionStatus;
  rejectionReason?: string;
  createdAt: string;
  resolvedAt?: string;
}

// ── Parent-facing types ────────────────────────────────────────────────────

export interface Family {
  id: string;
  parentUserId: string;
  name: string;
  createdAt: string;
}

export interface FamilySettings {
  id: string;
  familyId: string;
  requireTaskApproval: boolean;
  requireRedemptionApproval: boolean;
  weeklyAiSummary: boolean;
  quietHours: boolean;
}

// ── Activity feed ──────────────────────────────────────────────────────────

export type ActivityType =
  | "task_completed"
  | "task_approved"
  | "task_denied"
  | "reward_redeemed"
  | "reward_approved"
  | "reward_denied"
  | "coins_adjusted"
  | "kid_added";

export interface ActivityEvent {
  id: string;
  familyId: string;
  kidId?: string;
  kidName?: string;
  type: ActivityType;
  payload?: Record<string, unknown>;
  createdAt: string;
}

// ── AI Coach ───────────────────────────────────────────────────────────────

export interface CoachStep {
  prompt: string;
  quickReplies?: string[];
}

// ── Streaks & badges ───────────────────────────────────────────────────────

export interface Streak {
  kidId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: string;
}

export interface Badge {
  id: string;
  kidId: string;
  slug: string;
  earnedAt: string;
}
