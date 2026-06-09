'use server';

import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { learnings, expressResults } from '@/db/schema';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { requireUserId } from '@/lib/session';
import {
  generateExpress,
  type ExpressFormat,
  type ExpressResult,
} from '@/lib/ai/express';
import type { ExpressHistoryItem } from '@/lib/data/express';

/**
 * Ensures express_results table exists and has all expected columns.
 * Handles the case where the table was created by an older version of this
 * code with fewer columns (scope_label / learning_ids / topic_filters added later).
 */
async function ensureExpressResultsTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "express_results" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "user_id" uuid NOT NULL REFERENCES "users"("id"),
      "format" text NOT NULL,
      "audience" text,
      "scope_label" text,
      "learning_ids" uuid[],
      "topic_filters" text[],
      "used_count" integer DEFAULT 0 NOT NULL,
      "output" jsonb NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    )
  `);
  // Backfill columns that may be missing if the table was created by older code
  await db.execute(sql`ALTER TABLE "express_results" ADD COLUMN IF NOT EXISTS "scope_label" text`);
  await db.execute(sql`ALTER TABLE "express_results" ADD COLUMN IF NOT EXISTS "learning_ids" uuid[]`);
  await db.execute(sql`ALTER TABLE "express_results" ADD COLUMN IF NOT EXISTS "topic_filters" text[]`);
}

export async function getExpressHistoryAction(): Promise<ExpressHistoryItem[]> {
  const userId = await requireUserId();
  try {
    await ensureExpressResultsTable();

    const rows = await db
      .select()
      .from(expressResults)
      .where(eq(expressResults.userId, userId))
      .orderBy(desc(expressResults.createdAt))
      .limit(20);

    return rows.map((r: typeof expressResults.$inferSelect) => ({
      id: r.id,
      format: r.format,
      audience: r.audience,
      scopeLabel: r.scopeLabel,
      usedCount: r.usedCount,
      output: r.output as Record<string, unknown>,
      createdAt: r.createdAt,
    }));
  } catch (err) {
    console.error('[express] failed to fetch history:', (err as Error).message);
    return [];
  }
}

export interface RunExpressResult {
  ok: boolean;
  error?: string;
  result?: ExpressResult;
  usedCount?: number;
  savedId?: string;
}

export async function runExpress(input: {
  format: ExpressFormat;
  learningIds?: string[];
  topicFilters?: string[];
  audience?: string;
  scopeLabel?: string;
}): Promise<RunExpressResult> {
  const userId = await requireUserId();

  const conditions = [eq(learnings.userId, userId)];

  if (input.learningIds?.length) {
    conditions.push(inArray(learnings.id, input.learningIds));
  } else if (input.topicFilters?.length) {
    conditions.push(inArray(learnings.topic, input.topicFilters));
  }

  const rows = await db
    .select()
    .from(learnings)
    .where(and(...conditions))
    .orderBy(desc(learnings.createdAt))
    .limit(40);

  if (rows.length === 0) {
    return { ok: false, error: 'No learnings found for the selected scope. Try a different selection.' };
  }

  try {
    const result = await generateExpress({
      format: input.format,
      audience: input.audience,
      learnings: rows.map((l: typeof learnings.$inferSelect) => ({
        title: l.title,
        summary: l.summary,
        topic: l.topic,
        tags: l.tags ?? [],
      })),
    });

    let savedId: string | undefined;
    try {
      await ensureExpressResultsTable();

      const [saved] = await db
        .insert(expressResults)
        .values({
          userId,
          format: input.format,
          audience: input.audience ?? null,
          scopeLabel: input.scopeLabel ?? 'Entire library',
          learningIds: input.learningIds ?? null,
          topicFilters: input.topicFilters ?? null,
          usedCount: rows.length,
          output: result,
        })
        .returning({ id: expressResults.id });
      savedId = saved?.id;
    } catch (err) {
      console.error('[express] failed to save result:', (err as Error).message);
    }

    return { ok: true, result, usedCount: rows.length, savedId };
  } catch (err) {
    console.error('[express] generation error:', (err as Error).message);
    return { ok: false, error: 'Generation failed. Please try again.' };
  }
}
