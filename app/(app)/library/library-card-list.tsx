import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { LearningWithMeta } from '@/lib/data/learnings';
import { confidenceLabel } from '@/lib/sr';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function isNew(createdAt: Date | string) {
  return Date.now() - new Date(createdAt).getTime() < ONE_DAY_MS;
}

function ConfidenceDot({ score }: { score: number }) {
  const label = confidenceLabel(score);
  const color =
    label === 'High'
      ? 'bg-green-500'
      : label === 'Medium'
      ? 'bg-amber-500'
      : 'bg-red-400';
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${color}`}
      title={`Confidence: ${label} (${score}%)`}
    />
  );
}

export function LibraryCardList({ items }: { items: LearningWithMeta[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {items.map((item) => {
        const processing = item.status === 'processing';
        const failed = item.status === 'failed';
        const due = item.dueCount > 0;

        return (
          <Link key={item.id} href={`/library/${item.id}`} className="block no-underline">
            <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
              <div className="flex items-start gap-3 flex-1">
                {/* Confidence dot (only for ready items with reviews) */}
                {!processing && item.reviewCount > 0 && (
                  <ConfidenceDot score={item.confidence} />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">
                      {item.title}
                    </h3>
                  </div>

                  <div className="flex gap-1.5 flex-wrap mb-2">
                    {isNew(item.createdAt) && !processing && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/15 text-primary uppercase tracking-wide">
                        New
                      </span>
                    )}
                    {due && !processing && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-500 uppercase tracking-wide">
                        {item.dueCount} due
                      </span>
                    )}
                    {failed && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-500/15 text-red-400 uppercase tracking-wide">
                        Failed
                      </span>
                    )}
                  </div>

                  {processing ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Analyzing content…
                    </div>
                  ) : (
                    <>
                      {item.summary && (
                        <p className="text-xs text-muted-foreground line-clamp-3 mb-2 leading-relaxed">
                          {item.summary}
                        </p>
                      )}
                      <div className="flex gap-1.5 flex-wrap mt-auto">
                        {item.topic && (
                          <Badge variant="brand" className="text-xs">{item.topic}</Badge>
                        )}
                        {(item.tags ?? []).slice(0, 2).map((t) => (
                          <Badge key={t} variant="outline" className="text-xs">#{t}</Badge>
                        ))}
                        {item.domain && (
                          <Badge variant="outline" className="text-xs text-muted-foreground">
                            {item.domain}
                          </Badge>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="text-xs text-muted-foreground flex-shrink-0 pt-0.5 whitespace-nowrap">
                  {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
