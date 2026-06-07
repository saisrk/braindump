import 'server-only';
import { db } from '@/db';
import { quizAttempts, learnings } from '@/db/schema';
import { and, desc, eq } from 'drizzle-orm';

export type QuizAttempt = typeof quizAttempts.$inferSelect;

/** Most recent quiz attempt for a learning, scoped to user. */
export async function getLatestQuizAttempt(
  userId: string,
  learningId: string
): Promise<QuizAttempt | null> {
  const [row] = await db
    .select({ attempt: quizAttempts })
    .from(quizAttempts)
    .innerJoin(learnings, eq(quizAttempts.learningId, learnings.id))
    .where(and(eq(quizAttempts.learningId, learningId), eq(quizAttempts.userId, userId)))
    .orderBy(desc(quizAttempts.createdAt))
    .limit(1);
  return row?.attempt ?? null;
}

/** All quiz attempts for a learning, newest first. */
export async function getQuizHistory(
  userId: string,
  learningId: string
): Promise<QuizAttempt[]> {
  const rows = await db
    .select({ attempt: quizAttempts })
    .from(quizAttempts)
    .innerJoin(learnings, eq(quizAttempts.learningId, learnings.id))
    .where(and(eq(quizAttempts.learningId, learningId), eq(quizAttempts.userId, userId)))
    .orderBy(desc(quizAttempts.createdAt));
  return rows.map((r: { attempt: QuizAttempt }) => r.attempt);
}

/** Hours remaining until next attempt is allowed (0 = can take now). */
export function cooldownHoursRemaining(lastAttempt: QuizAttempt | null): number {
  if (!lastAttempt) return 0;
  const hoursSince = (Date.now() - new Date(lastAttempt.createdAt).getTime()) / 36e5;
  return Math.max(0, Math.ceil(24 - hoursSince));
}
