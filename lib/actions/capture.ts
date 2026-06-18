'use server';

import { db } from '@/db';
import { learnings, reviewItems, userProfiles } from '@/db/schema';
import { requireUserId, getOptionalUserId } from '@/lib/session';
import {
  summarizeCapture,
  generateReviewItems,
  type CaptureSummary,
} from '@/lib/ai/capture';
import { extractFromUrl, isValidUrl } from '@/lib/extract';
import { analyzeBlogContent, analyzeVideoMetadata } from '@/lib/ai/content-analysis';
import { detectVideoUrl } from '@/lib/video-detection';
import { recordActivity } from '@/lib/data/activity';
import { todayISO } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import { and, eq, gte, ne, count } from 'drizzle-orm';

const FREE_DAILY_CAPTURE_LIMIT = 1;
const PRO_DAILY_CAPTURE_LIMIT = 10;
const FREE_LIBRARY_CAP = 30;

export type SourceType = 'url' | 'text' | 'file' | 'wizard';

export interface AnalyzeResult {
  ok: boolean;
  error?: string;
  summary?: CaptureSummary;
  resolvedContent?: string;
  /** True when content was sourced via web search fallback (page was blocked). */
  fromSearch?: boolean;
}

/**
 * Step 1 of capture: analyze pasted content / URL into an editable summary.
 * Does NOT persist anything.
 */
export async function analyzeCapture(input: {
  content: string;
  sourceType: SourceType;
  sourceRef?: string;
  whyItMatters?: string;
}): Promise<AnalyzeResult> {
  // Analysis is intentionally public — no auth required to see a summary.
  // Auth is enforced at saveCapture() when we need a userId to persist.

  let content = input.content?.trim() ?? '';
  let sourceRef = input.sourceRef?.trim() || null;

  // For URL captures, fetch and clean the page text.
  if (input.sourceType === 'url') {
    const url = content || sourceRef || '';
    if (!isValidUrl(url)) {
      return { ok: false, error: 'Please enter a valid http(s) URL.' };
    }
    sourceRef = url;
    const extracted = await extractFromUrl(url);
    if (!extracted || extracted.text.length < 80) {
      return {
        ok: false,
        error: "Couldn't read that page and the web search fallback found nothing. Try pasting the text directly.",
      };
    }
    content = `${extracted.title ? `Page title: ${extracted.title}\n\n` : ''}${extracted.text}`;
    // Carry fromSearch flag through so the caller can surface it.
    if (extracted.fromSearch) {
      try {
        const summary = await summarizeCapture({ content, sourceRef, sourceType: input.sourceType });
        return { ok: true, summary, resolvedContent: content, fromSearch: true };
      } catch (err) {
        return { ok: false, error: 'AI summary failed after web search. Please try again.' };
      }
    }
  }

  if (content.length < 10) {
    return { ok: false, error: 'Add a little more detail to summarize.' };
  }

  try {
    const summary = await summarizeCapture({
      content,
      sourceRef,
      sourceType: input.sourceType,
      whyItMatters: input.whyItMatters,
    });
    return { ok: true, summary, resolvedContent: content };
  } catch (err) {
    console.log('[v0] analyzeCapture error:', (err as Error).message);
    return {
      ok: false,
      error: 'The AI summary failed. Please try again in a moment.',
    };
  }
}

export interface SaveCaptureInput {
  title: string;
  summary: string;
  topic: string;
  tags: string[];
  difficulty: number;
  sourceType: SourceType;
  sourceRef?: string | null;
  /** Cleaned source text used for review generation. */
  resolvedContent?: string;
  keyPoints?: string[];
  /** When false, skip AI review-item generation (faster save). */
  generateReviews?: boolean;
  // NEW: Content metadata from organization step
  author?: string;
  publishDate?: string;
  domain?: string;
  videoUrl?: string;
  videoTitle?: string;
  videoChannel?: string;
  videoDuration?: number;
  contentType?: string;
}

export interface SaveCaptureResult {
  ok: boolean;
  error?: string;
  /**
   * 'daily_limit' when a free user has hit their daily capture limit.
   * 'pro_daily_limit' when a Pro user has hit the 10/day capture limit.
   * 'library_full' when a free user has reached the total library cap.
   */
  errorCode?: 'daily_limit' | 'pro_daily_limit' | 'library_full';
  learningId?: string;
  reviewCount?: number;
}

/**
 * Step 2 of capture: persist the (possibly edited) learning, generate a
 * starter review set, and record streak activity.
 */
