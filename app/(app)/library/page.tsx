'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, BookMarked, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { getLibraryData } from '@/lib/actions/insights';
import type { LearningWithMeta } from '@/lib/data/learnings';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function isNew(createdAt: Date | string) {
  return Date.now() - new Date(createdAt).getTime() < ONE_DAY_MS;
}

export default function LibraryPage() {
  const router = useRouter();
  const [learnings, setLearnings] = useState<LearningWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [topicFilter, setTopicFilter] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await getLibraryData();
      setLearnings(data);
    } catch (e) {
      console.error('[library] load error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh while any card is still processing.
  useEffect(() => {
    const hasProcessing = learnings.some((l) => (l as any).status === 'processing');
    if (!hasProcessing) return;
    const id = setInterval(() => load(), 3000);
    return () => clearInterval(id);
  }, [learnings, load]);

  const topics = Array.from(new Set(learnings.map((l) => l.topic).filter(Boolean) as string[])).sort();

  const filtered = learnings.filter((l) => {
    const matchSearch =
      !search ||
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.summary?.toLowerCase().includes(search.toLowerCase());
    const matchTopic = !topicFilter || l.topic === topicFilter;
    return matchSearch && matchTopic;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (learnings.length === 0) {
    return (
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
    );
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Library"
        subtitle={`${learnings.length} learning${learnings.length === 1 ? '' : 's'}`}
      />

      <div className="flex-1 overflow-auto px-4 py-6 md:px-8">
        <div className="mb-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {topics.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setTopicFilter(null)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  topicFilter === null
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                }`}
              >
                All
              </button>
              {topics.map((t) => (
                <button
                  key={t}
                  onClick={() => setTopicFilter(t)}
                  className={`px-3 py-1 rounded-full text-sm capitalize transition-colors ${
                    topicFilter === t
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {filtered.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No learnings match your search</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => {
              const processing = (item as any).status === 'processing';
              const failed = (item as any).status === 'failed';
              return (
                <Link key={item.id} href={`/library/${item.id}`} className="block no-underline">
                  <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-start gap-3">
                      {processing && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground flex-shrink-0 mt-1" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-base font-semibold text-foreground truncate">
                            {item.title}
                          </h3>
                          {isNew(item.createdAt) && !processing && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/15 text-primary uppercase tracking-wide flex-shrink-0">
                              New
                            </span>
                          )}
                          {failed && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-500/15 text-red-400 uppercase tracking-wide flex-shrink-0">
                              Failed
                            </span>
                          )}
                        </div>

                        {processing ? (
                          <p className="text-sm text-muted-foreground">Analyzing content…</p>
                        ) : (
                          <>
                            {item.summary && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                {item.summary}
                              </p>
                            )}
                            <div className="flex gap-1.5 flex-wrap">
                              {item.topic && (
                                <Badge variant="brand" className="text-xs">{item.topic}</Badge>
                              )}
                              {(item.tags ?? []).slice(0, 3).map((t) => (
                                <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                              ))}
                              {item.domain && (
                                <Badge variant="outline" className="text-xs text-muted-foreground">
                                  {item.domain}
                                </Badge>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground flex-shrink-0 pt-0.5">
                        {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
