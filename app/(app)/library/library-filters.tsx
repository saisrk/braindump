'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

type Sort = 'recent' | 'due' | 'confidence';

interface Facets {
  topics: string[];
  tags: string[];
}

interface Props {
  facets: Facets;
  currentSearch: string;
  currentTopic: string;
  currentTag: string;
  currentSort: Sort;
}

const SORT_OPTIONS: { value: Sort; label: string }[] = [
  { value: 'recent', label: 'Recent' },
  { value: 'due', label: 'Due first' },
  { value: 'confidence', label: 'Weakest first' },
];

export function LibraryFilters({ facets, currentSearch, currentTopic, currentTag, currentSort }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(currentSearch);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const buildUrl = useCallback(
    (overrides: Record<string, string>) => {
      const p = new URLSearchParams();
      const vals = {
        search,
        topic: currentTopic,
        tag: currentTag,
        sort: currentSort,
        ...overrides,
      };
      if (vals.search) p.set('search', vals.search);
      if (vals.topic) p.set('topic', vals.topic);
      if (vals.tag) p.set('tag', vals.tag);
      if (vals.sort && vals.sort !== 'recent') p.set('sort', vals.sort);
      const qs = p.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [pathname, search, currentTopic, currentTag, currentSort]
  );

  // Debounced search → URL update
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (search !== currentSearch) {
        router.push(buildUrl({ search }));
      }
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  function setTopic(t: string) {
    router.push(buildUrl({ topic: t, tag: '' }));
  }

  function setTag(t: string) {
    router.push(buildUrl({ tag: t }));
  }

  function setSort(s: Sort) {
    router.push(buildUrl({ sort: s }));
  }

  // Tags visible in the current topic context
  const visibleTags = facets.tags;

  return (
    <div className="mb-6 space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Sort */}
      <div className="flex gap-2">
        {SORT_OPTIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => setSort(o.value)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              currentSort === o.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* Topic chips */}
      {facets.topics.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setTopic('')}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              !currentTopic
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            All topics
          </button>
          {facets.topics.map((t) => (
            <button
              key={t}
              onClick={() => setTopic(currentTopic === t ? '' : t)}
              className={`px-3 py-1 rounded-full text-sm capitalize transition-colors ${
                currentTopic === t
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Tag chips — shown below topics */}
      {visibleTags.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {visibleTags.map((t) => (
            <button
              key={t}
              onClick={() => setTag(currentTag === t ? '' : t)}
              className={`px-3 py-1 rounded-full text-xs transition-colors border ${
                currentTag === t
                  ? 'border-primary/60 bg-primary/10 text-primary'
                  : 'border-border bg-background text-muted-foreground hover:text-foreground'
              }`}
            >
              #{t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
