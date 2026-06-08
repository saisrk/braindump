'use client'

import { useEffect, useState } from 'react'

interface BookLoaderProps {
  variant: 'quiz' | 'teachback' | 'review'
}

const CONFIGS = {
  quiz: {
    eyebrow: 'Test Yourself',
    color: '#46557a',
    phases: [
      { icon: '📖', line: 'Opening your library…' },
      { icon: '🧠', line: 'Generating questions from your notes…' },
      { icon: '✏️', line: 'Setting the difficulty…' },
      { icon: '✦', line: 'Almost ready…' },
    ],
  },
  teachback: {
    eyebrow: 'Teach Back',
    color: '#c79a3e',
    phases: [
      { icon: '📚', line: 'Pulling up your learning…' },
      { icon: '🎯', line: 'Preparing the teach-back session…' },
      { icon: '💬', line: 'Loading AI grader…' },
      { icon: '✦', line: 'Ready to hear your explanation…' },
    ],
  },
  review: {
    eyebrow: 'Smart Review',
    color: '#b5462f',
    phases: [
      { icon: '🗃️', line: 'Checking your review queue…' },
      { icon: '📅', line: 'Scheduling cards by memory curve…' },
      { icon: '⚡', line: 'Preparing flashcards…' },
      { icon: '✦', line: 'Let\'s reinforce your memory…' },
    ],
  },
}

// Animated book spines
function MiniShelf({ color }: { color: string }) {
  const books = [
    { h: 52, grad: `linear-gradient(160deg, ${color}, ${color}cc)` },
    { h: 64, grad: 'linear-gradient(160deg, #6f8a5a, #4a6040)' },
    { h: 44, grad: 'linear-gradient(160deg, #c79a3e, #a07828)' },
    { h: 58, grad: 'linear-gradient(160deg, #8a5072, #633858)' },
    { h: 48, grad: 'linear-gradient(160deg, #5a6a7a, #3e4e5e)' },
  ]

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', position: 'relative', padding: '0 8px 12px' }}>
      {books.map((b, i) => (
        <div
          key={i}
          style={{
            width: '22px',
            height: `${b.h}px`,
            background: b.grad,
            borderRadius: '2px 3px 3px 2px',
            boxShadow: 'inset -2px 0 4px rgba(0,0,0,.2)',
            animation: `book-bounce 1.8s ease-in-out ${i * 0.18}s infinite`,
          }}
        />
      ))}
      {/* shelf */}
      <div style={{
        position: 'absolute',
        bottom: '0',
        left: '0',
        right: '0',
        height: '8px',
        background: '#d8cdb8',
        borderRadius: '0 0 4px 4px',
        boxShadow: '0 3px 6px -2px rgba(42,38,32,.2)',
      }} />
    </div>
  )
}

// Scanning highlight bars (like the capture loader)
function ScanLines({ color }: { color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', width: '200px' }}>
      {['100%', '82%', '94%', '68%', '88%'].map((w, i) => (
        <div
          key={i}
          style={{
            position: 'relative',
            height: '9px',
            borderRadius: '4px',
            background: '#ede8df',
            width: w,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `${color}60`,
              borderRadius: '4px',
              animation: `scan-sweep 2s ease-in-out ${i * 0.25}s infinite`,
            }}
          />
        </div>
      ))}
    </div>
  )
}

export function BookLoader({ variant }: BookLoaderProps) {
  const config = CONFIGS[variant]
  const [phaseIdx, setPhaseIdx] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setPhaseIdx((p) => (p + 1) % config.phases.length)
    }, 900)
    return () => clearInterval(interval)
  }, [config.phases.length])

  const phase = config.phases[phaseIdx]

  return (
    <>
      <style>{`
        @keyframes book-bounce {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes scan-sweep {
          0% { transform: translateX(-110%); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateX(110%); opacity: 0; }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .loader-phase {
          animation: fade-up 0.35s ease forwards;
        }
      `}</style>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '420px',
          gap: '0',
          textAlign: 'center',
          padding: '40px 20px',
        }}
      >
        {/* Animated shelf */}
        <MiniShelf color={config.color} />

        {/* Eyebrow */}
        <p
          style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '4px',
            textTransform: 'uppercase',
            color: config.color,
            marginTop: '28px',
            marginBottom: '6px',
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          {config.eyebrow}
        </p>

        {/* Phase text */}
        <p
          key={phaseIdx}
          className="loader-phase"
          style={{
            fontFamily: "'Spectral', Georgia, serif",
            fontSize: '18px',
            fontWeight: 600,
            color: 'var(--color-foreground, #2a2620)',
            marginBottom: '28px',
            lineHeight: 1.3,
          }}
        >
          <span style={{ marginRight: '8px' }}>{phase.icon}</span>
          <em style={{ fontStyle: 'italic' }}>{phase.line}</em>
        </p>

        {/* Scan lines */}
        <ScanLines color={config.color} />

        {/* Pulsing dot row */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '24px' }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: config.color,
                opacity: phaseIdx % 3 === i ? 1 : 0.25,
                transition: 'opacity 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>
    </>
  )
}
