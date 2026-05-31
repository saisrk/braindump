import { pgTable, uuid, integer, date } from 'drizzle-orm/pg-core';
import { users } from './users';

export const streaks = pgTable('streaks', {
  userId: uuid('user_id').primaryKey().references(() => users.id),
  currentCount: integer('current_count').default(0),
  longest: integer('longest').default(0),
  lastActiveDate: date('last_active_date'),
  freezeTokens: integer('freeze_tokens').default(0),
});
