import { pgTable, uuid, text, integer, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

export const expressResults = pgTable('express_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  format: text('format').notNull(),
  audience: text('audience'),
  scopeLabel: text('scope_label'),  // human-readable: "AI, Leadership" or "3 specific learnings"
  learningIds: uuid('learning_ids').array(),
  topicFilters: text('topic_filters').array(),
  usedCount: integer('used_count').notNull().default(0),
  output: jsonb('output').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
