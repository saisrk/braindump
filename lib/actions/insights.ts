'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireUserId } from '@/lib/session';
import { getRecentTopics } from '@/lib/data/learnings';
import {
  getTodaysCaptures,
  getTodayLog,
  saveTodaySummary,
  getDashboardStats as getStats,
} from '@/lib/data/activity';
import { suggestWhatsNext, type WhatsNextSuggestion } from '@/lib/ai/capture';
import { generateDailySummary } from '@/lib/ai/express';
import { listLearnings } from '@/lib/data/learnings';
import { getDueReviewItems } from '@/lib/data/reviews';

export interface DashboardData {
  streak: number;
  todayLearnings: number;
  due: number;
  total: number;
}

export async function getDashboardStats(): Promise<DashboardData> {
  await requireUserId();
  return getStats();
}

export async function getLibraryData() {
  const userId = await requireUserId();
  const learnings = await listLearnings(userId, {});
  return learnings;
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
    const [topics, [user]] = await Promise.all([
      getRecentTopics(userId),
      db.select({ goals: users.goals }).from(users).where(eq(users.id, userId)),
    ]);
    const suggestions = await suggestWhatsNext({
      recentTopics: topics,
      goals: user?.goals ?? [],
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
