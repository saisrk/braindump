CREATE TABLE "daily_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"date" date NOT NULL,
	"items_captured" integer DEFAULT 0,
	"items_reviewed" integer DEFAULT 0,
	"summary" text,
	CONSTRAINT "daily_logs_user_id_date_unique" UNIQUE("user_id","date")
);
--> statement-breakpoint
CREATE TABLE "learnings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"source_type" text NOT NULL,
	"source_ref" text,
	"summary" text,
	"tags" text[] DEFAULT '{}',
	"topic" text,
	"difficulty" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learning_id" uuid NOT NULL,
	"type" text NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"sr_interval" integer DEFAULT 1,
	"sr_ease" real DEFAULT 2.5,
	"due_date" date NOT NULL,
	"last_reviewed" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "streaks" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"current_count" integer DEFAULT 0,
	"longest" integer DEFAULT 0,
	"last_active_date" date,
	"freeze_tokens" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "teach_backs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learning_id" uuid NOT NULL,
	"user_explanation" text NOT NULL,
	"ai_feedback" text,
	"gap_score" real,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"goals" text[] DEFAULT '{}',
	"preferences" jsonb DEFAULT '{}'::jsonb,
	"streak_target" integer DEFAULT 1,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "daily_logs" ADD CONSTRAINT "daily_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learnings" ADD CONSTRAINT "learnings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_items" ADD CONSTRAINT "review_items_learning_id_learnings_id_fk" FOREIGN KEY ("learning_id") REFERENCES "public"."learnings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "streaks" ADD CONSTRAINT "streaks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teach_backs" ADD CONSTRAINT "teach_backs_learning_id_learnings_id_fk" FOREIGN KEY ("learning_id") REFERENCES "public"."learnings"("id") ON DELETE no action ON UPDATE no action;