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

const selectClass =
  'h-9 rounded-none border border-border bg-input text-foreground text-sm px-3 pr-8 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors hover:border-primary/50 min-w-0';

export function LibraryFilters({ facets, currentSearch, currentTopic, currentTag, currentSort }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(currentSearch);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const buildUrl = useCallback(
    (overrides: Record<string, string>) => {
      const p = new URLSearchParams();
      const vals = { search, topic: currentTopic, tag: currentTag, sort: currentSort, ...overrides };
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

  return (
    <div className="mb-5 space-y-2">
      {/* Row 1: search + dropdowns */}
      <div className="flex gap-2 items-center">
        {/* Search — grows to fill space */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {/* Sort dropdown */}
        <div className="relative flex-shrink-0">
          <select
            value={currentSort}
            onChange={(e) => router.push(buildUrl({ sort: e.target.value }))}
            className={selectClass}
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235e93a0' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
          >
            <option value="recent">Recent</option>
            <option value="due">Due first</option>
            <option value="confidence">Weakest first</option>
          </select>
        </div>

        {/* Topic dropdown */}
        {facets.topics.length > 0 && (
          <div className="relative flex-shrink-0">
            <select
              value={currentTopic}
              onChange={(e) => router.push(buildUrl({ topic: e.target.value, tag: '' }))}
              className={selectClass}
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235e93a0' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
            >
              <option value="">All topics</option>
              {facets.topics.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        )}

        {/* Tag dropdown */}
        {facets.tags.length > 0 && (
          <div className="relative flex-shrink-0">
            <select
              value={currentTag}
              onChange={(e) => router.push(buildUrl({ tag: e.target.value }))}
              className={selectClass}
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235e93a0' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
            >
              <option value="">All tags</option>
              {facets.tags.map((t) => (
                <option key={t} value={t}>#{t}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Active filter pills — show what's currently selected for easy removal */}
      {(currentTopic || currentTag || currentSort !== 'recent') && (
        <div className="flex gap-2 flex-wrap">
          {currentSort !== 'recent' && (
            <button
              onClick={() => router.push(buildUrl({ sort: 'recent' }))}
              className="flex items-center gap-1 px-2 py-0.5 text-xs rounded border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              {currentSort === 'due' ? 'Due first' : 'Weakest first'} ×
            </button>
          )}
          {currentTopic && (
            <button
              onClick={() => router.push(buildUrl({ topic: '', tag: '' }))}
              className="flex items-center gap-1 px-2 py-0.5 text-xs rounded border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              {currentTopic} ×
            </button>
          )}
          {currentTag && (
            <button
              onClick={() => router.push(buildUrl({ tag: '' }))}
              className="flex items-center gap-1 px-2 py-0.5 text-xs rounded border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              #{currentTag} ×
            </button>
          )}
        </div>
      )}
    </div>
  );
}
