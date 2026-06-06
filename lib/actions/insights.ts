'use server';

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

export async function getWhatsNext(): Promise<{
  ok: boolean;
  suggestions?: WhatsNextSuggestion[];
  error?: string;
}> {
  const userId = await requireUserId();
  try {
    const [topics, [profile]] = await Promise.all([
      getRecentTopics(userId),
      db.select({ goals: userProfiles.goals }).from(userProfiles).where(eq(userProfiles.userId, userId)),
    ]);
    const suggestions = await suggestWhatsNext({
      recentTopics: topics,
      goals: profile?.goals ?? [],
    });
    return { ok: true, suggestions };
  } catch (err) {
    console.log('[v0] getWhatsNext error:', (err as Error).message);
    return { ok: false, error: 'Could not load suggestions.' };
  }
}

export async function refreshDailySummary(): Promise<{
  ok: boolean;
  summary?: string;
  error?: string;
}> {
  const userId = await requireUserId();
  try {
    const [captures, log] = await Promise.all([
      getTodaysCaptures(userId),
      getTodayLog(userId),
    ]);
    const summary = await generateDailySummary({
      captured: captures,
      reviewedCount: log?.itemsReviewed ?? 0,
    });
    await saveTodaySummary(userId, summary);
    return { ok: true, summary };
  } catch (err) {
    console.log('[v0] refreshDailySummary error:', (err as Error).message);
    return { ok: false, error: 'Could not generate summary.' };
  }
}
