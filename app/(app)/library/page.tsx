import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { requireUserId } from '@/lib/session';
import { listLearnings, getUserFacets } from '@/lib/data/learnings';
import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { BookShelf } from './book-shelf';
import { LibraryCardList } from './library-card-list';
import { LibraryFilters } from './library-filters';
import { groupSimilarTopics } from '@/lib/ai/topic-groups';
import { NewLearningHighlight } from './new-learning-highlight';
import type { LearningWithMeta } from '@/lib/data/learnings';
import { db } from '@/db';
import { learnings as learningsTable } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

type Sort = 'recent' | 'due' | 'confidence';

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; topic?: string; tag?: string; sort?: string; new?: string }>;
}) {
  const params = await searchParams;
  const search = params.search?.trim() ?? '';
  const topic = params.topic?.trim() ?? '';
  const tag = params.tag?.trim() ?? '';
  const sort = (['recent', 'due', 'confidence'].includes(params.sort ?? '') ? params.sort : 'recent') as Sort;
  const newId = params.new?.trim() ?? '';

  // Any active filter besides sort → show flat card list (filters + bookshelf don't mix well)
  const isFiltered = !!(search || topic || tag);

  try {
    const userId = await requireUserId();

    const [data, facets] = await Promise.all([
      listLearnings(userId, { search, topic, tag, sort }),
      getUserFacets(userId),
    ]);

    // Check enrichment status for the newly captured learning
    let newIsProcessing = false;
    if (newId) {
      const [row] = await db
        .select({ status: learningsTable.status })
        .from(learningsTable)
        .where(and(eq(learningsTable.id, newId), eq(learningsTable.userId, userId)));
      newIsProcessing = row?.status === 'processing';
    }

    // Bookshelf view: AI-merge similar topic names, then group
    let grouped = new Map<string, LearningWithMeta[]>();
    if (!isFiltered) {
      const rawTopics = [...new Set(data.map((item) => item.topic?.trim() || 'Uncategorised'))];
      const topicMap = rawTopics.length > 1
        ? await groupSimilarTopics(userId, rawTopics).catch(() => new Map(rawTopics.map((t) => [t, t])))
        : new Map(rawTopics.map((t) => [t, t]));

      for (const item of data) {
        const raw = item.topic?.trim() || 'Uncategorised';
        const key = topicMap.get(raw) ?? raw;
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)!.push(item);
      }
    }

    const isEmpty = data.length === 0;

    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto px-4 pt-6 pb-8 md:px-8">
          <PageHeader
            eyebrow="Library"
            title="Your Shelves"
            subtitle="Each learning, bound and kept where you can find it"
            className="mb-6"
          />

            {newId && (
            <NewLearningHighlight newId={newId} isProcessing={newIsProcessing} />
          )}

        <LibraryFilters
            facets={facets}
            currentSearch={search}
            currentTopic={topic}
            currentTag={tag}
            currentSort={sort}
          />

          {isEmpty ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center min-h-80 text-center rounded-2xl border-2 border-dashed border-border" style={{ background: 'linear-gradient(180deg,var(--color-card),var(--color-background))' }}>
              <div className="flex gap-3 items-end mb-6">
                {[120, 100, 130, 110, 120].map((h, i) => (
                  <div
                    key={i}
                    className="rounded flex-shrink-0"
                    style={{ width: '44px', height: `${h}px`, border: '2px dashed var(--color-border)' }}
                  />
                ))}
              </div>
              <h3 className="font-display font-bold text-2xl text-foreground mb-2">Your shelf is empty</h3>
              <p className="text-muted-foreground text-sm mb-6">Capture your first learning and watch it become a book.</p>
              <Link href="/capture">
                <Button>＋ Shelve your first learning</Button>
              </Link>
            </div>
          ) : isFiltered ? (
            /* Filtered — flat card list */
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                {data.length} result{data.length !== 1 ? 's' : ''}
                {search && <> for &ldquo;{search}&rdquo;</>}
                {(search || topic || tag) && (
                  <>
                    {' · '}
                    <Link href="/library" className="text-primary hover:underline">Clear filters</Link>
                  </>
                )}
              </p>
              <LibraryCardList items={data} />
            </div>
          ) : (
            /* Bookshelf view grouped by topic — 2-column grid */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', alignItems: 'start' }}>
              {Array.from(grouped.entries()).map(([t, items]) => (
                <BookShelf key={t} topic={t} learnings={items} highlightId={newId} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  } catch (e) {
    if (isRedirectError(e)) throw e;
    redirect('/login');
  }
}
