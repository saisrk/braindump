-- Add dashboard tour seen timestamp to user_profiles.
-- Null = tour not yet seen. Set when user completes or skips the tour.

ALTER TABLE "user_profiles"
  ADD COLUMN IF NOT EXISTS "dashboard_tour_seen_at" timestamp with time zone;
