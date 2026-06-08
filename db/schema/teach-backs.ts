import { pgTable, uuid, text, real, timestamp } from 'drizzle-orm/pg-core';
import { learnings } from './learnings';
import { users } from './users';

export const teachBacks = pgTable('teach_backs', {
  id: uuid('id').primaryKey().defaultRandom(),
  learningId: uuid('learning_id').notNull().references(() => learnings.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  userExplanation: text('user_explanation').notNull(),
  aiFeedback: text('ai_feedback'),
  gapScore: real('gap_score'),
  verdict: text('verdict'), // 'strong' | 'partial' | 'shaky'
  nailedPoints: text('nailed_points').array().default([]),
  gapAreas: text('gap_areas').array().default([]),
  followUpQuestions: text('follow_up_questions').array().default([]),
  encouragement: text('encouragement'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
