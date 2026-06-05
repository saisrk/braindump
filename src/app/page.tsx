'use client';

import Link from 'next/link';
import { useStore } from '@/lib/store';
import StreakBadge from '@/components/StreakBadge';
import LearningCard from '@/components/LearningCard';

export default function HomePage() {
  const { learnings, reviewItems, streak } = useStore();

  const today = new Date().toDateString();
  const todayLearnings = learnings.filter(
    (l) => new Date(l.createdAt).toDateString() === today
  );

  const dueCount = reviewItems.filter(
    (r) => new Date(r.dueDate) <= new Date()
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Today</h1>
        <p className="text-sm text-slate-500 mt-1">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Streak */}
      <StreakBadge streak={streak} />

      {/* Due reviews */}
      <Link href="/review">
        <div className={`rounded-xl border px-4 py-3 flex items-center justify-between transition-colors ${
          dueCount > 0
            ? 'bg-violet-950 border-violet-700 hover:bg-violet-900'
            : 'bg-slate-900 border-slate-800 hover:bg-slate-800'
        }`}>
          <div>
            <div className="text-sm font-semibold text-slate-200">
              {dueCount > 0 ? `${dueCount} item${dueCount === 1 ? '' : 's'} due for review` : 'No reviews due'}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {dueCount > 0 ? 'Tap to start your review session' : "You're all caught up!"}
            </div>
          </div>
          <span className="text-violet-400 text-xl">{dueCount > 0 ? '→' : '✓'}</span>
        </div>
      </Link>

      {/* Primary CTA */}
      <Link href="/capture">
        <button className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-4 rounded-xl text-base transition-colors shadow-lg shadow-violet-900/40">
          + Capture something new
        </button>
      </Link>

      {/* Today's captures */}
      <div>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Captured today
        </h2>
        {todayLearnings.length === 0 ? (
          <div className="text-center py-10 text-slate-600 text-sm">
            Nothing captured yet today. Start learning!
          </div>
        ) : (
          <div className="space-y-3">
            {todayLearnings.map((learning) => (
              <LearningCard key={learning.id} learning={learning} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
