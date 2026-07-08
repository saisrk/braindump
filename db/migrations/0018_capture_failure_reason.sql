-- Records why a capture failed to enrich ('thin_content' | 'ai_failed') so the
-- library's "tap to retry" card can show the actual reason instead of a
-- generic message.

ALTER TABLE "learnings"
  ADD COLUMN IF NOT EXISTS "failure_reason" text;
