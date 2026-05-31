import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

export const learnings = pgTable('learnings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  sourceType: text('source_type').notNull(),
  sourceRef: text('source_ref'),
  summary: text('summary'),
  tags: text('tags').array().default([]),
  topic: text('topic'),
  difficulty: integer('difficulty'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
