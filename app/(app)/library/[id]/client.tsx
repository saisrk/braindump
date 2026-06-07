'use client';

import { useRouter } from 'next/navigation';
import { ExternalLink, ArrowLeft, Brain, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { confidenceLabel } from '@/lib/sr';
import type { InferSelectModel } from 'drizzle-orm';
import type { learnings, reviewItems, teachBacks } from '@/db/schema';

type Learning = InferSelectModel<typeof learnings>;
type ReviewItem = InferSelectModel<typeof reviewItems>;
type TeachBack = InferSelectModel<typeof teachBacks>;

interface Props {
  learning: Learning;
  reviewItems: ReviewItem[];
  teachBacks: TeachBack[];
  confidence: number;
  learningId: string;
}

function StatTile({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="hud-frame-sm p-3 text-center">
      <p className="text-xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

export function LearningDetailClient({ learning, reviewItems, teachBacks, confidence, learningId }: Props) {
  const router = useRouter();
  const label = confidenceLabel(confidence);
  const labelColor =
    label === 'High' ? 'text-green-500' : label === 'Medium' ? 'text-amber-500' : 'text-red-400';
  const lastTeachBack = teachBacks[0];

  return (
    <div className="flex flex-col gap-4">
      <Button variant="outline" onClick={() => router.push('/library')} size="sm" className="self-start">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Library
      </Button>

      {/* Two-column on desktop, single column on mobile */}
      <div className="flex flex-col md:flex-row gap-4 items-start">

        {/* LEFT — main content */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Summary + key points */}
          <Card className="p-5 space-y-4">
            <div className="flex flex-wrap gap-2">
              {learning.topic && <Badge variant="brand">{learning.topic}</Badge>}
              {(learning.tags ?? []).map((t) => (
                <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
              ))}
            </div>

            {learning.summary && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Summary</p>
                <p className="text-foreground leading-relaxed text-sm">{learning.summary}</p>
              </div>
            )}

            {(learning.keyPoints ?? []).length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Key Points</p>
                <ul className="space-y-1.5">
                  {(learning.keyPoints ?? []).map((kp, i) => (
                    <li key={i} className="flex gap-2 text-sm text-foreground">
                      <span className="text-primary flex-shrink-0 mt-0.5">›</span>
                      <span>{kp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          {/* Knowledge meter */}
          {reviewItems.length > 0 && (
            <Card className="p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Knowledge</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${confidence}%` }}
                  />
                </div>
                <span className={`text-sm font-semibold ${labelColor}`}>{label}</span>
                <span className="text-xs text-muted-foreground">{confidence}%</span>
              </div>
              {lastTeachBack && (
                <p className="text-xs text-muted-foreground">
                  Last teach-back: <span className="font-medium text-foreground">{Math.round((lastTeachBack.gapScore ?? 0) * 100)}%</span>
                </p>
              )}
            </Card>
          )}
        </div>

        {/* RIGHT — sticky action panel */}
        <div className="w-full md:w-56 flex-shrink-0 space-y-3 md:sticky md:top-4">

          {/* CTAs */}
          <Button
            onClick={() => router.push(`/teachback?learningId=${learningId}`)}
            className="w-full gap-2"
          >
            <Brain className="h-4 w-4" />
            Teach Back
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/review')}
            className="w-full gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Review Queue →
          </Button>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <StatTile value={reviewItems.length} label="Cards" />
            <StatTile value={teachBacks.length} label="Teach-backs" />
            <StatTile value={learning.difficulty ?? '—'} label="Difficulty" />
          </div>

          {/* Source metadata */}
          {(learning.sourceRef || learning.author || learning.publishDate) && (
            <div className="hud-frame-sm p-3 space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Source</p>
              {learning.author && (
                <p className="text-xs text-foreground">By <span className="font-medium">{learning.author}</span></p>
              )}
              {learning.publishDate && (
                <p className="text-xs text-muted-foreground">
                  {new Date(learning.publishDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              )}
              {learning.sourceRef && (
                <a
                  href={learning.sourceRef}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-primary hover:underline break-all"
                >
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  {learning.domain ?? (() => { try { return new URL(learning.sourceRef!).hostname; } catch { return learning.sourceRef; } })()}
                </a>
              )}
              <p className="text-xs text-muted-foreground border-t border-border pt-1.5">
                Captured {new Date(learning.createdAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
