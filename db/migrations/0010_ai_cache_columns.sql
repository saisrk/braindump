-- Add AI result cache columns to user_profiles.
-- All nullable — existing rows work without backfill; cache is populated on first call.

ALTER TABLE "user_profiles"
  ADD COLUMN IF NOT EXISTS "whats_next_cache" jsonb,
  ADD COLUMN IF NOT EXISTS "whats_next_cached_at" timestamp with time zone,
  ADD COLUMN IF NOT EXISTS "whats_next_input_hash" text,
  ADD COLUMN IF NOT EXISTS "daily_summary_cache" text,
  ADD COLUMN IF NOT EXISTS "daily_summary_cached_date" text,
  ADD COLUMN IF NOT EXISTS "topic_aliases" jsonb,
  ADD COLUMN IF NOT EXISTS "topic_aliases_known_topics" text[];
