import { pgTable, uuid, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core';
import { users } from './users';

export const learnings = pgTable('learnings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  sourceType: text('source_type').notNull(), // 'url', 'video', 'note'
  sourceRef: text('source_ref'), // URL or video URL
  summary: text('summary'),
  tags: text('tags').array().default([]),
  topic: text('topic'),
  difficulty: integer('difficulty'),
  // Content metadata
  author: text('author'),
  publishDate: timestamp('publish_date', { withTimezone: true }),
  domain: text('domain'), // extracted from URL for organization
  keyPoints: text('key_points').array().default([]), // LLM-generated key points
  contentType: text('content_type'), // 'blog', 'video', 'article', etc.
  videoUrl: text('video_url'), // for video sources
  videoTitle: text('video_title'),
  videoChannel: text('video_channel'),
  videoDuration: integer('video_duration'), // in seconds
  isAiGenerated: boolean('is_ai_generated').default(true), // whether metadata came from LLM analysis
  status: text('status').default('ready').notNull(), // 'processing' | 'ready' | 'failed'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
