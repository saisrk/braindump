'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import { topicGradient } from '@/lib/book-colors';
import type { InferSelectModel } from 'drizzle-orm';
import type { learnings, reviewItems, teachBacks } from '@/db/schema';
import type { TeachBackRecord, QuizRecord, ReviewCardHistory } from '@/lib/data/history';
import type { ReviewHistoryEntry } from '@/db/schema/review-items';

type Learning = InferSelectModel<typeof learnings>;
type ReviewItem = InferSelectModel<typeof reviewItems>;
type TeachBack = InferSelectModel<typeof teachBacks>;

type ContentTab = 'summary' | 'keypoints' | 'analytics';

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

const S = { font: "'Inter', system-ui, sans-serif", serif: "'Spectral', Georgia, serif" };

const HIGHLIGHT_COLORS = ['#c79a3e', '#6f8a5a', '#46557a', '#8a5072', '#c97a4a'];

// ── Activity timeline ─────────────────────────────────────────────────────────

interface TimelineEntry {
  key: string;
  type: 'teachback' | 'review' | 'quiz';
  label: string;
  date: Date;
  color: string;
  icon: string;
}

function buildTimeline(
  teachBackHistory: TeachBackRecord[],
  quizHistory: QuizRecord[],
  reviewCardHistory: ReviewCardHistory[]
): TimelineEntry[] {
  const entries: TimelineEntry[] = [];

  for (const tb of teachBackHistory) {
    entries.push({
      key: `tb-${tb.id}`,
      type: 'teachback',
      label: tb.verdict ? `Teach-back — ${tb.verdict}` : 'Teach-back completed',
      date: tb.createdAt,
      color: '#6f8a5a',
      icon: '▣',
    });
  }

  for (const q of quizHistory) {
    entries.push({
      key: `q-${q.id}`,
      type: 'quiz',
      label: `Quiz — scored ${q.score}%`,
      date: q.createdAt,
      color: '#c79a3e',
      icon: '?',
    });
  }

  for (const card of reviewCardHistory) {
    for (const entry of (card.reviewHistory as ReviewHistoryEntry[])) {
      entries.push({
        key: `rv-${card.id}-${entry.gradedAt}`,
        type: 'review',
        label: `Review — ${entry.grade} (${card.question.slice(0, 50)}${card.question.length > 50 ? '…' : ''})`,
        date: new Date(entry.gradedAt),
        color: '#46557a',
        icon: '◳',
      });
    }
  }

  return entries.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 8);
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return '1d ago';
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

// ── Book cover ────────────────────────────────────────────────────────────────

interface BookCoverProps {
  learning: Learning;
  reviewItems: ReviewItem[];
  confidence: number;
  gradient: string;
}

