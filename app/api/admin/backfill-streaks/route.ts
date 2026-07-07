import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, learnings, teachBacks, quizAttempts, reviewItems, dailyLogs, streaks } from '@/db/schema';
import { and, eq, ne } from 'drizzle-orm';
import { daysBetween } from '@/lib/utils';
import type { ReviewHistoryEntry } from '@/db/schema/review-items';

export const runtime = 'nodejs';
export const maxDuration = 300;

/**
 * One-off backfill: recomputes daily_logs + streaks from a user's *actual*
 * historical activity (captures, teach-backs, quizzes, graded reviews).
 *
 * Needed because captures never called recordActivity() until the fix in
 * this same PR — every existing user's streak/heatmap was silently missing
 * every day where the only thing they did was capture. This derives the
 * true activity-date history from the source tables directly (not from the
 * already-incomplete daily_logs/streaks rows) and overwrites them.
 *
 * Idempotent — safe to run more than once; recomputes from scratch each time.
 */

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function computeStreakStats(sortedDates: string[]): {
  longest: number;
  current: number;
  lastActiveDate: string | null;
} {
  if (sortedDates.length === 0) return { longest: 0, current: 0, lastActiveDate: null };

  let longest = 1;
  let run = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const gap = daysBetween(sortedDates[i], sortedDates[i - 1]);
    run = gap === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }

  let current = 1;
  for (let i = sortedDates.length - 1; i > 0; i--) {
    const gap = daysBetween(sortedDates[i], sortedDates[i - 1]);
    if (gap === 1) current += 1;
    else break;
  }

  return { longest, current, lastActiveDate: sortedDates[sortedDates.length - 1] };
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('authorization');
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let processed = 0;
  let updated = 0;
  let failed = 0;

  try {
    const allUsers = await db.select({ id: users.id }).from(users);

    for (const user of allUsers) {
      processed++;
      try {
        const [captureRows, teachRows, quizRows, reviewRows] = await Promise.all([
          db
            .select({ createdAt: learnings.createdAt })
            .from(learnings)
            .where(and(eq(learnings.userId, user.id), ne(learnings.sourceType, 'sample'))),
          db.select({ createdAt: teachBacks.createdAt }).from(teachBacks).where(eq(teachBacks.userId, user.id)),
          db.select({ createdAt: quizAttempts.createdAt }).from(quizAttempts).where(eq(quizAttempts.userId, user.id)),
          db.select({ reviewHistory: reviewItems.reviewHistory }).from(reviewItems).where(eq(reviewItems.userId, user.id)),
        ]);

        const captureDates = new Set<string>(captureRows.map((r: { createdAt: Date }) => toDateStr(r.createdAt)));
        const reviewLikeDates = new Set<string>();
        for (const r of teachRows) reviewLikeDates.add(toDateStr(r.createdAt));
        for (const r of quizRows) reviewLikeDates.add(toDateStr(r.createdAt));
        for (const r of reviewRows) {
          const history = (r.reviewHistory ?? []) as ReviewHistoryEntry[];
          for (const entry of history) {
            if (entry.gradedAt) reviewLikeDates.add(new Date(entry.gradedAt).toISOString().slice(0, 10));
          }
        }

        const activityDates = new Set<string>([...captureDates, ...reviewLikeDates]);
        if (activityDates.size === 0) continue;

        // Backfill daily_logs — only insert rows for dates with no existing
        // row, so anything already correctly recorded post-fix is untouched.
        for (const date of activityDates) {
          await db
            .insert(dailyLogs)
            .values({
              userId: user.id,
              date,
              itemsCaptured: captureDates.has(date) ? 1 : 0,
              itemsReviewed: reviewLikeDates.has(date) ? 1 : 0,
            })
            .onConflictDoNothing({ target: [dailyLogs.userId, dailyLogs.date] });
        }

        // Recompute the streak from the complete authoritative history —
        // always a superset of whatever partial data existed before, so a
        // direct overwrite (not merge) is correct here.
        const sorted = Array.from(activityDates).sort();
        const { longest, current, lastActiveDate } = computeStreakStats(sorted);

        await db
          .insert(streaks)
          .values({ userId: user.id, currentCount: current, longest, lastActiveDate, freezeTokens: 2 })
          .onConflictDoUpdate({
            target: streaks.userId,
            set: { currentCount: current, longest, lastActiveDate },
          });

        updated++;
      } catch (err) {
        console.error('[admin/backfill-streaks] Failed for user', user.id, err);
        failed++;
      }
    }
  } catch (err) {
    console.error('[admin/backfill-streaks] Fatal error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  return NextResponse.json({ processed, updated, failed });
}
