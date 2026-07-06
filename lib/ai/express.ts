import 'server-only';
import { generateText, Output } from 'ai';
import { z } from 'zod';
import { SMART_MODEL, FAST_MODEL } from './models';

export type ExpressFormat = 'talking-points' | 'star' | 'profile' | 'summary';

interface LearningContext {
  title: string;
  summary: string | null;
  topic: string | null;
  tags: string[];
  keyPoints: string[];
}

/* talking points ---------------------------------------------------- */
const talkingPointsSchema = z.object({
  points: z.array(
    z.object({
      headline: z.string().describe('A crisp, confident one-line claim.'),
      detail: z
        .string()
        .describe('1-2 supporting sentences the speaker can expand on.'),
    })
  ),
});

/* STAR answers ------------------------------------------------------ */
const starSchema = z.object({
  answers: z.array(
    z.object({
      prompt: z.string().describe('A likely interview question this answers.'),
      situation: z.string(),
      task: z.string(),
      action: z.string(),
      result: z.string(),
    })
  ),
});

/* profile snippets -------------------------------------------------- */
const profileSchema = z.object({
  bullets: z
    .array(z.string())
    .describe('Copy-ready resume/LinkedIn bullets, each starting with a verb.'),
});

/* narrative summary ------------------------------------------------- */
const narrativeSchema = z.object({
  markdown: z
    .string()
    .describe('A shareable "learning in public" recap in plain markdown.'),
});

export interface ExpressResult {
  format: ExpressFormat;
  talkingPoints?: z.infer<typeof talkingPointsSchema>['points'];
  starAnswers?: z.infer<typeof starSchema>['answers'];
  profileBullets?: string[];
  narrative?: string;
}

function contextBlock(learnings: LearningContext[]): string {
  return learnings
    .map(
      (l, i) =>
        `${i + 1}. ${l.title}${l.topic ? ` [${l.topic}]` : ''}\n   ${
          l.summary ?? ''
        }${
          l.keyPoints.length
            ? `\n   Key points:\n${l.keyPoints
                .map((kp) => `   - ${kp}`)
                .join('\n')}`
            : ''
        }`
    )
    .join('\n');
}

export async function generateExpress(args: {
  format: ExpressFormat;
  learnings: LearningContext[];
  audience?: string;
}): Promise<ExpressResult> {
  const ctx = contextBlock(args.learnings);
  const audience = args.audience?.trim();

  if (args.format === 'talking-points') {
    const { experimental_output } = await generateText({
      model: SMART_MODEL,
      system:
        'Turn a learner\'s knowledge into confident, accurate talking points they ' +
        'can use in conversation. Ground every point in the provided learnings.',
      prompt: `${audience ? `Audience/context: ${audience}\n\n` : ''}Learnings:\n${ctx}`,
      experimental_output: Output.object({ schema: talkingPointsSchema }),
    });
    return { format: args.format, talkingPoints: experimental_output.points };
  }

  if (args.format === 'star') {
    const { experimental_output } = await generateText({
      model: SMART_MODEL,
      system:
        'Create STAR-format interview answers grounded in the learner\'s real ' +
        'logged knowledge. Keep each section to 1-2 sentences. Do not fabricate ' +
        'achievements that are not implied by the learnings.',
      prompt: `${audience ? `Role/context: ${audience}\n\n` : ''}Learnings:\n${ctx}`,
      experimental_output: Output.object({ schema: starSchema }),
    });
    return { format: args.format, starAnswers: experimental_output.answers };
  }

  if (args.format === 'profile') {
    const { experimental_output } = await generateText({
      model: SMART_MODEL,
      system:
        'Write punchy, copy-ready profile bullets (LinkedIn / portfolio) from the ' +
        'learner\'s knowledge. Each bullet starts with a strong verb and stays honest.',
      prompt: `${audience ? `Target profile: ${audience}\n\n` : ''}Learnings:\n${ctx}`,
      experimental_output: Output.object({ schema: profileSchema }),
    });
    return { format: args.format, profileBullets: experimental_output.bullets };
  }

  // narrative summary
  const { experimental_output } = await generateText({
    model: SMART_MODEL,
    system:
      'Write a warm, first-person "here is what I have been learning" recap suitable ' +
      'for sharing publicly. Use plain markdown. Be specific and grounded.',
    prompt: `${audience ? `Context: ${audience}\n\n` : ''}Learnings:\n${ctx}`,
    experimental_output: Output.object({ schema: narrativeSchema }),
  });
  return { format: args.format, narrative: experimental_output.markdown };
}

/* ------------------------------------------------------------------ */
/* Daily summary digest                                                */
/* ------------------------------------------------------------------ */

export async function generateDailySummary(args: {
  captured: { title: string; summary: string | null }[];
  reviewedCount: number;
}): Promise<string> {
  if (args.captured.length === 0 && args.reviewedCount === 0) {
    return 'No learning activity logged yet today.';
  }

  const { text } = await generateText({
    model: FAST_MODEL,
    system:
      'Write a single warm, encouraging sentence summarizing the learner\'s day. ' +
      'Mention concrete topics. No emojis. No preamble.',
    prompt: [
      `Captured today: ${
        args.captured.map((c) => c.title).join('; ') || 'nothing new'
      }`,
      `Items reviewed today: ${args.reviewedCount}`,
    ].join('\n'),
  });

  return text.trim();
}
