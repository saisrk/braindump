'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Check, ChevronRight, Copy, RotateCcw, Search, Lock } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { runExpress, getExpressHistoryAction } from '@/lib/actions/express';
import { topicGradient } from '@/lib/book-colors';
import type { ExpressResult, ExpressFormat } from '@/lib/ai/express';
import type { ExpressHistoryItem } from '@/lib/data/express';

/* ── Types ───────────────────────────────────────────────────────── */

type Step = 'format' | 'scope' | 'loading' | 'result';

interface Learning {
  id: string;
  title: string;
  topic: string | null;
}

interface FormatDef {
  id: ExpressFormat;
  icon: string;
  color: string;
  tint: string;
  name: string;
  trigger: string;
  gain: string;
  example: string;
}

/* ── Format definitions (verbose copy) ───────────────────────────── */

const FORMATS: FormatDef[] = [
  {
    id: 'talking-points',
    icon: '◉',
    color: '#b5462f',
    tint: 'rgba(181,70,47,0.10)',
    name: 'Talking Points',
    trigger: 'Before a presentation, meeting, or podcast',
    gain: 'Walk into any room knowing exactly what to say. Your learnings become sharp, sequenced claims you can speak to confidently — no notes needed.',
    example: '• The 80/20 of skill acquisition\n  Most of the value comes from a handful of core concepts. Identify them early and you learn 10× faster.',
  },
  {
    id: 'star',
    icon: '★',
    color: '#c79a3e',
    tint: 'rgba(199,154,62,0.10)',
    name: 'STAR Stories',
    trigger: 'Before a job interview or performance review',
    gain: 'Turn abstract knowledge into interview-ready stories. Each answer follows the Situation-Task-Action-Result format recruiters expect, grounded in what you actually learned.',
    example: 'Q: Tell me about a time you applied data-driven thinking\nS: Our team was debating two directions with no clear winner…\nA: I pulled together usage data and ran a quick cohort analysis…\nR: We shipped the right feature 6 weeks faster.',
  },
  {
    id: 'profile',
    icon: '◈',
    color: '#46557a',
    tint: 'rgba(70,85,122,0.10)',
    name: 'Profile Summary',
    trigger: 'Updating your LinkedIn bio, speaker bio, or CV',
    gain: 'A crisp paragraph that shows what you know, not just what you\'ve done. Positions you as someone who actively builds expertise — a signal most profiles completely miss.',
    example: '• Continuous learner focused on AI product design and systems thinking\n• Built intuition for LLM capabilities through 40+ hours of hands-on study\n• Translate complex technical concepts into actionable team decisions',
  },
  {
    id: 'summary',
    icon: '▦',
    color: '#6f8a5a',
    tint: 'rgba(111,138,90,0.10)',
    name: 'Learning Summary',
    trigger: 'Sharing with your team, writing a newsletter, or documenting what you studied',
    gain: 'A structured Markdown document your colleagues can actually read. The kind of internal post that makes you look like a thought leader — written in seconds, not hours.',
    example: '## What I learned about transformer attention\n\nThe core insight: each token "looks at" all others and decides what\'s relevant. This is why context window size matters so much…',
  },
];

/* ── Helpers ─────────────────────────────────────────────────────── */

function formatOutput(res: ExpressResult): string {
  if (res.talkingPoints)
    return res.talkingPoints.map((p) => `• ${p.headline}\n  ${p.detail}`).join('\n\n');
  if (res.starAnswers)
    return res.starAnswers
      .map((a) => `Q: ${a.prompt}\n\nS: ${a.situation}\nT: ${a.task}\nA: ${a.action}\nR: ${a.result}`)
      .join('\n\n---\n\n');
  if (res.profileBullets) return res.profileBullets.map((b) => `• ${b}`).join('\n');
  if (res.narrative) return res.narrative;
  return '';
}

/* ── Step 1: Format Picker ───────────────────────────────────────── */

