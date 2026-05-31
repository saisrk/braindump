'use server';

import { db } from '@/db';
import { learnings, reviewItems } from '@/db/schema';
import { requireUserId } from '@/lib/session';
import {
  summarizeCapture,
  generateReviewItems,
  type CaptureSummary,
} from '@/lib/ai/capture';
import { extractFromUrl, isValidUrl } from '@/lib/extract';
import { recordActivity } from '@/lib/data/activity';
import { todayISO } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

export type SourceType = 'url' | 'text' | 'file' | 'wizard';

export interface AnalyzeResult {
  ok: boolean;
  error?: string;
  summary?: CaptureSummary;
  /** Cleaned source text, passed back so save can generate review items. */
  resolvedContent?: string;
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
  await requireUserId();

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
        error:
          "Couldn't read that page. Paste the text directly, or use the wizard instead.",
      };
    }
    content = `${extracted.title ? `Page title: ${extracted.title}\n\n` : ''}${extracted.text}`;
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
}

export interface SaveCaptureResult {
  ok: boolean;
  error?: string;
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
