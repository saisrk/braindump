import 'server-only';
import { generateObject } from 'ai';
import { z } from 'zod';
import { FAST_MODEL } from './models';
import { db } from '@/db';
import { userProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Returns a map from every raw topic name to its canonical (merged) name.
 * Result is cached in user_profiles.topic_aliases and only regenerated when
 * new topics appear that aren't covered by the existing cache.
 */
export async function groupSimilarTopics(
  userId: string,
  topics: string[]
): Promise<Map<string, string>> {
  if (topics.length <= 1) {
    return new Map(topics.map((t) => [t, t]));
  }

  // Check cache
  const [profile] = await db
    .select({ topicAliases: userProfiles.topicAliases, topicAliasesKnownTopics: userProfiles.topicAliasesKnownTopics })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId));

  const knownTopics = new Set(profile?.topicAliasesKnownTopics ?? []);
  const newTopics = topics.filter((t) => !knownTopics.has(t));
  const existingAliases = (profile?.topicAliases ?? {}) as Record<string, string>;

  // Cache hit: all topics already mapped
  if (newTopics.length === 0 && Object.keys(existingAliases).length > 0) {
    const map = new Map<string, string>();
    for (const t of topics) map.set(t, existingAliases[t] ?? t);
    return map;
  }

  // Cache miss or new topics — run AI on full topic list (re-grouping is cheap with Haiku)
  const freshMap = await callGroupingAI(topics);

  // Persist updated cache
  const aliasesRecord: Record<string, string> = {};
  for (const [k, v] of freshMap) aliasesRecord[k] = v;

  await db.update(userProfiles).set({
    topicAliases: aliasesRecord,
    topicAliasesKnownTopics: topics,
  }).where(eq(userProfiles.userId, userId));

  return freshMap;
}

async function callGroupingAI(topics: string[]): Promise<Map<string, string>> {
  const { object } = await generateObject({
    model: FAST_MODEL,
    schema: z.object({
      groups: z.array(
        z.object({
          canonical: z.string().describe('The shortest, clearest name for this topic group.'),
          members: z.array(z.string()).describe('All input topic names that belong to this group.'),
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
    for (const member of group.members) map.set(member, group.canonical);
  }
  // Safety: ensure every input topic is mapped
  for (const t of topics) {
    if (!map.has(t)) map.set(t, t);
  }
  return map;
}
