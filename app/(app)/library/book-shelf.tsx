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
        }}
      >
        {learnings.map((learning, i) => {
          const height = BOOK_HEIGHTS[i % BOOK_HEIGHTS.length];
          const hasDue = learning.dueCount > 0;
          return (
            <Link
              key={learning.id}
              href={`/library/${learning.id}`}
              className="no-underline"
              title={learning.title}
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
        <Link href="/capture" className="no-underline" title="Add to this shelf">
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
