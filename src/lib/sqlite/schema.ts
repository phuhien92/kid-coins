import { randomUUID } from "node:crypto";
import { relations, sql } from "drizzle-orm";
import { check, integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

// Runtime SQLite schema. ../schema.ts is the legacy Postgres schema kept for the offline transfer.
const now = sql`(cast(unixepoch('subsec') * 1000 as integer))`;
const id = () => text("id").primaryKey().notNull().$defaultFn(randomUUID);
const date = (name: string) => integer(name, { mode: "timestamp_ms" });

export const families = sqliteTable("families", {
  id: id(),
  parentUserId: text("parent_user_id").notNull().unique(),
  name: text("name").notNull(),
  parentPinHash: text("parent_pin_hash"),
  createdAt: date("created_at").default(now).notNull(),
});

export const familySettings = sqliteTable("family_settings", {
  id: id(),
  familyId: text("family_id").notNull().unique().references(() => families.id, { onDelete: "cascade" }),
  requireTaskApproval: integer("require_task_approval", { mode: "boolean" }).notNull().default(true),
  requireRedemptionApproval: integer("require_redemption_approval", { mode: "boolean" }).notNull().default(true),
  weeklyAiSummary: integer("weekly_ai_summary", { mode: "boolean" }).notNull().default(true),
  quietHours: integer("quiet_hours", { mode: "boolean" }).notNull().default(false),
  saveInterestBps: integer("save_interest_bps").notNull().default(500),
  updatedAt: date("updated_at").default(now).notNull(),
});

export const kidProfiles = sqliteTable("kid_profiles", {
  id: id(),
  familyId: text("family_id").notNull().references(() => families.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  avatarColor: text("avatar_color").notNull().default("#F4D34E"),
  pinHash: text("pin_hash").notNull(),
  balance: integer("balance").notNull().default(0),
  createdAt: date("created_at").default(now).notNull(),
}, (t) => [
  check("kid_balance_nonnegative", sql`typeof(${t.balance}) = 'integer' and ${t.balance} >= 0`),
]);

export const characters = sqliteTable("characters", {
  id: id(),
  kidId: text("kid_id").notNull().unique().references(() => kidProfiles.id, { onDelete: "cascade" }),
  color: text("color").notNull().default("yellow"),
  hat: text("hat").notNull().default("none"),
  eye: text("eye").notNull().default("default"),
  extra: text("extra").notNull().default("none"),
  bg: text("bg").notNull().default("sky"),
  outfit: text("outfit").notNull().default("none"),
  updatedAt: date("updated_at").default(now).notNull(),
});

export const jars = sqliteTable("jars", {
  id: id(),
  kidId: text("kid_id").notNull().references(() => kidProfiles.id, { onDelete: "cascade" }),
  type: text("type", { enum: ["save", "give"] }).notNull(),
  balance: integer("balance").notNull().default(0),
  lastInterestAt: date("last_interest_at"),
  createdAt: date("created_at").default(now).notNull(),
}, (t) => [
  unique().on(t.kidId, t.type),
  check("jar_balance_nonnegative", sql`typeof(${t.balance}) = 'integer' and ${t.balance} >= 0`),
  check("jar_type_valid", sql`${t.type} in ('save', 'give')`),
]);

export const tasks = sqliteTable("tasks", {
  id: id(),
  kidId: text("kid_id").notNull().references(() => kidProfiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  emoji: text("emoji").notNull().default("✅"),
  type: text("type", { enum: ["daily", "once"] }).notNull().default("daily"),
  coinReward: integer("coin_reward").notNull().default(10),
  scheduledStartAt: date("scheduled_start_at"),
  durationDays: integer("duration_days"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: date("created_at").default(now).notNull(),
}, (t) => [
  check("task_type_valid", sql`${t.type} in ('daily', 'once')`),
]);

export const taskCompletions = sqliteTable("task_completions", {
  id: id(),
  taskId: text("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  kidId: text("kid_id").notNull().references(() => kidProfiles.id, { onDelete: "cascade" }),
  coinsEarned: integer("coins_earned").notNull(),
  paymentPercent: integer("payment_percent").notNull().default(100),
  bonusCoins: integer("bonus_coins").notNull().default(0),
  status: text("status", { enum: ["pending", "approved", "denied"] }).notNull().default("pending"),
  rejectionReason: text("rejection_reason"),
  completedAt: date("completed_at").default(now).notNull(),
  resolvedAt: date("resolved_at"),
}, (t) => [
  check("completion_status_valid", sql`${t.status} in ('pending', 'approved', 'denied')`),
]);

export const coinTransactions = sqliteTable("coin_transactions", {
  id: id(),
  kidId: text("kid_id").notNull().references(() => kidProfiles.id, { onDelete: "cascade" }),
  type: text("type", { enum: ["earned", "redeemed", "adjusted", "allocated", "interest"] }).notNull(),
  amount: integer("amount").notNull(),
  description: text("description").notNull(),
  createdAt: date("created_at").default(now).notNull(),
}, (t) => [
  check("transaction_type_valid", sql`${t.type} in ('earned', 'redeemed', 'adjusted', 'allocated', 'interest')`),
]);

export const rewards = sqliteTable("rewards", {
  id: id(),
  familyId: text("family_id").notNull().references(() => families.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  coinCost: integer("coin_cost").notNull(),
  emoji: text("emoji").notNull().default("🎁"),
  quantity: integer("quantity"),
  quantityUsed: integer("quantity_used").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: date("created_at").default(now).notNull(),
}, (t) => [
  check("reward_stock_valid", sql`typeof(${t.quantityUsed}) = 'integer' and ${t.quantityUsed} >= 0 and (${t.quantity} is null or (typeof(${t.quantity}) = 'integer' and ${t.quantity} >= 0))`),
]);

export const redemptionRequests = sqliteTable("redemption_requests", {
  id: id(),
  kidId: text("kid_id").notNull().references(() => kidProfiles.id, { onDelete: "cascade" }),
  rewardId: text("reward_id").notNull().references(() => rewards.id, { onDelete: "cascade" }),
  status: text("status", { enum: ["pending", "approved", "denied"] }).notNull().default("pending"),
  coinsSpent: integer("coins_spent").notNull(),
  rejectionReason: text("rejection_reason"),
  createdAt: date("created_at").default(now).notNull(),
  resolvedAt: date("resolved_at"),
}, (t) => [
  check("redemption_status_valid", sql`${t.status} in ('pending', 'approved', 'denied')`),
]);

export const goals = sqliteTable("goals", {
  id: id(),
  kidId: text("kid_id").notNull().references(() => kidProfiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  targetAmount: integer("target_amount").notNull(),
  emoji: text("emoji").notNull().default("⭐"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: date("created_at").default(now).notNull(),
});

export const streaks = sqliteTable("streaks", {
  id: id(),
  kidId: text("kid_id").notNull().unique().references(() => kidProfiles.id, { onDelete: "cascade" }),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastCompletedDate: date("last_completed_date"),
});

export const badges = sqliteTable("badges", {
  id: id(),
  kidId: text("kid_id").notNull().references(() => kidProfiles.id, { onDelete: "cascade" }),
  slug: text("slug").notNull(),
  earnedAt: date("earned_at").default(now).notNull(),
});

export const activityLog = sqliteTable("activity_log", {
  id: id(),
  familyId: text("family_id").notNull().references(() => families.id, { onDelete: "cascade" }),
  kidId: text("kid_id").references(() => kidProfiles.id, { onDelete: "set null" }),
  type: text("type", { enum: ["task_completed", "task_approved", "task_denied", "reward_redeemed", "reward_approved", "reward_denied", "coins_adjusted", "kid_added", "coins_allocated", "interest_paid"] }).notNull(),
  payload: text("payload", { mode: "json" }).$type<Record<string, unknown>>(),
  createdAt: date("created_at").default(now).notNull(),
}, (t) => [
  check("activity_type_valid", sql`${t.type} in ('task_completed', 'task_approved', 'task_denied', 'reward_redeemed', 'reward_approved', 'reward_denied', 'coins_adjusted', 'kid_added', 'coins_allocated', 'interest_paid')`),
  check("activity_payload_valid", sql`${t.payload} is null or json_valid(${t.payload})`),
]);

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
  jars: many(jars),
  badges: many(badges),
  streak: one(streaks, {
    fields: [kidProfiles.id],
    references: [streaks.kidId],
  }),
  activityLog: many(activityLog),
}));

export const jarsRelations = relations(jars, ({ one }) => ({
  kid: one(kidProfiles, {
    fields: [jars.kidId],
    references: [kidProfiles.id],
  }),
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
