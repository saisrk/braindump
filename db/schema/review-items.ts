import { pgTable, uuid, text, integer, real, date, timestamp } from 'drizzle-orm/pg-core';
import { learnings } from './learnings';

export const reviewItems = pgTable('review_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  learningId: uuid('learning_id').notNull().references(() => learnings.id),
  type: text('type').notNull(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  srInterval: integer('sr_interval').default(1),
  srEase: real('sr_ease').default(2.5),
  dueDate: date('due_date').notNull(),
  lastReviewed: timestamp('last_reviewed', { withTimezone: true }),
});
