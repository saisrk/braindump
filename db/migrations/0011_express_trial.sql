-- Add express_trial_used flag to user_profiles.
-- False by default — first Express run is free for every user.

ALTER TABLE "user_profiles"
  ADD COLUMN IF NOT EXISTS "express_trial_used" boolean NOT NULL DEFAULT false;
