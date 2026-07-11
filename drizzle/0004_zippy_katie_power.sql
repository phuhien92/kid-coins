ALTER TABLE "rewards" ADD COLUMN "quantity" integer;--> statement-breakpoint
ALTER TABLE "rewards" ADD COLUMN "quantity_used" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "task_completions" ADD COLUMN "payment_percent" integer DEFAULT 100 NOT NULL;--> statement-breakpoint
ALTER TABLE "task_completions" ADD COLUMN "bonus_coins" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "emoji" text DEFAULT '✅' NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "scheduled_start_at" timestamp;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "duration_days" integer;