'use server';

import { db } from '@/db';
import { learnings, teachBacks } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { requireUserId } from '@/lib/session';
import { gradeTeachBack, type TeachBackFeedback } from '@/lib/ai/teachback';
import { revalidatePath } from 'next/cache';

export interface TeachBackResult {
  ok: boolean;
  error?: string;
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
      userExplanation: input.explanation.trim(),
      aiFeedback: JSON.stringify(feedback),
      gapScore: feedback.gapScore,
    });

    revalidatePath(`/library/${learning.id}`);
    revalidatePath('/home');

    return { ok: true, feedback };
  } catch (err) {
    console.log('[v0] submitTeachBack error:', (err as Error).message);
    return { ok: false, error: 'Grading failed. Please try again.' };
  }
}
