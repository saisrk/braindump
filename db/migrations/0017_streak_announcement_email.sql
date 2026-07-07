-- Idempotency guard for the one-time "sharable streaks" announcement email so
-- re-running the admin broadcast never double-sends to the same user.

ALTER TABLE "user_profiles"
  ADD COLUMN IF NOT EXISTS "streak_announcement_sent_at" timestamp with time zone;
