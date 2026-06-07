'use client';

import { useRouter } from 'next/navigation';
import { ExternalLink, ArrowLeft, Brain, RotateCcw, Star } from 'lucide-react';
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

export function LearningDetailClient({ learning, reviewItems, teachBacks, confidence, learningId }: Props) {
  const router = useRouter();
  const label = confidenceLabel(confidence);
  const labelColor =
    label === 'High' ? 'text-green-500' : label === 'Medium' ? 'text-amber-500' : 'text-red-400';

  const lastTeachBack = teachBacks[0];

  return (
    <>
      <Button variant="outline" onClick={() => router.push('/library')} size="sm">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Library
      </Button>

      {/* Summary */}
      <Card className="p-5 space-y-3">
        {/* Topic + tags */}
        <div className="flex flex-wrap gap-2">
          {learning.topic && <Badge variant="brand">{learning.topic}</Badge>}
          {(learning.tags ?? []).map((t) => (
            <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
          ))}
        </div>

        {learning.summary && (
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Summary</h3>
            <p className="text-foreground leading-relaxed">{learning.summary}</p>
          </div>
        )}

        {(learning.keyPoints ?? []).length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Key Points</h3>
            <ul className="space-y-1">
              {(learning.keyPoints ?? []).map((kp, i) => (
                <li key={i} className="flex gap-2 text-sm text-foreground">
                  <span className="text-primary mt-0.5">•</span>
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
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Knowledge</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${confidence}%` }}
              />
            </div>
            <span className={`text-sm font-semibold ${labelColor}`}>{label}</span>
            <span className="text-xs text-muted-foreground">{confidence}%</span>
          </div>
          {lastTeachBack && (
            <p className="text-xs text-muted-foreground mt-2">
              Last teach-back score: <span className="font-medium text-foreground">{Math.round((lastTeachBack.gapScore ?? 0) * 100)}%</span>
            </p>
          )}
        </Card>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{reviewItems.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Review cards</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{teachBacks.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Teach-backs</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{learning.difficulty ?? '—'}</p>
          <p className="text-xs text-muted-foreground mt-1">Difficulty</p>
        </Card>
      </div>

      {/* Source metadata */}
      {(learning.sourceRef || learning.author || learning.domain || learning.publishDate) && (
        <Card className="p-4 space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Source</h3>
          {learning.author && (
            <p className="text-sm text-foreground">By <span className="font-medium">{learning.author}</span></p>
          )}
          {learning.publishDate && (
            <p className="text-sm text-muted-foreground">
              Published {new Date(learning.publishDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
          {learning.sourceRef && (
            <a
              href={learning.sourceRef}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-primary hover:underline break-all"
            >
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
              {learning.domain ?? learning.sourceRef}
            </a>
          )}
          <p className="text-xs text-muted-foreground pt-1">
            Captured {new Date(learning.createdAt).toLocaleDateString()}
          </p>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3 pb-4">
        <Button
          variant="outline"
          onClick={() => router.push(`/teachback?learningId=${learningId}`)}
          className="flex-1 gap-2"
        >
          <Brain className="h-4 w-4" />
          Teach Back
        </Button>
        <Button onClick={() => router.push('/review')} className="flex-1 gap-2">
          <RotateCcw className="h-4 w-4" />
          Review
        </Button>
      </div>
    </>
  );
}
