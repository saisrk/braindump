import { requireUserId } from '@/lib/session';
import { db } from '@/db';
import { learnings } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getExpressHistory } from '@/lib/data/express';
import { getProvenLearningIds } from '@/lib/data/learnings';
import { ExpressClient } from './client';

export default async function ExpressPage() {
  const userId = await requireUserId();

  const [rows, history] = await Promise.all([
    db
      .select({ id: learnings.id, title: learnings.title, topic: learnings.topic })
      .from(learnings)
      .where(eq(learnings.userId, userId))
      .orderBy(desc(learnings.createdAt)),
    getExpressHistory(userId).catch(() => []),
  ]);

  const allIds = rows.map((r: { id: string }) => r.id);
  const provenSet = allIds.length > 0
    ? await getProvenLearningIds(userId, allIds).catch(() => new Set<string>())
    : new Set<string>();
  const provenIds = new Set(provenSet);

  return (
    <ExpressClient
      learnings={rows}
      history={history}
      provenIds={Array.from(provenIds)}
    />
  );
}
