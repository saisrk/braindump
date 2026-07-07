'use server';

import { db } from '@/db';
import { learnings, teachBacks } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { requireUserId } from '@/lib/session';
import { getEntitlement } from '@/lib/entitlements';
import { gradeTeachBack, type TeachBackFeedback } from '@/lib/ai/teachback';
import { recordActivity } from '@/lib/data/activity';
import { revalidatePath } from 'next/cache';

export interface TeachBackResult {
  ok: boolean;
  error?: string;
  errorCode?: 'trial_expired';
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

  // Access gate: trial or Pro get unlimited grading; expired users are paywalled.
  const { hasAccess } = await getEntitlement(userId);
  if (!hasAccess) {
    return {
      ok: false,
      errorCode: 'trial_expired',
      error: 'Your free trial has ended. Subscribe to Pro for unlimited teach-back grading.',
    };
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
      keyPoints: learning.keyPoints ?? [],
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

    // Completing a teach-back is genuine learning activity — count it toward
    // the daily streak just like capture and review.
    await recordActivity(userId, 'review');

    revalidatePath(`/library/${learning.id}`);
    revalidatePath('/home');

    return { ok: true, feedback };
  } catch (err) {
    console.log('[v0] submitTeachBack error:', (err as Error).message);
    return { ok: false, error: 'Grading failed. Please try again.' };
  }
}
