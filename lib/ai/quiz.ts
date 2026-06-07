import 'server-only';
import { generateText, Output } from 'ai';
import { z } from 'zod';
import { FAST_MODEL } from './models';
import type { QuizQuestion } from '@/db/schema';
import { nanoid } from 'nanoid';

const quizSchema = z.object({
  questions: z.array(
    z.discriminatedUnion('type', [
      z.object({
        type: z.literal('mcq'),
        question: z.string().describe('The question text'),
        options: z.array(z.string()).min(4).max(4).describe('Exactly 4 answer choices'),
        correctAnswer: z.string().describe('Must be one of the 4 options verbatim'),
      }),
      z.object({
        type: z.literal('oneliner'),
        question: z.string().describe('A question requiring a short typed answer'),
        correctAnswer: z.string().describe('The ideal short answer (1-2 sentences max)'),
      }),
    ])
  ).describe('Exactly 4 questions: 3 MCQ + 1 one-liner'),
});

export async function generateQuiz(args: {
  title: string;
  summary: string;
  keyPoints?: string[];
  sourceContent?: string;
}): Promise<QuizQuestion[]> {
  const { experimental_output } = await generateText({
    model: FAST_MODEL,
    system:
      'You create comprehension quizzes for learners. Generate exactly 4 questions: ' +
      '3 multiple-choice (4 options each, exactly one correct) and 1 one-liner (short typed answer). ' +
      'Questions must test genuine understanding, not trivial recall. ' +
      'MCQ distractors should be plausible but clearly wrong on reflection. ' +
      'The correctAnswer for MCQ must match one of the options verbatim.',
    prompt: [
      `Title: ${args.title}`,
      `Summary: ${args.summary}`,
      args.keyPoints?.length ? `Key points:\n- ${args.keyPoints.join('\n- ')}` : '',
      args.sourceContent ? `\nSource material:\n${args.sourceContent.slice(0, 4000)}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
    experimental_output: Output.object({ schema: quizSchema }),
  });

  return experimental_output.questions.map((q) => ({
    ...q,
    id: nanoid(),
    options: q.type === 'mcq' ? q.options : undefined,
  }));
}

/**
 * Grade a one-liner answer leniently using LLM.
 * Returns true if the user's answer captures the core idea.
 */
export async function gradeOneliner(args: {
  question: string;
  correctAnswer: string;
  userAnswer: string;
}): Promise<boolean> {
  const { text } = await generateText({
    model: FAST_MODEL,
    system:
      'You grade short answers leniently. Reply with only "correct" or "incorrect". ' +
      'Mark correct if the user captures the core idea, even if wording differs. ' +
      'Mark incorrect only if the answer is clearly wrong or missing the key point.',
    prompt: [
      `Question: ${args.question}`,
      `Ideal answer: ${args.correctAnswer}`,
      `User answered: ${args.userAnswer}`,
    ].join('\n'),
  });

  return text.trim().toLowerCase().startsWith('correct');
}
