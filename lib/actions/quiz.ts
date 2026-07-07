'use server';

import { db } from '@/db';
import { quizAttempts, reviewItems, learnings } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { requireUserId } from '@/lib/session';
import { getEntitlement } from '@/lib/entitlements';
import { generateQuiz, gradeOneliner } from '@/lib/ai/quiz';
import { recordActivity } from '@/lib/data/activity';
import { getLatestQuizAttempt, cooldownHoursRemaining } from '@/lib/data/quiz';
import { todayISO } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import type { QuizQuestion, QuizAnswer } from '@/db/schema';

export interface GenerateQuizResult {
  ok: boolean;
  error?: string;
  errorCode?: 'trial_expired';
  questions?: QuizQuestion[];
  cooldownHours?: number;
}

export interface SubmitQuizResult {
  ok: boolean;
  error?: string;
  errorCode?: 'trial_expired';
  score?: number;
  answers?: QuizAnswer[];
  reviewItemsAdded?: number;
}

/** Returns quiz questions for a learning. Respects 24h cooldown. */
export async function getQuizQuestions(learningId: string): Promise<GenerateQuizResult> {
  const userId = await requireUserId();

  // Quizzes require an active trial or subscription.
  const { hasAccess } = await getEntitlement(userId);
  if (!hasAccess) {
    return {
      ok: false,
      errorCode: 'trial_expired',
      error: 'Your free trial has ended. Subscribe to Pro to keep taking quizzes.',
    };
  }

  // Verify ownership
  const [row] = await db
    .select()
    .from(learnings)
    .where(and(eq(learnings.id, learningId), eq(learnings.userId, userId)));
  if (!row) return { ok: false, error: 'Learning not found.' };

  // Check cooldown
  const last = await getLatestQuizAttempt(userId, learningId);
  const hoursLeft = cooldownHoursRemaining(last);
  if (hoursLeft > 0) return { ok: false, cooldownHours: hoursLeft, error: `Cooldown active. Try again in ${hoursLeft}h.` };

  // Generate questions from the learning's content
  const questions = await generateQuiz({
    title: row.title,
    summary: row.summary ?? '',
    keyPoints: row.keyPoints ?? [],
  });

  return { ok: true, questions };
}

/** Scores submitted answers, saves attempt, adds failed MCQs to review queue. */
export async function submitQuizAttempt(input: {
  learningId: string;
  questions: QuizQuestion[];
  userAnswers: Record<string, string>; // questionId → userAnswer
}): Promise<SubmitQuizResult> {
  const userId = await requireUserId();

  // Quizzes require an active trial or subscription.
  const { hasAccess } = await getEntitlement(userId);
  if (!hasAccess) {
    return {
      ok: false,
      errorCode: 'trial_expired',
      error: 'Your free trial has ended. Subscribe to Pro to keep taking quizzes.',
    };
  }

  // Verify ownership.
  const [learning] = await db
    .select({ id: learnings.id })
    .from(learnings)
    .where(and(eq(learnings.id, input.learningId), eq(learnings.userId, userId)));
  if (!learning) return { ok: false, error: 'Learning not found.' };

  // Score each question
  const gradedAnswers: QuizAnswer[] = await Promise.all(
    input.questions.map(async (q) => {
      const userAnswer = input.userAnswers[q.id] ?? '';
      let correct: boolean;

      if (q.type === 'mcq') {
        correct = userAnswer.trim() === q.correctAnswer.trim();
      } else {
        // One-liner: use LLM lenient grading
        correct = await gradeOneliner({
          question: q.question,
          correctAnswer: q.correctAnswer,
          userAnswer,
        });
      }

      return { questionId: q.id, userAnswer, correct };
    })
  );

  const correctCount = gradedAnswers.filter((a) => a.correct).length;
  const score = Math.round((correctCount / input.questions.length) * 100);

  // Save attempt
  await db.insert(quizAttempts).values({
    learningId: input.learningId,
    userId,
    questions: input.questions,
    answers: gradedAnswers,
    score,
  });

  // Taking a quiz is genuine learning activity — count it toward the daily
  // streak just like capture and review.
  await recordActivity(userId, 'review');

  // Auto-add failed questions to review queue (deduplication: check existing questions)
  const failedQuestions = input.questions.filter((q) =>
    gradedAnswers.find((a) => a.questionId === q.id && !a.correct)
  );

  let reviewItemsAdded = 0;
  if (failedQuestions.length > 0) {
    const existing = await db
      .select({ question: reviewItems.question })
      .from(reviewItems)
      .where(eq(reviewItems.learningId, input.learningId));
    const existingQuestions = new Set(existing.map((r: { question: string }) => r.question));

    const toInsert = failedQuestions
      .filter((q) => !existingQuestions.has(q.question))
      .map((q) => ({
        userId,
        learningId: input.learningId,
        type: q.type === 'mcq' ? 'quiz' : 'flashcard',
        question: q.question,
        answer: q.correctAnswer,
        dueDate: todayISO(),
        srInterval: 1,
        srEase: 2.5,
      }));

    if (toInsert.length > 0) {
      await db.insert(reviewItems).values(toInsert);
      reviewItemsAdded = toInsert.length;
    }
  }

  revalidatePath(`/library/${input.learningId}`);
  revalidatePath('/library');
  revalidatePath('/review');

  return { ok: true, score, answers: gradedAnswers, reviewItemsAdded };
}
