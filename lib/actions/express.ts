'use server';

import { db } from '@/db';
import { learnings, expressResults } from '@/db/schema';
import { and, desc, eq, gte, inArray } from 'drizzle-orm';
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
  topic?: string;
  since?: string;
  learningIds?: string[];
  audience?: string;
}): Promise<RunExpressResult> {
  const userId = await requireUserId();

  const conditions = [eq(learnings.userId, userId)];
  if (input.topic) conditions.push(eq(learnings.topic, input.topic));
  if (input.since) conditions.push(gte(learnings.createdAt, new Date(input.since)));
  if (input.learningIds?.length)
    conditions.push(inArray(learnings.id, input.learningIds));

  const rows = await db
    .select()
    .from(learnings)
    .where(and(...conditions))
    .orderBy(desc(learnings.createdAt))
    .limit(40);

  if (rows.length === 0) {
    return {
      ok: false,
      error: 'No matching learnings to express. Capture or adjust filters first.',
    };
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

    const [saved] = await db
      .insert(expressResults)
      .values({
        userId,
        format: input.format,
        audience: input.audience ?? null,
        topicFilter: input.topic ?? null,
        sinceFilter: input.since ?? null,
        usedCount: rows.length,
        output: result,
      })
      .returning({ id: expressResults.id });

    return { ok: true, result, usedCount: rows.length, savedId: saved?.id };
  } catch (err) {
    console.log('[express] runExpress error:', (err as Error).message);
    return { ok: false, error: 'Generation failed. Please try again.' };
  }
}
