import Link from 'next/link';
import { BookMarked } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { requireUserId } from '@/lib/session';
import { listLearnings, getUserFacets } from '@/lib/data/learnings';
import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { LibraryFilters } from './library-filters';
import { LibraryCardList } from './library-card-list';

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; topic?: string; tag?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const sort = (params.sort as 'recent' | 'due' | 'confidence') ?? 'recent';

  try {
    const userId = await requireUserId();
    const [data, facets] = await Promise.all([
      listLearnings(userId, {
        search: params.search,
        topic: params.topic,
        tag: params.tag,
        sort,
      }),
      getUserFacets(userId),
    ]);

    const isFiltered = !!(params.search || params.topic || params.tag);

    return (
      <div className="flex flex-col h-full">
        <PageHeader
          title="Library"
          subtitle={`${data.length} learning${data.length === 1 ? '' : 's'}`}
        />

        <div className="flex-1 overflow-auto px-4 py-6 md:px-8">
          <LibraryFilters
            facets={facets}
            currentSearch={params.search ?? ''}
            currentTopic={params.topic ?? ''}
            currentTag={params.tag ?? ''}
            currentSort={sort}
          />

          {data.length === 0 ? (
            isFiltered ? (
              <div className="mt-8 text-center space-y-3">
                <p className="text-muted-foreground">No learnings match these filters.</p>
                <Link href="/library" className="text-sm text-primary hover:underline">
                  Clear filters
                </Link>
              </div>
            ) : (
              <EmptyState
                icon={<BookMarked className="h-12 w-12" />}
                title="Your library is empty"
                description="Start by capturing your first learning"
                action={
                  <Link href="/capture">
                    <Button>New Learning</Button>
                  </Link>
                }
              />
            )
          ) : (
            <LibraryCardList items={data} />
          )}
        </div>
      </div>
    );
  } catch (e) {
    if (isRedirectError(e)) throw e;
    redirect('/login');
  }
}
