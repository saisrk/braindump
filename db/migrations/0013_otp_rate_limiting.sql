-- Add attempt counter and creation timestamp to verification_tokens for OTP rate limiting.
ALTER TABLE "verification_tokens"
  ADD COLUMN IF NOT EXISTS "attempt_count" integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone NOT NULL DEFAULT now();
