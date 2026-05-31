'use server';

import { db } from '@/db';
import { reviewItems } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireUserId } from '@/lib/session';
import { getOwnedReviewItem } from '@/lib/data/reviews';
import { recordActivity } from '@/lib/data/activity';
import { GRADE_MAP, schedule, type GradeLabel } from '@/lib/sr';
import { revalidatePath } from 'next/cache';

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

  const item = await getOwnedReviewItem(userId, input.itemId);
  if (!item) return { ok: false, error: 'Review item not found.' };

  const result = schedule(
    { interval: item.srInterval ?? 1, ease: item.srEase ?? 2.5 },
    GRADE_MAP[input.grade]
  );

  await db
    .update(reviewItems)
    .set({
      srInterval: result.interval,
      srEase: result.ease,
      dueDate: result.dueDate,
      lastReviewed: new Date(),
    })
    .where(eq(reviewItems.id, input.itemId));

  await recordActivity(userId, 'review');

  revalidatePath('/home');
  revalidatePath('/review');

  return { ok: true, nextDue: result.dueDate };
}
