'use server';

import { db } from '@/db';
import { learnings } from '@/db/schema';
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
}

export async function runExpress(input: {
  format: ExpressFormat;
  topic?: string;
  /** ISO date lower bound, e.g. last 30 days. */
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
      learnings: rows.map((l) => ({
        title: l.title,
        summary: l.summary,
        topic: l.topic,
        tags: l.tags ?? [],
      })),
    });
    return { ok: true, result, usedCount: rows.length };
  } catch (err) {
    console.log('[v0] runExpress error:', (err as Error).message);
    return { ok: false, error: 'Generation failed. Please try again.' };
  }
}
