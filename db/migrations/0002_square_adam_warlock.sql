ALTER TABLE "learnings" ADD COLUMN "author" text;--> statement-breakpoint
ALTER TABLE "learnings" ADD COLUMN "publish_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "learnings" ADD COLUMN "domain" text;--> statement-breakpoint
ALTER TABLE "learnings" ADD COLUMN "key_points" text[] DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "learnings" ADD COLUMN "content_type" text;--> statement-breakpoint
ALTER TABLE "learnings" ADD COLUMN "video_url" text;--> statement-breakpoint
ALTER TABLE "learnings" ADD COLUMN "video_title" text;--> statement-breakpoint
ALTER TABLE "learnings" ADD COLUMN "video_channel" text;--> statement-breakpoint
ALTER TABLE "learnings" ADD COLUMN "video_duration" integer;--> statement-breakpoint
ALTER TABLE "learnings" ADD COLUMN "is_ai_generated" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_pro" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "pro_trial_ends_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "pro_subscription_ends_at" timestamp with time zone;