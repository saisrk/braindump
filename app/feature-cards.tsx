'use client'

import { useState, useEffect } from 'react'

const S = {
  font: "'Inter', system-ui, sans-serif",
  serif: "'Spectral', Georgia, serif",
}

function CapturePreview() {
  const [phase, setPhase] = useState(0)
  // phase 0: idle, 1: url typed, 2: scanning, 3: result
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300)
    const t2 = setTimeout(() => setPhase(2), 900)
    const t3 = setTimeout(() => setPhase(3), 1800)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  return (
    <div style={{ marginTop: '20px' }}>
      {/* URL bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f5f2ec', border: '1px solid #e6e0d4', borderRadius: '8px', padding: '8px 12px', marginBottom: '10px', fontSize: '12px', color: '#7c7361', fontFamily: S.font, overflow: 'hidden' }}>
        <span style={{ opacity: 0.5 }}>🔗</span>
        <span style={{ transition: 'opacity 0.4s', opacity: phase >= 1 ? 1 : 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          medium.com/article-on-deep-work
        </span>
      </div>
      {/* scan lines */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {['92%', '100%', '78%', '85%'].map((w, i) => (
          <div key={i} style={{ position: 'relative', height: '10px', borderRadius: '4px', background: '#ede8df', overflow: 'hidden', width: w, transition: 'opacity 0.3s', opacity: phase >= 2 ? 1 : 0, transitionDelay: `${i * 0.08}s` }}>
            {phase >= 2 && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(199,154,62,.45)', borderRadius: '4px', animation: `scan-shimmer 1.8s ease-in-out ${i * 0.3}s infinite` }} />
            )}
          </div>
        ))}
      </div>
      {/* result badge */}
      <div style={{ marginTop: '12px', display: 'flex', gap: '6px', transition: 'opacity 0.5s', opacity: phase >= 3 ? 1 : 0 }}>
        <span style={{ background: '#6f8a5a', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '20px', fontFamily: S.font }}>✓ Saved to Library</span>
        <span style={{ background: '#46557a', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '20px', fontFamily: S.font }}>AI Summary ready</span>
      </div>
    </div>
  )
}

function ReviewPreview() {
  const [flipped, setFlipped] = useState(false)
  const [graded, setGraded] = useState(false)
  useEffect(() => {
    const t1 = setTimeout(() => setFlipped(true), 600)
    const t2 = setTimeout(() => setGraded(true), 1400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div style={{ marginTop: '20px' }}>
      {/* Flashcard */}
      <div style={{ background: '#f5f2ec', border: '1px solid #e6e0d4', borderRadius: '10px', padding: '14px 16px', minHeight: '64px', position: 'relative', marginBottom: '10px' }}>
        <div style={{ position: 'absolute', top: 0, right: '10px', width: '6px', height: '20px', background: '#c79a3e', borderRadius: '0 0 3px 3px' }} />
        <p style={{ fontSize: '12px', fontFamily: S.serif, color: '#2a2620', fontWeight: 600, lineHeight: 1.4 }}>
          {!flipped ? 'What is the "deep work" hypothesis?' : 'The ability to focus without distraction is becoming rare and increasingly valuable in our knowledge economy.'}
        </p>
        {flipped && <span style={{ fontSize: '10px', color: '#b5462f', fontWeight: 600, fontFamily: S.font }}>Answer revealed</span>}
      </div>
      {/* Grade buttons */}
      <div style={{ display: 'flex', gap: '6px', transition: 'opacity 0.4s', opacity: graded ? 1 : 0 }}>
        {[
          { label: 'Again', color: '#b5462f' },
          { label: 'Hard', color: '#9c7a23' },
          { label: 'Good', color: '#46557a' },
          { label: 'Easy', color: '#4f6b3a' },
        ].map((g) => (
          <div key={g.label} style={{ flex: 1, border: `1px solid ${g.color}`, color: g.color, borderRadius: '8px', padding: '5px 0', fontSize: '11px', fontWeight: 700, textAlign: 'center', fontFamily: S.font }}>
            {g.label}
          </div>
        ))}
      </div>
    </div>
  )
}

function TeachBackPreview() {
  const text = "Deep work is the ability to focus without distraction on cognitively demanding tasks..."
  const [typed, setTyped] = useState(0)
  const [result, setResult] = useState(false)
  useEffect(() => {
    const interval = setInterval(() => setTyped((t) => {
      if (t >= text.length) { clearInterval(interval); return t }
      return t + 3
    }), 40)
    const t2 = setTimeout(() => setResult(true), 2200)
    return () => { clearInterval(interval); clearTimeout(t2) }
  }, [])

  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{ background: '#f5f2ec', border: '1px solid #e6e0d4', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: '#2a2620', fontFamily: S.serif, lineHeight: 1.5, minHeight: '60px' }}>
        {text.slice(0, typed)}<span style={{ animation: 'blink 1s step-end infinite', borderRight: '1px solid #2a2620' }}>&nbsp;</span>
      </div>
      <div style={{ marginTop: '10px', transition: 'opacity 0.5s', opacity: result ? 1 : 0 }}>
        <div style={{ background: 'rgba(111,138,90,.1)', border: '1px solid rgba(111,138,90,.3)', borderRadius: '8px', padding: '10px 12px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#4f6b3a', fontFamily: S.font, marginBottom: '4px' }}>✓ Strong — 87% comprehension</p>
          <p style={{ fontSize: '11px', color: '#7c7361', fontFamily: S.font }}>Gap: mention the Newport framework for scheduling deep work blocks.</p>
        </div>
      </div>
    </div>
  )
}

