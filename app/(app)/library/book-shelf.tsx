'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { topicGradient } from '@/lib/book-colors';
import type { LearningWithMeta } from '@/lib/data/learnings';

interface BookShelfProps {
  topic: string;
  learnings: LearningWithMeta[];
}

const BOOK_HEIGHTS = [158, 138, 170, 146, 162, 132, 152];

type OverlayPhase = 'standing' | 'opening';

interface OverlayState {
  gradient: string;
  /** clip-path when the book is still just a rect on the shelf */
  clipBook: string;
  /** clip-path after vertical expansion — full-height strip at book position */
  clipStanding: string;
  phase: OverlayPhase;
  /** book's left edge in px — spine stays here */
  spineLeft: number;
  /** book's width in px — spine width at the start */
  bookWidth: number;
}

export function BookShelf({ topic, learnings }: BookShelfProps) {
  const gradient = topicGradient(topic);
  const router = useRouter();
  const [overlay, setOverlay] = useState<OverlayState | null>(null);

  const handleBookClick = (e: React.MouseEvent, learningId: string, bookEl: HTMLElement) => {
    e.preventDefault();

    const rect = bookEl.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Phase 1 target: full-height strip at the book's horizontal position
    const clipStanding = `inset(0px ${vw - rect.right}px 0px ${rect.left}px)`;
    // Starting clip: exact book rect
    const clipBook = `inset(${rect.top}px ${vw - rect.right}px ${vh - rect.bottom}px ${rect.left}px round 3px)`;

    setOverlay({
      gradient,
      clipBook,
      clipStanding,
      phase: 'standing',
      spineLeft: rect.left,
      bookWidth: rect.width,
    });

    // Phase 2: expand to full screen after vertical expansion completes
    setTimeout(() => {
      setOverlay((prev) => (prev ? { ...prev, phase: 'opening' } : null));
    }, 230);

    setTimeout(() => {
      router.push(`/library/${learningId}`);
    }, 620);
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
          return (
            <BookItem
              key={learning.id}
              learning={learning}
              height={height}
              gradient={gradient}
              hasDue={hasDue}
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

      {/* Book-opening transition overlay */}
      {overlay && typeof document !== 'undefined' &&
        createPortal(
          <BookOpenOverlay overlay={overlay} />,
          document.body
        )
      }
    </div>
  );
}

/* ── Overlay rendered as a separate component for clean state ──────────────── */

function BookOpenOverlay({ overlay }: { overlay: OverlayState }) {
  const { gradient, clipBook, clipStanding, phase, spineLeft, bookWidth } = overlay;
  const isOpening = phase === 'opening';

  // Spine width: starts as the full book width, shrinks to a narrow strip as pages open
  const spineWidth = isOpening ? 52 : bookWidth;
  // Pages (cream area) start at 0 width and expand to fill the rest of the viewport
  // Left cream (back cover area) appears simultaneously
  const pagesBg = '#f5f2ec';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: 'none',
        // Phase 1: expand vertically to full-height strip at book position
        // Phase 2: expand horizontally to full viewport
        clipPath: isOpening ? 'inset(0px round 0px)' : clipStanding,
        transition: isOpening
          ? 'clip-path 0.36s cubic-bezier(0.4, 0, 0.2, 1)'
          : `clip-path 0.2s cubic-bezier(0.4, 0, 0.2, 1)`,
        // On mount: start at book rect, immediately transition to clipStanding
        // We use a CSS animation trick: the element mounts with clipBook, then
        // the browser paints it, and the transition to clipStanding fires.
        animation: 'book-stand 0.22s cubic-bezier(0.4, 0, 0.2, 1) forwards',
      }}
    >
      <style>{`
        @keyframes book-stand {
          from { clip-path: ${clipBook}; }
          to   { clip-path: ${clipStanding}; }
        }
      `}</style>

      {/* Cream back-cover — fills left of spine */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: `calc(100% - ${spineLeft}px)`,
          background: pagesBg,
          opacity: isOpening ? 1 : 0,
          transition: isOpening ? 'opacity 0.1s ease' : 'none',
        }}
      />

      {/* Spine — gradient strip, stays at book's original left edge */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: spineLeft,
          width: spineWidth,
          background: gradient,
          boxShadow: isOpening ? '6px 0 24px rgba(0,0,0,0.22), -2px 0 8px rgba(0,0,0,0.08)' : 'none',
          transition: isOpening ? 'width 0.32s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease' : 'none',
          zIndex: 1,
        }}
      />

      {/* Pages — cream area to the right of spine */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: spineLeft + spineWidth,
          right: 0,
          background: pagesBg,
          // Subtle ruled-paper texture
          backgroundImage:
            'repeating-linear-gradient(transparent, transparent 27px, rgba(42,38,32,0.045) 27px, rgba(42,38,32,0.045) 28px)',
          backgroundPosition: '0 44px',
          opacity: isOpening ? 1 : 0,
          transition: isOpening ? 'opacity 0.15s ease 0.05s, left 0.32s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
          zIndex: 0,
        }}
      />
    </div>
  );
}

/* ── Separate child so we can get a stable ref per book ────────────────────── */

interface BookItemProps {
  learning: LearningWithMeta;
  height: number;
  gradient: string;
  hasDue: boolean;
  onOpen: (e: React.MouseEvent, id: string, el: HTMLElement) => void;
}

function BookItem({ learning, height, gradient, hasDue, onOpen }: BookItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [popping, setPopping] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (!ref.current) return;
    setPopping(true);
    onOpen(e, learning.id, ref.current);
  };

  return (
    <div
      ref={ref}
      className={`no-underline book-tip${popping ? ' book-opening' : ''}`}
      data-tip={learning.title}
      onClick={handleClick}
      style={{ cursor: 'pointer', display: 'block' }}
    >
      <div
        className="book"
        style={{ width: '44px', height: `${height}px`, background: gradient }}
      >
        {hasDue && <div className="book-ribbon" />}
        {learning.sourceType === 'sample' && (
          <div
            style={{
              position: 'absolute',
              bottom: '6px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(255,255,255,0.22)',
              color: 'rgba(255,255,255,0.9)',
              fontSize: '7px',
              fontWeight: 700,
              fontFamily: 'Inter, system-ui, sans-serif',
              letterSpacing: '0.08em',
              padding: '2px 5px',
              borderRadius: '3px',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
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
