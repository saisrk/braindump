'use server';

import { createHash } from 'crypto';
import { db } from '@/db';
import { userProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireUserId } from '@/lib/session';
import { getRecentTopics } from '@/lib/data/learnings';
import {
  getTodaysCaptures,
  getTodayLog,
  saveTodaySummary,
  getDashboardStats as getStats,
  getStreak,
} from '@/lib/data/activity';
import { suggestWhatsNext, type WhatsNextSuggestion } from '@/lib/ai/capture';
import { generateDailySummary } from '@/lib/ai/express';
import { listLearnings, getUserFacets } from '@/lib/data/learnings';
import { getDueReviewItems } from '@/lib/data/reviews';
import { todayISO } from '@/lib/utils';

export interface DashboardData {
  streak: number;
  todayLearnings: number;
  due: number;
  total: number;
}

export async function getDashboardStats(): Promise<DashboardData> {
  const userId = await requireUserId();
  const streak = await getStreak(userId);
  const today = await getTodaysCaptures(userId);
  const due = await getDueReviewItems(userId);
  const stats = await getStats(userId);

  return {
    streak: streak.currentCount ?? 0,
    todayLearnings: today.length,
    due: due.length,
    total: stats.totalLearnings,
  };
}

export interface LibraryOptions {
  search?: string;
  topic?: string;
  tag?: string;
  sort?: 'recent' | 'due' | 'confidence';
}

export async function getLibraryData(opts: LibraryOptions = {}) {
  const userId = await requireUserId();
  return listLearnings(userId, opts);
}

export async function getLibraryFacets() {
  const userId = await requireUserId();
  return getUserFacets(userId);
}

export async function getReviewItems() {
  const userId = await requireUserId();
  const items = await getDueReviewItems(userId);
  return items;
}

// ── Whats Next ────────────────────────────────────────────────────────────────
// Cached in user_profiles. Regenerates when topics/goals change or cache is
// older than 24 hours. Haiku is fast enough for this structured output.

function hashInput(topics: string[], goals: string[]): string {
  return createHash('sha1')
    .update([...topics].sort().join(',') + '|' + [...goals].sort().join(','))
    .digest('hex')
    .slice(0, 16);
}

export async function getWhatsNext(): Promise<{
  ok: boolean;
  suggestions?: WhatsNextSuggestion[];
  error?: string;
}> {
  const userId = await requireUserId();
  try {
    const [topics, [profile]] = await Promise.all([
      getRecentTopics(userId),
      db.select({
        goals: userProfiles.goals,
        whatsNextCache: userProfiles.whatsNextCache,
        whatsNextCachedAt: userProfiles.whatsNextCachedAt,
        whatsNextInputHash: userProfiles.whatsNextInputHash,
      }).from(userProfiles).where(eq(userProfiles.userId, userId)),
    ]);

    const goals = profile?.goals ?? [];
    const inputHash = hashInput(topics, goals);
    const cachedAt = profile?.whatsNextCachedAt;
    const ageMs = cachedAt ? Date.now() - new Date(cachedAt).getTime() : Infinity;
    const cacheValid =
      profile?.whatsNextCache &&
      profile.whatsNextInputHash === inputHash &&
      ageMs < 24 * 60 * 60 * 1000;

    if (cacheValid) {
      return { ok: true, suggestions: profile.whatsNextCache as WhatsNextSuggestion[] };
    }

    // Cache miss — call AI (now Haiku, not Sonnet)
    const suggestions = await suggestWhatsNext({ recentTopics: topics, goals });

    await db.update(userProfiles).set({
      whatsNextCache: suggestions,
      whatsNextCachedAt: new Date(),
      whatsNextInputHash: inputHash,
    }).where(eq(userProfiles.userId, userId));

    return { ok: true, suggestions };
  } catch (err) {
    console.error('[insights] getWhatsNext error:', (err as Error).message);
    return { ok: false, error: 'Could not load suggestions.' };
  }
}

// ── Daily Summary ─────────────────────────────────────────────────────────────
// Cached once per calendar day in user_profiles. Refreshable on demand.
// Downgraded to Haiku.

export async function getDailySummary(): Promise<{
  ok: boolean;
  summary?: string;
  fromCache: boolean;
}> {
  const userId = await requireUserId();
  try {
    const today = todayISO();
    const [profile] = await db.select({
      dailySummaryCache: userProfiles.dailySummaryCache,
      dailySummaryCachedDate: userProfiles.dailySummaryCachedDate,
    }).from(userProfiles).where(eq(userProfiles.userId, userId));

    if (profile?.dailySummaryCache && profile.dailySummaryCachedDate === today) {
      return { ok: true, summary: profile.dailySummaryCache, fromCache: true };
    }

    return { ok: true, summary: undefined, fromCache: false };
  } catch (err) {
    console.error('[insights] getDailySummary error:', (err as Error).message);
    return { ok: false, fromCache: false };
  }
}

export async function refreshDailySummary(): Promise<{
  ok: boolean;
  summary?: string;
  error?: string;
}> {
  const userId = await requireUserId();
  try {
    const today = todayISO();
    const [captures, log] = await Promise.all([
      getTodaysCaptures(userId),
      getTodayLog(userId),
    ]);

    // Don't burn tokens if there's nothing to summarise
    if (captures.length === 0 && (log?.itemsReviewed ?? 0) === 0) {
      return { ok: true, summary: 'No learning activity logged yet today.' };
    }

    const summary = await generateDailySummary({
      captured: captures,
      reviewedCount: log?.itemsReviewed ?? 0,
    });

    await Promise.all([
      saveTodaySummary(userId, summary),
      db.update(userProfiles).set({
        dailySummaryCache: summary,
        dailySummaryCachedDate: today,
      }).where(eq(userProfiles.userId, userId)),
    ]);

    return { ok: true, summary };
  } catch (err) {
    console.error('[insights] refreshDailySummary error:', (err as Error).message);
    return { ok: false, error: 'Could not generate summary.' };
  }
}
