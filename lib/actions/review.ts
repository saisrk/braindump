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

// Multiplier applied to the SM-2 interval based on user's difficulty preference.
const DIFFICULTY_MULTIPLIER: Record<string, number> = {
  relaxed: 1.4,    // cards come back less often
  standard: 1.0,
  intensive: 0.65, // cards come back sooner
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

  const [item, profileRows] = await Promise.all([
    getOwnedReviewItem(userId, input.itemId),
    db.select({ preferences: userProfiles.preferences }).from(userProfiles).where(eq(userProfiles.userId, userId)),
  ]);

  if (!item) return { ok: false, error: 'Review item not found.' };

  const prefs = (profileRows[0]?.preferences ?? {}) as Record<string, unknown>;
  const multiplier = DIFFICULTY_MULTIPLIER[(prefs.reviewDifficulty as string) ?? 'standard'] ?? 1.0;

  const raw = schedule(
    { interval: item.srInterval ?? 1, ease: item.srEase ?? 2.5 },
    GRADE_MAP[input.grade]
  );

  // Apply difficulty multiplier to interval, then recompute due date
  const adjustedInterval = Math.max(1, Math.round(raw.interval * multiplier));
  const dueDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + adjustedInterval);
    const off = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - off).toISOString().slice(0, 10);
  })();

  const newEntry: ReviewHistoryEntry = {
    grade: input.grade,
    gradedAt: new Date().toISOString(),
    intervalBefore: item.srInterval ?? 1,
  };

  const existing = (item.reviewHistory as ReviewHistoryEntry[] | null) ?? [];

  await db
    .update(reviewItems)
    .set({
      srInterval: adjustedInterval,
      srEase: raw.ease,
      dueDate,
      lastReviewed: new Date(),
      reviewHistory: [...existing, newEntry],
    })
    .where(eq(reviewItems.id, input.itemId));

  await recordActivity(userId, 'review');

  revalidatePath('/home');
  revalidatePath('/review');

  return { ok: true, nextDue: dueDate };
}
