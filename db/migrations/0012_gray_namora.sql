ALTER TABLE "review_items" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "whats_next_cache" jsonb;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "whats_next_cached_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "whats_next_input_hash" text;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "daily_summary_cache" text;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "daily_summary_cached_date" text;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "topic_aliases" jsonb;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "topic_aliases_known_topics" text[];--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "dashboard_tour_seen_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "express_trial_used" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "review_items" ADD CONSTRAINT "review_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;