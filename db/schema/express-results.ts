import { pgTable, uuid, text, integer, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';
import type { ExpressResult } from '@/lib/ai/express';

export const expressResults = pgTable('express_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  format: text('format').notNull(),
  audience: text('audience'),
  topicFilter: text('topic_filter'),
  sinceFilter: text('since_filter'),
  usedCount: integer('used_count').notNull().default(0),
  output: jsonb('output').notNull().$type<ExpressResult>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
