import Link from 'next/link';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { requireUserId } from '@/lib/session';
import { listLearnings } from '@/lib/data/learnings';
import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { BookShelf } from './book-shelf';
import { LibraryCardList } from './library-card-list';
import { groupSimilarTopics } from '@/lib/ai/topic-groups';
import type { LearningWithMeta } from '@/lib/data/learnings';

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const params = await searchParams;
  const search = params.search?.trim() ?? '';

  try {
    const userId = await requireUserId();
    const data = await listLearnings(userId, { search, sort: 'recent' });

    // Collect raw topic names, then ask AI to merge similar ones
    const rawTopics = [...new Set(data.map((item) => item.topic?.trim() || 'Uncategorised'))];
    const topicMap = rawTopics.length > 1
      ? await groupSimilarTopics(rawTopics).catch(() => new Map(rawTopics.map((t) => [t, t])))
      : new Map(rawTopics.map((t) => [t, t]));

    // Group learnings under canonical topic names
    const grouped = new Map<string, LearningWithMeta[]>();
    for (const item of data) {
      const raw = item.topic?.trim() || 'Uncategorised';
      const key = topicMap.get(raw) ?? raw;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(item);
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

          {/* Search bar */}
          <div className="relative mb-8 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <form>
              <input
                name="search"
                defaultValue={search}
                placeholder="Search your shelves…"
                className="w-full rounded-lg border border-border bg-card pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </form>
          </div>

          {isEmpty ? (
            /* Empty state — dashed shelf slots */
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
          ) : search ? (
            /* Search results — flat card list */
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                {data.length} result{data.length !== 1 ? 's' : ''} for &ldquo;{search}&rdquo;
                {' · '}
                <Link href="/library" className="text-primary hover:underline">Clear</Link>
              </p>
              {data.length === 0 ? (
                <p className="text-center text-muted-foreground py-16">No learnings match this search.</p>
              ) : (
                <LibraryCardList items={data} />
              )}
            </div>
          ) : (
            /* Bookshelf view grouped by topic — 2-column grid */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', alignItems: 'start' }}>
              {Array.from(grouped.entries()).map(([topic, items]) => (
                <BookShelf key={topic} topic={topic} learnings={items} />
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
