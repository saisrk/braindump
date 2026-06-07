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
    <div className="mb-8">
      {/* Shelf header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-semibold text-foreground" style={{ fontSize: '18px' }}>
          {topic}
        </h3>
        <span className="text-xs text-muted-foreground">{learnings.length} volume{learnings.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Books row */}
      <div
        className="flex items-end gap-3 px-5 pt-5 pb-0 rounded-t-2xl border border-b-0"
        style={{
          background: 'linear-gradient(180deg, var(--color-background), #ffffff)',
          borderColor: 'var(--color-border)',
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
                style={{ width: '52px', height: `${height}px`, background: gradient }}
              >
                {hasDue && <div className="book-ribbon" />}
                <span>{learning.title}</span>
              </div>
            </Link>
          );
        })}

        {/* Empty "add" slot */}
        <Link href="/capture" className="no-underline" title="Capture a new learning">
          <div
            className="flex items-center justify-center rounded"
            style={{
              width: '52px',
              height: '130px',
              border: '2px dashed var(--color-border)',
              color: 'var(--color-muted-foreground)',
              fontSize: '22px',
              background: 'var(--color-card)',
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
