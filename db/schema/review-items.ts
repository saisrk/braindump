import { pgTable, uuid, text, integer, real, date, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { learnings } from './learnings';
import { users } from './users';

export interface ReviewHistoryEntry {
  grade: 'again' | 'hard' | 'good' | 'easy';
  gradedAt: string; // ISO timestamp
  intervalBefore: number;
}

export const reviewItems = pgTable('review_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  learningId: uuid('learning_id').notNull().references(() => learnings.id),
  type: text('type').notNull(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  srInterval: integer('sr_interval').default(1),
  srEase: real('sr_ease').default(2.5),
  dueDate: date('due_date').notNull(),
  lastReviewed: timestamp('last_reviewed', { withTimezone: true }),
  reviewHistory: jsonb('review_history').$type<ReviewHistoryEntry[]>().default([]),
});
