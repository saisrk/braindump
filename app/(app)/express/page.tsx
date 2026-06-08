import { PageHeader } from '@/components/ui/page-header';
import { requireUserId } from '@/lib/session';
import { getUserFacets } from '@/lib/data/learnings';
import { getExpressHistory } from '@/lib/data/express';
import { ExpressClient } from './client';

export default async function ExpressPage() {
  const userId = await requireUserId();

  const [facets, history] = await Promise.all([
    getUserFacets(userId),
    getExpressHistory(userId),
  ]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-8 md:px-8">
        <PageHeader
          eyebrow="Express"
          title="Turn your shelves into content"
          subtitle="Pull your learnings back out, articulated and ready"
          className="mb-6"
        />
        <ExpressClient topics={facets.topics} history={history} />
      </div>
    </div>
  );
}
