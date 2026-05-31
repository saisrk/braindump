import 'server-only';
import { db } from '@/db';
import { learnings, reviewItems } from '@/db/schema';
import { and, asc, eq, lte, sql } from 'drizzle-orm';
import { todayISO } from '@/lib/utils';

export type ReviewItem = typeof reviewItems.$inferSelect;

export interface DueReviewItem extends ReviewItem {
  learningTitle: string;
  learningId: string;
}

/** Items whose due date is today or earlier, scoped to the user. */
export async function getDueReviewItems(
  userId: string,
  limit = 50
): Promise<DueReviewItem[]> {
  const today = todayISO();
  const rows = await db
    .select({
      item: reviewItems,
      learningTitle: learnings.title,
    })
    .from(reviewItems)
    .innerJoin(learnings, eq(reviewItems.learningId, learnings.id))
    .where(and(eq(learnings.userId, userId), lte(reviewItems.dueDate, today)))
    .orderBy(asc(reviewItems.dueDate))
    .limit(limit);

  return rows.map((r: any) => ({
    ...r.item,
    learningTitle: r.learningTitle,
    learningId: r.item.learningId,
  }));
}

export async function getDueCount(userId: string): Promise<number> {
  const today = todayISO();
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(reviewItems)
    .innerJoin(learnings, eq(reviewItems.learningId, learnings.id))
    .where(and(eq(learnings.userId, userId), lte(reviewItems.dueDate, today)));
  return row?.count ?? 0;
}

/** Verify an item belongs to the user before mutating it. */
export async function getOwnedReviewItem(userId: string, itemId: string) {
  const [row] = await db
    .select({ item: reviewItems })
    .from(reviewItems)
    .innerJoin(learnings, eq(reviewItems.learningId, learnings.id))
    .where(and(eq(reviewItems.id, itemId), eq(learnings.userId, userId)));
  return row?.item ?? null;
}
