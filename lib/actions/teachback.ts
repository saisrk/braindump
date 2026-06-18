'use server';

import { db } from '@/db';
import { learnings, teachBacks, userProfiles } from '@/db/schema';
import { and, eq, gte, count } from 'drizzle-orm';
import { requireUserId } from '@/lib/session';
import { gradeTeachBack, type TeachBackFeedback } from '@/lib/ai/teachback';
import { revalidatePath } from 'next/cache';

const FREE_WEEKLY_TEACHBACK = 3;

export interface TeachBackResult {
  ok: boolean;
  error?: string;
  errorCode?: 'pro_required';
  feedback?: TeachBackFeedback;
}

export async function submitTeachBack(input: {
  learningId: string;
  explanation: string;
}): Promise<TeachBackResult> {
  const userId = await requireUserId();

  if (!input.explanation?.trim() || input.explanation.trim().length < 15) {
    return { ok: false, error: 'Write a little more so we can grade it fairly.' };
  }

  // Weekly quota check for free users
  const [profile] = await db
    .select({ isPro: userProfiles.isPro })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId));

  if (!profile?.isPro) {
    // ISO week: Monday 00:00 UTC
    const now = new Date();
    const dayOfWeek = now.getUTCDay(); // 0=Sun, 1=Mon ... 6=Sat
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysFromMonday));

    const [{ weekCount }] = await db
      .select({ weekCount: count() })
      .from(teachBacks)
      .where(and(eq(teachBacks.userId, userId), gte(teachBacks.createdAt, weekStart)));

    if (weekCount >= FREE_WEEKLY_TEACHBACK) {
      return {
        ok: false,
        errorCode: 'pro_required',
        error: `You've used all ${FREE_WEEKLY_TEACHBACK} free teach-backs this week. Upgrade to Pro for unlimited grading.`,
      };
    }
  }

  const [learning] = await db
    .select()
    .from(learnings)
    .where(
      and(eq(learnings.id, input.learningId), eq(learnings.userId, userId))
    );

  if (!learning) return { ok: false, error: 'Learning not found.' };

  try {
    const feedback = await gradeTeachBack({
      title: learning.title,
      summary: learning.summary ?? '',
      explanation: input.explanation.trim(),
    });

    await db.insert(teachBacks).values({
      learningId: learning.id,
      userId,
      userExplanation: input.explanation.trim(),
      aiFeedback: JSON.stringify(feedback),
      gapScore: feedback.gapScore,
      verdict: feedback.verdict,
      nailedPoints: feedback.nailed,
      gapAreas: feedback.gaps,
      followUpQuestions: feedback.followUpQuestions,
      encouragement: feedback.encouragement,
    });

    revalidatePath(`/library/${learning.id}`);
    revalidatePath('/home');

    return { ok: true, feedback };
  } catch (err) {
    console.log('[v0] submitTeachBack error:', (err as Error).message);
    return { ok: false, error: 'Grading failed. Please try again.' };
  }
}
