import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  uuid,
  pgEnum,
  json,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ── Enums ──────────────────────────────────────────────────────────────────

export const taskTypeEnum = pgEnum("task_type", ["daily", "once"]);

export const taskCompletionStatusEnum = pgEnum("task_completion_status", [
  "pending",   // kid marked done, awaiting parent review
  "approved",  // parent approved, coins credited
  "denied",    // parent denied, optimistic update rolled back
]);

export const redemptionStatusEnum = pgEnum("redemption_status", [
  "pending",
  "approved",
  "denied",
]);

export const transactionTypeEnum = pgEnum("transaction_type", [
  "earned",    // task approved
  "redeemed",  // reward redemption approved
  "adjusted",  // manual parent adjustment
]);

export const activityTypeEnum = pgEnum("activity_type", [
  "task_completed",   // kid submitted a completion
  "task_approved",    // parent approved
  "task_denied",      // parent denied
  "reward_redeemed",  // kid requested redemption
  "reward_approved",  // parent approved redemption
  "reward_denied",    // parent denied redemption
  "coins_adjusted",   // parent manually adjusted balance
  "kid_added",        // new kid profile created
]);

// ── Tables ─────────────────────────────────────────────────────────────────

export const families = pgTable("families", {
  id: uuid("id").defaultRandom().primaryKey(),
  parentUserId: text("parent_user_id").notNull().unique(), // Supabase auth UID
  name: text("name").notNull(),
  parentPinHash: text("parent_pin_hash"), // bcrypt hash; null when no parent PIN is set
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * One row per family. Must be provisioned explicitly alongside family creation.
 * Stores all parent-configurable toggles so they survive across sessions
 * without hitting the families table for every settings read.
 */
export const familySettings = pgTable("family_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  familyId: uuid("family_id")
    .notNull()
    .unique()
    .references(() => families.id, { onDelete: "cascade" }),
  // Approval modes
  requireTaskApproval: boolean("require_task_approval").notNull().default(true),
  requireRedemptionApproval: boolean("require_redemption_approval").notNull().default(true),
  // Notification prefs
  weeklyAiSummary: boolean("weekly_ai_summary").notNull().default(true),
  quietHours: boolean("quiet_hours").notNull().default(false),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const kidProfiles = pgTable("kid_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  familyId: uuid("family_id")
    .notNull()
    .references(() => families.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  avatarColor: text("avatar_color").notNull().default("#F4D34E"),
  pinHash: text("pin_hash").notNull(),
  balance: integer("balance").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const characters = pgTable("characters", {
  id: uuid("id").defaultRandom().primaryKey(),
  kidId: uuid("kid_id")
    .notNull()
    .unique()
    .references(() => kidProfiles.id, { onDelete: "cascade" }),
  color: text("color").notNull().default("yellow"),
  hat: text("hat").notNull().default("none"),
  eye: text("eye").notNull().default("default"),
  extra: text("extra").notNull().default("none"),
  bg: text("bg").notNull().default("sky"),
  outfit: text("outfit").notNull().default("none"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  kidId: uuid("kid_id")
    .notNull()
    .references(() => kidProfiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  emoji: text("emoji").notNull().default("✅"),
  type: taskTypeEnum("type").notNull().default("daily"),
  coinReward: integer("coin_reward").notNull().default(10),
  scheduledStartAt: timestamp("scheduled_start_at"),
  durationDays: integer("duration_days"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * One row per task completion attempt.
 *
 * Flow:
 *   1. Kid taps "done" → row inserted with status = "pending"
 *   2. Parent approves → status = "approved", kid balance credited, coinTransaction created
 *   3. Parent denies  → status = "denied", optimistic update on kid's UI rolled back
 *
 * If familySettings.requireTaskApproval = false, the API auto-approves on insert.
 */
export const taskCompletions = pgTable("task_completions", {
  id: uuid("id").defaultRandom().primaryKey(),
  taskId: uuid("task_id")
    .notNull()
    .references(() => tasks.id, { onDelete: "cascade" }),
  kidId: uuid("kid_id")
    .notNull()
    .references(() => kidProfiles.id, { onDelete: "cascade" }),
  coinsEarned: integer("coins_earned").notNull(),
  paymentPercent: integer("payment_percent").notNull().default(100),
  bonusCoins: integer("bonus_coins").notNull().default(0),
  status: taskCompletionStatusEnum("status").notNull().default("pending"),
  rejectionReason: text("rejection_reason"),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"), // set when approved or denied
});

export const coinTransactions = pgTable("coin_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  kidId: uuid("kid_id")
    .notNull()
    .references(() => kidProfiles.id, { onDelete: "cascade" }),
  type: transactionTypeEnum("type").notNull(),
  amount: integer("amount").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rewards = pgTable("rewards", {
  id: uuid("id").defaultRandom().primaryKey(),
  familyId: uuid("family_id")
    .notNull()
    .references(() => families.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  coinCost: integer("coin_cost").notNull(),
  emoji: text("emoji").notNull().default("🎁"),
  quantity: integer("quantity"),
  quantityUsed: integer("quantity_used").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const redemptionRequests = pgTable("redemption_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  kidId: uuid("kid_id")
    .notNull()
    .references(() => kidProfiles.id, { onDelete: "cascade" }),
  rewardId: uuid("reward_id")
    .notNull()
    .references(() => rewards.id, { onDelete: "cascade" }),
  status: redemptionStatusEnum("status").notNull().default("pending"),
  coinsSpent: integer("coins_spent").notNull(),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

export const goals = pgTable("goals", {
  id: uuid("id").defaultRandom().primaryKey(),
  kidId: uuid("kid_id")
    .notNull()
    .references(() => kidProfiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  targetAmount: integer("target_amount").notNull(),
  emoji: text("emoji").notNull().default("⭐"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const streaks = pgTable("streaks", {
  id: uuid("id").defaultRandom().primaryKey(),
  kidId: uuid("kid_id")
    .notNull()
    .unique()
    .references(() => kidProfiles.id, { onDelete: "cascade" }),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastCompletedDate: timestamp("last_completed_date"),
});

export const badges = pgTable("badges", {
  id: uuid("id").defaultRandom().primaryKey(),
  kidId: uuid("kid_id")
    .notNull()
    .references(() => kidProfiles.id, { onDelete: "cascade" }),
  slug: text("slug").notNull(),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

/**
 * Append-only event log driving the parent dashboard activity feed.
 * payload is a JSON object whose shape depends on `type` — kept flexible
 * so new event types don't require schema migrations.
 *
 * Examples:
 *   task_approved  → { taskTitle: string, coinsEarned: number, completionId: string }
 *   reward_redeemed → { rewardTitle: string, coinsSpent: number, requestId: string }
 *   coins_adjusted  → { delta: number, reason: string }
 */
export const activityLog = pgTable("activity_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  familyId: uuid("family_id")
    .notNull()
    .references(() => families.id, { onDelete: "cascade" }),
  kidId: uuid("kid_id").references(() => kidProfiles.id, { onDelete: "set null" }),
  type: activityTypeEnum("type").notNull(),
  payload: json("payload").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Relations ──────────────────────────────────────────────────────────────

export const familiesRelations = relations(families, ({ one, many }) => ({
  settings: one(familySettings, {
    fields: [families.id],
    references: [familySettings.familyId],
  }),
  kids: many(kidProfiles),
  rewards: many(rewards),
  activityLog: many(activityLog),
}));

export const familySettingsRelations = relations(familySettings, ({ one }) => ({
  family: one(families, {
    fields: [familySettings.familyId],
    references: [families.id],
  }),
}));

export const kidProfilesRelations = relations(kidProfiles, ({ one, many }) => ({
  family: one(families, {
    fields: [kidProfiles.familyId],
    references: [families.id],
  }),
  character: one(characters, {
    fields: [kidProfiles.id],
    references: [characters.kidId],
  }),
  tasks: many(tasks),
  completions: many(taskCompletions),
  transactions: many(coinTransactions),
  redemptions: many(redemptionRequests),
  goals: many(goals),
  badges: many(badges),
  streak: one(streaks, {
    fields: [kidProfiles.id],
    references: [streaks.kidId],
  }),
  activityLog: many(activityLog),
}));

export const charactersRelations = relations(characters, ({ one }) => ({
  kid: one(kidProfiles, {
    fields: [characters.kidId],
    references: [kidProfiles.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  kid: one(kidProfiles, {
    fields: [tasks.kidId],
    references: [kidProfiles.id],
  }),
  completions: many(taskCompletions),
}));

export const taskCompletionsRelations = relations(taskCompletions, ({ one }) => ({
  task: one(tasks, {
    fields: [taskCompletions.taskId],
    references: [tasks.id],
  }),
  kid: one(kidProfiles, {
    fields: [taskCompletions.kidId],
    references: [kidProfiles.id],
  }),
}));

export const rewardsRelations = relations(rewards, ({ one, many }) => ({
  family: one(families, {
    fields: [rewards.familyId],
    references: [families.id],
  }),
  redemptions: many(redemptionRequests),
}));

export const redemptionRequestsRelations = relations(redemptionRequests, ({ one }) => ({
  kid: one(kidProfiles, {
    fields: [redemptionRequests.kidId],
    references: [kidProfiles.id],
  }),
  reward: one(rewards, {
    fields: [redemptionRequests.rewardId],
    references: [rewards.id],
  }),
}));

export const streaksRelations = relations(streaks, ({ one }) => ({
  kid: one(kidProfiles, {
    fields: [streaks.kidId],
    references: [kidProfiles.id],
  }),
}));

export const badgesRelations = relations(badges, ({ one }) => ({
  kid: one(kidProfiles, {
    fields: [badges.kidId],
    references: [kidProfiles.id],
  }),
}));

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  family: one(families, {
    fields: [activityLog.familyId],
    references: [families.id],
  }),
  kid: one(kidProfiles, {
    fields: [activityLog.kidId],
    references: [kidProfiles.id],
  }),
}));
