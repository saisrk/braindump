'use client';

import { useState, useTransition, useEffect } from 'react';
import { completeOnboarding } from '@/lib/actions/onboarding';
import { topicGradient } from '@/lib/book-colors';

const F = "'Inter', system-ui, sans-serif";
const SERIF = "'Spectral', Georgia, serif";

const TOPICS = [
  { label: 'AI', emoji: '🤖' },
  { label: 'Leadership', emoji: '🧭' },
  { label: 'Coding', emoji: '💻' },
  { label: 'Design', emoji: '🎨' },
  { label: 'Science', emoji: '🔬' },
  { label: 'Business', emoji: '📈' },
  { label: 'Personal Dev', emoji: '🌱' },
];

function MiniBookSpine({
  topic,
  selected,
  onClick,
  index,
}: {
  topic: { label: string; emoji: string };
  selected: boolean;
  onClick: () => void;
  index: number;
}) {
  const grad = topicGradient(topic.label);
  const heights = [90, 110, 100, 120, 95, 105, 115];
  const h = heights[index % heights.length];

  return (
    <button
      onClick={onClick}
      style={{
        position: 'relative',
        width: '58px',
        height: `${h}px`,
        background: grad,
        borderRadius: '3px 4px 4px 3px',
        border: 'none',
        cursor: 'pointer',
        boxShadow: selected
          ? `0 -6px 18px -4px rgba(0,0,0,.35), inset -3px 0 8px rgba(0,0,0,.25)`
          : `0 2px 6px -2px rgba(0,0,0,.25), inset -3px 0 8px rgba(0,0,0,.2)`,
        transform: selected ? 'translateY(-10px)' : 'translateY(0)',
        transition: 'transform 0.25s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        outline: selected ? '2px solid rgba(255,255,255,0.5)' : 'none',
        outlineOffset: '1px',
      }}
    >
      {/* Vertical title */}
      <span
        style={{
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          fontFamily: F,
          fontSize: '9px',
          fontWeight: 700,
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.85)',
          lineHeight: 1,
          userSelect: 'none',
        }}
      >
        {topic.label}
      </span>
      {/* Selected checkmark */}
      {selected && (
        <div
          style={{
            position: 'absolute',
            top: '6px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '14px',
            height: '14px',
            background: 'rgba(255,255,255,0.25)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M1.5 4L3 5.5L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </button>
  );
}

function ShelfBoard({ books }: { books: { label: string }[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Books row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '4px',
          padding: '0 12px',
          minHeight: '130px',
        }}
      >
        {books.length === 0 ? (
          <div
            style={{
              width: '58px',
              height: '90px',
              border: '2px dashed rgba(181,70,47,0.3)',
              borderRadius: '3px 4px 4px 3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontFamily: F, fontSize: '18px', color: 'rgba(181,70,47,0.4)' }}>+</span>
          </div>
        ) : (
          books.map((b, i) => {
            const grad = topicGradient(b.label);
            const heights = [90, 110, 100, 120, 95];
            const h = heights[i % heights.length];
            return (
              <div
                key={b.label}
                style={{
                  width: '38px',
                  height: `${h}px`,
                  background: grad,
                  borderRadius: '3px 4px 4px 3px',
                  boxShadow: 'inset -3px 0 8px rgba(0,0,0,.2)',
                  flexShrink: 0,
                  animation: 'shelf-drop 0.35s cubic-bezier(.34,1.56,.64,1) both',
                }}
              />
            );
          })
        )}
      </div>
      {/* Shelf board */}
      <div
        style={{
          height: '10px',
          background: 'linear-gradient(180deg, #c8b89a 0%, #b5a285 100%)',
          borderRadius: '0 0 2px 2px',
          boxShadow: '0 3px 8px -2px rgba(42,38,32,.3)',
        }}
      />
    </div>
  );
}

function LoopStep({
  icon,
  label,
  desc,
  color,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
  color: string;
  delay: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        animation: `fadein 0.4s ease ${delay} both`,
      }}
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '14px',
          background: `${color}18`,
          border: `1.5px solid ${color}40`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '22px',
        }}
      >
        {icon}
      </div>
      <p style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '13px', color: '#2a2620', margin: 0 }}>{label}</p>
      <p style={{ fontFamily: F, fontSize: '11px', color: '#7c7361', margin: 0, textAlign: 'center', lineHeight: 1.4 }}>{desc}</p>
    </div>
  );
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [celebrating, setCelebrating] = useState(false);
  const [confetti, setConfetti] = useState<{ x: number; color: string; delay: string }[]>([]);

  function toggleTopic(topic: string) {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  }

  function goToStep3() {
    setStep(3);
    // Trigger celebration after a short delay
    setTimeout(() => {
      setCelebrating(true);
      setConfetti(
        Array.from({ length: 18 }, (_, i) => ({
          x: 10 + Math.random() * 80,
          color: ['#b5462f', '#c79a3e', '#6f8a5a', '#46557a', '#8a5072'][i % 5],
          delay: `${Math.random() * 0.4}s`,
        }))
      );
    }, 100);
  }

  function handleFinish() {
    startTransition(async () => {
      await completeOnboarding(name, selectedTopics);
    });
  }

  const firstName = name.trim().split(' ')[0] || null;

  // Arc progress: step 1 = 33%, step 2 = 66%, step 3 = 100%
  const arcPercent = (step / 3) * 100;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f5f2ec',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        fontFamily: F,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@400;500;600;700&display=swap');
        @keyframes fadein { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shelf-drop { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes confetti-fall {
          0% { opacity: 1; transform: translateY(-10px) rotate(0deg); }
          100% { opacity: 0; transform: translateY(80px) rotate(360deg); }
        }
        @keyframes step-enter { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        .onb-step { animation: step-enter 0.3s ease both; }
      `}</style>

      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Brand mark */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '32px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              background: '#b5462f',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="3" y="2" width="8" height="14" rx="1.5" fill="white" opacity="0.9" />
              <rect x="7" y="2" width="8" height="14" rx="1.5" fill="white" opacity="0.6" />
            </svg>
          </div>
          <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '20px', color: '#2a2620' }}>Braindump</span>
        </div>

        {/* Progress arc */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
          <div style={{ position: 'relative', width: '60px', height: '60px' }}>
            <svg width="60" height="60" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="30" cy="30" r="24" fill="none" stroke="#e6e0d4" strokeWidth="4" />
              <circle
                cx="30"
                cy="30"
                r="24"
                fill="none"
                stroke="#b5462f"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 24}`}
                strokeDashoffset={`${2 * Math.PI * 24 * (1 - arcPercent / 100)}`}
                style={{ transition: 'stroke-dashoffset 0.5s cubic-bezier(.4,0,.2,1)' }}
              />
            </svg>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: F,
                fontSize: '12px',
                fontWeight: 700,
                color: '#b5462f',
              }}
            >
              {step}/3
            </div>
          </div>
        </div>

        {/* Card */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e6e0d4',
            borderRadius: '20px',
            padding: '36px 32px',
            boxShadow: '0 12px 40px -16px rgba(42,38,32,.2)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Confetti */}
          {celebrating && confetti.map((c, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: 0,
                left: `${c.x}%`,
                width: '6px',
                height: '6px',
                background: c.color,
                borderRadius: '1px',
                animation: `confetti-fall 1s ease ${c.delay} forwards`,
                pointerEvents: 'none',
              }}
            />
          ))}

          {/* ── Step 1 ── */}
          {step === 1 && (
            <div className="onb-step" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <p style={{ fontFamily: F, fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#b5462f', margin: '0 0 8px' }}>
                  Your second brain
                </p>
                <h1 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '28px', color: '#2a2620', margin: '0 0 8px', lineHeight: 1.2 }}>
                  Everything you learn,<br />finally remembered.
                </h1>
                <p style={{ fontFamily: F, fontSize: '14px', color: '#7c7361', margin: 0, lineHeight: 1.6 }}>
                  Capture ideas, review them at the right time, and actually retain what matters. Let&apos;s get you set up in 3 steps.
                </p>
              </div>

              <div>
                <label style={{ fontFamily: F, fontSize: '13px', fontWeight: 600, color: '#2a2620', display: 'block', marginBottom: '8px' }}>
                  What should we call you?
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && name.trim() && setStep(2)}
                  placeholder="Your name"
                  autoFocus
                  style={{
                    width: '100%',
                    background: '#f5f2ec',
                    border: '1.5px solid #e6e0d4',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    fontFamily: F,
                    fontSize: '15px',
                    color: '#2a2620',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#b5462f')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#e6e0d4')}
                />
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!name.trim()}
                style={{
                  width: '100%',
                  background: name.trim() ? '#b5462f' : '#e6e0d4',
                  color: name.trim() ? '#fff' : '#aaa190',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px',
                  fontFamily: F,
                  fontWeight: 700,
                  fontSize: '15px',
                  cursor: name.trim() ? 'pointer' : 'not-allowed',
                  transition: 'background 0.2s',
                  boxShadow: name.trim() ? '0 6px 16px -6px rgba(181,70,47,.5)' : 'none',
                }}
              >
                Continue →
              </button>
            </div>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <div className="onb-step" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <p style={{ fontFamily: F, fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#b5462f', margin: '0 0 8px' }}>
                  {firstName ? `Hey ${firstName}!` : 'Step 2'}
                </p>
                <h2 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '26px', color: '#2a2620', margin: '0 0 6px', lineHeight: 1.2 }}>
                  What do you want to learn?
                </h2>
                <p style={{ fontFamily: F, fontSize: '13px', color: '#7c7361', margin: 0 }}>
                  Pick your topics — each one becomes a shelf in your library.
                </p>
              </div>

              {/* Book spine chips */}
              <div>
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {TOPICS.map((topic, i) => (
                    <MiniBookSpine
                      key={topic.label}
                      topic={topic}
                      selected={selectedTopics.includes(topic.label)}
                      onClick={() => toggleTopic(topic.label)}
                      index={i}
                    />
                  ))}
                </div>

                {/* Mini shelf preview */}
                <div style={{ marginTop: '16px', background: '#f5f2ec', borderRadius: '10px', padding: '8px 8px 0', overflow: 'hidden' }}>
                  <p style={{ fontFamily: F, fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#aaa190', margin: '0 0 4px 4px' }}>
                    Your library preview
                  </p>
                  <ShelfBoard books={selectedTopics.map(l => ({ label: l }))} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: '1.5px solid #e6e0d4',
                    borderRadius: '12px',
                    padding: '13px',
                    fontFamily: F,
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#7c7361',
                    cursor: 'pointer',
                  }}
                >
                  ← Back
                </button>
                <button
                  onClick={goToStep3}
                  style={{
                    flex: 2,
                    background: '#b5462f',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '13px',
                    fontFamily: F,
                    fontWeight: 700,
                    fontSize: '14px',
                    color: '#fff',
                    cursor: 'pointer',
                    boxShadow: '0 6px 16px -6px rgba(181,70,47,.5)',
                  }}
                >
                  {selectedTopics.length === 0 ? 'Skip →' : `Set up ${selectedTopics.length} shelf${selectedTopics.length !== 1 ? 'ves' : ''} →`}
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3 ── */}
          {step === 3 && (
            <div className="onb-step" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: F, fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#6f8a5a', margin: '0 0 8px' }}>
                  Ready to go
                </p>
                <h2 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '26px', color: '#2a2620', margin: '0 0 6px', lineHeight: 1.2 }}>
                  {firstName ? `Welcome, ${firstName}!` : 'Your space is ready!'}
                </h2>
                <p style={{ fontFamily: F, fontSize: '13px', color: '#7c7361', margin: 0 }}>
                  {selectedTopics.length > 0
                    ? `We've seeded your library with starter learnings across your ${selectedTopics.length} topic${selectedTopics.length !== 1 ? 's' : ''}.`
                    : "We've seeded your library with a few starter learnings."}
                </p>
              </div>

              {/* The loop — 3-icon flow */}
              <div
                style={{
                  background: '#f5f2ec',
                  borderRadius: '14px',
                  padding: '20px 16px',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto 1fr auto 1fr',
                  alignItems: 'start',
                  gap: '0',
                }}
              >
                <LoopStep icon="📥" label="Capture" desc="Paste a URL or idea" color="#b5462f" delay="0s" />
                <div style={{ display: 'flex', alignItems: 'center', paddingTop: '22px', color: '#aaa190', fontFamily: F, fontSize: '16px' }}>→</div>
                <LoopStep icon="🃏" label="Review" desc="Spaced repetition cards" color="#46557a" delay="0.1s" />
                <div style={{ display: 'flex', alignItems: 'center', paddingTop: '22px', color: '#aaa190', fontFamily: F, fontSize: '16px' }}>→</div>
                <LoopStep icon="🧠" label="Master" desc="Teach it back to the AI" color="#6f8a5a" delay="0.2s" />
              </div>

              {/* Selected topics mini preview */}
              {selectedTopics.length > 0 && (
                <div>
                  <p style={{ fontFamily: F, fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#aaa190', margin: '0 0 8px' }}>
                    Your shelves
                  </p>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {selectedTopics.map((t) => (
                      <span
                        key={t}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '4px 10px',
                          background: `${topicGradient(t).match(/#[0-9a-f]{6}/i)?.[0] ?? '#b5462f'}20`,
                          borderRadius: '20px',
                          fontFamily: F,
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#2a2620',
                        }}
                      >
                        <span
                          style={{
                            display: 'inline-block',
                            width: '8px',
                            height: '8px',
                            borderRadius: '1px',
                            background: topicGradient(t),
                          }}
                        />
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleFinish}
                disabled={isPending}
                style={{
                  width: '100%',
                  background: isPending ? '#e6e0d4' : '#b5462f',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '15px',
                  fontFamily: F,
                  fontWeight: 700,
                  fontSize: '15px',
                  color: isPending ? '#aaa190' : '#fff',
                  cursor: isPending ? 'not-allowed' : 'pointer',
                  boxShadow: isPending ? 'none' : '0 6px 16px -6px rgba(181,70,47,.55)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background 0.2s',
                }}
              >
                {isPending ? (
                  <>
                    <span
                      style={{
                        display: 'inline-block',
                        width: '14px',
                        height: '14px',
                        border: '2px solid #aaa190',
                        borderTopColor: '#7c7361',
                        borderRadius: '50%',
                        animation: 'spin 0.7s linear infinite',
                      }}
                    />
                    Setting up your library…
                  </>
                ) : (
                  'Open my library →'
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer note */}
        <p style={{ fontFamily: F, fontSize: '12px', color: '#aaa190', textAlign: 'center', marginTop: '20px' }}>
          Your knowledge, your space — nothing shared without permission.
        </p>
      </div>
    </div>
  );
}
