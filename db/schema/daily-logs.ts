import { pgTable, uuid, text, integer, date, unique } from 'drizzle-orm/pg-core';
import { users } from './users';

export const dailyLogs = pgTable('daily_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  date: date('date').notNull(),
  itemsCaptured: integer('items_captured').default(0),
  itemsReviewed: integer('items_reviewed').default(0),
  summary: text('summary'),
}, (table) => ({
  userDateUnique: unique().on(table.userId, table.date),
}));
