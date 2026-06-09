import { PageHeader } from '@/components/ui/page-header';
import { requireUserId } from '@/lib/session';
import { db } from '@/db';
import { learnings } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getExpressHistory } from '@/lib/data/express';
import { ExpressClient } from './client';

export default async function ExpressPage() {
  const userId = await requireUserId();

  const [rows, history] = await Promise.all([
    db
      .select({ id: learnings.id, title: learnings.title, topic: learnings.topic })
      .from(learnings)
      .where(eq(learnings.userId, userId))
      .orderBy(desc(learnings.createdAt)),
    getExpressHistory(userId),
  ]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-8 md:px-8">
        <PageHeader
          eyebrow="Express"
          title="Turn your shelves into content"
          subtitle="Choose what to express, then pick a format"
          className="mb-6"
        />
        <ExpressClient learnings={rows} history={history} />
      </div>
    </div>
  );
}
