'use client';

import { useState, useMemo } from 'react';
import { BookLoader } from '@/components/ui/book-loader';
import { runExpress } from '@/lib/actions/express';
import type { ExpressFormat, ExpressResult } from '@/lib/ai/express';
import type { ExpressHistoryItem } from '@/lib/data/express';

export interface LearningStub {
  id: string;
  title: string;
  topic: string | null;
}

interface Props {
  learnings: LearningStub[];
  history: ExpressHistoryItem[];
}

const FORMATS = [
  { id: 'talking-points', name: 'Talking Points',  desc: 'Key points for interviews or conversations', color: '#b5462f', icon: '◉' },
  { id: 'star',           name: 'STAR Stories',     desc: 'Situation · Task · Action · Result',         color: '#c79a3e', icon: '★' },
  { id: 'profile',        name: 'Profile Summary',  desc: 'Professional profile or bio snippet',        color: '#46557a', icon: '◈' },
  { id: 'summary',        name: 'Learning Summary', desc: 'Shareable markdown recap',                   color: '#6f8a5a', icon: '▦' },
] as const;

type FormatId = typeof FORMATS[number]['id'];

const FORMAT_MAP = Object.fromEntries(FORMATS.map((f) => [f.id, f])) as Record<string, typeof FORMATS[number]>;

const S = { font: "'Inter', system-ui, sans-serif", serif: "'Spectral', Georgia, serif" };

function formatOutput(res: ExpressResult): string {
  if (res.talkingPoints) return res.talkingPoints.map((p) => `• ${p.headline}\n  ${p.detail}`).join('\n\n');
  if (res.starAnswers) return res.starAnswers.map((a) => `Q: ${a.prompt}\n\nS: ${a.situation}\nT: ${a.task}\nA: ${a.action}\nR: ${a.result}`).join('\n\n---\n\n');
  if (res.profileBullets) return res.profileBullets.map((b) => `• ${b}`).join('\n');
  if (res.narrative) return res.narrative;
  return '';
}

function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Step 1: Format picker ─────────────────────────────────────────────────────

interface FormatPickerProps {
  selected: FormatId | null;
  onSelect: (id: FormatId) => void;
}

