'use client'

import { useState, useEffect } from 'react'

const F = "'Inter', system-ui, sans-serif"
const SERIF = "'Spectral', Georgia, serif"

const CARDS = [
  {
    topic: 'Deep Work · Card 1 of 6',
    question: 'What makes deep work different from ordinary focused work?',
    answer: 'Deep work is cognitively demanding work performed in a state of distraction-free concentration. Ordinary focus still tolerates interruptions — deep work treats them as incompatible with the goal.',
    color: '#b5462f',
  },
  {
    topic: 'System Design · Card 3 of 8',
    question: 'When does a cache invalidation strategy matter most?',
    answer: 'When reads vastly outnumber writes and stale data has a real cost. Write-through keeps cache consistent but adds latency on writes. TTL-based expiry trades consistency for simplicity.',
    color: '#46557a',
  },
  {
    topic: 'Decision Making · Card 2 of 5',
    question: 'What is the difference between a reversible and irreversible decision?',
    answer: 'Reversible decisions (Type 2) can be undone cheaply — move fast. Irreversible decisions (Type 1) require more data and deliberation. Most decisions are Type 2, but people treat them like Type 1.',
    color: '#c79a3e',
  },
]

const GRADES = [
  { label: 'Again', sub: '<1m', color: '#b5462f' },
  { label: 'Hard',  sub: '10m',  color: '#9c7a23' },
  { label: 'Good',  sub: '1d',   color: '#46557a' },
  { label: 'Easy',  sub: '4d',   color: '#4f6b3a' },
]

export function HeroCard() {
  const [cardIdx, setCardIdx] = useState(0)
  const [phase, setPhase] = useState<'question' | 'answer' | 'graded'>('question')
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    let t1: ReturnType<typeof setTimeout>
    let t2: ReturnType<typeof setTimeout>
    let t3: ReturnType<typeof setTimeout>
    let t4: ReturnType<typeof setTimeout>

    t1 = setTimeout(() => setPhase('answer'), 1800)
    t2 = setTimeout(() => setPhase('graded'), 3200)
    t3 = setTimeout(() => setExiting(true), 5000)
    t4 = setTimeout(() => {
      setCardIdx((i) => (i + 1) % CARDS.length)
      setPhase('question')
      setExiting(false)
    }, 5500)

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [cardIdx])

  const card = CARDS[cardIdx]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <style>{`
        @keyframes hc-fadein {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes hc-fadeout {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(-6px); }
        }
        .hc-card {
          animation: hc-fadein 0.4s ease both;
        }
        .hc-card.exiting {
          animation: hc-fadeout 0.4s ease both;
        }
        .hc-answer {
          animation: hc-fadein 0.5s ease both;
        }
        .hc-grades {
          animation: hc-fadein 0.4s ease 0.1s both;
        }
      `}</style>

      {/* Card */}
      <div
        className={`hc-card${exiting ? ' exiting' : ''}`}
        style={{
          background: '#ffffff',
          border: '1px solid #e6e0d4',
          borderRadius: '14px',
          padding: '28px 28px 24px',
          boxShadow: '0 8px 32px -12px rgba(42,38,32,.18)',
          position: 'relative',
          minHeight: '220px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ribbon */}
        <div style={{ position: 'absolute', top: 0, right: '20px', width: '8px', height: '28px', background: card.color, borderRadius: '0 0 4px 4px', opacity: 0.85 }} />

        {/* topic */}
        <p style={{ fontFamily: F, fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#aaa190', marginBottom: '16px' }}>
          {card.topic}
        </p>

        {/* question */}
        <p style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '17px', color: '#2a2620', lineHeight: 1.5, marginBottom: 'auto', paddingBottom: phase === 'question' ? '0' : '16px' }}>
          {card.question}
        </p>

        {/* answer */}
        {phase !== 'question' && (
          <div className="hc-answer" style={{ borderTop: '1px solid #e6e0d4', paddingTop: '16px', marginTop: '16px' }}>
            <p style={{ fontFamily: F, fontSize: '13px', color: '#7c7361', lineHeight: 1.65 }}>
              {card.answer}
            </p>
          </div>
        )}
      </div>

      {/* Grade buttons */}
      <div
        className="hc-grades"
        style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px',
          opacity: phase === 'graded' ? 1 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: phase === 'graded' ? 'auto' : 'none',
        }}
      >
        {GRADES.map((g) => (
          <button
            key={g.label}
            style={{
              border: `1.5px solid ${g.color}`,
              borderRadius: '10px',
              padding: '10px 0',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = `${g.color}12` }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            <span style={{ fontFamily: F, fontWeight: 700, fontSize: '13px', color: g.color }}>{g.label}</span>
            <span style={{ fontFamily: F, fontSize: '11px', color: '#aaa190' }}>{g.sub}</span>
          </button>
        ))}
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', paddingTop: '4px' }}>
        {CARDS.map((_, i) => (
          <div key={i} style={{ width: i === cardIdx ? '18px' : '6px', height: '6px', borderRadius: '3px', background: i === cardIdx ? '#b5462f' : '#e6e0d4', transition: 'all 0.3s ease' }} />
        ))}
      </div>
    </div>
  )
}
