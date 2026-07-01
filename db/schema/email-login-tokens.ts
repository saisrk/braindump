import { pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

// Single-use auto-login tokens embedded in lifecycle emails so a click signs
// the user straight in (no OTP re-entry) and lands on a specific deep link.
export const emailLoginTokens = pgTable('email_login_tokens', {
  token: text('token').primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
