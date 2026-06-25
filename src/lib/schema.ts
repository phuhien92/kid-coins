import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const taskTypeEnum = pgEnum("task_type", ["daily", "once"]);
export const redemptionStatusEnum = pgEnum("redemption_status", [
  "pending",
  "approved",
  "denied",
]);
export const transactionTypeEnum = pgEnum("transaction_type", [
  "earned",
  "redeemed",
  "adjusted",
]);

export const families = pgTable("families", {
  id: uuid("id").defaultRandom().primaryKey(),
  parentUserId: text("parent_user_id").notNull().unique(), // Supabase auth user id
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  kidId: uuid("kid_id")
    .notNull()
    .references(() => kidProfiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  type: taskTypeEnum("type").notNull().default("daily"),
  coinReward: integer("coin_reward").notNull().default(10),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const taskCompletions = pgTable("task_completions", {
  id: uuid("id").defaultRandom().primaryKey(),
  taskId: uuid("task_id")
    .notNull()
    .references(() => tasks.id, { onDelete: "cascade" }),
  kidId: uuid("kid_id")
    .notNull()
    .references(() => kidProfiles.id, { onDelete: "cascade" }),
  coinsEarned: integer("coins_earned").notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
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
  coinCost: integer("coin_cost").notNull(),
  emoji: text("emoji").notNull().default("🎁"),
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

// ── Relations ──

export const familiesRelations = relations(families, ({ many }) => ({
  kids: many(kidProfiles),
  rewards: many(rewards),
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
}));

export const charactersRelations = relations(characters, ({ one }) => ({
  kid: one(kidProfiles, {
    fields: [characters.kidId],
    references: [kidProfiles.id],
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
