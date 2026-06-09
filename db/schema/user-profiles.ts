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
  // AI result caches — avoids re-calling LLMs on every page load
  whatsNextCache: jsonb('whats_next_cache').$type<{ topic: string; reason: string }[]>(),
  whatsNextCachedAt: timestamp('whats_next_cached_at', { withTimezone: true }),
  whatsNextInputHash: text('whats_next_input_hash'),
  dailySummaryCache: text('daily_summary_cache'),
  dailySummaryCachedDate: text('daily_summary_cached_date'), // ISO date e.g. "2026-06-09"
  topicAliases: jsonb('topic_aliases').$type<Record<string, string>>(),
  topicAliasesKnownTopics: text('topic_aliases_known_topics').array(),
  expressTrialUsed: boolean('express_trial_used').default(false).notNull(),
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
