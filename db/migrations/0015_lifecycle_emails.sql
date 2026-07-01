-- Lifecycle email support: single-use auto-login tokens for email links, and
-- idempotency timestamps so each cron-driven lifecycle email sends at most once.

CREATE TABLE IF NOT EXISTS "email_login_tokens" (
  "token" text PRIMARY KEY,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "expires_at" timestamp with time zone NOT NULL,
  "used_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE "user_profiles"
  ADD COLUMN IF NOT EXISTS "welcome_email_sent_at" timestamp with time zone,
  ADD COLUMN IF NOT EXISTS "trial_ended_email_sent_at" timestamp with time zone,
  ADD COLUMN IF NOT EXISTS "last_review_reminder_sent_at" timestamp with time zone,
  ADD COLUMN IF NOT EXISTS "last_reengagement_email_sent_at" timestamp with time zone;