function StreakPreview() {
  const [count, setCount] = useState(0)
  const [showing, setShowing] = useState(false)
  const days = [false, true, true, false, true, true, true]
  useEffect(() => {
    const t = setTimeout(() => setShowing(true), 300)
    const interval = setInterval(() => setCount((c) => (c < 5 ? c + 1 : c)), 220)
    return () => { clearTimeout(t); clearInterval(interval) }
  }, [])

  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px', transition: 'opacity 0.4s', opacity: showing ? 1 : 0 }}>
        <span style={{ fontFamily: S.serif, fontWeight: 700, fontSize: '32px', color: '#b5462f' }}>{count}</span>
        <span style={{ fontSize: '12px', color: '#7c7361', fontFamily: S.font }}>day streak 🔥</span>
      </div>
      <div style={{ display: 'flex', gap: '5px' }}>
        {days.map((active, i) => (
          <div
            key={i}
            style={{
              flex: 1, height: '20px', borderRadius: '4px',
              background: active ? '#b5462f' : '#ede8df',
              opacity: showing ? (active ? 0.85 : 0.5) : 0,
              transition: 'opacity 0.3s',
              transitionDelay: `${i * 0.06}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

function ExpressPreview() {
  const [active, setActive] = useState(0)
  const [showing, setShowing] = useState(false)
  const formats = ['Talking Points', 'STAR Story', 'Profile Bio', 'Summary']
  const colors = ['#b5462f', '#c79a3e', '#46557a', '#6f8a5a']
  useEffect(() => {
    const interval = setInterval(() => setActive((a) => (a + 1) % formats.length), 900)
    const t = setTimeout(() => setShowing(true), 400)
    return () => { clearInterval(interval); clearTimeout(t) }
  }, [])

  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
        {formats.map((f, i) => (
          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', borderRadius: '7px', border: `1px solid ${active === i ? colors[i] : '#e6e0d4'}`, background: active === i ? `${colors[i]}10` : 'transparent', transition: 'all 0.3s', opacity: showing ? 1 : 0, transitionDelay: `${i * 0.1}s` }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors[i], flexShrink: 0 }} />
            <span style={{ fontSize: '12px', fontWeight: active === i ? 700 : 500, color: active === i ? colors[i] : '#7c7361', fontFamily: S.font }}>{f}</span>
            {active === i && <span style={{ marginLeft: 'auto', fontSize: '10px', color: colors[i], fontFamily: S.font }}>→ Generate</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

const FEATURES = [
  {
    icon: '⚡',
    color: '#b5462f',
    title: 'Capture',
    desc: 'Paste URLs or write notes — AI summarizes and organizes everything into your shelves.',
    detail: 'Drop any URL or raw text. AI scans, extracts key ideas, and slots the learning into your library — ready for review.',
    Preview: CapturePreview,
  },
  {
    icon: '🔁',
    color: '#46557a',
    title: 'Smart Review',
    desc: 'Spaced repetition flashcards surface at the perfect moment. Never forget what matters.',
    detail: 'Cards appear exactly when your memory is about to fade. Rate recall and the algorithm adjusts — locking knowledge in long-term.',
    Preview: ReviewPreview,
  },
  {
    icon: '🎯',
    color: '#c79a3e',
    title: 'Teach Back',
    desc: 'Explain in your own words. AI identifies gaps and guides you to deeper understanding.',
    detail: 'Type your explanation like you\'re teaching a friend. AI scores comprehension, surfaces gaps, and suggests follow-up questions.',
    Preview: TeachBackPreview,
  },
  {
    icon: '✨',
    color: '#6f8a5a',
    title: 'Express',
    desc: 'Turn your library into talking points, STAR stories, or a profile summary in seconds.',
    detail: 'Pick a format and your learnings are articulated for interviews, bios, or conversations — ready to copy and use.',
    Preview: ExpressPreview,
  },
  {
    icon: '🔥',
    color: '#b5462f',
    title: 'Streaks',
    desc: 'Every capture or review counts toward your streak — a daily nudge to keep showing up.',
    detail: 'Track your streak on the dashboard, freeze it when life happens, and share your progress with a public link.',
    Preview: StreakPreview,
  },
]

export function FeatureCards() {
  const [hovered, setHovered] = useState<number | null>(null)
  const [tapped, setTapped] = useState<number | null>(null)
  const [previewKey, setPreviewKey] = useState(0)

  const handleEnter = (i: number) => {
    setHovered(i)
    setPreviewKey((k) => k + 1)
  }

  return (
    <>
      <style>{`
        @keyframes scan-shimmer {
          0% { transform: translateX(-100%); opacity: 0; }
          30% { opacity: 1; }
          70% { opacity: 1; }
          100% { transform: translateX(200%); opacity: 0; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        /* Desktop: horizontal accordion */
        .feat-row {
          display: flex;
          gap: 12px;
          align-items: stretch;
        }
        .feat-card {
          flex: 1;
          min-width: 0;
          transition: flex 0.45s cubic-bezier(0.34, 1.2, 0.64, 1), box-shadow 0.3s ease, border-color 0.3s ease;
          cursor: default;
          overflow: hidden;
        }
        .feat-card.expanded { flex: 2.6; }
        .feat-card.compressed { flex: 0.7; }
        .feat-preview {
          max-height: 0;
          overflow: hidden;
          opacity: 0;
          transition: max-height 0.4s ease, opacity 0.35s ease;
        }
        .feat-card.expanded .feat-preview,
        .feat-card.mobile-open .feat-preview {
          max-height: 260px;
          opacity: 1;
        }
        .feat-detail {
          max-height: 0;
          overflow: hidden;
          opacity: 0;
          transition: max-height 0.35s ease, opacity 0.3s ease;
        }
        .feat-card.expanded .feat-detail,
        .feat-card.mobile-open .feat-detail {
          max-height: 60px;
          opacity: 1;
        }
        /* Mobile: vertical stack */
        @media (max-width: 640px) {
          .feat-row {
            flex-direction: column;
            gap: 10px;
          }
          .feat-card { flex: none !important; }
          .feat-card.expanded { flex: none !important; }
          .feat-card.compressed { flex: none !important; }
        }
      `}</style>

      <div className="feat-row">
        {FEATURES.map((feat, i) => {
          const state = hovered === null ? 'idle' : hovered === i ? 'expanded' : 'compressed'
          const mobileOpen = tapped === i
          const { Preview } = feat
          const isActive = state === 'expanded' || mobileOpen
          return (
            <div
              key={i}
              className={[
                'feat-card',
                state === 'expanded' ? 'expanded' : state === 'compressed' ? 'compressed' : '',
                mobileOpen ? 'mobile-open' : '',
              ].join(' ').trim()}
              style={{
                background: '#fff',
                border: `1px solid ${isActive ? feat.color : '#e6e0d4'}`,
                borderRadius: '12px',
                padding: '24px 20px',
                boxShadow: isActive
                  ? `0 16px 40px -12px rgba(42,38,32,.18), 0 0 0 1px ${feat.color}22`
                  : '0 8px 24px -16px rgba(42,38,32,.3)',
              }}
              onMouseEnter={() => { handleEnter(i) }}
              onMouseLeave={() => setHovered(null)}
              onClick={() => { setTapped(mobileOpen ? null : i); setPreviewKey((k) => k + 1) }}
            >
              {/* Icon + title row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <div style={{ width: '44px', height: '44px', background: feat.color, borderRadius: '10px', display: 'grid', placeItems: 'center', fontSize: '20px', flexShrink: 0 }}>
                  {feat.icon}
                </div>
                <h3 style={{ fontFamily: S.serif, fontWeight: 600, fontSize: '17px', color: '#2a2620', margin: 0, whiteSpace: 'nowrap' }}>
                  {feat.title}
                </h3>
                {/* Mobile tap indicator */}
                <span style={{ marginLeft: 'auto', fontSize: '16px', color: feat.color, transition: 'transform 0.2s', transform: mobileOpen ? 'rotate(180deg)' : 'none', display: 'inline-block' }}>
                  ›
                </span>
              </div>

              {/* Short desc */}
              <p style={{ fontSize: '13px', color: '#7c7361', lineHeight: '1.55', margin: 0 }}>
                {feat.desc}
              </p>

              {/* Expanded detail line */}
              <div className="feat-detail">
                <p style={{ fontSize: '12px', color: feat.color, fontWeight: 600, fontFamily: S.font, marginTop: '10px', lineHeight: 1.4 }}>
                  {feat.detail}
                </p>
              </div>

              {/* Live preview */}
              <div className="feat-preview">
                {(hovered === i || tapped === i) && <Preview key={previewKey} />}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
