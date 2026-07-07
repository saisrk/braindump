import 'server-only';
import { db } from '@/db';
import { streaks, learnings, users } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { daysBetween, todayISO } from '@/lib/utils';

export interface PublicStreak {
  displayName: string | null;
  currentCount: number;
  longest: number;
  totalLearnings: number;
  topicCount: number;
}

/**
 * Resolve a public share token to a minimal, privacy-safe streak snapshot.
 * Returns null for unknown/revoked tokens. Never exposes learning titles,
 * summaries, or any content — only aggregate counts.
 */
export async function getPublicStreak(
  token: string
): Promise<PublicStreak | null> {
  if (!token) return null;

  const [row] = await db
    .select({
      userId: streaks.userId,
      currentCount: streaks.currentCount,
      longest: streaks.longest,
      lastActiveDate: streaks.lastActiveDate,
      freezeTokens: streaks.freezeTokens,
      displayName: users.name,
    })
    .from(streaks)
    .innerJoin(users, eq(users.id, streaks.userId))
    .where(eq(streaks.shareToken, token));

  if (!row) return null;

  // Apply the same display-time decay as getStreak: a stale streak that
  // exceeds the freeze-token grace period reads as 0.
  let currentCount = row.currentCount ?? 0;
  if (row.lastActiveDate) {
    const gap = daysBetween(todayISO(), row.lastActiveDate);
    const freezes = row.freezeTokens ?? 0;
    if (gap > 1 + freezes) currentCount = 0;
  }

  const [counts] = await db
    .select({
      total: sql<number>`count(*)::int`,
      topics: sql<number>`count(distinct ${learnings.topic})::int`,
    })
    .from(learnings)
    .where(eq(learnings.userId, row.userId));

  return {
    displayName: row.displayName ?? null,
    currentCount,
    longest: row.longest ?? 0,
    totalLearnings: counts?.total ?? 0,
    topicCount: counts?.topics ?? 0,
  };
}
