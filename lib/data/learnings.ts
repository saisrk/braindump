import 'server-only';
import { db } from '@/db';
import { learnings, reviewItems, teachBacks } from '@/db/schema';
import { and, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { confidenceFromSr } from '@/lib/sr';

export type Learning = typeof learnings.$inferSelect;

export interface LearningWithMeta extends Learning {
  reviewCount: number;
  teachBackCount: number;
  confidence: number;
}

/** All distinct topics + tags for a user (for filter chips). */
export async function getUserFacets(userId: string) {
  const rows = await db
    .select({ topic: learnings.topic, tags: learnings.tags })
    .from(learnings)
    .where(eq(learnings.userId, userId));

  const topics = new Set<string>();
  const tags = new Set<string>();
  for (const r of rows) {
    if (r.topic) topics.add(r.topic);
    for (const t of r.tags ?? []) tags.add(t);
  }
  return {
    topics: Array.from(topics).sort(),
    tags: Array.from(tags).sort(),
  };
}

export interface ListLearningsOptions {
  search?: string;
  topic?: string;
  tag?: string;
}

export async function listLearnings(
  userId: string,
  opts: ListLearningsOptions = {}
): Promise<LearningWithMeta[]> {
  const conditions = [eq(learnings.userId, userId)];

  if (opts.search) {
    const term = `%${opts.search}%`;
    conditions.push(
      or(
        ilike(learnings.title, term),
        ilike(learnings.summary, term),
        ilike(learnings.topic, term)
      )!
    );
  }
  if (opts.topic) conditions.push(eq(learnings.topic, opts.topic));
  if (opts.tag) {
    conditions.push(sql`${opts.tag} = ANY(${learnings.tags})`);
  }

  const rows = await db
    .select({
      learning: learnings,
      reviewCount: sql<number>`(
        select count(*)::int from ${reviewItems}
        where ${reviewItems.learningId} = ${learnings.id}
      )`,
      teachBackCount: sql<number>`(
        select count(*)::int from ${teachBacks}
        where ${teachBacks.learningId} = ${learnings.id}
      )`,
      avgInterval: sql<number>`coalesce((
        select avg(${reviewItems.srInterval}) from ${reviewItems}
        where ${reviewItems.learningId} = ${learnings.id}
      ), 0)`,
      avgEase: sql<number>`coalesce((
        select avg(${reviewItems.srEase}) from ${reviewItems}
        where ${reviewItems.learningId} = ${learnings.id}
      ), 2.5)`,
    })
    .from(learnings)
    .where(and(...conditions))
    .orderBy(desc(learnings.createdAt));

  return rows.map((r) => ({
    ...r.learning,
    reviewCount: r.reviewCount,
    teachBackCount: r.teachBackCount,
    confidence: r.reviewCount
      ? confidenceFromSr(Number(r.avgInterval), Number(r.avgEase))
      : 0,
  }));
}

export async function getLearning(userId: string, id: string) {
  const [learning] = await db
    .select()
    .from(learnings)
    .where(and(eq(learnings.id, id), eq(learnings.userId, userId)));

  if (!learning) return null;

  const [items, teaches] = await Promise.all([
    db.select().from(reviewItems).where(eq(reviewItems.learningId, id)),
    db
      .select()
      .from(teachBacks)
      .where(eq(teachBacks.learningId, id))
      .orderBy(desc(teachBacks.createdAt)),
  ]);

  return { learning, reviewItems: items, teachBacks: teaches };
}

export async function getRecentTopics(
  userId: string,
  limit = 12
): Promise<string[]> {
  const rows = await db
    .select({ topic: learnings.topic })
    .from(learnings)
    .where(eq(learnings.userId, userId))
    .orderBy(desc(learnings.createdAt))
    .limit(limit);

  const seen = new Set<string>();
  for (const r of rows) if (r.topic) seen.add(r.topic);
  return Array.from(seen);
}