function FormatPicker({
  selected,
  onSelect,
  onContinue,
}: {
  selected: ExpressFormat | null;
  onSelect: (id: ExpressFormat) => void;
  onContinue: () => void;
}) {
  const [expanded, setExpanded] = useState<ExpressFormat | null>(null);

  return (
    <div className="max-w-2xl">
      <p className="text-sm text-muted-foreground mb-5" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        What do you want to create? Pick a format and we'll pull your learnings into it.
      </p>

      <div className="space-y-3">
        {FORMATS.map((f) => {
          const isSelected = selected === f.id;
          const isExpanded = expanded === f.id;

          return (
            <div
              key={f.id}
              onClick={() => { onSelect(f.id); setExpanded(f.id); }}
              style={{
                border: `1.5px solid ${isSelected ? f.color : 'var(--color-border)'}`,
                borderRadius: '14px',
                background: isSelected ? f.tint : 'var(--color-card)',
                cursor: 'pointer',
                transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
                boxShadow: isSelected ? `0 0 0 3px ${f.color}22` : '0 1px 4px rgba(42,38,32,0.06)',
                overflow: 'hidden',
              }}
            >
              {/* Card header row */}
              <div className="flex items-center gap-4 px-5 py-4">
                <div
                  className="flex-shrink-0 w-11 h-11 rounded-xl grid place-items-center text-white font-bold text-lg"
                  style={{ background: isSelected ? f.color : f.tint, color: isSelected ? '#fff' : f.color, transition: 'background 0.15s, color 0.15s' }}
                >
                  {f.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground" style={{ fontFamily: 'Spectral, Georgia, serif', fontSize: '16px' }}>
                      {f.name}
                    </h4>
                    {isSelected && (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-xs" style={{ background: f.color }}>
                        <Check size={11} strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: f.color, fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600 }}>
                    {f.trigger}
                  </p>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); setExpanded(isExpanded ? null : f.id); }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                  style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                >
                  {isExpanded ? 'Less' : 'See example'}
                </button>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div style={{ borderTop: `1px solid ${f.color}33`, background: `${f.tint}` }}>
                  <div className="px-5 py-4 space-y-3">
                    <p className="text-sm text-foreground leading-relaxed" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                      {f.gain}
                    </p>
                    <div
                      className="rounded-lg px-4 py-3"
                      style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)' }}
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: f.color, fontFamily: 'Inter, system-ui, sans-serif' }}>
                        Sample output
                      </p>
                      <pre className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                        {f.example}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selected && (
        <div className="mt-6">
          <button
            onClick={onContinue}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
            style={{ background: FORMATS.find(f => f.id === selected)!.color, fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            Continue <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Upgrade Modal ────────────────────────────────────────────────── */

function UpgradeModal({ reason, onClose }: { reason: 'pro_required' | 'not_proven'; onClose: () => void }) {
  const router = useRouter();
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(42,38,32,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative rounded-2xl p-8 max-w-sm w-full"
        style={{ background: 'var(--color-card)', border: '1.5px solid var(--color-border)', boxShadow: '0 24px 48px -12px rgba(42,38,32,0.4)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {reason === 'pro_required' ? (
          <>
            <div className="w-12 h-12 rounded-xl grid place-items-center text-2xl mb-4" style={{ background: 'rgba(181,70,47,0.12)' }}>⚡</div>
            <h3 className="font-bold text-xl mb-2 text-foreground" style={{ fontFamily: 'Spectral, Georgia, serif' }}>Express is a Pro feature</h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              You've used your one free Express run. Upgrade to Pro for unlimited content generation from your library.
            </p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-xl grid place-items-center text-2xl mb-4" style={{ background: 'rgba(199,154,62,0.12)' }}>🔒</div>
            <h3 className="font-bold text-xl mb-2 text-foreground" style={{ fontFamily: 'Spectral, Georgia, serif' }}>Prove your learning first</h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              Express works best when you've tested your understanding. Complete a quiz (score ≥ 70) or a teach-back (score ≥ 60) on at least one selected learning.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 mb-6" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              <li>→ Go to <strong>Review</strong> to test yourself</li>
              <li>→ Or try <strong>Teach Back</strong> from a library card</li>
            </ul>
          </>
        )}
        {reason === 'pro_required' ? (
          <button
            onClick={() => router.push('/pricing')}
            className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
            style={{ background: '#b5462f', fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            Upgrade to Pro →
          </button>
        ) : (
          <button
            onClick={onClose}
            className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
            style={{ background: '#b5462f', fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            Got it
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Step 2: Scope Selector ─────────────────────────────────────── */

const BOOK_HEIGHTS_SM = [48, 42, 52, 44, 50, 40, 46];

function ScopeSelector({
  learnings,
  format,
  provenIds,
  onBack,
  onGenerate,
}: {
  learnings: Learning[];
  format: FormatDef;
  provenIds: Set<string>;
  onBack: () => void;
  onGenerate: (ids: string[], scopeLabel: string, audience: string) => void;
}) {
  const [mode, setMode] = useState<'shelf' | 'pick'>('shelf');
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');

  const topicGroups = useMemo(() => {
    const map = new Map<string, Learning[]>();
    for (const l of learnings) {
      const key = l.topic ?? 'Uncategorised';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(l);
    }
    return map;
  }, [learnings]);

  const filteredLearnings = useMemo(() => {
    if (!search.trim()) return learnings;
    const q = search.toLowerCase();
    return learnings.filter(l => l.title.toLowerCase().includes(q) || (l.topic ?? '').toLowerCase().includes(q));
  }, [learnings, search]);

  const filteredGroups = useMemo(() => {
    const map = new Map<string, Learning[]>();
    for (const l of filteredLearnings) {
      const key = l.topic ?? 'Uncategorised';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(l);
    }
    return map;
  }, [filteredLearnings]);

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev => {
      const next = new Set(prev);
      if (next.has(topic)) next.delete(topic); else next.add(topic);
      return next;
    });
  };

  const toggleId = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSubmit = () => {
    if (mode === 'shelf') {
      if (selectedTopics.size === 0) {
        const ids = learnings.map(l => l.id);
        onGenerate(ids, 'Entire library', '');
      } else {
        const ids = learnings.filter(l => selectedTopics.has(l.topic ?? 'Uncategorised')).map(l => l.id);
        const label = Array.from(selectedTopics).join(', ');
        onGenerate(ids, label, '');
      }
    } else {
      const ids = Array.from(selectedIds);
      onGenerate(ids, `${ids.length} selected learnings`, '');
    }
  };

  const canSubmit = mode === 'shelf' ? true : selectedIds.size > 0;

  const submitLabel = mode === 'shelf'
    ? selectedTopics.size === 0
      ? 'Generate from entire library'
      : `Generate from ${selectedTopics.size} shelf${selectedTopics.size > 1 ? 's' : ''}`
    : selectedIds.size === 0
      ? 'Select at least one learning'
      : `Generate with ${selectedIds.size} learning${selectedIds.size > 1 ? 's' : ''}`;

  return (
    <div className="max-w-2xl flex flex-col" style={{ minHeight: 0 }}>
      {/* Format reminder */}
      <div className="flex items-center gap-3 mb-5 px-4 py-3 rounded-xl" style={{ background: format.tint, border: `1px solid ${format.color}44` }}>
        <span className="text-base font-bold" style={{ color: format.color }}>{format.icon}</span>
        <div className="flex-1">
          <span className="text-sm font-semibold" style={{ color: format.color, fontFamily: 'Spectral, Georgia, serif' }}>{format.name}</span>
          <span className="text-xs text-muted-foreground ml-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>{format.trigger}</span>
        </div>
        <button onClick={onBack} className="text-xs text-muted-foreground hover:text-foreground" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          Change
        </button>
      </div>

      {/* Segmented mode switcher */}
      <div
        className="flex mb-5 p-1 rounded-xl"
        style={{ background: 'var(--color-muted)', width: 'fit-content' }}
      >
        {(['shelf', 'pick'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className="px-5 py-1.5 rounded-lg text-sm font-semibold transition-all"
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              background: mode === m ? 'var(--color-card)' : 'transparent',
              color: mode === m ? 'var(--color-foreground)' : 'var(--color-muted-foreground)',
              boxShadow: mode === m ? '0 1px 4px rgba(42,38,32,0.10)' : 'none',
            }}
          >
            {m === 'shelf' ? 'By Shelf' : 'By Learning'}
          </button>
        ))}
      </div>

      {/* Shelf card grid */}
      {mode === 'shelf' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            maxHeight: '420px',
            overflowY: 'auto',
          }}
        >
          {Array.from(topicGroups.entries()).map(([topic, items]) => {
            const grad = topicGradient(topic);
            const active = selectedTopics.has(topic);
            const provenCount = items.filter((l) => provenIds.has(l.id)).length;
            const hasProven = provenCount > 0;
            return (
              <div
                key={topic}
                onClick={() => hasProven && toggleTopic(topic)}
                className="rounded-xl overflow-hidden transition-all"
                style={{
                  border: `2px solid ${active ? format.color : 'var(--color-border)'}`,
                  background: 'var(--color-card)',
                  boxShadow: active ? `0 0 0 3px ${format.color}22` : '0 1px 4px rgba(42,38,32,0.06)',
                  cursor: hasProven ? 'pointer' : 'not-allowed',
                  opacity: hasProven ? 1 : 0.55,
                  position: 'relative',
                }}
              >
                {/* Shelf visual area */}
                <div
                  style={{
                    background: 'linear-gradient(180deg, var(--color-background) 0%, var(--color-muted) 100%)',
                    padding: '12px 12px 0 12px',
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '3px',
                    minHeight: '72px',
                  }}
                >
                  {items.slice(0, 6).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-sm flex-shrink-0"
                      style={{
                        width: '14px',
                        height: `${BOOK_HEIGHTS_SM[i % BOOK_HEIGHTS_SM.length]}px`,
                        background: grad,
                        opacity: 0.9,
                      }}
                    />
                  ))}
                  {items.length > 6 && (
                    <div
                      className="rounded-sm flex items-center justify-center text-white flex-shrink-0"
                      style={{ width: '18px', height: '44px', background: grad, fontSize: '8px', opacity: 0.65, fontFamily: 'Inter, system-ui, sans-serif' }}
                    >
                      +{items.length - 6}
                    </div>
                  )}
                </div>
                {/* Shelf board */}
                <div style={{ height: '6px', background: 'var(--color-shelf, #d8cdb8)', borderBottom: '1px solid rgba(42,38,32,0.08)' }} />
                {/* Card body */}
                <div className="px-3 py-2.5">
                  <p className="text-sm font-semibold text-foreground truncate" style={{ fontFamily: 'Spectral, Georgia, serif' }}>{topic}</p>
                  <p className="text-xs mt-0.5" style={{ fontFamily: 'Inter, system-ui, sans-serif', color: 'var(--color-muted-foreground)' }}>
                    {items.length} vol{items.length !== 1 ? 's' : ''}
                    {hasProven
                      ? <span style={{ color: '#6f8a5a' }}> · {provenCount} proven</span>
                      : <span style={{ color: '#c79a3e' }}> · prove first</span>
                    }
                  </p>
                </div>
                {/* Selection indicator */}
                {hasProven && (
                  <div
                    className="absolute top-2 right-2 w-5 h-5 rounded-full border-2 grid place-items-center transition-all"
                    style={{ borderColor: active ? format.color : 'var(--color-border)', background: active ? format.color : 'var(--color-card)' }}
                  >
                    {active && <Check size={10} strokeWidth={3} color="#fff" />}
                  </div>
                )}
                {!hasProven && (
                  <div className="absolute top-2 right-2">
                    <Lock size={12} style={{ color: 'var(--color-muted-foreground)' }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Learning card grid */}
      {mode === 'pick' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search learnings…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-xl border border-border bg-card pl-8 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
              />
            </div>
            <button
              className="text-xs text-muted-foreground hover:text-foreground whitespace-nowrap flex-shrink-0"
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
              onClick={() => {
                const allIds = filteredLearnings.map(l => l.id);
                const allSelected = allIds.every(id => selectedIds.has(id));
                setSelectedIds(prev => {
                  const next = new Set(prev);
                  allIds.forEach(id => allSelected ? next.delete(id) : next.add(id));
                  return next;
                });
              }}
            >
              {filteredLearnings.every(l => selectedIds.has(l.id)) ? 'Deselect all' : 'Select all'}
            </button>
          </div>

          <div style={{ maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Array.from(filteredGroups.entries()).map(([topic, items]) => {
              const grad = topicGradient(topic);
              return (
                <div key={topic}>
                  <div className="mb-2 px-0.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>{topic}</p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    {items.map((l) => {
                      const active = selectedIds.has(l.id);
                      return (
                        <div
                          key={l.id}
                          onClick={() => toggleId(l.id)}
                          className="rounded-xl overflow-hidden transition-all cursor-pointer flex"
                          style={{
                            border: `2px solid ${active ? format.color : 'var(--color-border)'}`,
                            background: 'var(--color-card)',
                            boxShadow: active ? `0 0 0 3px ${format.color}22` : '0 1px 4px rgba(42,38,32,0.06)',
                            position: 'relative',
                            minHeight: '72px',
                          }}
                        >
                          {/* Narrow colour band on the left */}
                          <div style={{ width: '10px', flexShrink: 0, background: grad }} />
                          {/* Card body */}
                          <div className="px-3 py-2.5 flex flex-col justify-center flex-1 min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ fontFamily: 'Inter, system-ui, sans-serif', color: 'var(--color-muted-foreground)', fontSize: '9px' }}>
                              {topic}
                            </p>
                            <p className="text-sm font-semibold text-foreground leading-snug" style={{ fontFamily: 'Spectral, Georgia, serif', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {l.title}
                            </p>
                          </div>
                          {/* Selection check */}
                          <div
                            className="absolute top-2 right-2 w-5 h-5 rounded-full border-2 grid place-items-center transition-all flex-shrink-0"
                            style={{ borderColor: active ? format.color : 'var(--color-border)', background: active ? format.color : 'var(--color-card)' }}
                          >
                            {active && <Check size={10} strokeWidth={3} color="#fff" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer CTA */}
      <div className="mt-5 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:-translate-y-0.5"
          style={{ background: format.color, fontFamily: 'Inter, system-ui, sans-serif' }}
        >
          {submitLabel} →
        </button>
        {mode === 'shelf' && selectedTopics.size > 0 && (
          <button
            onClick={() => setSelectedTopics(new Set())}
            className="w-full text-center text-xs text-muted-foreground mt-2 hover:text-foreground transition-colors"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            Or use entire library
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Loading ─────────────────────────────────────────────────────── */

const LOADING_PHASES: Record<ExpressFormat, string[]> = {
  'talking-points': ['Reading your shelves…', 'Finding the strongest ideas…', 'Shaping your talking points…', 'Almost ready…'],
  star: ['Reading your shelves…', 'Finding the right stories…', 'Structuring your STAR answers…', 'Almost ready…'],
  profile: ['Reading your shelves…', 'Distilling your expertise…', 'Writing your summary…', 'Almost ready…'],
  summary: ['Reading your shelves…', 'Connecting the ideas…', 'Drafting your write-up…', 'Almost ready…'],
};

function LoadingView({ format }: { format: FormatDef }) {
  return (
    <div className="max-w-2xl flex flex-col items-center justify-center py-20 gap-5">
      <div className="w-14 h-14 rounded-2xl grid place-items-center text-white text-2xl" style={{ background: format.color }}>
        {format.icon}
      </div>
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="animate-spin" size={20} style={{ color: format.color }} />
        <p className="text-sm text-muted-foreground italic" style={{ fontFamily: 'Spectral, Georgia, serif' }}>
          {LOADING_PHASES[format.id][1]}
        </p>
      </div>
    </div>
  );
}

/* ── Result View ─────────────────────────────────────────────────── */

function ResultView({
  result,
  format,
  usedCount,
  onReset,
}: {
  result: ExpressResult;
  format: FormatDef;
  usedCount: number;
  onReset: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const output = formatOutput(result);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl grid place-items-center text-white text-base" style={{ background: format.color }}>
            {format.icon}
          </div>
          <div>
            <h3 className="font-semibold text-foreground" style={{ fontFamily: 'Spectral, Georgia, serif', fontSize: '16px' }}>{format.name}</h3>
            <p className="text-xs text-muted-foreground" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Based on {usedCount} learning{usedCount !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* Output */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <pre className="text-sm text-foreground leading-relaxed whitespace-pre-wrap" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          {output}
        </pre>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
        >
          <Copy size={14} />
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button
          onClick={onReset}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
        >
          <RotateCcw size={14} />
          Generate Another
        </button>
      </div>
    </div>
  );
}

/* ── History Tab ─────────────────────────────────────────────────── */

function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function HistoryTab({ history }: { history: ExpressHistoryItem[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (history.length === 0) {
    return (
      <div className="max-w-2xl flex flex-col items-center justify-center py-16 gap-3">
        <p className="text-3xl">📜</p>
        <p className="text-sm font-semibold text-foreground" style={{ fontFamily: 'Spectral, Georgia, serif' }}>No history yet</p>
        <p className="text-sm text-muted-foreground text-center" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          Your generated outputs will appear here after you run Express for the first time.
        </p>
      </div>
    );
  }

  const handleCopy = (item: ExpressHistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const output = formatOutput(item.output as unknown as ExpressResult);
    navigator.clipboard.writeText(output);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-2xl space-y-2">
      {history.map((item) => {
        const fmt = FORMATS.find(f => f.id === item.format) ?? FORMATS[0];
        const isExpanded = expandedId === item.id;
        const output = formatOutput(item.output as unknown as ExpressResult);

        return (
          <div
            key={item.id}
            style={{
              border: '1.5px solid var(--color-border)',
              borderRadius: '14px',
              background: 'var(--color-card)',
              overflow: 'hidden',
              transition: 'border-color 0.15s',
            }}
          >
            {/* Row header */}
            <div
              className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-muted/40 transition-colors"
              onClick={() => setExpandedId(isExpanded ? null : item.id)}
            >
              <div className="w-8 h-8 rounded-lg grid place-items-center text-white text-sm flex-shrink-0" style={{ background: fmt.color }}>
                {fmt.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground" style={{ fontFamily: 'Spectral, Georgia, serif' }}>{fmt.name}</span>
                  {item.audience && (
                    <span className="text-xs text-muted-foreground truncate" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                      for {item.audience}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    {fmtDate(item.createdAt)}
                  </span>
                  {item.scopeLabel && (
                    <>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs truncate" style={{ color: fmt.color, fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600 }}>
                        {item.scopeLabel}
                      </span>
                    </>
                  )}
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    {item.usedCount} learning{item.usedCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={(e) => handleCopy(item, e)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded"
                  style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                >
                  <Copy size={12} />
                  {copiedId === item.id ? 'Copied!' : 'Copy'}
                </button>
                <span className="text-muted-foreground text-xs">{isExpanded ? '▲' : '▼'}</span>
              </div>
            </div>

            {/* Expanded output */}
            {isExpanded && (
              <div style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-background)', padding: '16px 20px' }}>
                <pre className="text-sm text-foreground leading-relaxed whitespace-pre-wrap" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {output}
                </pre>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Main Client ─────────────────────────────────────────────────── */

export function ExpressClient({
  learnings,
  history: initialHistory,
  isPro,
  trialUsed,
  provenIds: provenIdsArray,
}: {
  learnings: Learning[];
  history: ExpressHistoryItem[];
  isPro: boolean;
  trialUsed: boolean;
  provenIds: string[];
}) {
  const [tab, setTab] = useState<'generate' | 'history'>('generate');
  const [step, setStep] = useState<Step>('format');
  const [selectedFormat, setSelectedFormat] = useState<ExpressFormat | null>(null);
  const [result, setResult] = useState<ExpressResult | null>(null);
  const [usedCount, setUsedCount] = useState(0);
  const [history, setHistory] = useState<ExpressHistoryItem[]>(initialHistory);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState<'pro_required' | 'not_proven' | null>(null);
  const [localTrialUsed, setLocalTrialUsed] = useState(trialUsed);

  const provenIds = useMemo(() => new Set(provenIdsArray), [provenIdsArray]);
  const formatDef = FORMATS.find(f => f.id === selectedFormat) ?? FORMATS[0];

  const refreshHistory = async () => {
    setHistoryLoading(true);
    const fresh = await getExpressHistoryAction();
    setHistory(fresh);
    setHistoryLoading(false);
  };

  const handleTabSwitch = (t: 'generate' | 'history') => {
    setTab(t);
    if (t === 'history') refreshHistory();
  };

  const handleGenerate = async (ids: string[], scopeLabel: string, audience: string) => {
    if (!selectedFormat) return;
    setStep('loading');
    const start = Date.now();

    const res = await runExpress({
      format: selectedFormat,
      learningIds: ids.length > 0 ? ids : undefined,
      audience: audience || undefined,
      scopeLabel,
    });

    const elapsed = Date.now() - start;
    const minWait = 2500;
    if (elapsed < minWait) await new Promise(r => setTimeout(r, minWait - elapsed));

    if (res.ok && res.result) {
      setResult(res.result);
      setUsedCount(res.usedCount ?? 0);
      setStep('result');
      if (!isPro) setLocalTrialUsed(true);
      // Refresh history in background so History tab is up to date
      getExpressHistoryAction().then(setHistory);
    } else if (res.errorCode === 'pro_required' || res.errorCode === 'not_proven') {
      setStep('scope');
      setUpgradeModal(res.errorCode as 'pro_required' | 'not_proven');
    } else {
      setStep('scope');
    }
  };

  // Step indicator
  const steps = [
    { key: 'format', label: 'Choose format' },
    { key: 'scope', label: 'Choose source' },
  ];
  const currentStepIdx = step === 'format' ? 0 : step === 'scope' ? 1 : step === 'loading' ? 1 : 2;

  return (
    <div className="flex flex-col h-full">
      {upgradeModal && (
        <UpgradeModal reason={upgradeModal} onClose={() => setUpgradeModal(null)} />
      )}
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-8 md:px-8">
        <PageHeader
          eyebrow="Express"
          title="Turn your shelves into content"
          subtitle="Choose a format, pick your source, and get a polished output in seconds."
          className="mb-4"
        />

        {/* Trial / Pro status callout */}
        {!isPro && !localTrialUsed && (
          <div className="max-w-2xl mb-4 px-4 py-3 rounded-xl flex items-center gap-3" style={{ background: 'rgba(199,154,62,0.12)', border: '1px solid rgba(199,154,62,0.35)' }}>
            <span className="text-base">⚡</span>
            <p className="text-sm" style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#c79a3e' }}>
              <strong>First Express is free.</strong> You have one complimentary run — make it count.
            </p>
          </div>
        )}

        {/* Tab bar */}
        <div className="flex gap-1 mb-6 max-w-2xl p-1 rounded-xl" style={{ background: 'var(--color-muted)', width: 'fit-content' }}>
          {(['generate', 'history'] as const).map(t => (
            <button
              key={t}
              onClick={() => handleTabSwitch(t)}
              className="relative px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                background: tab === t ? 'var(--color-card)' : 'transparent',
                color: tab === t ? 'var(--color-foreground)' : 'var(--color-muted-foreground)',
                boxShadow: tab === t ? '0 1px 4px rgba(42,38,32,0.10)' : 'none',
              }}
            >
              {t === 'generate' ? 'Generate' : (
                <span className="flex items-center gap-1.5">
                  History
                  {history.length > 0 && (
                    <span className="text-xs rounded-full px-1.5 py-0.5" style={{ background: 'var(--color-border)', color: 'var(--color-muted-foreground)', fontSize: '10px', fontWeight: 700 }}>
                      {history.length}
                    </span>
                  )}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Generate tab */}
        {tab === 'generate' && (
          <>
            {/* Step indicator */}
            {(step === 'format' || step === 'scope') && (
              <div className="flex items-center gap-2 mb-6 max-w-2xl">
                {steps.map((s, i) => {
                  const done = i < currentStepIdx;
                  const active = i === currentStepIdx;
                  return (
                    <div key={s.key} className="flex items-center gap-2">
                      <div
                        className="flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1"
                        style={{
                          fontFamily: 'Inter, system-ui, sans-serif',
                          background: active ? formatDef.color : done ? formatDef.tint : 'var(--color-muted)',
                          color: active ? '#fff' : done ? formatDef.color : 'var(--color-muted-foreground)',
                        }}
                      >
                        <span>{i + 1}</span>
                        <span>{s.label}</span>
                      </div>
                      {i < steps.length - 1 && (
                        <div className="w-4 h-px bg-border" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {step === 'format' && (
              <FormatPicker
                selected={selectedFormat}
                onSelect={setSelectedFormat}
                onContinue={() => setStep('scope')}
              />
            )}

            {step === 'scope' && selectedFormat && (
              <ScopeSelector
                learnings={learnings}
                format={formatDef}
                provenIds={provenIds}
                onBack={() => setStep('format')}
                onGenerate={handleGenerate}
              />
            )}

            {step === 'loading' && <LoadingView format={formatDef} />}

            {step === 'result' && result && (
              <ResultView
                result={result}
                format={formatDef}
                usedCount={usedCount}
                onReset={() => { setStep('format'); setSelectedFormat(null); setResult(null); }}
              />
            )}
          </>
        )}

        {/* History tab */}
        {tab === 'history' && (
          historyLoading
            ? (
              <div className="max-w-2xl flex items-center justify-center py-16 gap-2 text-muted-foreground">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Loading history…</span>
              </div>
            )
            : <HistoryTab history={history} />
        )}
      </div>
    </div>
  );
}
