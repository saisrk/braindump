import 'server-only';
import { db } from '@/db';
import { learnings, reviewItems, teachBacks, quizAttempts } from '@/db/schema';
import { and, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { confidenceFromSr } from '@/lib/sr';

export type Learning = typeof learnings.$inferSelect;

export interface LearningWithMeta extends Learning {
  reviewCount: number;
  teachBackCount: number;
  confidence: number;
  dueCount: number;
  latestQuizScore: number | null;
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
  sort?: 'recent' | 'due' | 'confidence';
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
      dueCount: sql<number>`coalesce((
        select count(*)::int from ${reviewItems}
        where ${reviewItems.learningId} = ${learnings.id}
          and ${reviewItems.dueDate} <= current_date
      ), 0)`,
      latestQuizScore: sql<number | null>`(
        select score from ${quizAttempts}
        where ${quizAttempts.learningId} = ${learnings.id}
        order by created_at desc limit 1
      )`,
    })
    .from(learnings)
    .where(and(...conditions))
    .orderBy(
      ...(() => {
        const sort = opts.sort ?? 'recent';
        if (sort === 'due') {
          return [
            sql`coalesce((select count(*)::int from ${reviewItems} where ${reviewItems.learningId} = ${learnings.id} and ${reviewItems.dueDate} <= current_date), 0) desc`,
            desc(learnings.createdAt),
          ];
        } else if (sort === 'confidence') {
          return [
            sql`coalesce((select avg(${reviewItems.srInterval}) from ${reviewItems} where ${reviewItems.learningId} = ${learnings.id}), 0) asc`,
            desc(learnings.createdAt),
          ];
        } else {
          return [desc(learnings.createdAt)];
        }
      })()
    );

  return rows.map((r: any) => ({
    ...r.learning,
    reviewCount: r.reviewCount,
    teachBackCount: r.teachBackCount,
    dueCount: r.dueCount,
    latestQuizScore: r.latestQuizScore ?? null,
    confidence: r.reviewCount
      ? confidenceFromSr(Number(r.avgInterval), Number(r.avgEase))
      : 0,
  }));
}

export async function getLearning(userId: string, id: string) {
  if (!userId) return null;

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

  // Compute confidence from SM-2 state.
  const confidence = items.length
    ? confidenceFromSr(
        items.reduce((s: number, i: { srInterval?: number | null }) => s + (i.srInterval ?? 1), 0) / items.length,
        items.reduce((s: number, i: { srEase?: number | null }) => s + (i.srEase ?? 2.5), 0) / items.length
      )
    : 0;

  return { learning, reviewItems: items, teachBacks: teaches, confidence };
}

/**
 * Returns the set of learning IDs (from the provided list) that are "proven":
 * latest quiz score ≥ 70 OR latest teach-back gap_score ≥ 60.
 */
export async function getProvenLearningIds(
  userId: string,
  learningIds: string[]
): Promise<Set<string>> {
  if (learningIds.length === 0) return new Set();

  const [quizRows, teachRows] = await Promise.all([
    db
      .select({ learningId: quizAttempts.learningId, score: quizAttempts.score })
      .from(quizAttempts)
      .where(
        and(
          eq(quizAttempts.userId, userId),
          sql`${quizAttempts.learningId} = ANY(ARRAY[${sql.join(
            learningIds.map((id) => sql`${id}::uuid`),
            sql`, `
          )}])`
        )
      )
      .orderBy(desc(quizAttempts.createdAt)),
    db
      .select({ learningId: teachBacks.learningId, gapScore: teachBacks.gapScore })
      .from(teachBacks)
      .where(
        and(
          eq(teachBacks.userId, userId),
          sql`${teachBacks.learningId} = ANY(ARRAY[${sql.join(
            learningIds.map((id) => sql`${id}::uuid`),
            sql`, `
          )}])`
        )
      )
      .orderBy(desc(teachBacks.createdAt)),
  ]);

  const proven = new Set<string>();

  // Latest quiz score per learning
  const latestQuiz = new Map<string, number>();
  for (const r of quizRows) {
    if (!latestQuiz.has(r.learningId)) latestQuiz.set(r.learningId, r.score);
  }
  for (const [id, score] of latestQuiz) {
    if (score >= 70) proven.add(id);
  }

  // Latest teach-back score per learning
  const latestTeach = new Map<string, number | null>();
  for (const r of teachRows) {
    if (!latestTeach.has(r.learningId)) latestTeach.set(r.learningId, r.gapScore ?? null);
  }
  for (const [id, score] of latestTeach) {
    if (score !== null && score >= 60) proven.add(id);
  }

  return proven;
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
