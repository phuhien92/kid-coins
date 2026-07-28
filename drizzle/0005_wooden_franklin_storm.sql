CREATE TYPE "public"."jar_type" AS ENUM('save', 'give');--> statement-breakpoint
ALTER TYPE "public"."activity_type" ADD VALUE 'coins_allocated';--> statement-breakpoint
ALTER TYPE "public"."activity_type" ADD VALUE 'interest_paid';--> statement-breakpoint
ALTER TYPE "public"."transaction_type" ADD VALUE 'allocated';--> statement-breakpoint
ALTER TYPE "public"."transaction_type" ADD VALUE 'interest';--> statement-breakpoint
CREATE TABLE "jars" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kid_id" uuid NOT NULL,
	"type" "jar_type" NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"last_interest_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "jars_kid_id_type_unique" UNIQUE("kid_id","type")
);
--> statement-breakpoint
ALTER TABLE "family_settings" ADD COLUMN "save_interest_bps" integer DEFAULT 500 NOT NULL;--> statement-breakpoint
ALTER TABLE "jars" ADD CONSTRAINT "jars_kid_id_kid_profiles_id_fk" FOREIGN KEY ("kid_id") REFERENCES "public"."kid_profiles"("id") ON DELETE cascade ON UPDATE no action;