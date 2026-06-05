'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { ReviewItem } from '@/lib/types';
import Link from 'next/link';

function FlashCard({
  item,
  onRate,
}: {
  item: ReviewItem;
  onRate: (rating: number) => void;
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="space-y-4">
      {/* Card */}
      <div
        className="card-flip cursor-pointer"
        style={{ minHeight: 220 }}
        onClick={() => setFlipped((f) => !f)}
      >
        <div className={`card-flip-inner ${flipped ? 'flipped' : ''}`} style={{ minHeight: 220 }}>
          {/* Front */}
          <div className="card-face bg-slate-900 border border-slate-700 rounded-2xl p-6 flex flex-col justify-between" style={{ minHeight: 220 }}>
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">
              {item.type === 'flashcard' ? 'Flashcard' : 'Quiz'}
            </div>
            <p className="text-slate-100 text-lg font-medium leading-snug flex-1 flex items-center">
              {item.question}
            </p>
            <div className="text-xs text-slate-600 mt-4 text-center">Tap to reveal answer</div>
          </div>

          {/* Back */}
          <div className="card-face card-back bg-violet-950 border border-violet-700 rounded-2xl p-6 flex flex-col justify-between" style={{ minHeight: 220 }}>
            <div className="text-xs text-violet-400 uppercase tracking-wider mb-2">Answer</div>
            <p className="text-slate-100 text-base leading-relaxed flex-1 flex items-center">
              {item.answer}
            </p>
            <div className="text-xs text-violet-500 mt-4 text-center">Rate your recall below</div>
          </div>
        </div>
      </div>

      {/* Rating buttons — only show after flip */}
      {flipped && (
        <div className="space-y-2">
          <p className="text-xs text-slate-500 text-center">How well did you remember?</p>
          <div className="flex gap-2 justify-center">
            {[
              { rating: 1, label: 'Blackout', color: 'bg-red-900 hover:bg-red-800 border-red-700 text-red-300' },
              { rating: 2, label: 'Hard', color: 'bg-orange-900 hover:bg-orange-800 border-orange-700 text-orange-300' },
              { rating: 3, label: 'OK', color: 'bg-yellow-900 hover:bg-yellow-800 border-yellow-700 text-yellow-300' },
              { rating: 4, label: 'Good', color: 'bg-green-900 hover:bg-green-800 border-green-700 text-green-300' },
              { rating: 5, label: 'Perfect', color: 'bg-emerald-900 hover:bg-emerald-800 border-emerald-700 text-emerald-300' },
            ].map(({ rating, label, color }) => (
              <button
                key={rating}
                onClick={() => onRate(rating)}
                className={`flex-1 border rounded-xl py-2 text-xs font-semibold transition-colors ${color}`}
              >
                <div className="text-base leading-none mb-0.5">{rating}</div>
                <div>{label}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReviewPage() {
  const { reviewItems, updateReviewItem } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  const dueItems = reviewItems.filter(
    (r) => new Date(r.dueDate) <= new Date()
  );

  const handleRate = (rating: number) => {
    const item = dueItems[currentIndex];
    updateReviewItem(item.id, rating);
    setReviewedCount((c) => c + 1);

    if (currentIndex + 1 >= dueItems.length) {
      setSessionComplete(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  if (dueItems.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Review</h1>
          <p className="text-sm text-slate-500 mt-1">Spaced repetition session</p>
        </div>
        <div className="text-center py-20 space-y-4">
          <div className="text-5xl">✓</div>
          <p className="text-slate-300 font-medium text-lg">All caught up!</p>
          <p className="text-slate-500 text-sm">No reviews are due right now.</p>
          <Link href="/capture">
            <button className="mt-4 bg-violet-600 hover:bg-violet-500 text-white px-6 py-2 rounded-xl text-sm font-semibold transition-colors">
              Capture something new
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Review</h1>
        </div>
        <div className="text-center py-20 space-y-4">
          <div className="text-5xl">🎉</div>
          <p className="text-slate-100 font-bold text-xl">Session complete!</p>
          <p className="text-slate-400 text-sm">
            You reviewed {reviewedCount} item{reviewedCount === 1 ? '' : 's'}.
          </p>
          <Link href="/">
            <button className="mt-4 bg-violet-600 hover:bg-violet-500 text-white px-6 py-2 rounded-xl text-sm font-semibold transition-colors">
              Back to Today
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const current = dueItems[currentIndex];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Review</h1>
          <p className="text-sm text-slate-500 mt-1">
            {currentIndex + 1} of {dueItems.length}
          </p>
        </div>
        <div className="text-xs text-slate-500 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1">
          {dueItems.length - currentIndex} remaining
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-violet-500 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex) / dueItems.length) * 100}%` }}
        />
      </div>

      {/* Card */}
      <FlashCard key={current.id} item={current} onRate={handleRate} />
    </div>
  );
}