function BookCover({ learning, reviewItems, confidence, gradient }: BookCoverProps) {
  const mastery = Math.round(confidence);
  const topic = learning.topic ?? 'Uncategorised';
  const capturedDate = new Date(learning.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const sourceDisplay = learning.domain ?? (learning.sourceRef ? (() => { try { return new URL(learning.sourceRef!).hostname; } catch { return learning.sourceRef; } })() : null);

  return (
    <div style={{
      width: '296px', height: '430px', borderRadius: '5px 10px 10px 5px',
      background: gradient,
      boxShadow: 'inset 7px 0 0 rgba(255,255,255,.14), inset -10px 0 22px rgba(0,0,0,.28), 0 30px 60px -26px rgba(42,38,32,.7)',
      border: '1px solid rgba(0,0,0,.2)',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      padding: '28px 26px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Spine hint */}
      <div style={{ position: 'absolute', left: '7px', top: 0, bottom: 0, width: '1px', background: 'rgba(0,0,0,.25)' }} />

      {/* Top */}
      <div>
        <p style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)', fontFamily: S.font, fontWeight: 600 }}>
          Braindump · Library
        </p>
      </div>

      {/* Middle */}
      <div>
        <p style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(255,255,255,.6)', fontFamily: S.font, fontWeight: 600, marginBottom: '12px' }}>
          {topic}
        </p>
        <h2 style={{
          fontFamily: S.serif, fontWeight: 700, fontSize: '26px', lineHeight: 1.15,
          color: 'rgba(255,255,255,.88)',
          textShadow: '0 1px 0 rgba(0,0,0,.45), 0 -1px 0 rgba(255,255,255,.12)',
          letterSpacing: '.3px', marginBottom: '16px',
        }}>
          {learning.title}
        </h2>
        {/* Gold rule */}
        <div style={{ height: '2px', width: '54px', background: '#c79a3e', marginBottom: '16px', boxShadow: '0 1px 0 rgba(0,0,0,.4)' }} />
        {/* Meta */}
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,.7)', lineHeight: 1.9, fontFamily: S.serif }}>
          {sourceDisplay && <div>Source · <strong style={{ color: 'rgba(255,255,255,.9)' }}>{sourceDisplay}</strong></div>}
          <div>Cards · <strong style={{ color: 'rgba(255,255,255,.9)' }}>{reviewItems.length}</strong>{mastery > 0 ? <> · Mastery · <strong style={{ color: 'rgba(255,255,255,.9)' }}>{mastery}%</strong></> : null}</div>
        </div>
      </div>

      {/* Bottom */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <p style={{ fontSize: '10px', letterSpacing: '1px', color: 'rgba(255,255,255,.6)', textTransform: 'uppercase', fontFamily: S.font }}>
          Captured · {capturedDate}
        </p>
        <div style={{ width: '38px', height: '38px', borderRadius: '50%', border: '1.5px solid #c79a3e', display: 'grid', placeItems: 'center', color: '#c79a3e', fontFamily: S.serif, fontWeight: 700, fontSize: '12px', opacity: 0.85 }}>
          BD
        </div>
      </div>
    </div>
  );
}

// ── Content panels ────────────────────────────────────────────────────────────

function SummaryPanel({ learning }: { learning: Learning }) {
  const hasSource = !!(learning.sourceRef || learning.author);

  return (
    <div style={{ padding: '4px 0 0 28px', minHeight: '380px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
        <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#b5462f', flexShrink: 0 }} />
        <h3 style={{ fontFamily: S.serif, fontWeight: 700, fontSize: '22px', color: 'var(--color-foreground)' }}>AI Summary</h3>
        <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--color-muted-foreground)', fontStyle: 'italic', fontFamily: S.serif }}>the back cover</span>
      </div>
      {learning.summary ? (
        <p style={{ fontFamily: S.serif, fontSize: '16px', lineHeight: 1.72, color: 'var(--color-foreground)', maxWidth: '560px' }}>
          {learning.summary}
        </p>
      ) : (
        <p style={{ fontFamily: S.serif, fontSize: '15px', color: 'var(--color-muted-foreground)', fontStyle: 'italic' }}>No summary available.</p>
      )}

      {hasSource && (
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
          {learning.author && (
            <p style={{ fontSize: '13px', color: 'var(--color-muted-foreground)', fontFamily: S.font, marginBottom: '4px' }}>
              By <strong style={{ color: 'var(--color-foreground)' }}>{learning.author}</strong>
            </p>
          )}
          {learning.sourceRef && (
            <a
              href={learning.sourceRef}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#b5462f', fontFamily: S.font }}
            >
              <ExternalLink style={{ width: 11, height: 11 }} />
              {learning.domain ?? (() => { try { return new URL(learning.sourceRef!).hostname; } catch { return learning.sourceRef; } })()}
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function KeyPointsPanel({ learning }: { learning: Learning }) {
  const kps = learning.keyPoints ?? [];

  return (
    <div style={{ padding: '4px 0 0 28px', minHeight: '380px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
        <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#6f8a5a', flexShrink: 0 }} />
        <h3 style={{ fontFamily: S.serif, fontWeight: 700, fontSize: '22px', color: 'var(--color-foreground)' }}>Key Points</h3>
        <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--color-muted-foreground)', fontStyle: 'italic', fontFamily: S.serif }}>{kps.length} insight{kps.length !== 1 ? 's' : ''}</span>
      </div>
      {kps.length === 0 ? (
        <p style={{ fontFamily: S.serif, fontSize: '15px', color: 'var(--color-muted-foreground)', fontStyle: 'italic' }}>No key points captured.</p>
      ) : (
        <div>
          {kps.map((kp, i) => (
            <div key={i} style={{ display: 'flex', gap: '16px', padding: '13px 0', borderBottom: i < kps.length - 1 ? '1px solid var(--color-border)' : 'none', maxWidth: '560px' }}>
              <span style={{ fontFamily: S.serif, fontWeight: 700, color: HIGHLIGHT_COLORS[i % HIGHLIGHT_COLORS.length], fontSize: '18px', flexShrink: 0, width: '24px' }}>
                {i + 1}
              </span>
              <p style={{ fontSize: '15px', lineHeight: 1.55, color: 'var(--color-foreground)', fontFamily: S.serif }}>{kp}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface AnalyticsPanelProps {
  learning: Learning;
  reviewItems: ReviewItem[];
  teachBacks: TeachBack[];
  confidence: number;
  latestQuizScore: number | null;
  teachBackHistory: TeachBackRecord[];
  quizHistory: QuizRecord[];
  reviewCardHistory: ReviewCardHistory[];
  learningId: string;
  dueCount: number;
}

function AnalyticsPanel({
  reviewItems, teachBacks, confidence, latestQuizScore,
  teachBackHistory, quizHistory, reviewCardHistory,
  learningId, dueCount,
}: AnalyticsPanelProps) {
  const router = useRouter();
  const mastery = Math.round(confidence);
  const reviewCount = reviewCardHistory.reduce((a, c) => a + (c.reviewHistory as ReviewHistoryEntry[]).length, 0);
  const timeline = buildTimeline(teachBackHistory, quizHistory, reviewCardHistory);

  return (
    <div style={{ padding: '4px 0 0 28px', minHeight: '380px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
        <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#46557a', flexShrink: 0 }} />
        <h3 style={{ fontFamily: S.serif, fontWeight: 700, fontSize: '22px', color: 'var(--color-foreground)' }}>Your Progress</h3>
        <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--color-muted-foreground)', fontStyle: 'italic', fontFamily: S.serif }}>this volume</span>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', maxWidth: '520px', marginBottom: '20px' }}>
        {[
          { value: reviewCount, label: 'Reviews', color: '#46557a' },
          { value: teachBacks.length, label: 'Teach-backs', color: '#6f8a5a' },
          { value: latestQuizScore !== null ? `${latestQuizScore}%` : '—', label: 'Last Quiz', color: '#c79a3e' },
        ].map((stat) => (
          <div key={stat.label} style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontFamily: S.serif, fontWeight: 700, fontSize: '28px', color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-muted-foreground)', textTransform: 'uppercase', letterSpacing: '.5px', marginTop: '3px', fontFamily: S.font }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Mastery bar */}
      <div style={{ maxWidth: '520px', marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '7px', fontFamily: S.font, color: 'var(--color-foreground)' }}>
          <span>Mastery</span>
          <strong style={{ fontFamily: S.serif }}>{mastery}%</strong>
        </div>
        <div style={{ height: '10px', borderRadius: '99px', background: 'var(--color-border)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min(100, mastery)}%`, background: 'linear-gradient(90deg, #6f8a5a, #46557a)', borderRadius: '99px', transition: 'width 0.6s ease' }} />
        </div>
      </div>

      {/* Timeline */}
      {timeline.length > 0 && (
        <div style={{ maxWidth: '520px', marginTop: '18px' }}>
          {timeline.map((entry) => (
            <div key={entry.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--color-border)', fontSize: '14px', fontFamily: S.font, color: 'var(--color-foreground)' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: entry.color, display: 'grid', placeItems: 'center', color: '#fff', fontSize: '13px', flexShrink: 0 }}>
                {entry.icon}
              </div>
              <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.label}</span>
              <span style={{ color: 'var(--color-muted-foreground)', fontSize: '12px', flexShrink: 0 }}>{timeAgo(entry.date)}</span>
            </div>
          ))}
        </div>
      )}

      {/* CTA buttons */}
      <div style={{ display: 'flex', gap: '10px', maxWidth: '520px', marginTop: '20px' }}>
        <button
          onClick={() => router.push(`/teachback?learningId=${learningId}`)}
          style={{ flex: 1, padding: '13px', borderRadius: '10px', border: 'none', background: '#b5462f', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '13px', fontFamily: S.font, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px' }}
        >
          ▣ Teach back
        </button>
        <button
          onClick={() => router.push('/review')}
          style={{ flex: 1, padding: '13px', borderRadius: '10px', border: '1px solid var(--color-border)', background: 'var(--color-card)', color: 'var(--color-foreground)', cursor: 'pointer', fontWeight: 600, fontSize: '13px', fontFamily: S.font }}
        >
          ◳ Review{dueCount > 0 ? ` (${dueCount})` : ''}
        </button>
        <button
          onClick={() => router.push(`/library/${learningId}/quiz`)}
          style={{ flex: 1, padding: '13px', borderRadius: '10px', border: '1px solid var(--color-border)', background: 'var(--color-card)', color: 'var(--color-foreground)', cursor: 'pointer', fontWeight: 600, fontSize: '13px', fontFamily: S.font }}
        >
          ? Quiz
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

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
  const [activeTab, setActiveTab] = useState<ContentTab>('summary');

  const topic = learning.topic ?? 'Uncategorised';
  const gradient = topicGradient(topic);

  const dueCount = reviewItems.filter((item) => {
    if (!item.dueDate) return false;
    return new Date(item.dueDate) <= new Date();
  }).length;

  const CONTENT_TABS: { id: ContentTab; label: string; color: string; icon: string }[] = [
    { id: 'summary',   label: 'Summary',    color: '#b5462f', icon: '✦' },
    { id: 'keypoints', label: 'Key Points', color: '#6f8a5a', icon: '❖' },
    { id: 'analytics', label: 'Analytics',  color: '#46557a', icon: '📊' },
  ];

  const ACTION_TABS = [
    { label: 'Teach Back', color: '#c79a3e', icon: '▣', textColor: '#3a2c08', onClick: () => router.push(`/teachback?learningId=${learningId}`) },
    { label: 'Review', color: '#8a5072', icon: '◳', textColor: '#fff', badge: dueCount > 0 ? dueCount : null, onClick: () => router.push('/review') },
    { label: 'Quiz', color: '#c97a4a', icon: '?', textColor: '#fff', onClick: () => router.push(`/library/${learningId}/quiz`) },
  ];

  return (
    <>
      <style>{`
        .tab-btn { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .tab-btn:hover { transform: translateX(6px); }
        .tab-btn.tab-active { transform: translateX(10px) !important; box-shadow: 5px 5px 12px -3px rgba(42,38,32,.55) !important; }
        @media (max-width: 768px) {
          .reader-grid { grid-template-columns: 1fr !important; }
          .book-stage { display: flex; justify-content: center; padding-bottom: 24px !important; }
          .book-tabs-col { display: none !important; }
          .mobile-tab-bar { display: flex !important; }
          .panel-col { padding-left: 0 !important; }
        }
        .mobile-tab-bar { display: none; gap: 6px; margin-bottom: 20px; flex-wrap: wrap; }
      `}</style>

      {/* Back */}
      <button
        onClick={() => router.push('/library')}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, color: 'var(--color-muted-foreground)', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 20px 0', fontFamily: S.font }}
      >
        ← Library › <span style={{ color: '#b5462f', fontWeight: 600 }}>{topic}</span>
      </button>

      {/* Mobile tab bar */}
      <div className="mobile-tab-bar">
        {CONTENT_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{ padding: '7px 14px', borderRadius: '8px', border: `1px solid ${activeTab === t.id ? t.color : 'var(--color-border)'}`, background: activeTab === t.id ? t.color : 'var(--color-card)', color: activeTab === t.id ? '#fff' : 'var(--color-muted-foreground)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: S.font }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Reader grid */}
      <div
        className="reader-grid"
        style={{ display: 'grid', gridTemplateColumns: '430px 1fr', alignItems: 'start', gap: 0 }}
      >
        {/* Left: book stage + tabs */}
        <div className="book-stage" style={{ perspective: '1800px', padding: '10px 0 10px 6px' }}>
          <div style={{ position: 'relative', width: '296px', height: '430px' }}>
            <BookCover
              learning={learning}
              reviewItems={reviewItems}
              confidence={confidence}
              gradient={gradient}
            />

            {/* Bookmark tabs — attached to right edge of book */}
            <div
              className="book-tabs-col"
              style={{ position: 'absolute', left: '296px', top: '30px', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 5 }}
            >
              {/* Content tabs */}
              {CONTENT_TABS.map((t) => (
                <button
                  key={t.id}
                  className={`tab-btn${activeTab === t.id ? ' tab-active' : ''}`}
                  onClick={() => setActiveTab(t.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '9px',
                    padding: '9px 14px 9px 13px', borderRadius: '0 7px 7px 0',
                    cursor: 'pointer', color: '#fff', whiteSpace: 'nowrap',
                    fontFamily: S.font, fontWeight: 600, fontSize: '12.5px',
                    background: t.color, border: 'none',
                    boxShadow: '3px 3px 8px -3px rgba(42,38,32,.5)',
                  }}
                >
                  <span style={{ fontSize: '13px', width: '15px', textAlign: 'center' }}>{t.icon}</span>
                  {t.label}
                </button>
              ))}

              {/* Divider */}
              <div style={{ height: '1px', margin: '4px 0 0' }} />

              {/* Action tabs */}
              {ACTION_TABS.map((t) => (
                <button
                  key={t.label}
                  className="tab-btn"
                  onClick={t.onClick}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '9px',
                    padding: '9px 14px 9px 13px', borderRadius: '0 7px 7px 0',
                    cursor: 'pointer', color: t.textColor, whiteSpace: 'nowrap',
                    fontFamily: S.font, fontWeight: 600, fontSize: '12.5px',
                    background: t.color, border: 'none',
                    boxShadow: '3px 3px 8px -3px rgba(42,38,32,.5)',
                  }}
                >
                  <span style={{ fontSize: '13px', width: '15px', textAlign: 'center' }}>{t.icon}</span>
                  {t.label}
                  {t.badge != null && (
                    <span style={{ marginLeft: '4px', background: 'rgba(255,255,255,.25)', borderRadius: '99px', padding: '1px 7px', fontSize: '10px' }}>{t.badge}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: content panel */}
        <div className="panel-col" style={{ paddingLeft: '8px', paddingTop: '10px' }}>
          {activeTab === 'summary' && <SummaryPanel learning={learning} />}
          {activeTab === 'keypoints' && <KeyPointsPanel learning={learning} />}
          {activeTab === 'analytics' && (
            <AnalyticsPanel
              learning={learning}
              reviewItems={reviewItems}
              teachBacks={teachBacks}
              confidence={confidence}
              latestQuizScore={latestQuizScore}
              teachBackHistory={teachBackHistory}
              quizHistory={quizHistory}
              reviewCardHistory={reviewCardHistory}
              learningId={learningId}
              dueCount={dueCount}
            />
          )}
        </div>
      </div>
    </>
  );
}
