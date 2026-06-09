import { requireUserId } from '@/lib/session';
import { db } from '@/db';
import { learnings } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { ExpressClient } from './client';

export default async function ExpressPage() {
  const userId = await requireUserId();

  const rows = await db
    .select({ id: learnings.id, title: learnings.title, topic: learnings.topic })
    .from(learnings)
    .where(eq(learnings.userId, userId))
    .orderBy(desc(learnings.createdAt));

  return <ExpressClient learnings={rows} />;
}
