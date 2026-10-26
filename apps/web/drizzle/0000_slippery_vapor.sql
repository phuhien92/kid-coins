CREATE TYPE "public"."redemption_status" AS ENUM('pending', 'approved', 'denied');--> statement-breakpoint
CREATE TYPE "public"."task_type" AS ENUM('daily', 'once');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('earned', 'redeemed', 'adjusted');--> statement-breakpoint
CREATE TABLE "badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kid_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"earned_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "characters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kid_id" uuid NOT NULL,
	"color" text DEFAULT 'yellow' NOT NULL,
	"hat" text DEFAULT 'none' NOT NULL,
	"eye" text DEFAULT 'default' NOT NULL,
	"extra" text DEFAULT 'none' NOT NULL,
	"bg" text DEFAULT 'sky' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "characters_kid_id_unique" UNIQUE("kid_id")
);
--> statement-breakpoint
CREATE TABLE "coin_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kid_id" uuid NOT NULL,
	"type" "transaction_type" NOT NULL,
	"amount" integer NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "families" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_user_id" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "families_parent_user_id_unique" UNIQUE("parent_user_id")
);
--> statement-breakpoint
CREATE TABLE "goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kid_id" uuid NOT NULL,
	"title" text NOT NULL,
	"target_amount" integer NOT NULL,
	"emoji" text DEFAULT '⭐' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kid_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"family_id" uuid NOT NULL,
	"name" text NOT NULL,
	"avatar_color" text DEFAULT '#F4D34E' NOT NULL,
	"pin_hash" text NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "redemption_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kid_id" uuid NOT NULL,
	"reward_id" uuid NOT NULL,
	"status" "redemption_status" DEFAULT 'pending' NOT NULL,
	"coins_spent" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "rewards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"family_id" uuid NOT NULL,
	"title" text NOT NULL,
	"coin_cost" integer NOT NULL,
	"emoji" text DEFAULT '🎁' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "streaks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kid_id" uuid NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"longest_streak" integer DEFAULT 0 NOT NULL,
	"last_completed_date" timestamp,
	CONSTRAINT "streaks_kid_id_unique" UNIQUE("kid_id")
);
--> statement-breakpoint
CREATE TABLE "task_completions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"kid_id" uuid NOT NULL,
	"coins_earned" integer NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kid_id" uuid NOT NULL,
	"title" text NOT NULL,
	"type" "task_type" DEFAULT 'daily' NOT NULL,
	"coin_reward" integer DEFAULT 10 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "badges" ADD CONSTRAINT "badges_kid_id_kid_profiles_id_fk" FOREIGN KEY ("kid_id") REFERENCES "public"."kid_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "characters" ADD CONSTRAINT "characters_kid_id_kid_profiles_id_fk" FOREIGN KEY ("kid_id") REFERENCES "public"."kid_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coin_transactions" ADD CONSTRAINT "coin_transactions_kid_id_kid_profiles_id_fk" FOREIGN KEY ("kid_id") REFERENCES "public"."kid_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_kid_id_kid_profiles_id_fk" FOREIGN KEY ("kid_id") REFERENCES "public"."kid_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kid_profiles" ADD CONSTRAINT "kid_profiles_family_id_families_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."families"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "redemption_requests" ADD CONSTRAINT "redemption_requests_kid_id_kid_profiles_id_fk" FOREIGN KEY ("kid_id") REFERENCES "public"."kid_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "redemption_requests" ADD CONSTRAINT "redemption_requests_reward_id_rewards_id_fk" FOREIGN KEY ("reward_id") REFERENCES "public"."rewards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rewards" ADD CONSTRAINT "rewards_family_id_families_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."families"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "streaks" ADD CONSTRAINT "streaks_kid_id_kid_profiles_id_fk" FOREIGN KEY ("kid_id") REFERENCES "public"."kid_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_completions" ADD CONSTRAINT "task_completions_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_completions" ADD CONSTRAINT "task_completions_kid_id_kid_profiles_id_fk" FOREIGN KEY ("kid_id") REFERENCES "public"."kid_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_kid_id_kid_profiles_id_fk" FOREIGN KEY ("kid_id") REFERENCES "public"."kid_profiles"("id") ON DELETE cascade ON UPDATE no action;