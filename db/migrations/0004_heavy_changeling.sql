CREATE TABLE "user_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"goals" text[] DEFAULT '{}',
	"preferences" jsonb DEFAULT '{}'::jsonb,
	"streak_target" integer DEFAULT 1,
	"onboarded_at" timestamp with time zone,
	"is_pro" boolean DEFAULT false,
	"pro_trial_ends_at" timestamp with time zone,
	"pro_subscription_ends_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "goals";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "preferences";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "streak_target";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "is_pro";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "pro_trial_ends_at";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "pro_subscription_ends_at";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "onboarded_at";