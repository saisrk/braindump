ALTER TABLE "review_items" ADD COLUMN "review_history" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "teach_backs" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "teach_backs" ADD COLUMN "verdict" text;--> statement-breakpoint
ALTER TABLE "teach_backs" ADD COLUMN "nailed_points" text[] DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "teach_backs" ADD COLUMN "gap_areas" text[] DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "teach_backs" ADD COLUMN "follow_up_questions" text[] DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "teach_backs" ADD COLUMN "encouragement" text;--> statement-breakpoint
ALTER TABLE "teach_backs" ADD CONSTRAINT "teach_backs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;