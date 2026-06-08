'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
import type { TeachBackRecord, QuizRecord, ReviewCardHistory } from '@/lib/data/history'

interface Props {
  teachBackHistory: TeachBackRecord[]
  quizHistory: QuizRecord[]
  reviewCardHistory: ReviewCardHistory[]
}

type Tab = 'quiz' | 'teachback' | 'review'

function fmt(d: Date | string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const VERDICT_COLOR: Record<string, string> = {
  strong: '#6f8a5a',
  partial: '#c79a3e',
  shaky: '#b5462f',
}

const GRADE_COLOR: Record<string, string> = {
  easy: '#4f6b3a',
  good: '#46557a',
  hard: '#9c7a23',
  again: '#b5462f',
}

function ScorePill({ score, color }: { score: number; color: string }) {
  return (
    <span
      style={{
        background: `${color}18`,
        color,
        border: `1px solid ${color}40`,
        borderRadius: '20px',
        padding: '2px 10px',
        fontSize: '12px',
        fontWeight: 700,
        fontFamily: "'Inter', system-ui, sans-serif",
        flexShrink: 0,
      }}
    >
      {score}%
    </span>
  )
}

function QuizTab({ history }: { history: QuizRecord[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)

  if (history.length === 0) {
    return <EmptyHistory label="No quiz attempts yet — hit Test Yourself to start." />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {history.map((attempt) => {
        const correct = attempt.answers.filter((a) => a.correct).length
        const color = attempt.score >= 80 ? '#4f6b3a' : attempt.score >= 50 ? '#c79a3e' : '#b5462f'
        const isOpen = expanded === attempt.id
        return (
          <div
            key={attempt.id}
            style={{
              borderRadius: '10px',
              border: '1px solid var(--color-border, #e6e0d4)',
              background: 'var(--color-card, #fff)',
              overflow: 'hidden',
            }}
          >
            {/* Header row */}
            <button
              onClick={() => setExpanded(isOpen ? null : attempt.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <ScorePill score={attempt.score} color={color} />
              <span style={{ flex: 1, fontSize: '13px', color: 'var(--color-muted-foreground, #7c7361)', fontFamily: "'Inter', system-ui, sans-serif" }}>
                {correct}/{attempt.questions.length} correct · {fmt(attempt.createdAt)}
              </span>
              {isOpen
                ? <ChevronUp style={{ width: 14, height: 14, color: 'var(--color-muted-foreground, #7c7361)', flexShrink: 0 }} />
                : <ChevronDown style={{ width: 14, height: 14, color: 'var(--color-muted-foreground, #7c7361)', flexShrink: 0 }} />}
            </button>

            {/* Expanded Q&A breakdown */}
            {isOpen && (
              <div style={{ borderTop: '1px solid var(--color-border, #e6e0d4)', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {attempt.questions.map((q, i) => {
                  const ans = attempt.answers.find((a) => a.questionId === q.id)
                  const ok = ans?.correct ?? false
                  return (
                    <div key={q.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      {ok
                        ? <CheckCircle2 style={{ width: 14, height: 14, color: '#4f6b3a', flexShrink: 0, marginTop: 2 }} />
                        : <XCircle style={{ width: 14, height: 14, color: '#b5462f', flexShrink: 0, marginTop: 2 }} />}
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-foreground, #2a2620)', marginBottom: 3, fontFamily: "'Spectral', Georgia, serif" }}>{q.question}</p>
                        <p style={{ fontSize: '12px', color: 'var(--color-muted-foreground, #7c7361)', fontFamily: "'Inter', system-ui, sans-serif" }}>
                          Your answer: <span style={{ color: ok ? '#4f6b3a' : '#b5462f' }}>{ans?.userAnswer || '—'}</span>
                        </p>
                        {!ok && (
                          <p style={{ fontSize: '12px', color: '#4f6b3a', fontFamily: "'Inter', system-ui, sans-serif", marginTop: 2 }}>
                            Correct: {q.correctAnswer}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function TeachBackTab({ history }: { history: TeachBackRecord[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)

  if (history.length === 0) {
    return <EmptyHistory label="No teach-back sessions yet — explain a concept to start." />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {history.map((tb) => {
        const color = VERDICT_COLOR[tb.verdict ?? 'shaky'] ?? '#b5462f'
        const isOpen = expanded === tb.id
        return (
          <div
            key={tb.id}
            style={{
              borderRadius: '10px',
              border: `1px solid var(--color-border, #e6e0d4)`,
              borderLeft: `3px solid ${color}`,
              background: 'var(--color-card, #fff)',
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => setExpanded(isOpen ? null : tb.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              {tb.gapScore !== null && <ScorePill score={Math.round(tb.gapScore)} color={color} />}
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color, textTransform: 'capitalize', fontFamily: "'Inter', system-ui, sans-serif" }}>
                  {tb.verdict ?? 'Graded'}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--color-muted-foreground, #7c7361)', marginLeft: 8, fontFamily: "'Inter', system-ui, sans-serif" }}>
                  · {fmt(tb.createdAt)}
                </span>
              </div>
              {isOpen
                ? <ChevronUp style={{ width: 14, height: 14, color: 'var(--color-muted-foreground, #7c7361)', flexShrink: 0 }} />
                : <ChevronDown style={{ width: 14, height: 14, color: 'var(--color-muted-foreground, #7c7361)', flexShrink: 0 }} />}
            </button>

            {isOpen && (
              <div style={{ borderTop: '1px solid var(--color-border, #e6e0d4)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* What you wrote */}
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-muted-foreground, #7c7361)', marginBottom: 6, fontFamily: "'Inter', system-ui, sans-serif" }}>Your explanation</p>
                  <p style={{ fontSize: '13px', color: 'var(--color-foreground, #2a2620)', lineHeight: 1.6, fontFamily: "'Spectral', Georgia, serif", fontStyle: 'italic', background: 'var(--color-background, #f5f2ec)', borderRadius: 8, padding: '10px 12px' }}>
                    {tb.userExplanation}
                  </p>
                </div>

                {tb.encouragement && (
                  <p style={{ fontSize: '13px', color, fontFamily: "'Spectral', Georgia, serif", fontStyle: 'italic' }}>
                    "{tb.encouragement}"
                  </p>
                )}

                {tb.nailedPoints.length > 0 && (
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: 700, color: '#4f6b3a', marginBottom: 4, fontFamily: "'Inter', system-ui, sans-serif" }}>✓ What you nailed</p>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {tb.nailedPoints.map((pt, i) => (
                        <li key={i} style={{ fontSize: '12px', color: 'var(--color-foreground, #2a2620)', display: 'flex', gap: 6, fontFamily: "'Inter', system-ui, sans-serif" }}>
                          <span style={{ color: '#4f6b3a', flexShrink: 0 }}>✓</span>{pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {tb.gapAreas.length > 0 && (
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: 700, color: '#b5462f', marginBottom: 4, fontFamily: "'Inter', system-ui, sans-serif" }}>Gaps to address</p>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {tb.gapAreas.map((g, i) => (
                        <li key={i} style={{ fontSize: '12px', color: 'var(--color-foreground, #2a2620)', display: 'flex', gap: 6, fontFamily: "'Inter', system-ui, sans-serif" }}>
                          <span style={{ color: '#b5462f', flexShrink: 0 }}>•</span>{g}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {tb.followUpQuestions.length > 0 && (
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: 700, color: '#46557a', marginBottom: 4, fontFamily: "'Inter', system-ui, sans-serif" }}>Follow-up questions</p>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {tb.followUpQuestions.map((q, i) => (
                        <li key={i} style={{ fontSize: '12px', color: 'var(--color-foreground, #2a2620)', display: 'flex', gap: 6, fontFamily: "'Inter', system-ui, sans-serif" }}>
                          <span style={{ color: '#46557a', flexShrink: 0 }}>Q:</span>{q}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function ReviewTab({ history }: { history: ReviewCardHistory[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)

  const totalSessions = history.reduce((acc, c) => acc + c.reviewHistory.length, 0)

  if (history.length === 0 || totalSessions === 0) {
    return <EmptyHistory label="No review sessions yet — cards will appear here after you review them." />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {history.filter((c) => c.reviewHistory.length > 0).map((card) => {
        const isOpen = expanded === card.id
        const last = card.reviewHistory[card.reviewHistory.length - 1]
        const lastColor = GRADE_COLOR[last?.grade] ?? '#7c7361'
        return (
          <div
            key={card.id}
            style={{
              borderRadius: '10px',
              border: '1px solid var(--color-border, #e6e0d4)',
              background: 'var(--color-card, #fff)',
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => setExpanded(isOpen ? null : card.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: lastColor,
                  background: `${lastColor}18`,
                  border: `1px solid ${lastColor}40`,
                  borderRadius: '20px',
                  padding: '2px 10px',
                  textTransform: 'capitalize',
                  flexShrink: 0,
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}
              >
                {last?.grade}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '13px', color: 'var(--color-foreground, #2a2620)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'Spectral', Georgia, serif" }}>
                  {card.question}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--color-muted-foreground, #7c7361)', marginTop: 2, fontFamily: "'Inter', system-ui, sans-serif" }}>
                  {card.reviewHistory.length} review{card.reviewHistory.length !== 1 ? 's' : ''} · interval {card.srInterval}d
                  {card.lastReviewed && ` · last ${fmt(card.lastReviewed)}`}
                </p>
              </div>
              {isOpen
                ? <ChevronUp style={{ width: 14, height: 14, color: 'var(--color-muted-foreground, #7c7361)', flexShrink: 0 }} />
                : <ChevronDown style={{ width: 14, height: 14, color: 'var(--color-muted-foreground, #7c7361)', flexShrink: 0 }} />}
            </button>

            {isOpen && (
              <div style={{ borderTop: '1px solid var(--color-border, #e6e0d4)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Answer */}
                <div style={{ background: 'var(--color-background, #f5f2ec)', borderRadius: 8, padding: '10px 12px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-muted-foreground, #7c7361)', marginBottom: 4, fontFamily: "'Inter', system-ui, sans-serif" }}>ANSWER</p>
                  <p style={{ fontSize: '13px', color: 'var(--color-foreground, #2a2620)', fontFamily: "'Spectral', Georgia, serif" }}>{card.answer}</p>
                </div>
                {/* Grade history timeline */}
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-muted-foreground, #7c7361)', marginBottom: 8, fontFamily: "'Inter', system-ui, sans-serif" }}>GRADE HISTORY</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {card.reviewHistory.map((entry, i) => {
                      const c = GRADE_COLOR[entry.grade] ?? '#7c7361'
                      return (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: c, background: `${c}18`, border: `1px solid ${c}40`, borderRadius: '4px', padding: '2px 6px', textTransform: 'capitalize', fontFamily: "'Inter', system-ui, sans-serif" }}>
                            {entry.grade}
                          </span>
                          <span style={{ fontSize: '9px', color: 'var(--color-muted-foreground, #7c7361)', fontFamily: "'Inter', system-ui, sans-serif" }}>
                            {new Date(entry.gradedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function EmptyHistory({ label }: { label: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--color-muted-foreground, #7c7361)', fontSize: '13px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <p style={{ fontSize: '24px', marginBottom: '10px' }}>📭</p>
      {label}
    </div>
  )
}

const TAB_LABELS: { key: Tab; label: string; count: (p: Props) => number }[] = [
  { key: 'quiz', label: 'Quiz', count: (p) => p.quizHistory.length },
  { key: 'teachback', label: 'Teach Back', count: (p) => p.teachBackHistory.length },
  { key: 'review', label: 'Review', count: (p) => p.reviewCardHistory.reduce((a, c) => a + c.reviewHistory.length, 0) },
]

export function HistoryPanel(props: Props) {
  const [tab, setTab] = useState<Tab>('quiz')
  const totalActivity = props.quizHistory.length + props.teachBackHistory.length +
    props.reviewCardHistory.reduce((a, c) => a + c.reviewHistory.length, 0)

  return (
    <div
      style={{
        borderRadius: '12px',
        border: '1px solid var(--color-border, #e6e0d4)',
        background: 'var(--color-card, #fff)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ padding: '16px 20px 0', borderBottom: '1px solid var(--color-border, #e6e0d4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h4 style={{ fontFamily: "'Spectral', Georgia, serif", fontWeight: 600, fontSize: '16px', color: 'var(--color-foreground, #2a2620)', margin: 0 }}>
            Activity History
          </h4>
          {totalActivity > 0 && (
            <span style={{ fontSize: '12px', color: 'var(--color-muted-foreground, #7c7361)', fontFamily: "'Inter', system-ui, sans-serif" }}>
              {totalActivity} session{totalActivity !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0' }}>
          {TAB_LABELS.map((t) => {
            const count = t.count(props)
            const active = tab === t.key
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: active ? 700 : 500,
                  fontFamily: "'Inter', system-ui, sans-serif",
                  color: active ? '#b5462f' : 'var(--color-muted-foreground, #7c7361)',
                  background: 'none',
                  border: 'none',
                  borderBottom: active ? '2px solid #b5462f' : '2px solid transparent',
                  cursor: 'pointer',
                  marginBottom: -1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'color 0.15s',
                }}
              >
                {t.label}
                {count > 0 && (
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: active ? '#b5462f' : 'var(--color-muted-foreground, #7c7361)',
                    background: active ? 'rgba(181,70,47,.1)' : 'var(--color-background, #f5f2ec)',
                    borderRadius: '20px',
                    padding: '1px 6px',
                  }}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ padding: '16px' }}>
        {tab === 'quiz' && <QuizTab history={props.quizHistory} />}
        {tab === 'teachback' && <TeachBackTab history={props.teachBackHistory} />}
        {tab === 'review' && <ReviewTab history={props.reviewCardHistory} />}
      </div>
    </div>
  )
}
