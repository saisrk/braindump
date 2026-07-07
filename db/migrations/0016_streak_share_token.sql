-- Opt-in, revocable public share token for learning streaks. Null means the
-- streak is private; a non-null nanoid grants access to the public share page.

ALTER TABLE "streaks"
  ADD COLUMN IF NOT EXISTS "share_token" text;

-- Enforce uniqueness so a token resolves to exactly one user.
CREATE UNIQUE INDEX IF NOT EXISTS "streaks_share_token_unique"
  ON "streaks" ("share_token");
