'use server';

import { db } from '@/db';
import { reviewItems, userProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireUserId } from '@/lib/session';
import { getOwnedReviewItem } from '@/lib/data/reviews';
import { recordActivity } from '@/lib/data/activity';
import { GRADE_MAP, schedule, type GradeLabel } from '@/lib/sr';
import { revalidatePath } from 'next/cache';
import type { ReviewHistoryEntry } from '@/db/schema/review-items';

const DIFFICULTY_MULTIPLIER: Record<string, number> = {
  relaxed: 1.4,
  standard: 1.0,
  intensive: 0.65,
};

export interface GradeReviewResult {
  ok: boolean;
  error?: string;
  nextDue?: string;
}

export async function gradeReviewItem(input: {
  itemId: string;
  grade: GradeLabel;
}): Promise<GradeReviewResult> {
  const userId = await requireUserId();

  const [item, profile] = await Promise.all([
    getOwnedReviewItem(userId, input.itemId),
    db.select({ preferences: userProfiles.preferences }).from(userProfiles).where(eq(userProfiles.userId, userId)).then((rows: { preferences: unknown }[]) => rows[0]),
  ]);
  if (!item) return { ok: false, error: 'Review item not found.' };

  const prefs = (profile?.preferences ?? {}) as Record<string, unknown>;
  const multiplier = DIFFICULTY_MULTIPLIER[(prefs.reviewDifficulty as string) ?? 'standard'] ?? 1.0;

  const raw = schedule(
    { interval: item.srInterval ?? 1, ease: item.srEase ?? 2.5 },
    GRADE_MAP[input.grade]
  );

  const addDaysISO = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const off = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - off).toISOString().slice(0, 10);
  };

  const adjustedInterval = Math.max(1, Math.round(raw.interval * multiplier));
  const result = { ...raw, interval: adjustedInterval, dueDate: addDaysISO(adjustedInterval) };

  const newEntry: ReviewHistoryEntry = {
    grade: input.grade,
    gradedAt: new Date().toISOString(),
    intervalBefore: item.srInterval ?? 1,
  };

  const existing = (item.reviewHistory as ReviewHistoryEntry[] | null) ?? [];

  await db
    .update(reviewItems)
    .set({
      srInterval: result.interval,
      srEase: result.ease,
      dueDate: result.dueDate,
      lastReviewed: new Date(),
      reviewHistory: [...existing, newEntry],
    })
    .where(eq(reviewItems.id, input.itemId));

  await recordActivity(userId, 'review');

  revalidatePath('/home');
  revalidatePath('/review');

  return { ok: true, nextDue: result.dueDate };
}
