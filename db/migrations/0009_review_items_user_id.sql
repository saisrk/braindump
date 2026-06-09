-- Add user_id to review_items as a denormalized column for direct ownership checks.
-- Step 1: add nullable column
ALTER TABLE "review_items" ADD COLUMN "user_id" uuid;

-- Step 2: backfill from learnings join
UPDATE "review_items" ri
SET "user_id" = l."user_id"
FROM "learnings" l
WHERE ri."learning_id" = l."id";

-- Step 3: make NOT NULL and add FK
ALTER TABLE "review_items" ALTER COLUMN "user_id" SET NOT NULL;
ALTER TABLE "review_items" ADD CONSTRAINT "review_items_user_id_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

-- Step 4: index for fast per-user queries
CREATE INDEX "review_items_user_id_idx" ON "review_items" ("user_id");
