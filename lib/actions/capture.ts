'use server';

import { db } from '@/db';
import { learnings } from '@/db/schema';
import { requireUserId, getOptionalUserId } from '@/lib/session';
import {
  summarizeCapture,
  type CaptureSummary,
} from '@/lib/ai/capture';
import { extractFromUrl, isValidUrl } from '@/lib/extract';
import { analyzeBlogContent, analyzeVideoMetadata } from '@/lib/ai/content-analysis';
import { detectVideoUrl } from '@/lib/video-detection';
import { recordActivity } from '@/lib/data/activity';
import { getEntitlement } from '@/lib/entitlements';
import { revalidatePath } from 'next/cache';
import { and, eq, gte, ne, count } from 'drizzle-orm';

// Trial and Pro users share the same generous limits; expired users are blocked.
const PRO_DAILY_CAPTURE_LIMIT = 10;

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
   * 'trial_expired' when the user's free trial has ended and they have no subscription.
   * 'pro_daily_limit' when the user has hit the 10/day capture limit.
   */
  errorCode?: 'trial_expired' | 'pro_daily_limit';
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

  // Access gate: trial or Pro may capture; expired users are paywalled.
  const { hasAccess } = await getEntitlement(userId);
  if (!hasAccess) {
    return {
      ok: false,
      errorCode: 'trial_expired',
      error: 'Your free trial has ended. Subscribe to Pro to keep capturing.',
    };
  }

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const [{ todayCount }] = await db
    .select({ todayCount: count() })
    .from(learnings)
    .where(and(eq(learnings.userId, userId), gte(learnings.createdAt, todayStart), ne(learnings.sourceType, 'sample')));

  if (todayCount >= PRO_DAILY_CAPTURE_LIMIT) {
    return {
      ok: false,
      errorCode: 'pro_daily_limit',
      error: `You've captured ${PRO_DAILY_CAPTURE_LIMIT} learnings today — the daily maximum. Come back tomorrow to keep going.`,
    };
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

    // Count today toward the streak the moment a capture is created —
    // don't gate this on enrichment succeeding.
    await recordActivity(userId, 'capture');

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
