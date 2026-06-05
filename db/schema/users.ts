import { pgTable, uuid, text, integer, jsonb, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  emailVerified: timestamp('email_verified', { withTimezone: true }),
  passwordHash: text('password_hash'),
  name: text('name'),
  image: text('image'),
  goals: text('goals').array().default([]),
  preferences: jsonb('preferences').default({}),
  streakTarget: integer('streak_target').default(1),
  // Pro features
  isPro: boolean('is_pro').default(false),
  proTrialEndsAt: timestamp('pro_trial_ends_at', { withTimezone: true }),
  proSubscriptionEndsAt: timestamp('pro_subscription_ends_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