export async function saveCapture(
  input: SaveCaptureInput
): Promise<SaveCaptureResult> {
  const userId = await requireUserId();

  if (!input.title?.trim()) {
    return { ok: false, error: 'A title is required.' };
  }

  // Capture quota checks
  const [profile] = await db
    .select({ isPro: userProfiles.isPro })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId));

  const isPro = profile?.isPro ?? false;
  const dailyLimit = isPro ? PRO_DAILY_CAPTURE_LIMIT : FREE_DAILY_CAPTURE_LIMIT;

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const [{ todayCount }] = await db
    .select({ todayCount: count() })
    .from(learnings)
    .where(and(eq(learnings.userId, userId), gte(learnings.createdAt, todayStart), ne(learnings.sourceType, 'sample')));

  if (todayCount >= dailyLimit) {
    return isPro
      ? {
          ok: false,
          errorCode: 'pro_daily_limit',
          error: `You've captured ${PRO_DAILY_CAPTURE_LIMIT} learnings today — the daily maximum. Come back tomorrow to keep going.`,
        }
      : {
          ok: false,
          errorCode: 'daily_limit',
          error: `You've used your ${FREE_DAILY_CAPTURE_LIMIT} capture for today. Upgrade to Pro for up to ${PRO_DAILY_CAPTURE_LIMIT} captures a day.`,
        };
  }

  if (!isPro) {
    const [{ totalCount }] = await db
      .select({ totalCount: count() })
      .from(learnings)
      .where(and(eq(learnings.userId, userId), ne(learnings.sourceType, 'sample')));

    if (totalCount >= FREE_LIBRARY_CAP) {
      return {
        ok: false,
        errorCode: 'library_full',
        error: `You've reached the ${FREE_LIBRARY_CAP}-learning lifetime limit on the free plan. Upgrade to Pro for an unlimited library.`,
      };
    }
  }

  try {
    const [learning] = await db
      .insert(learnings)
      .values({
        userId,
        title: input.title.trim(),
        summary: input.summary?.trim() || null,
        topic: input.topic?.trim() || null,
        tags: input.tags ?? [],
        difficulty: input.difficulty ?? null,
        sourceType: input.sourceType,
        sourceRef: input.sourceRef ?? null,
        // NEW: Persist content metadata
        author: input.author ?? null,
        publishDate: input.publishDate ? new Date(input.publishDate) : null,
        domain: input.domain ?? null,
        videoUrl: input.videoUrl ?? null,
        videoTitle: input.videoTitle ?? null,
        videoChannel: input.videoChannel ?? null,
        videoDuration: input.videoDuration ?? null,
        contentType: input.contentType ?? null,
        keyPoints: input.keyPoints ?? [],
        isAiGenerated: true,
      })
      .returning();

    let reviewCount = 0;
    if (input.generateReviews !== false) {
      try {
        const items = await generateReviewItems({
          title: input.title,
          summary: input.summary,
          keyPoints: input.keyPoints,
          sourceContent: input.resolvedContent,
        });
        if (items.length) {
          await db.insert(reviewItems).values(
            items.map((it) => ({
              userId,
              learningId: learning.id,
              type: it.type,
              question: it.question,
              answer: it.answer,
              dueDate: todayISO(),
              srInterval: 1,
              srEase: 2.5,
            }))
          );
          reviewCount = items.length;
        }
      } catch (err) {
        // Review generation is best-effort; the learning is still saved.
        console.log(
          '[v0] generateReviewItems error:',
          (err as Error).message
        );
      }
    }

    await recordActivity(userId, 'capture');

    revalidatePath('/home');
    revalidatePath('/library');
    revalidatePath('/review');

    return { ok: true, learningId: learning.id, reviewCount };
  } catch (err) {
    console.log('[v0] saveCapture error:', (err as Error).message);
    return { ok: false, error: 'Failed to save. Please try again.' };
  }
}

/**
 * NEW: When user clicks "Next: Organize", analyze content metadata using LLM
 * This enriches blog/video content with author, date, domain, and key points
 */
export interface AnalyzeContentMetadataInput {
  sourceRef: string; // URL or video URL
  sourceType: 'url' | 'video' | 'text';
  resolvedContent: string; // The extracted/cleaned content
}

export interface ContentMetadata {
  author?: string;
  publishDate?: string;
  domain?: string;
  videoTitle?: string;
  videoChannel?: string;
  videoDuration?: number;
  keyPoints: string[];
  contentType?: string;
}

export interface AnalyzeContentMetadataResult {
  ok: boolean;
  error?: string;
  metadata?: ContentMetadata;
}

export interface SaveSkeletonResult {
  ok: boolean;
  error?: string;
  /**
   * 'daily_limit' when a free user has hit their daily capture limit.
   * 'pro_daily_limit' when a Pro user has hit the 10/day capture limit.
   * 'library_full' when a free user has reached the total library cap.
   */
  errorCode?: 'daily_limit' | 'pro_daily_limit' | 'library_full';
  learningId?: string;
}

