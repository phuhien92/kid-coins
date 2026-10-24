CREATE TABLE `activity_log` (
	`id` text PRIMARY KEY NOT NULL,
	`family_id` text NOT NULL,
	`kid_id` text,
	`type` text NOT NULL,
	`payload` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`family_id`) REFERENCES `families`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`kid_id`) REFERENCES `kid_profiles`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "activity_type_valid" CHECK("activity_log"."type" in ('task_completed', 'task_approved', 'task_denied', 'reward_redeemed', 'reward_approved', 'reward_denied', 'coins_adjusted', 'kid_added', 'coins_allocated', 'interest_paid')),
	CONSTRAINT "activity_payload_valid" CHECK("activity_log"."payload" is null or json_valid("activity_log"."payload"))
);
--> statement-breakpoint
CREATE TABLE `badges` (
	`id` text PRIMARY KEY NOT NULL,
	`kid_id` text NOT NULL,
	`slug` text NOT NULL,
	`earned_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`kid_id`) REFERENCES `kid_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `characters` (
	`id` text PRIMARY KEY NOT NULL,
	`kid_id` text NOT NULL,
	`color` text DEFAULT 'yellow' NOT NULL,
	`hat` text DEFAULT 'none' NOT NULL,
	`eye` text DEFAULT 'default' NOT NULL,
	`extra` text DEFAULT 'none' NOT NULL,
	`bg` text DEFAULT 'sky' NOT NULL,
	`outfit` text DEFAULT 'none' NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`kid_id`) REFERENCES `kid_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `characters_kid_id_unique` ON `characters` (`kid_id`);--> statement-breakpoint
CREATE TABLE `coin_transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`kid_id` text NOT NULL,
	`type` text NOT NULL,
	`amount` integer NOT NULL,
	`description` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`kid_id`) REFERENCES `kid_profiles`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "transaction_type_valid" CHECK("coin_transactions"."type" in ('earned', 'redeemed', 'adjusted', 'allocated', 'interest'))
);
--> statement-breakpoint
CREATE TABLE `families` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_user_id` text NOT NULL,
	`name` text NOT NULL,
	`parent_pin_hash` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `families_parent_user_id_unique` ON `families` (`parent_user_id`);--> statement-breakpoint
CREATE TABLE `family_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`family_id` text NOT NULL,
	`require_task_approval` integer DEFAULT true NOT NULL,
	`require_redemption_approval` integer DEFAULT true NOT NULL,
	`weekly_ai_summary` integer DEFAULT true NOT NULL,
	`quiet_hours` integer DEFAULT false NOT NULL,
	`save_interest_bps` integer DEFAULT 500 NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`family_id`) REFERENCES `families`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `family_settings_family_id_unique` ON `family_settings` (`family_id`);--> statement-breakpoint
CREATE TABLE `goals` (
	`id` text PRIMARY KEY NOT NULL,
	`kid_id` text NOT NULL,
	`title` text NOT NULL,
	`target_amount` integer NOT NULL,
	`emoji` text DEFAULT '⭐' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`kid_id`) REFERENCES `kid_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `jars` (
	`id` text PRIMARY KEY NOT NULL,
	`kid_id` text NOT NULL,
	`type` text NOT NULL,
	`balance` integer DEFAULT 0 NOT NULL,
	`last_interest_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`kid_id`) REFERENCES `kid_profiles`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "jar_balance_nonnegative" CHECK(typeof("jars"."balance") = 'integer' and "jars"."balance" >= 0),
	CONSTRAINT "jar_type_valid" CHECK("jars"."type" in ('save', 'give'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `jars_kid_id_type_unique` ON `jars` (`kid_id`,`type`);--> statement-breakpoint
CREATE TABLE `kid_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`family_id` text NOT NULL,
	`name` text NOT NULL,
	`avatar_color` text DEFAULT '#F4D34E' NOT NULL,
	`pin_hash` text NOT NULL,
	`balance` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`family_id`) REFERENCES `families`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "kid_balance_nonnegative" CHECK(typeof("kid_profiles"."balance") = 'integer' and "kid_profiles"."balance" >= 0)
);
--> statement-breakpoint
CREATE TABLE `redemption_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`kid_id` text NOT NULL,
	`reward_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`coins_spent` integer NOT NULL,
	`rejection_reason` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`resolved_at` integer,
	FOREIGN KEY (`kid_id`) REFERENCES `kid_profiles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`reward_id`) REFERENCES `rewards`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "redemption_status_valid" CHECK("redemption_requests"."status" in ('pending', 'approved', 'denied'))
);
--> statement-breakpoint
CREATE TABLE `rewards` (
	`id` text PRIMARY KEY NOT NULL,
	`family_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`coin_cost` integer NOT NULL,
	`emoji` text DEFAULT '🎁' NOT NULL,
	`quantity` integer,
	`quantity_used` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`family_id`) REFERENCES `families`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "reward_stock_valid" CHECK(typeof("rewards"."quantity_used") = 'integer' and "rewards"."quantity_used" >= 0 and ("rewards"."quantity" is null or (typeof("rewards"."quantity") = 'integer' and "rewards"."quantity" >= "rewards"."quantity_used")))
);
--> statement-breakpoint
CREATE TABLE `streaks` (
	`id` text PRIMARY KEY NOT NULL,
	`kid_id` text NOT NULL,
	`current_streak` integer DEFAULT 0 NOT NULL,
	`longest_streak` integer DEFAULT 0 NOT NULL,
	`last_completed_date` integer,
	FOREIGN KEY (`kid_id`) REFERENCES `kid_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `streaks_kid_id_unique` ON `streaks` (`kid_id`);--> statement-breakpoint
CREATE TABLE `task_completions` (
	`id` text PRIMARY KEY NOT NULL,
	`task_id` text NOT NULL,
	`kid_id` text NOT NULL,
	`coins_earned` integer NOT NULL,
	`payment_percent` integer DEFAULT 100 NOT NULL,
	`bonus_coins` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`rejection_reason` text,
	`completed_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`resolved_at` integer,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`kid_id`) REFERENCES `kid_profiles`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "completion_status_valid" CHECK("task_completions"."status" in ('pending', 'approved', 'denied'))
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`kid_id` text NOT NULL,
	`title` text NOT NULL,
	`emoji` text DEFAULT '✅' NOT NULL,
	`type` text DEFAULT 'daily' NOT NULL,
	`coin_reward` integer DEFAULT 10 NOT NULL,
	`scheduled_start_at` integer,
	`duration_days` integer,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`kid_id`) REFERENCES `kid_profiles`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "task_type_valid" CHECK("tasks"."type" in ('daily', 'once'))
);
