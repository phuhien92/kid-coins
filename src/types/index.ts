export type UserRole = "parent" | "kid";

export interface KidProfile {
  id: string;
  name: string;
  balance: number;
  avatarColor: string;
  familyId: string;
}

export interface Task {
  id: string;
  title: string;
  type: "daily" | "once";
  coinReward: number;
  isActive: boolean;
  completedToday?: boolean;
}

export interface Reward {
  id: string;
  title: string;
  coinCost: number;
  emoji: string;
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  emoji: string;
}

export interface CharacterState {
  color: string;
  hat: string;
  eye: string;
  extra: string;
  bg: string;
}

export interface RedemptionRequest {
  id: string;
  kidId: string;
  kidName: string;
  rewardTitle: string;
  coinsSpent: number;
  status: "pending" | "approved" | "denied";
  createdAt: string;
}

export interface CoachStep {
  prompt: string;
  quickReplies?: string[];
}
