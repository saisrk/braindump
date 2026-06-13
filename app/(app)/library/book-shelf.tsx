'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
// useState used by BookItem below
import { topicGradient } from '@/lib/book-colors';
import { useBookTransition } from '@/context/book-transition';
import type { LearningWithMeta } from '@/lib/data/learnings';

interface BookShelfProps {
  topic: string;
  learnings: LearningWithMeta[];
  highlightId?: string;
}

const BOOK_HEIGHTS = [158, 138, 170, 146, 162, 132, 152];

export function BookShelf({ topic, learnings, highlightId }: BookShelfProps) {
  const gradient = topicGradient(topic);
  const router = useRouter();
  const { setOrigin } = useBookTransition();

  const handleBookClick = (e: React.MouseEvent, learningId: string, bookEl: HTMLElement) => {
    e.preventDefault();
    const rect = bookEl.getBoundingClientRect();
    setOrigin({ gradient, rect });
    router.push(`/library/${learningId}`);
  };

  return (
    <div className="mb-0">
      <style>{`
        .book-tip {
          position: relative;
        }
        .book-tip::after {
          content: attr(data-tip);
          position: absolute;
          bottom: calc(100% + 10px);
          left: 50%;
          transform: translateX(-50%);
          background: #2a2620;
          color: #f5f2ec;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
          max-width: 180px;
          overflow: hidden;
          text-overflow: ellipsis;
          padding: 5px 10px;
          border-radius: 6px;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.15s ease, transform 0.15s ease;
          transform: translateX(-50%) translateY(4px);
          z-index: 50;
          box-shadow: 0 4px 12px rgba(0,0,0,.2);
        }
        .book-tip::before {
          content: '';
          position: absolute;
          bottom: calc(100% + 5px);
          left: 50%;
          transform: translateX(-50%) translateY(4px);
          border: 5px solid transparent;
          border-top-color: #2a2620;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.15s ease, transform 0.15s ease;
          z-index: 50;
        }
        .book-tip:hover::after,
        .book-tip:hover::before {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
        .book-opening {
          animation: book-pop 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes book-pop {
          0%   { transform: translateY(0) scale(1); }
          55%  { transform: translateY(-18px) scale(1.08); }
          100% { transform: translateY(-12px) scale(1.05); }
        }
        @keyframes book-highlight-ring {
          0%   { box-shadow: 0 0 0 0 rgba(181,70,47,.55), 0 8px 20px -6px rgba(42,38,32,.3); transform: translateY(-14px) scale(1.06); }
          60%  { box-shadow: 0 0 0 6px rgba(181,70,47,.12), 0 8px 20px -6px rgba(42,38,32,.3); }
          100% { box-shadow: 0 0 0 0 rgba(181,70,47,0), 0 2px 8px -4px rgba(42,38,32,.2); transform: translateY(0) scale(1); }
        }
        .book-new {
          animation: book-highlight-ring 1.4s cubic-bezier(0.22,1,0.36,1) 0.3s both;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Shelf header */}
      {(() => {
        const isSampleShelf = learnings.every((l) => l.sourceType === 'sample');
        return (
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-display font-semibold text-foreground" style={{ fontSize: '16px' }}>
                {topic}
              </h3>
              {isSampleShelf && (
                <span
                  className="text-xs font-semibold rounded-full px-2 py-0.5"
                  style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    background: 'rgba(199,154,62,0.15)',
                    color: '#c79a3e',
                    border: '1px solid rgba(199,154,62,0.35)',
                    letterSpacing: '0.03em',
                  }}
                >
                  Sample
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{learnings.length} vol{learnings.length !== 1 ? 's' : ''}</span>
          </div>
        );
      })()}

      {/* Books row */}
      <div
        className="flex flex-wrap items-end gap-2 px-4 pt-4 pb-0 rounded-t-xl border border-b-0"
        style={{
          background: 'linear-gradient(180deg, var(--color-background), var(--color-card))',
          borderColor: 'var(--color-border)',
          minHeight: '100px',
          overflow: 'visible',
        }}
      >
        {learnings.map((learning, i) => {
          const height = BOOK_HEIGHTS[i % BOOK_HEIGHTS.length];
          const hasDue = learning.dueCount > 0;
          const isNew = highlightId === learning.id;
          return (
            <BookItem
              key={learning.id}
              learning={learning}
              height={height}
              gradient={gradient}
              hasDue={hasDue}
              isNew={isNew}
              onOpen={handleBookClick}
            />
          );
        })}

        {/* Empty "add" slot */}
        <a
          href="/capture"
          className="no-underline book-tip"
          data-tip="Add a learning"
          style={{ display: 'block' }}
        >
          <div
            className="flex items-center justify-center rounded"
            style={{
              width: '44px',
              height: '110px',
              border: '2px dashed var(--color-border)',
              color: 'var(--color-muted-foreground)',
              fontSize: '20px',
              background: 'transparent',
            }}
          >
            +
          </div>
        </a>
      </div>

      {/* Shelf board */}
      <div className="shelf-board" />
    </div>
  );
}

/* ── Separate child so we can get a stable ref per book ────────────────────── */

interface BookItemProps {
  learning: LearningWithMeta;
  height: number;
  gradient: string;
  hasDue: boolean;
  isNew: boolean;
  onOpen: (e: React.MouseEvent, id: string, el: HTMLElement) => void;
}

function BookItem({ learning, height, gradient, hasDue, isNew, onOpen }: BookItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [popping, setPopping] = useState(false);
  const isProcessing = (learning as { status?: string }).status === 'processing';

  const handleClick = (e: React.MouseEvent) => {
    if (!ref.current) return;
    setPopping(true);
    onOpen(e, learning.id, ref.current);
  };

  return (
    <div
      ref={ref}
      data-learning-id={learning.id}
      className={`no-underline book-tip${popping ? ' book-opening' : ''}${isNew ? ' book-new' : ''}`}
      data-tip={isProcessing ? 'Reading…' : learning.title}
      onClick={handleClick}
      style={{ cursor: 'pointer', display: 'block', position: 'relative' }}
    >
      <div
        className="book"
        style={{ width: '44px', height: `${height}px`, background: gradient, opacity: isProcessing ? 0.7 : 1 }}
      >
        {hasDue && !isProcessing && <div className="book-ribbon" />}
        {isProcessing && (
          <div style={{ position: 'absolute', top: '8px', left: '50%', transform: 'translateX(-50%)', width: '12px', height: '12px', borderRadius: '50%', border: '2px solid rgba(255,255,255,.25)', borderTopColor: 'rgba(255,255,255,.85)', animation: 'spin 0.8s linear infinite' }} />
        )}
        {learning.sourceType === 'sample' && (
          <div
            style={{
              position: 'absolute', bottom: '6px', left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(255,255,255,0.22)', color: 'rgba(255,255,255,0.9)',
              fontSize: '7px', fontWeight: 700, fontFamily: 'Inter, system-ui, sans-serif',
              letterSpacing: '0.08em', padding: '2px 5px', borderRadius: '3px',
              whiteSpace: 'nowrap', pointerEvents: 'none',
            }}
          >
            SAMPLE
          </div>
        )}
        <span>{learning.title}</span>
      </div>
    </div>
  );
}
