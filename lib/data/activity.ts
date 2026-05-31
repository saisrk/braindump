import 'server-only';
import { db } from '@/db';
import { dailyLogs, learnings, streaks } from '@/db/schema';
import { and, desc, eq, gte, sql } from 'drizzle-orm';
import { daysBetween, todayISO } from '@/lib/utils';

export type Streak = typeof streaks.$inferSelect;
export type DailyLog = typeof dailyLogs.$inferSelect;

/** Get (and lazily create) a user's streak row. */
export async function getStreak(userId: string): Promise<Streak> {
  const [existing] = await db
    .select()
    .from(streaks)
    .where(eq(streaks.userId, userId));
  if (existing) {
    // If the last active day was more than 1 day ago (accounting for freeze
    // tokens), the displayed current count should reflect a broken streak.
    if (existing.lastActiveDate) {
      const gap = daysBetween(todayISO(), existing.lastActiveDate);
      const freezes = existing.freezeTokens ?? 0;
      if (gap > 1 + freezes) {
        return { ...existing, currentCount: 0 };
      }
    }
    return existing;
  }

  const [created] = await db
    .insert(streaks)
    .values({ userId, currentCount: 0, longest: 0, freezeTokens: 2 })
    .returning();
  return created;
}

/**
 * Record activity for today. `kind` selects which counter to bump on the
 * daily log. Updates the streak if this is the first activity today.
 */
export async function recordActivity(
  userId: string,
  kind: 'capture' | 'review'
): Promise<void> {
  const today = todayISO();

  // Upsert today's daily log and bump the relevant counter.
  await db
    .insert(dailyLogs)
    .values({
      userId,
      date: today,
      itemsCaptured: kind === 'capture' ? 1 : 0,
      itemsReviewed: kind === 'review' ? 1 : 0,
    })
    .onConflictDoUpdate({
      target: [dailyLogs.userId, dailyLogs.date],
      set:
        kind === 'capture'
          ? { itemsCaptured: sql`${dailyLogs.itemsCaptured} + 1` }
          : { itemsReviewed: sql`${dailyLogs.itemsReviewed} + 1` },
    });

  // Update streak.
  const streak = await getStreakRaw(userId);
  if (streak.lastActiveDate === today) return; // already counted today

  let current = 1;
  if (streak.lastActiveDate) {
    const gap = daysBetween(today, streak.lastActiveDate);
    const freezes = streak.freezeTokens ?? 0;
    if (gap === 1) {
      current = (streak.currentCount ?? 0) + 1;
    } else if (gap <= 1 + freezes) {
      // Used freeze token(s) to bridge the gap.
      current = (streak.currentCount ?? 0) + 1;
    } else {
      current = 1;
    }
  }

  const longest = Math.max(streak.longest ?? 0, current);
  await db
    .update(streaks)
    .set({ currentCount: current, longest, lastActiveDate: today })
    .where(eq(streaks.userId, userId));
}

async function getStreakRaw(userId: string): Promise<Streak> {
  const [existing] = await db
    .select()
    .from(streaks)
    .where(eq(streaks.userId, userId));
  if (existing) return existing;
  const [created] = await db
    .insert(streaks)
    .values({ userId, currentCount: 0, longest: 0, freezeTokens: 2 })
    .returning();
  return created;
}

export async function getTodayLog(userId: string): Promise<DailyLog | null> {
  const [log] = await db
    .select()
    .from(dailyLogs)
    .where(and(eq(dailyLogs.userId, userId), eq(dailyLogs.date, todayISO())));
  return log ?? null;
}

export async function saveTodaySummary(
  userId: string,
  summary: string
): Promise<void> {
  await db
    .insert(dailyLogs)
    .values({ userId, date: todayISO(), summary })
    .onConflictDoUpdate({
      target: [dailyLogs.userId, dailyLogs.date],
      set: { summary },
    });
}

/** Items captured today, for the daily digest. */
export async function getTodaysCaptures(userId: string) {
  const start = todayISO() + 'T00:00:00.000Z';
  return db
    .select({ title: learnings.title, summary: learnings.summary })
    .from(learnings)
    .where(
      and(
        eq(learnings.userId, userId),
        gte(learnings.createdAt, new Date(start))
      )
    );
}

export interface DashboardStats {
  totalLearnings: number;
  weekLearnings: number;
  totalReviews: number;
}

export async function getDashboardStats(
  userId: string
): Promise<DashboardStats> {
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const [row] = await db
    .select({
      total: sql<number>`count(*)::int`,
      week: sql<number>`count(*) filter (where ${learnings.createdAt} >= ${weekAgo}::timestamp)::int`,
    })
    .from(learnings)
    .where(eq(learnings.userId, userId));

  return {
    totalLearnings: row?.total ?? 0,
    weekLearnings: row?.week ?? 0,
    totalReviews: 0,
  };
}

/** Last N daily logs for an activity heatmap / history. */
export async function getRecentLogs(userId: string, days = 14) {
  return db
    .select()
    .from(dailyLogs)
    .where(eq(dailyLogs.userId, userId))
    .orderBy(desc(dailyLogs.date))
    .limit(days);
}
