import { pgTable, uuid, text, real, timestamp } from 'drizzle-orm/pg-core';
import { learnings } from './learnings';

export const teachBacks = pgTable('teach_backs', {
  id: uuid('id').primaryKey().defaultRandom(),
  learningId: uuid('learning_id').notNull().references(() => learnings.id),
  userExplanation: text('user_explanation').notNull(),
  aiFeedback: text('ai_feedback'),
  gapScore: real('gap_score'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
