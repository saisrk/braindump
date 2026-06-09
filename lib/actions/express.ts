'use server';

import { db } from '@/db';
import { learnings, expressResults } from '@/db/schema';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { requireUserId } from '@/lib/session';
import {
  generateExpress,
  type ExpressFormat,
  type ExpressResult,
} from '@/lib/ai/express';

export interface RunExpressResult {
  ok: boolean;
  error?: string;
  result?: ExpressResult;
  usedCount?: number;
  savedId?: string;
}

export async function runExpress(input: {
  format: ExpressFormat;
  /** Specific learning IDs to include (mutually exclusive with topicFilters). */
  learningIds?: string[];
  /** Topic names to include (all learnings under these topics). */
  topicFilters?: string[];
  audience?: string;
  /** Human-readable scope label for history display. */
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
    } catch {
      // Table may not exist yet (pending migration) — generation still succeeds
    }

    return { ok: true, result, usedCount: rows.length, savedId };
  } catch (err) {
    console.log('[express] error:', (err as Error).message);
    return { ok: false, error: 'Generation failed. Please try again.' };
  }
}