function FormatPicker({ selected, onSelect }: FormatPickerProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
      {FORMATS.map((f) => {
        const active = selected === f.id;
        return (
          <button
            key={f.id}
            onClick={() => onSelect(f.id)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
              gap: '10px', padding: '18px 18px 16px',
              borderRadius: '14px', cursor: 'pointer', textAlign: 'left',
              border: `1.5px solid ${active ? f.color : 'var(--color-border)'}`,
              background: active ? `${f.color}08` : 'var(--color-card)',
              transition: 'all 0.15s', outline: 'none',
              boxShadow: active ? `0 0 0 3px ${f.color}20` : 'none',
            }}
          >
            {/* Icon row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '10px',
                background: active ? f.color : `${f.color}18`,
                display: 'grid', placeItems: 'center',
                fontSize: '16px',
                color: active ? '#fff' : f.color,
                transition: 'all 0.15s', flexShrink: 0,
              }}>
                {f.icon}
              </div>
              {active && (
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: f.color, display: 'grid', placeItems: 'center' }}>
                  <span style={{ color: '#fff', fontSize: '10px', fontWeight: 700 }}>✓</span>
                </div>
              )}
            </div>
            {/* Text */}
            <div>
              <p style={{ fontFamily: S.serif, fontWeight: 700, fontSize: '15px', color: active ? f.color : 'var(--color-foreground)', margin: 0, lineHeight: 1.2 }}>
                {f.name}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--color-muted-foreground)', margin: '4px 0 0', fontFamily: S.font, lineHeight: 1.45 }}>
                {f.desc}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ── Step 2: Scope selector ────────────────────────────────────────────────────

type ScopeMode = 'shelves' | 'specific';

interface ScopeSelectorProps {
  learnings: LearningStub[];
  format: FormatId;
  onGenerate: (ids: string[], label: string, audience: string) => void;
  onBack: () => void;
}

function ScopeSelector({ learnings, format, onGenerate, onBack }: ScopeSelectorProps) {
  const [mode, setMode] = useState<ScopeMode>('shelves');
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [audience, setAudience] = useState('');

  const topicMap = useMemo(() => {
    const m = new Map<string, LearningStub[]>();
    for (const l of learnings) {
      const t = l.topic ?? 'Uncategorised';
      if (!m.has(t)) m.set(t, []);
      m.get(t)!.push(l);
    }
    return m;
  }, [learnings]);

  const topics = useMemo(() => Array.from(topicMap.keys()).sort(), [topicMap]);

  const filteredLearnings = useMemo(() => {
    const q = search.toLowerCase();
    return q ? learnings.filter((l) => l.title.toLowerCase().includes(q) || (l.topic ?? '').toLowerCase().includes(q)) : learnings;
  }, [learnings, search]);

  const grouped = useMemo(() => {
    const m = new Map<string, LearningStub[]>();
    for (const l of filteredLearnings) {
      const t = l.topic ?? 'Uncategorised';
      if (!m.has(t)) m.set(t, []);
      m.get(t)!.push(l);
    }
    return m;
  }, [filteredLearnings]);

  const toggleTopic = (t: string) =>
    setSelectedTopics((prev) => { const n = new Set(prev); n.has(t) ? n.delete(t) : n.add(t); return n; });

  const toggleId = (id: string) =>
    setSelectedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const toggleGroupAll = (items: LearningStub[]) => {
    const ids = items.map((l) => l.id);
    const allSel = ids.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => { const n = new Set(prev); allSel ? ids.forEach((id) => n.delete(id)) : ids.forEach((id) => n.add(id)); return n; });
  };

  const { effectiveIds, label, count } = useMemo(() => {
    if (mode === 'shelves') {
      if (!selectedTopics.size) return { effectiveIds: [], label: '', count: 0 };
      const ids = learnings.filter((l) => selectedTopics.has(l.topic ?? 'Uncategorised')).map((l) => l.id);
      return { effectiveIds: ids, label: Array.from(selectedTopics).sort().join(', '), count: ids.length };
    }
    const ids = Array.from(selectedIds);
    return {
      effectiveIds: ids,
      label: ids.length === 1 ? (learnings.find((l) => l.id === ids[0])?.title ?? '1 learning') : `${ids.length} specific learnings`,
      count: ids.length,
    };
  }, [mode, selectedTopics, selectedIds, learnings]);

  const fmt = FORMAT_MAP[format];

  const handleEntireLibrary = () => onGenerate([], 'Entire library', audience.trim());
  const handleConfirm = () => { if (count > 0) onGenerate(effectiveIds, label, audience.trim()); };

  return (
    <div>
      {/* Format reminder badge */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '20px', background: `${fmt.color}12`, border: `1px solid ${fmt.color}30`, marginBottom: '20px' }}>
        <span style={{ fontSize: '13px', color: fmt.color }}>{fmt.icon}</span>
        <span style={{ fontSize: '12px', fontWeight: 700, color: fmt.color, fontFamily: S.font }}>{fmt.name}</span>
        <button onClick={onBack} style={{ fontSize: '11px', color: fmt.color, opacity: 0.65, background: 'none', border: 'none', cursor: 'pointer', fontFamily: S.font, padding: 0 }}>
          (change)
        </button>
      </div>

      {/* Audience */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-muted-foreground)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px', fontFamily: S.font }}>
          Audience <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
        </p>
        <input
          type="text"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          placeholder='e.g. "senior PM role" or "LinkedIn bio"'
          style={{ width: '100%', padding: '9px 13px', borderRadius: '9px', border: '1px solid var(--color-border)', background: 'var(--color-card)', color: 'var(--color-foreground)', fontSize: '14px', fontFamily: S.font, outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '4px', width: 'fit-content' }}>
        {([['shelves', 'By Shelf'], ['specific', 'Pick Learnings']] as [ScopeMode, string][]).map(([m, lbl]) => (
          <button key={m} onClick={() => setMode(m)} style={{ padding: '6px 16px', borderRadius: '7px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: S.font, background: mode === m ? '#2a2620' : 'transparent', color: mode === m ? '#f5f2ec' : 'var(--color-muted-foreground)', transition: 'all 0.15s' }}>
            {lbl}
          </button>
        ))}
      </div>

      {/* By shelf */}
      {mode === 'shelves' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          {topics.map((topic) => {
            const cnt = topicMap.get(topic)?.length ?? 0;
            const sel = selectedTopics.has(topic);
            return (
              <button key={topic} onClick={() => toggleTopic(topic)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '11px', cursor: 'pointer', textAlign: 'left', border: `1.5px solid ${sel ? '#b5462f' : 'var(--color-border)'}`, background: sel ? 'rgba(181,70,47,.05)' : 'var(--color-card)', transition: 'all 0.15s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', flexShrink: 0 }}>
                    {[28, 36, 24, 32].map((h, i) => (
                      <div key={i} style={{ width: '7px', height: `${h}px`, borderRadius: '1px 2px 2px 1px', background: sel ? '#b5462f' : '#c8bfb0', opacity: 0.6 + i * 0.1 }} />
                    ))}
                  </div>
                  <span style={{ fontFamily: S.serif, fontWeight: 600, fontSize: '15px', color: sel ? '#b5462f' : 'var(--color-foreground)' }}>{topic}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--color-muted-foreground)', fontFamily: S.font }}>{cnt} vol{cnt !== 1 ? 's' : ''}</span>
                  <div style={{ width: '18px', height: '18px', borderRadius: '5px', border: `2px solid ${sel ? '#b5462f' : 'var(--color-border)'}`, background: sel ? '#b5462f' : 'transparent', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    {sel && <span style={{ color: '#fff', fontSize: '10px', fontWeight: 700 }}>✓</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Pick specific */}
      {mode === 'specific' && (
        <div style={{ marginBottom: '16px' }}>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search learnings…" style={{ width: '100%', padding: '9px 13px', borderRadius: '9px', border: '1px solid var(--color-border)', background: 'var(--color-card)', color: 'var(--color-foreground)', fontSize: '14px', fontFamily: S.font, marginBottom: '12px', boxSizing: 'border-box', outline: 'none' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {Array.from(grouped.entries()).map(([topic, items]) => {
              const allSel = items.every((l) => selectedIds.has(l.id));
              return (
                <div key={topic}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-muted-foreground)', fontFamily: S.font }}>{topic}</span>
                    <button onClick={() => toggleGroupAll(items)} style={{ fontSize: '11px', fontWeight: 600, color: '#b5462f', background: 'none', border: 'none', cursor: 'pointer', fontFamily: S.font }}>
                      {allSel ? 'Deselect all' : 'Select all'}
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {items.map((l) => {
                      const sel = selectedIds.has(l.id);
                      return (
                        <button key={l.id} onClick={() => toggleId(l.id)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '9px', cursor: 'pointer', textAlign: 'left', border: `1px solid ${sel ? '#b5462f' : 'var(--color-border)'}`, background: sel ? 'rgba(181,70,47,.04)' : 'var(--color-card)', transition: 'all 0.1s' }}>
                          <div style={{ width: '17px', height: '17px', borderRadius: '5px', border: `2px solid ${sel ? '#b5462f' : 'var(--color-border)'}`, background: sel ? '#b5462f' : 'transparent', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                            {sel && <span style={{ color: '#fff', fontSize: '9px', fontWeight: 700 }}>✓</span>}
                          </div>
                          <span style={{ fontSize: '14px', color: sel ? 'var(--color-foreground)' : 'var(--color-muted-foreground)', fontFamily: S.serif, fontWeight: sel ? 600 : 400 }}>{l.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ position: 'sticky', bottom: 0, background: 'var(--color-background)', paddingTop: '12px', paddingBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', borderTop: '1px solid var(--color-border)' }}>
        <button onClick={handleEntireLibrary} style={{ fontSize: '13px', color: 'var(--color-muted-foreground)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: S.font, textDecoration: 'underline', textUnderlineOffset: '2px' }}>
          Use entire library
        </button>
        <button disabled={!count} onClick={handleConfirm} style={{ padding: '10px 22px', borderRadius: '10px', border: 'none', cursor: count ? 'pointer' : 'not-allowed', background: count ? '#b5462f' : 'var(--color-border)', color: count ? '#fff' : 'var(--color-muted-foreground)', fontSize: '13px', fontWeight: 700, fontFamily: S.font, boxShadow: count ? '0 4px 12px -4px rgba(181,70,47,.5)' : 'none', transition: 'all 0.15s' }}>
          {count ? `Generate with ${count} learning${count !== 1 ? 's' : ''} →` : 'Select at least one'}
        </button>
      </div>
    </div>
  );
}

// ── Result ────────────────────────────────────────────────────────────────────

function ResultView({ format, result, usedCount, scopeLabel, audience, onStartOver }: { format: string; result: ExpressResult; usedCount: number; scopeLabel: string; audience: string; onStartOver: () => void }) {
  const [copied, setCopied] = useState(false);
  const text = formatOutput(result);
  const fmt = FORMAT_MAP[format];
  const handleCopy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ width: '40px', height: '40px', background: fmt?.color ?? '#888', borderRadius: '9px', display: 'grid', placeItems: 'center', fontSize: '17px', color: '#fff', flexShrink: 0 }}>{fmt?.icon}</div>
        <div>
          <h3 style={{ fontFamily: S.serif, fontWeight: 700, fontSize: '18px', color: 'var(--color-foreground)', margin: 0 }}>{fmt?.name}</h3>
          <p style={{ fontSize: '12px', color: 'var(--color-muted-foreground)', margin: 0, fontFamily: S.font }}>{usedCount} learnings · {scopeLabel}{audience ? ` · ${audience}` : ''}</p>
        </div>
      </div>
      <div style={{ borderRadius: '12px', border: '1px solid var(--color-border)', background: 'var(--color-card)', padding: '28px', marginBottom: '12px' }}>
        <pre style={{ fontFamily: S.serif, fontSize: '15px', color: 'var(--color-foreground)', lineHeight: 1.75, whiteSpace: 'pre-wrap', margin: 0 }}>{text}</pre>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={handleCopy} style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1px solid var(--color-border)', background: copied ? 'rgba(111,138,90,.1)' : 'var(--color-card)', color: copied ? '#4f6b3a' : 'var(--color-foreground)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: S.font, transition: 'all 0.15s' }}>
          {copied ? '✓ Copied!' : 'Copy'}
        </button>
        <button onClick={onStartOver} style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1px solid var(--color-border)', background: 'var(--color-card)', color: 'var(--color-foreground)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: S.font }}>
          Generate Another
        </button>
      </div>
    </div>
  );
}

// ── History ───────────────────────────────────────────────────────────────────

function HistoryTab({ history }: { history: ExpressHistoryItem[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const handleCopy = (id: string, text: string) => { navigator.clipboard.writeText(text); setCopied(id); setTimeout(() => setCopied(null), 2000); };

  if (!history.length) return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-muted-foreground)', fontFamily: S.font, fontSize: '14px' }}>
      No generations yet.
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {history.map((item) => {
        const fmt = FORMAT_MAP[item.format];
        const isOpen = expanded === item.id;
        const text = formatOutput(item.output as unknown as ExpressResult);
        return (
          <div key={item.id} style={{ borderRadius: '12px', border: '1px solid var(--color-border)', background: 'var(--color-card)', overflow: 'hidden' }}>
            <button onClick={() => setExpanded(isOpen ? null : item.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
              <div style={{ width: '34px', height: '34px', background: fmt?.color ?? '#888', borderRadius: '8px', display: 'grid', placeItems: 'center', fontSize: '14px', color: '#fff', flexShrink: 0 }}>{fmt?.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: S.serif, fontWeight: 600, fontSize: '14px', color: 'var(--color-foreground)', margin: 0 }}>{fmt?.name ?? item.format}</p>
                <p style={{ fontSize: '11px', color: 'var(--color-muted-foreground)', margin: '2px 0 0', fontFamily: S.font }}>{fmtDate(item.createdAt)} · {item.usedCount} learnings{item.scopeLabel ? ` · ${item.scopeLabel}` : ''}{item.audience ? ` · ${item.audience}` : ''}</p>
              </div>
              <span style={{ fontSize: '18px', color: 'var(--color-muted-foreground)', display: 'inline-block', transition: 'transform 0.2s', transform: isOpen ? 'rotate(90deg)' : 'none', flexShrink: 0 }}>›</span>
            </button>
            {isOpen && (
              <div style={{ borderTop: '1px solid var(--color-border)', padding: '18px' }}>
                <pre style={{ fontFamily: S.serif, fontSize: '14px', color: 'var(--color-foreground)', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: '0 0 12px' }}>{text}</pre>
                <button onClick={() => handleCopy(item.id, text)} style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'transparent', color: copied === item.id ? '#4f6b3a' : 'var(--color-muted-foreground)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: S.font }}>
                  {copied === item.id ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

type Step = 'format' | 'scope' | 'loading' | 'result';

export function ExpressClient({ learnings, history: initialHistory }: Props) {
  const [tab, setTab] = useState<'generate' | 'history'>('generate');
  const [step, setStep] = useState<Step>('format');
  const [selectedFormat, setSelectedFormat] = useState<FormatId | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [scopeLabel, setScopeLabel] = useState('');
  const [audience, setAudience] = useState('');
  const [result, setResult] = useState<ExpressResult | null>(null);
  const [usedCount, setUsedCount] = useState(0);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<ExpressHistoryItem[]>(initialHistory);

  const handleFormatSelect = (id: FormatId) => {
    setSelectedFormat(id);
    setStep('scope');
  };

  const handleGenerate = async (ids: string[], label: string, aud: string) => {
    if (!selectedFormat) return;
    setSelectedIds(ids);
    setScopeLabel(label);
    setAudience(aud);
    setStep('loading');
    setError('');
    const start = Date.now();

    try {
      const res = await runExpress({
        format: selectedFormat as ExpressFormat,
        learningIds: ids.length ? ids : undefined,
        audience: aud || undefined,
        scopeLabel: label,
      });

      await new Promise((r) => setTimeout(r, Math.max(0, 2500 - (Date.now() - start))));

      if (res.ok && res.result) {
        setResult(res.result);
        setUsedCount(res.usedCount ?? 0);
        setStep('result');
        if (res.savedId) {
          setHistory((prev) => [{
            id: res.savedId!, format: selectedFormat, audience: aud || null,
            scopeLabel: label, usedCount: res.usedCount ?? 0,
            output: res.result as unknown as Record<string, unknown>,
            createdAt: new Date(),
          }, ...prev]);
        }
      } else {
        setError(res.error ?? 'Generation failed.');
        setStep('scope');
      }
    } catch {
      setError('Generation failed. Please try again.');
      setStep('scope');
    }
  };

  const handleStartOver = () => {
    setStep('format');
    setSelectedFormat(null);
    setSelectedIds([]);
    setScopeLabel('');
    setResult(null);
    setError('');
  };

  return (
    <div style={{ maxWidth: '600px' }}>
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '4px', width: 'fit-content' }}>
        {(['generate', 'history'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '7px 18px', borderRadius: '7px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: S.font, background: tab === t ? '#b5462f' : 'transparent', color: tab === t ? '#fff' : 'var(--color-muted-foreground)', transition: 'all 0.15s' }}>
            {t === 'generate' ? 'Generate' : `History${history.length ? ` (${history.length})` : ''}`}
          </button>
        ))}
      </div>

      {tab === 'generate' && (
        <>
          {/* Step indicator */}
          {(step === 'format' || step === 'scope') && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px' }}>
              {[
                { n: '1', label: 'Choose format', done: step === 'scope' },
                { n: '2', label: 'Choose source', done: false },
              ].map(({ n, label, done }, i) => {
                const active = (step === 'format' && n === '1') || (step === 'scope' && n === '2');
                return (
                  <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {i > 0 && <div style={{ width: '20px', height: '1px', background: 'var(--color-border)' }} />}
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: '10px', fontWeight: 700, fontFamily: S.font, background: done ? '#6f8a5a' : active ? '#b5462f' : 'var(--color-border)', color: (done || active) ? '#fff' : 'var(--color-muted-foreground)', flexShrink: 0 }}>
                      {done ? '✓' : n}
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: active ? 600 : 400, color: active ? 'var(--color-foreground)' : 'var(--color-muted-foreground)', fontFamily: S.font }}>{label}</span>
                  </div>
                );
              })}
            </div>
          )}

          {error && (
            <div style={{ marginBottom: '16px', padding: '11px 14px', borderRadius: '10px', background: 'rgba(181,70,47,.08)', border: '1px solid rgba(181,70,47,.2)', color: '#b5462f', fontSize: '13px', fontFamily: S.font }}>
              {error}
            </div>
          )}

          {step === 'format' && (
            <>
              <FormatPicker selected={selectedFormat} onSelect={handleFormatSelect} />
              {selectedFormat && (
                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => setStep('scope')} style={{ padding: '10px 22px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: '#b5462f', color: '#fff', fontSize: '13px', fontWeight: 700, fontFamily: S.font, boxShadow: '0 4px 12px -4px rgba(181,70,47,.5)' }}>
                    Continue →
                  </button>
                </div>
              )}
            </>
          )}

          {step === 'scope' && selectedFormat && (
            <ScopeSelector
              learnings={learnings}
              format={selectedFormat}
              onGenerate={handleGenerate}
              onBack={() => setStep('format')}
            />
          )}

          {step === 'loading' && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <BookLoader variant="express" />
            </div>
          )}

          {step === 'result' && result && (
            <ResultView format={selectedFormat!} result={result} usedCount={usedCount} scopeLabel={scopeLabel} audience={audience} onStartOver={handleStartOver} />
          )}
        </>
      )}

      {tab === 'history' && <HistoryTab history={history} />}
    </div>
  );
}
