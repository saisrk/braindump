import 'server-only';
import { generateText, Output } from 'ai';
import { z } from 'zod';
import { SMART_MODEL } from './models';

const teachBackSchema = z.object({
  gapScore: z
    .number()
    .min(0)
    .max(100)
    .describe(
      'How complete and accurate the explanation is, 0-100. Higher is better.'
    ),
  verdict: z
    .enum(['strong', 'partial', 'shaky'])
    .describe('Overall assessment of understanding.'),
  nailed: z
    .array(z.string())
    .describe('Specific things the learner explained correctly.'),
  gaps: z
    .array(z.string())
    .describe('Specific gaps, omissions or misconceptions to address.'),
  followUpQuestions: z
    .array(z.string())
    .describe('1-2 questions that would close the biggest gaps.'),
  encouragement: z
    .string()
    .describe('One warm, honest sentence of encouragement.'),
});

export type TeachBackFeedback = z.infer<typeof teachBackSchema>;

export async function gradeTeachBack(args: {
  title: string;
  summary: string;
  sourceContent?: string;
  explanation: string;
}): Promise<TeachBackFeedback> {
  const { experimental_output } = await generateText({
    model: SMART_MODEL,
    system:
      'You evaluate how well a learner can explain a concept in their own words. ' +
      'Compare their explanation against the reference material. Be honest but kind. ' +
      'Reward correct understanding even when phrased differently. Identify real ' +
      'gaps and misconceptions, not stylistic nitpicks. Keep each point short.',
    prompt: [
      `Concept: ${args.title}`,
      `Reference summary: ${args.summary}`,
      args.sourceContent
        ? `Reference material:\n${args.sourceContent.slice(0, 4000)}`
        : '',
      '',
      `The learner's explanation:\n"""${args.explanation}"""`,
    ]
      .filter(Boolean)
      .join('\n'),
    experimental_output: Output.object({ schema: teachBackSchema }),
  });

  return experimental_output;
}
