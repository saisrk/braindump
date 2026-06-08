import 'server-only';
import { db } from '@/db';
import { learnings, reviewItems, teachBacks, quizAttempts } from '@/db/schema';
import { and, eq, desc } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';
import type { ReviewHistoryEntry } from '@/db/schema/review-items';
import type { QuizQuestion, QuizAnswer } from '@/db/schema/quiz-attempts';

type TeachBackRow = InferSelectModel<typeof teachBacks>;
type QuizRow = InferSelectModel<typeof quizAttempts>;

// ── Types ────────────────────────────────────────────────────────────────────

export interface TeachBackRecord {
  id: string;
  createdAt: Date;
  gapScore: number | null;
  verdict: string | null;
  nailedPoints: string[];
  gapAreas: string[];
  followUpQuestions: string[];
  encouragement: string | null;
  userExplanation: string;
}

export interface QuizRecord {
  id: string;
  createdAt: Date;
  score: number;
  questions: QuizQuestion[];
  answers: QuizAnswer[];
}

export interface ReviewCardHistory {
  id: string;
  question: string;
  answer: string;
  srInterval: number;
  lastReviewed: Date | null;
  reviewHistory: ReviewHistoryEntry[];
}

// ── Queries ──────────────────────────────────────────────────────────────────

export async function getTeachBackHistory(
  userId: string,
  learningId: string
): Promise<TeachBackRecord[]> {
  const rows = await db
    .select()
    .from(teachBacks)
    .where(and(eq(teachBacks.learningId, learningId), eq(teachBacks.userId, userId)))
    .orderBy(desc(teachBacks.createdAt));

  return rows.map((r: TeachBackRow) => ({
    id: r.id,
    createdAt: r.createdAt,
    gapScore: r.gapScore ?? null,
    verdict: r.verdict ?? null,
    nailedPoints: (r.nailedPoints as string[]) ?? [],
    gapAreas: (r.gapAreas as string[]) ?? [],
    followUpQuestions: (r.followUpQuestions as string[]) ?? [],
    encouragement: r.encouragement ?? null,
    userExplanation: r.userExplanation,
  }));
}

export async function getQuizHistory(
  userId: string,
  learningId: string
): Promise<QuizRecord[]> {
  const rows = await db
    .select()
    .from(quizAttempts)
    .where(and(eq(quizAttempts.learningId, learningId), eq(quizAttempts.userId, userId)))
    .orderBy(desc(quizAttempts.createdAt));

  return rows.map((r: QuizRow) => ({
    id: r.id,
    createdAt: r.createdAt,
    score: r.score,
    questions: r.questions as QuizQuestion[],
    answers: r.answers as QuizAnswer[],
  }));
}

export async function getReviewCardHistory(
  userId: string,
  learningId: string
): Promise<ReviewCardHistory[]> {
  const rows = await db
    .select({ item: reviewItems })
    .from(reviewItems)
    .innerJoin(learnings, eq(reviewItems.learningId, learnings.id))
    .where(and(eq(reviewItems.learningId, learningId), eq(learnings.userId, userId)))
    .orderBy(desc(reviewItems.lastReviewed));

  return rows.map((r: { item: InferSelectModel<typeof reviewItems> }) => ({
    id: r.item.id,
    question: r.item.question,
    answer: r.item.answer,
    srInterval: r.item.srInterval ?? 1,
    lastReviewed: r.item.lastReviewed ?? null,
    reviewHistory: (r.item.reviewHistory as ReviewHistoryEntry[]) ?? [],
  }));
}
