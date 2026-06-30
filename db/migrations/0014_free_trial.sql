-- Switch from a permanent free tier to a 7-day full-access free trial.
-- 1) Grant a trial to every existing non-Pro user who doesn't already have one.
-- 2) Default the column so new signups automatically start a 7-day trial
--    (every userProfiles insert omits this column, so the DB default applies).
UPDATE "user_profiles"
  SET "pro_trial_ends_at" = now() + interval '7 days', "updated_at" = now()
  WHERE ("is_pro" IS NOT TRUE) AND "pro_trial_ends_at" IS NULL;

ALTER TABLE "user_profiles"
  ALTER COLUMN "pro_trial_ends_at" SET DEFAULT now() + interval '7 days';
