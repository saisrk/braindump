import {
  pgTable,
  uuid,
  text,
  integer,
  jsonb,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const userProfiles = pgTable('user_profiles', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  goals: text('goals').array().default([]),
  preferences: jsonb('preferences').default({}),
  streakTarget: integer('streak_target').default(1),
  onboardedAt: timestamp('onboarded_at', { withTimezone: true }),
  isPro: boolean('is_pro').default(false),
  proTrialEndsAt: timestamp('pro_trial_ends_at', { withTimezone: true }),
  proSubscriptionEndsAt: timestamp('pro_subscription_ends_at', {
    withTimezone: true,
  }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});
