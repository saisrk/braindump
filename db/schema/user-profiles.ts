import {
  pgTable,
  uuid,
  text,
  integer,
  jsonb,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
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
  dashboardTourSeenAt: timestamp('dashboard_tour_seen_at', { withTimezone: true }),
  expressTrialUsed: boolean('express_trial_used').default(false).notNull(),
  isPro: boolean('is_pro').default(false),
  // Every new account starts a 7-day full-access free trial (see migration 0014).
  proTrialEndsAt: timestamp('pro_trial_ends_at', { withTimezone: true }).default(
    sql`now() + interval '7 days'`,
  ),
  proSubscriptionEndsAt: timestamp('pro_subscription_ends_at', { withTimezone: true }),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  // Idempotency guards for lifecycle emails — set once sent so cron re-runs never double-send.
  welcomeEmailSentAt: timestamp('welcome_email_sent_at', { withTimezone: true }),
  trialEndedEmailSentAt: timestamp('trial_ended_email_sent_at', { withTimezone: true }),
  lastReviewReminderSentAt: timestamp('last_review_reminder_sent_at', { withTimezone: true }),
  lastReengagementEmailSentAt: timestamp('last_reengagement_email_sent_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});
