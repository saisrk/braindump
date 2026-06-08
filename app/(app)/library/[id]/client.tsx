'use client';

import { useRouter } from 'next/navigation';
import { ExternalLink, ArrowLeft, RotateCcw, Zap, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { topicGradient } from '@/lib/book-colors';
import type { InferSelectModel } from 'drizzle-orm';
import type { learnings, reviewItems, teachBacks } from '@/db/schema';

type Learning = InferSelectModel<typeof learnings>;
type ReviewItem = InferSelectModel<typeof reviewItems>;
type TeachBack = InferSelectModel<typeof teachBacks>;

const HIGHLIGHT_COLORS = ['#c79a3e', '#6f8a5a', '#46557a', '#8a5072', '#c97a4a'];

interface Props {
  learning: Learning;
  reviewItems: ReviewItem[];
  teachBacks: TeachBack[];
  confidence: number;
  learningId: string;
  latestQuizScore: number | null;
}

export function LearningDetailClient({ learning, reviewItems, teachBacks, confidence, learningId, latestQuizScore }: Props) {
  const router = useRouter();
  const topic = learning.topic ?? 'Uncategorised';
  const gradient = topicGradient(topic);

  return (
    <div className="flex flex-col gap-6">
      <Button variant="outline" onClick={() => router.push('/library')} size="sm" className="self-start">
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Library
      </Button>

      {/* Two-column on desktop */}
      <div className="flex flex-col md:flex-row gap-6 items-start">

        {/* LEFT — book cover + CTAs */}
        <div className="w-full md:w-72 flex-shrink-0 space-y-3">

          {/* Book cover */}
          <div
            className="relative flex flex-col justify-end p-6 rounded-xl"
            style={{
              background: gradient,
              minHeight: '280px',
              boxShadow: 'inset 6px 0 0 rgba(255,255,255,.12), inset -8px 0 16px rgba(0,0,0,.2), 0 24px 50px -24px rgba(42,38,32,.5)',
            }}
          >
            {/* Gold ribbon */}
            <div
              className="absolute top-0 right-8 w-3.5 h-12 rounded-b"
              style={{ background: '#c79a3e', boxShadow: '0 3px 5px rgba(0,0,0,.25)' }}
            />
            <p className="text-xs uppercase tracking-widest text-white/70 mb-2">{topic}</p>
            <h2 className="font-display font-bold text-white leading-tight" style={{ fontSize: '22px' }}>
              {learning.title}
            </h2>
            <p className="text-xs text-white/60 mt-3">
              Captured {new Date(learning.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              {reviewItems.length > 0 && ` · ${reviewItems.length} cards`}
            </p>
          </div>

          {/* CTAs */}
          <Button onClick={() => router.push('/review')} className="w-full gap-2">
            <RotateCcw className="h-4 w-4" />
            Review Queue →
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/library/${learningId}/quiz`)}
            className="w-full gap-2"
          >
            <Zap className="h-4 w-4" />
            Test Yourself
            {latestQuizScore !== null && (
              <span className="ml-auto text-xs text-muted-foreground">Last: {latestQuizScore}%</span>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/teachback?learningId=${learningId}`)}
            className="w-full gap-2"
          >
            <Brain className="h-4 w-4" />
            Teach Back
          </Button>
        </div>

        {/* RIGHT — content blocks */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Summary */}
          {learning.summary && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h4 className="font-display font-semibold text-primary text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                ✦ AI Summary
                <span className="text-muted-foreground font-sans text-xs normal-case tracking-normal">— the back cover</span>
              </h4>
              <p className="font-display text-foreground leading-relaxed" style={{ fontSize: '15px' }}>
                {learning.summary}
              </p>
            </div>
          )}

          {/* Key Points as highlights */}
          {(learning.keyPoints ?? []).length > 0 && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h4 className="font-display font-semibold text-primary text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                ✎ Key Points
                <span className="text-muted-foreground font-sans text-xs normal-case tracking-normal">— margin notes</span>
              </h4>
              <div className="space-y-0">
                {(learning.keyPoints ?? []).map((kp, i) => (
                  <div key={i} className="flex gap-3 py-3 border-b border-border last:border-0">
                    <div
                      className="w-1 rounded-full flex-shrink-0 mt-0.5"
                      style={{ background: HIGHLIGHT_COLORS[i % HIGHLIGHT_COLORS.length] }}
                    />
                    <p className="text-sm text-foreground leading-relaxed">{kp}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {((learning.tags ?? []).length > 0 || learning.topic) && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h4 className="font-display font-semibold text-foreground text-sm mb-3">Tags</h4>
              <div className="flex gap-2 flex-wrap">
                {learning.topic && <Badge variant="brand">{learning.topic}</Badge>}
                {(learning.tags ?? []).map((t) => (
                  <Badge key={t} variant="outline">#{t}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Source */}
          {(learning.sourceRef || learning.author || learning.domain) && (
            <div className="rounded-xl border border-border bg-card p-5 space-y-1.5">
              <h4 className="font-display font-semibold text-foreground text-sm mb-2">Source</h4>
              {learning.author && (
                <p className="text-sm text-foreground">By <span className="font-medium">{learning.author}</span></p>
              )}
              {learning.publishDate && (
                <p className="text-xs text-muted-foreground">
                  {new Date(learning.publishDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              )}
              {learning.sourceRef && (
                <a
                  href={learning.sourceRef}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline break-all"
                >
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  {learning.domain ?? (() => { try { return new URL(learning.sourceRef!).hostname; } catch { return learning.sourceRef; } })()}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
