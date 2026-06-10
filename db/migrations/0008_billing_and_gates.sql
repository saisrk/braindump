ALTER TABLE "user_profiles"
  ADD COLUMN IF NOT EXISTS "express_trial_used" boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "dashboard_tour_seen_at" timestamp with time zone,
  ADD COLUMN IF NOT EXISTS "stripe_customer_id" text,
  ADD COLUMN IF NOT EXISTS "stripe_subscription_id" text;
