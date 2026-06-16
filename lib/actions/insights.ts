'use server';

import { createHash } from 'crypto';
import { db } from '@/db';
import { userProfiles, users, reviewItems, learnings as learningsTable, teachBacks, quizAttempts } from '@/db/schema';
import { and, eq, gte, lte, sql, desc } from 'drizzle-orm';
import { requireUserId } from '@/lib/session';
import { auth } from '@/lib/auth';
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
import { topicGradient } from '@/lib/book-colors';
import { todayISO } from '@/lib/utils';

export interface VolumeStatus {
  id: string;
  title: string;
  topic: string;
  dueCount: number;
  totalCards: number;
  confidence: number; // 0-100
  daysUntilNextReview: number | null; // null = has due items
  hasSummary: boolean;
}

export interface DashboardData {
  streak: number;
  todayLearnings: number;
  due: number;
  dueThisWeek: number;
  total: number;
  topicCount: number;
  masteredCount: number;
  userName: string | null;
  topTopics: { topic: string; color: string }[];
  recentVolumes: VolumeStatus[];
  tourSeen: boolean;
}

export async function getDashboardStats(): Promise<DashboardData> {
  const userId = await requireUserId();
  const session = await auth();
  const userName = session?.user?.name ?? null;

  const today = todayISO();
  const weekFromNow = new Date();
  weekFromNow.setDate(weekFromNow.getDate() + 7);
  const weekISO = weekFromNow.toISOString().slice(0, 10);

  const [streak, todayCaptures, dueItems, stats, profileRows, allLearnings] = await Promise.all([
    getStreak(userId),
    getTodaysCaptures(userId),
    getDueReviewItems(userId),
    getStats(userId),
    db.select({ dashboardTourSeenAt: userProfiles.dashboardTourSeenAt })
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId)),
    listLearnings(userId, { sort: 'recent' }),
  ]);

  // Due this week (today + 7 days)
  const [weekRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(reviewItems)
    .where(and(
      eq(reviewItems.userId, userId),
      gte(reviewItems.dueDate, today),
      lte(reviewItems.dueDate, weekISO),
    ));
  const dueThisWeek = weekRow?.count ?? 0;

  // Mastered = has a teach-back with gap_score >= 80 OR confidence >= 80 from SR
  const masteredFromSr = new Set(allLearnings.filter(l => l.confidence >= 80).map(l => l.id));

  // Fetch best teach-back score per learning
  const teachBackRows = allLearnings.length > 0
    ? await db
        .select({ learningId: teachBacks.learningId, gapScore: teachBacks.gapScore })
        .from(teachBacks)
        .where(eq(teachBacks.userId, userId))
    : [];
  const bestTeachScore = new Map<string, number>();
  for (const r of teachBackRows) {
    const prev = bestTeachScore.get(r.learningId) ?? 0;
    if ((r.gapScore ?? 0) > prev) bestTeachScore.set(r.learningId, r.gapScore ?? 0);
  }
  const masteredIds = new Set([
    ...masteredFromSr,
    ...Array.from(bestTeachScore.entries()).filter(([, s]) => s >= 80).map(([id]) => id),
  ]);
  const masteredCount = masteredIds.size;

  // Topic count + top topics for colour bars
  const topicMap = new Map<string, number>();
  for (const l of allLearnings) {
    const t = l.topic ?? 'Uncategorised';
    topicMap.set(t, (topicMap.get(t) ?? 0) + 1);
  }
  const sortedTopics = Array.from(topicMap.entries()).sort((a, b) => b[1] - a[1]);
  const topTopics = sortedTopics.slice(0, 4).map(([topic]) => ({
    topic,
    color: topicGradient(topic),
  }));

  // Recent 3 volumes with status
  const recentLearnings = allLearnings.slice(0, 6);
  const recentIds = recentLearnings.map(l => l.id);

  // Teach-back scores to determine mastered status
  const teachRows = recentIds.length > 0
    ? await db
        .select({ learningId: teachBacks.learningId, gapScore: teachBacks.gapScore })
        .from(teachBacks)
        .where(and(
          eq(teachBacks.userId, userId),
          sql`${teachBacks.learningId} = ANY(ARRAY[${sql.join(recentIds.map(id => sql`${id}::uuid`), sql`, `)}])`
        ))
        .orderBy(desc(teachBacks.createdAt))
    : [];

  // Next review date per learning (earliest upcoming due date)
  const nextReviewRows = recentIds.length > 0
    ? await db
        .select({ learningId: reviewItems.learningId, dueDate: reviewItems.dueDate })
        .from(reviewItems)
        .where(and(
          eq(reviewItems.userId, userId),
          gte(reviewItems.dueDate, today),
          sql`${reviewItems.learningId} = ANY(ARRAY[${sql.join(recentIds.map(id => sql`${id}::uuid`), sql`, `)}])`
        ))
    : [];

  const nextReviewByLearning = new Map<string, string>();
  for (const r of nextReviewRows) {
    const existing = nextReviewByLearning.get(r.learningId);
    if (!existing || r.dueDate < existing) nextReviewByLearning.set(r.learningId, r.dueDate);
  }

  const latestTeach = new Map<string, number | null>();
  for (const r of teachRows) {
    if (!latestTeach.has(r.learningId)) latestTeach.set(r.learningId, r.gapScore);
  }

  const recentVolumes: VolumeStatus[] = recentLearnings.slice(0, 3).map(l => {
    const nextReview = nextReviewByLearning.get(l.id) ?? null;
    const daysUntil = nextReview
      ? Math.max(0, Math.round((new Date(nextReview).getTime() - Date.now()) / 86400000))
      : null;
    return {
      id: l.id,
      title: l.title,
      topic: l.topic ?? 'Uncategorised',
      dueCount: l.dueCount,
      totalCards: l.reviewCount,
      confidence: l.confidence,
      daysUntilNextReview: l.dueCount > 0 ? null : daysUntil,
      hasSummary: !!l.summary,
    };
  });

  return {
    streak: streak.currentCount ?? 0,
    todayLearnings: todayCaptures.length,
    due: dueItems.length,
    dueThisWeek,
    total: stats.totalLearnings,
    topicCount: topicMap.size,
    masteredCount,
    userName,
    topTopics,
    recentVolumes,
    tourSeen: !!profileRows[0]?.dashboardTourSeenAt,
  };
}

export async function markTourSeen(): Promise<void> {
  const userId = await requireUserId();
  await db
    .update(userProfiles)
    .set({ dashboardTourSeenAt: new Date() })
    .where(eq(userProfiles.userId, userId));
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