/**
 * Saves a minimal skeleton learning row immediately (status='processing').
 * The caller should then fire an enrich request to fill in AI fields.
 */
export async function saveSkeleton(input: {
  sourceType: SourceType;
  sourceRef?: string | null;
  rawContent?: string; // original text/URL the user entered
}): Promise<SaveSkeletonResult> {
  const userId = await requireUserId();

  // Capture quota checks (same limits as saveCapture)
  const [profile] = await db
    .select({ isPro: userProfiles.isPro })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId));

  const isPro = profile?.isPro ?? false;
  const dailyLimit = isPro ? PRO_DAILY_CAPTURE_LIMIT : FREE_DAILY_CAPTURE_LIMIT;

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const [{ todayCount }] = await db
    .select({ todayCount: count() })
    .from(learnings)
    .where(and(eq(learnings.userId, userId), gte(learnings.createdAt, todayStart), ne(learnings.sourceType, 'sample')));

  if (todayCount >= dailyLimit) {
    return isPro
      ? {
          ok: false,
          errorCode: 'pro_daily_limit',
          error: `You've captured ${PRO_DAILY_CAPTURE_LIMIT} learnings today — the daily maximum. Come back tomorrow to keep going.`,
        }
      : {
          ok: false,
          errorCode: 'daily_limit',
          error: `You've used your ${FREE_DAILY_CAPTURE_LIMIT} capture for today. Upgrade to Pro for up to ${PRO_DAILY_CAPTURE_LIMIT} captures a day.`,
        };
  }

  if (!isPro) {
    const [{ totalCount }] = await db
      .select({ totalCount: count() })
      .from(learnings)
      .where(and(eq(learnings.userId, userId), ne(learnings.sourceType, 'sample')));

    if (totalCount >= FREE_LIBRARY_CAP) {
      return {
        ok: false,
        errorCode: 'library_full',
        error: `You've reached the ${FREE_LIBRARY_CAP}-learning lifetime limit on the free plan. Upgrade to Pro for an unlimited library.`,
      };
    }
  }

  try {
    // Derive a placeholder title from the URL domain or raw content preview.
    let placeholderTitle = 'Analyzing…';
    if (input.sourceRef) {
      try {
        placeholderTitle = new URL(input.sourceRef).hostname.replace('www.', '');
      } catch {}
    } else if (input.rawContent) {
      placeholderTitle = input.rawContent.slice(0, 60) + (input.rawContent.length > 60 ? '…' : '');
    }

    const [learning] = await db
      .insert(learnings)
      .values({
        userId,
        title: placeholderTitle,
        sourceType: input.sourceType,
        sourceRef: input.sourceRef ?? null,
        status: 'processing',
        isAiGenerated: true,
      })
      .returning({ id: learnings.id });

    revalidatePath('/library');
    return { ok: true, learningId: learning.id };
  } catch (err) {
    console.error('[capture] saveSkeleton error:', (err as Error).message);
    return { ok: false, error: 'Failed to save. Please try again.' };
  }
}

export async function analyzeContentMetadata(
  input: AnalyzeContentMetadataInput
): Promise<AnalyzeContentMetadataResult> {
  await requireUserId();

  if (!input.sourceRef?.trim()) {
    return { ok: false, error: 'No source URL provided.' };
  }

  try {
    // Check if it's a video
    const videoInfo = detectVideoUrl(input.sourceRef);
    
    if (videoInfo) {
      // Analyze video metadata
      const videoMetadata = await analyzeVideoMetadata(
        input.sourceRef,
        input.resolvedContent
      );
      
      return {
        ok: true,
        metadata: {
          videoTitle: videoMetadata.videoTitle,
          videoChannel: videoMetadata.videoChannel,
          videoDuration: videoMetadata.videoDuration,
          keyPoints: videoMetadata.keyPoints,
          contentType: 'video',
          domain: new URL(input.sourceRef).hostname.replace('www.', ''),
        },
      };
    }

    // Analyze blog/article metadata
    const blogMetadata = await analyzeBlogContent(
      input.sourceRef,
      input.resolvedContent,
      null
    );

    return {
      ok: true,
      metadata: {
        author: blogMetadata.author,
        publishDate: blogMetadata.publishDate,
        domain: blogMetadata.domain,
        contentType: blogMetadata.contentType,
        keyPoints: blogMetadata.keyPoints,
      },
    };
  } catch (err) {
    console.log('[v0] analyzeContentMetadata error:', (err as Error).message);
    return {
      ok: false,
      error: 'Failed to analyze content. Please try again.',
    };
  }
}
