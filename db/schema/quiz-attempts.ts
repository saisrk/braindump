import { pgTable, uuid, text, integer, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { learnings } from './learnings';
import { users } from './users';

export interface QuizQuestion {
  id: string;
  type: 'mcq' | 'oneliner';
  question: string;
  options?: string[]; // MCQ only
  correctAnswer: string;
}

export interface QuizAnswer {
  questionId: string;
  userAnswer: string;
  correct: boolean;
}

export const quizAttempts = pgTable('quiz_attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  learningId: uuid('learning_id').notNull().references(() => learnings.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  questions: jsonb('questions').notNull().$type<QuizQuestion[]>(),
  answers: jsonb('answers').notNull().$type<QuizAnswer[]>(),
  score: integer('score').notNull(), // 0-100
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
