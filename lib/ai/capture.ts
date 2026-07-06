import 'server-only';
import { generateText, Output } from 'ai';
import { z } from 'zod';
import { FAST_MODEL, SMART_MODEL } from './models';

/* ------------------------------------------------------------------ */
/* Capture summarization                                               */
/* ------------------------------------------------------------------ */

const captureSchema = z.object({
  title: z.string().describe('A concise, specific title (max ~8 words).'),
  summary: z
    .string()
    .describe('A clear 2-3 sentence plain-language summary of the key idea.'),
  topic: z
    .string()
    .describe('A single broad subject area, e.g. "React", "System Design".'),
  tags: z
    .array(z.string())
    .describe('3-5 short lowercase tags for filtering and grouping.'),
  difficulty: z
    .number()
    .int()
    .min(1)
    .max(5)
    .describe('Estimated conceptual difficulty from 1 (easy) to 5 (hard).'),
  keyPoints: z
    .array(z.string())
    .describe('2-4 distinct, atomic takeaways worth remembering.'),
});

export type CaptureSummary = z.infer<typeof captureSchema>;

export interface CaptureInput {
  /** Raw text the user pasted, or a note describing what they learned. */
  content: string;
  /** Optional source URL or reference for context. */
  sourceRef?: string | null;
  sourceType: 'url' | 'text' | 'file' | 'wizard';
  /** Optional wizard context: why it matters to the user. */
  whyItMatters?: string | null;
}

export async function summarizeCapture(
  input: CaptureInput
): Promise<CaptureSummary> {
  const context = [
    `Source type: ${input.sourceType}`,
    input.sourceRef ? `Source reference: ${input.sourceRef}` : null,
    input.whyItMatters ? `Why it matters to the learner: ${input.whyItMatters}` : null,
    '',
    'Learning material / note:',
    input.content,
  ]
    .filter(Boolean)
    .join('\n');

  const { experimental_output } = await generateText({
    model: FAST_MODEL,
    system:
      'You help a learner externalize what they just learned. Extract a faithful, ' +
      'concrete summary from the material they provide. Never invent facts that ' +
      'are not supported by the material. Keep language plain and specific.',
    prompt: context,
    experimental_output: Output.object({ schema: captureSchema }),
  });

  return experimental_output;
}

/* ------------------------------------------------------------------ */
/* Review item (flashcard + quiz) generation                          */
/* ------------------------------------------------------------------ */

const reviewItemSchema = z.object({
  type: z.enum(['flashcard', 'quiz']),
  question: z.string(),
  answer: z
    .string()
    .describe('The correct answer or, for flashcards, the back of the card.'),
  options: z
    .array(z.string())
    .describe(
      'For quiz items, 3-4 answer choices including the correct one. Empty array for flashcards.'
    ),
});

const reviewSetSchema = z.object({
  items: z.array(reviewItemSchema).describe('4-6 review items total.'),
});

export type GeneratedReviewItem = z.infer<typeof reviewItemSchema>;

export async function generateReviewItems(args: {
  title: string;
  summary: string;
  keyPoints?: string[];
  sourceContent?: string;
}): Promise<GeneratedReviewItem[]> {
  const { experimental_output } = await generateText({
    model: FAST_MODEL,
    system:
      'You create study material. Generate a small mix of flashcards (recall of ' +
      'facts) and multiple-choice quiz questions (conceptual understanding). ' +
      'Questions must be answerable purely from the provided material. ' +
      'For quiz items always include 3-4 plausible options with exactly one correct. ' +
      'For flashcards return an empty options array.',
    prompt: [
      `Title: ${args.title}`,
      `Summary: ${args.summary}`,
      args.keyPoints?.length ? `Key points:\n- ${args.keyPoints.join('\n- ')}` : '',
      args.sourceContent ? `\nSource material:\n${args.sourceContent.slice(0, 12000)}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
    experimental_output: Output.object({ schema: reviewSetSchema }),
  });

  return experimental_output.items;
}

/* ------------------------------------------------------------------ */
/* "What's next" suggestions                                          */
/* ------------------------------------------------------------------ */

const whatsNextSchema = z.object({
  suggestions: z
    .array(
      z.object({
        topic: z.string(),
        reason: z.string().describe('One sentence on why this is a good next step.'),
      })
    )
    .describe('2-4 suggested next topics.'),
});

export type WhatsNextSuggestion = z.infer<
  typeof whatsNextSchema
>['suggestions'][number];

export async function suggestWhatsNext(args: {
  recentTopics: string[];
  goals: string[];
}): Promise<WhatsNextSuggestion[]> {
  if (args.recentTopics.length === 0 && args.goals.length === 0) return [];

  const { experimental_output } = await generateText({
    model: FAST_MODEL,
    system:
      'You are a thoughtful learning coach. Suggest logical next topics that build ' +
      'on what the learner already covered and move them toward their goals. ' +
      'Be encouraging and specific. Never repeat topics they already know well.',
    prompt: [
      `Recently learned topics: ${args.recentTopics.join(', ') || 'none yet'}`,
      `Stated goals: ${args.goals.join(', ') || 'none stated'}`,
    ].join('\n'),
    experimental_output: Output.object({ schema: whatsNextSchema }),
  });

  return experimental_output.suggestions;
}
