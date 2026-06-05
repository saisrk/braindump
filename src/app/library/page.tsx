'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import LearningCard from '@/components/LearningCard';

export default function LibraryPage() {
  const { learnings, teachBacks } = useStore();

  const latestScoreByLearning = teachBacks.reduce<Record<string, number>>((acc, tb) => {
    if (!(tb.learningId in acc)) acc[tb.learningId] = tb.score;
    return acc;
  }, {});
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Collect all unique tags
  const allTags = Array.from(new Set(learnings.flatMap((l) => l.tags))).sort();

  const filtered = learnings.filter((l) => {
    const matchesSearch =
      search.trim() === '' ||
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())) ||
      l.summary.toLowerCase().includes(search.toLowerCase());

    const matchesTag = activeTag === null || l.tags.includes(activeTag);

    return matchesSearch && matchesTag;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Library</h1>
        <p className="text-sm text-slate-500 mt-1">
          {learnings.length} learning{learnings.length === 1 ? '' : 's'} saved
        </p>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by title, tag, or content..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 text-sm"
      />

      {/* Tag filter chips */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTag(null)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              activeTag === null
                ? 'bg-violet-600 border-violet-500 text-white'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                activeTag === tag
                  ? 'bg-violet-600 border-violet-500 text-white'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-600 text-sm">
          No learnings match your search.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((learning) => (
            <LearningCard
                key={learning.id}
                learning={learning}
                lastTeachBackScore={latestScoreByLearning[learning.id]}
              />
          ))}
        </div>
      )}
    </div>
  );
}
