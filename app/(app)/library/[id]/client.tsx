'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExternalLink, ArrowLeft, RotateCcw, Zap, Brain, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { topicGradient } from '@/lib/book-colors';
import { HistoryPanel } from './history-panel';
import type { InferSelectModel } from 'drizzle-orm';
import type { learnings, reviewItems, teachBacks } from '@/db/schema';
import type { TeachBackRecord, QuizRecord, ReviewCardHistory } from '@/lib/data/history';

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
  teachBackHistory: TeachBackRecord[];
  quizHistory: QuizRecord[];
  reviewCardHistory: ReviewCardHistory[];
}

export function LearningDetailClient({
  learning,
  reviewItems,
  teachBacks,
  confidence,
  learningId,
  latestQuizScore,
  teachBackHistory,
  quizHistory,
  reviewCardHistory,
}: Props) {
  const router = useRouter();
  const topic = learning.topic ?? 'Uncategorised';
  const gradient = topicGradient(topic);
  const [secondaryOpen, setSecondaryOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const hasSource = !!(learning.sourceRef || learning.author || learning.domain);
  const hasTags = (learning.tags ?? []).length > 0 || !!learning.topic;
  const totalActivity = quizHistory.length + teachBackHistory.length +
    reviewCardHistory.reduce((a, c) => a + c.reviewHistory.length, 0);

  return (
    <div className="max-w-2xl mx-auto">

      {/* Back */}
      <button
        onClick={() => router.push('/library')}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          fontSize: '13px', fontWeight: 500, color: 'var(--color-muted-foreground)',
          background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 20px 0',
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        <ArrowLeft style={{ width: 14, height: 14 }} />
        Library
      </button>

      {/* ── Identity strip ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
        {/* Mini book spine */}
        <div style={{
          width: '52px', height: '80px', flexShrink: 0,
          background: gradient, borderRadius: '3px 6px 6px 3px',
          boxShadow: 'inset 4px 0 0 rgba(255,255,255,.12), inset -6px 0 12px rgba(0,0,0,.2), 0 8px 20px -8px rgba(42,38,32,.4)',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: 0, right: '6px',
            width: '7px', height: '20px',
            background: '#c79a3e', borderRadius: '0 0 3px 3px',
          }} />
        </div>

        {/* Title + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '10px', fontWeight: 700, letterSpacing: '3px',
              textTransform: 'uppercase', color: 'var(--color-primary, #b5462f)',
              fontFamily: "'Inter', system-ui, sans-serif",
            }}>
              {topic}
            </span>
            {reviewItems.length > 0 && (
              <span style={{
                fontSize: '11px', color: 'var(--color-muted-foreground)',
                fontFamily: "'Inter', system-ui, sans-serif",
              }}>
                · {reviewItems.length} cards
              </span>
            )}
          </div>
          <h1 style={{
            fontFamily: "'Spectral', Georgia, serif",
            fontWeight: 700, fontSize: '26px', lineHeight: 1.15,
            color: 'var(--color-foreground)', margin: 0,
          }}>
            {learning.title}
          </h1>
          <p style={{
            fontSize: '12px', color: 'var(--color-muted-foreground)',
            marginTop: '6px', fontFamily: "'Inter', system-ui, sans-serif",
          }}>
            Captured {new Date(learning.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* ── Summary ────────────────────────────────────────────────────── */}
      {learning.summary && (
        <div style={{
          borderRadius: '12px', border: '1px solid var(--color-border)',
          background: 'var(--color-card)', padding: '20px 24px', marginBottom: '16px',
        }}>
          <p style={{
            fontSize: '10px', fontWeight: 700, letterSpacing: '3px',
            textTransform: 'uppercase', color: 'var(--color-primary, #b5462f)',
            marginBottom: '12px', fontFamily: "'Inter', system-ui, sans-serif",
          }}>
            ✦ Summary
          </p>
          <p style={{
            fontFamily: "'Spectral', Georgia, serif",
            fontSize: '16px', lineHeight: 1.7,
            color: 'var(--color-foreground)', margin: 0,
          }}>
            {learning.summary}
          </p>
        </div>
      )}

      {/* ── Key Points ─────────────────────────────────────────────────── */}
      {(learning.keyPoints ?? []).length > 0 && (
        <div style={{
          borderRadius: '12px', border: '1px solid var(--color-border)',
          background: 'var(--color-card)', padding: '20px 24px', marginBottom: '16px',
        }}>
          <p style={{
            fontSize: '10px', fontWeight: 700, letterSpacing: '3px',
            textTransform: 'uppercase', color: 'var(--color-primary, #b5462f)',
            marginBottom: '12px', fontFamily: "'Inter', system-ui, sans-serif",
          }}>
            ✎ Key Points
          </p>
          <div>
            {(learning.keyPoints ?? []).map((kp, i) => (
              <div key={i} style={{
                display: 'flex', gap: '14px', paddingTop: '12px', paddingBottom: '12px',
                borderBottom: i < (learning.keyPoints ?? []).length - 1 ? '1px solid var(--color-border)' : 'none',
              }}>
                <div style={{
                  width: '3px', borderRadius: '2px', flexShrink: 0, marginTop: '2px',
                  alignSelf: 'stretch', minHeight: '20px',
                  background: HIGHLIGHT_COLORS[i % HIGHLIGHT_COLORS.length],
                }} />
                <p style={{
                  fontSize: '14px', lineHeight: 1.65,
                  color: 'var(--color-foreground)', margin: 0,
                  fontFamily: "'Spectral', Georgia, serif",
                }}>
                  {kp}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Secondary details (collapsible) ────────────────────────────── */}
      {(hasTags || hasSource) && (
        <div style={{ marginBottom: '16px' }}>
          <button
            onClick={() => setSecondaryOpen((o) => !o)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', borderRadius: secondaryOpen ? '12px 12px 0 0' : '12px',
              border: '1px solid var(--color-border)', borderBottom: secondaryOpen ? 'none' : '1px solid var(--color-border)',
              background: 'var(--color-card)', cursor: 'pointer',
              fontSize: '13px', fontWeight: 600, color: 'var(--color-muted-foreground)',
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          >
            <span>Tags &amp; Source</span>
            {secondaryOpen
              ? <ChevronUp style={{ width: 14, height: 14 }} />
              : <ChevronDown style={{ width: 14, height: 14 }} />}
          </button>

          {secondaryOpen && (
            <div style={{
              border: '1px solid var(--color-border)', borderTop: 'none',
              borderRadius: '0 0 12px 12px',
              background: 'var(--color-card)', padding: '16px 20px',
              display: 'flex', flexDirection: 'column', gap: '16px',
            }}>
              {hasTags && (
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-muted-foreground)', marginBottom: '8px', fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: '1px', textTransform: 'uppercase' }}>Tags</p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {learning.topic && <Badge variant="brand">{learning.topic}</Badge>}
                    {(learning.tags ?? []).map((t) => (
                      <Badge key={t} variant="outline">#{t}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {hasSource && (
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-muted-foreground)', marginBottom: '8px', fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: '1px', textTransform: 'uppercase' }}>Source</p>
                  {learning.author && (
                    <p style={{ fontSize: '13px', color: 'var(--color-foreground)', marginBottom: '4px', fontFamily: "'Inter', system-ui, sans-serif" }}>
                      By <strong>{learning.author}</strong>
                    </p>
                  )}
                  {learning.publishDate && (
                    <p style={{ fontSize: '12px', color: 'var(--color-muted-foreground)', marginBottom: '4px', fontFamily: "'Inter', system-ui, sans-serif" }}>
                      {new Date(learning.publishDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  )}
                  {learning.sourceRef && (
                    <a
                      href={learning.sourceRef}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--color-primary, #b5462f)', fontFamily: "'Inter', system-ui, sans-serif", wordBreak: 'break-all' }}
                    >
                      <ExternalLink style={{ width: 11, height: 11, flexShrink: 0 }} />
                      {learning.domain ?? (() => { try { return new URL(learning.sourceRef!).hostname; } catch { return learning.sourceRef; } })()}
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Activity history (collapsible) ─────────────────────────────── */}
      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={() => setHistoryOpen((o) => !o)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', borderRadius: historyOpen ? '12px 12px 0 0' : '12px',
            border: '1px solid var(--color-border)', borderBottom: historyOpen ? 'none' : '1px solid var(--color-border)',
            background: 'var(--color-card)', cursor: 'pointer',
            fontSize: '13px', fontWeight: 600, color: 'var(--color-muted-foreground)',
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Activity History
            {totalActivity > 0 && (
              <span style={{
                fontSize: '11px', fontWeight: 700, color: '#b5462f',
                background: 'rgba(181,70,47,.1)', borderRadius: '20px',
                padding: '1px 8px', fontFamily: "'Inter', system-ui, sans-serif",
              }}>
                {totalActivity}
              </span>
            )}
          </span>
          {historyOpen
            ? <ChevronUp style={{ width: 14, height: 14 }} />
            : <ChevronDown style={{ width: 14, height: 14 }} />}
        </button>

        {historyOpen && (
          <div style={{
            border: '1px solid var(--color-border)', borderTop: 'none',
            borderRadius: '0 0 12px 12px', overflow: 'hidden',
          }}>
            <HistoryPanel
              teachBackHistory={teachBackHistory}
              quizHistory={quizHistory}
              reviewCardHistory={reviewCardHistory}
            />
          </div>
        )}
      </div>

      {/* ── Sticky CTA bar ─────────────────────────────────────────────── */}
      <div style={{
        position: 'fixed', bottom: 0, left: '192px', right: 0,
        padding: '12px 24px 16px',
        background: 'var(--color-background)',
        borderTop: '1px solid var(--color-border)',
        display: 'flex', gap: '10px', alignItems: 'center',
        zIndex: 40,
      }}>
        {/* Review */}
        <button
          onClick={() => router.push('/review')}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
            background: '#b5462f', color: '#fff', border: 'none', borderRadius: '9px',
            padding: '11px 0', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
            fontFamily: "'Inter', system-ui, sans-serif",
            boxShadow: '0 4px 12px -4px rgba(181,70,47,.5)',
          }}
        >
          <RotateCcw style={{ width: 14, height: 14 }} />
          Review
        </button>

        {/* Test Yourself */}
        <button
          onClick={() => router.push(`/library/${learningId}/quiz`)}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
            background: 'var(--color-card)', color: 'var(--color-foreground)',
            border: '1px solid var(--color-border)', borderRadius: '9px',
            padding: '11px 0', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          <Zap style={{ width: 14, height: 14 }} />
          Test Yourself
          {latestQuizScore !== null && (
            <span style={{ fontSize: '11px', color: 'var(--color-muted-foreground)', marginLeft: '2px' }}>
              {latestQuizScore}%
            </span>
          )}
        </button>

        {/* Teach Back */}
        <button
          onClick={() => router.push(`/teachback?learningId=${learningId}`)}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
            background: 'var(--color-card)', color: 'var(--color-foreground)',
            border: '1px solid var(--color-border)', borderRadius: '9px',
            padding: '11px 0', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          <Brain style={{ width: 14, height: 14 }} />
          Teach Back
          {teachBackHistory.length > 0 && (
            <span style={{ fontSize: '11px', color: 'var(--color-muted-foreground)', marginLeft: '2px' }}>
              {teachBackHistory.length}×
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
