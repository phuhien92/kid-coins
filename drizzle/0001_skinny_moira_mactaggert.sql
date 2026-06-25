CREATE TYPE "public"."activity_type" AS ENUM('task_completed', 'task_approved', 'task_denied', 'reward_redeemed', 'reward_approved', 'reward_denied', 'coins_adjusted', 'kid_added');--> statement-breakpoint
CREATE TYPE "public"."task_completion_status" AS ENUM('pending', 'approved', 'denied');--> statement-breakpoint
CREATE TABLE "activity_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"family_id" uuid NOT NULL,
	"kid_id" uuid,
	"type" "activity_type" NOT NULL,
	"payload" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "family_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"family_id" uuid NOT NULL,
	"require_task_approval" boolean DEFAULT true NOT NULL,
	"require_redemption_approval" boolean DEFAULT true NOT NULL,
	"weekly_ai_summary" boolean DEFAULT true NOT NULL,
	"quiet_hours" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "family_settings_family_id_unique" UNIQUE("family_id")
);
--> statement-breakpoint
ALTER TABLE "redemption_requests" ADD COLUMN "rejection_reason" text;--> statement-breakpoint
ALTER TABLE "rewards" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "task_completions" ADD COLUMN "status" "task_completion_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "task_completions" ADD COLUMN "rejection_reason" text;--> statement-breakpoint
ALTER TABLE "task_completions" ADD COLUMN "resolved_at" timestamp;--> statement-breakpoint
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_family_id_families_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."families"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_kid_id_kid_profiles_id_fk" FOREIGN KEY ("kid_id") REFERENCES "public"."kid_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_settings" ADD CONSTRAINT "family_settings_family_id_families_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."families"("id") ON DELETE cascade ON UPDATE no action;