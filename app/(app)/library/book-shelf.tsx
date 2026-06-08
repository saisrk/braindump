import Link from 'next/link';
import { topicGradient } from '@/lib/book-colors';
import type { LearningWithMeta } from '@/lib/data/learnings';

interface BookShelfProps {
  topic: string;
  learnings: LearningWithMeta[];
}

const BOOK_HEIGHTS = [158, 138, 170, 146, 162, 132, 152];

export function BookShelf({ topic, learnings }: BookShelfProps) {
  const gradient = topicGradient(topic);

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
      `}</style>

      {/* Shelf header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-semibold text-foreground" style={{ fontSize: '16px' }}>
          {topic}
        </h3>
        <span className="text-xs text-muted-foreground">{learnings.length} vol{learnings.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Books row — wraps if many books */}
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
            <Link
              key={learning.id}
              href={`/library/${learning.id}`}
              className="no-underline book-tip"
              data-tip={learning.title}
            >
              <div
                className="book"
                style={{ width: '44px', height: `${height}px`, background: gradient }}
              >
                {hasDue && <div className="book-ribbon" />}
                <span>{learning.title}</span>
              </div>
            </Link>
          );
        })}

        {/* Empty "add" slot */}
        <Link href="/capture" className="no-underline book-tip" data-tip="Add a learning">
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
        </Link>
      </div>

      {/* Shelf board */}
      <div className="shelf-board" />
    </div>
  );
}
