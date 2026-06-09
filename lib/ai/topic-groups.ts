import 'server-only';
import { generateObject } from 'ai';
import { z } from 'zod';
import { FAST_MODEL } from './models';

/**
 * Given a list of topic names, returns a map from every input topic to its
 * canonical (merged) name. Topics that are clearly about the same subject get
 * the same canonical name; unique topics map to themselves.
 *
 * e.g. ["Leadership", "Leadership & Executive Strategy", "AI", "AI Tools & Productivity"]
 *   → { "Leadership": "Leadership", "Leadership & Executive Strategy": "Leadership",
 *       "AI": "AI", "AI Tools & Productivity": "AI" }
 */
export async function groupSimilarTopics(
  topics: string[]
): Promise<Map<string, string>> {
  // Nothing to group
  if (topics.length <= 1) {
    return new Map(topics.map((t) => [t, t]));
  }

  const { object } = await generateObject({
    model: FAST_MODEL,
    schema: z.object({
      groups: z.array(
        z.object({
          canonical: z.string().describe('The shortest, clearest name for this topic group.'),
          members: z.array(z.string()).describe('All input topic names that belong to this group, including the canonical if it was an input.'),
        })
      ),
    }),
    prompt: `You are organising a personal knowledge library. The user has these shelf topics:

${topics.map((t) => `- ${t}`).join('\n')}

Group topics that are clearly about the same subject (e.g. "Leadership" and "Leadership & Executive Strategy" are the same; "AI" and "AI Tools & Productivity" are the same). Topics that are genuinely different must stay separate.

Rules:
- Every input topic must appear in exactly one group's members list.
- Choose the shortest, clearest name as canonical (prefer the user's own words).
- If a topic is unique, it forms its own group with itself as canonical.
- Do not invent new topic names that weren't in the input.`,
  });

  const map = new Map<string, string>();
  for (const group of object.groups) {
    for (const member of group.members) {
      map.set(member, group.canonical);
    }
  }

  // Safety: ensure every input topic is mapped (LLM may miss some)
  for (const t of topics) {
    if (!map.has(t)) map.set(t, t);
  }

  return map;
}
