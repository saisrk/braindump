'use client';

import { useState, useMemo } from 'react';
import { BookLoader } from '@/components/ui/book-loader';
import { runExpress } from '@/lib/actions/express';
import type { ExpressFormat, ExpressResult } from '@/lib/ai/express';
import type { ExpressHistoryItem } from '@/lib/data/express';

// ── Types ────────────────────────────────────────────────────────────────────

export interface LearningStub {
  id: string;
  title: string;
  topic: string | null;
}

interface Props {
  learnings: LearningStub[];
  history: ExpressHistoryItem[];
}

// ── Constants ────────────────────────────────────────────────────────────────

const FORMAT_META: Record<string, { name: string; desc: string; color: string; icon: string }> = {
  'talking-points': { name: 'Talking Points',   desc: 'Key points for interviews or conversations', color: '#b5462f', icon: '◉' },
  'star':           { name: 'STAR Stories',      desc: 'Situation, Task, Action, Result framework',  color: '#c79a3e', icon: '★' },
  'profile':        { name: 'Profile Summary',   desc: 'Professional profile or bio snippet',        color: '#46557a', icon: '◈' },
  'summary':        { name: 'Learning Summary',  desc: 'Markdown summary for sharing',              color: '#6f8a5a', icon: '▦' },
};

const S = { font: "'Inter', system-ui, sans-serif", serif: "'Spectral', Georgia, serif" };

// ── Helpers ───────────────────────────────────────────────────────────────────

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

// ── Step 1: Scope selector ────────────────────────────────────────────────────

type ScopeMode = 'shelves' | 'specific';

interface ScopeSelectorProps {
  learnings: LearningStub[];
  onConfirm: (ids: string[], label: string) => void;
  onEntireLibrary: () => void;
}

function ScopeSelector({ learnings, onConfirm, onEntireLibrary }: ScopeSelectorProps) {
  const [mode, setMode] = useState<ScopeMode>('shelves');
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');

  // Build topics with counts
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

  const toggleTopic = (t: string) => {
    setSelectedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t); else next.add(t);
      return next;
    });
  };

  const toggleId = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleGroupAll = (t: string, groupLearnings: LearningStub[]) => {
    const ids = groupLearnings.map((l) => l.id);
    const allSelected = ids.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  };

  // Compute effective selected IDs and label
  const { effectiveIds, label, count } = useMemo(() => {
    if (mode === 'shelves') {
      if (selectedTopics.size === 0) return { effectiveIds: [], label: '', count: 0 };
      const ids = learnings.filter((l) => selectedTopics.has(l.topic ?? 'Uncategorised')).map((l) => l.id);
      const topicList = Array.from(selectedTopics).sort().join(', ');
      return { effectiveIds: ids, label: topicList, count: ids.length };
    } else {
      const ids = Array.from(selectedIds);
      return {
        effectiveIds: ids,
        label: ids.length === 1
          ? (learnings.find((l) => l.id === ids[0])?.title ?? '1 learning')
          : `${ids.length} specific learnings`,
        count: ids.length,
      };
    }
  }, [mode, selectedTopics, selectedIds, learnings]);

  const canContinue = count > 0;

  return (
    <div>
      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '4px', width: 'fit-content' }}>
        {([['shelves', 'By Shelf'], ['specific', 'Pick Learnings']] as [ScopeMode, string][]).map(([m, label]) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              padding: '7px 18px', borderRadius: '7px', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: 600, fontFamily: S.font,
              background: mode === m ? '#2a2620' : 'transparent',
              color: mode === m ? '#f5f2ec' : 'var(--color-muted-foreground)',
              transition: 'all 0.15s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── BY SHELF ── */}
      {mode === 'shelves' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {topics.map((topic) => {
            const count = topicMap.get(topic)?.length ?? 0;
            const sel = selectedTopics.has(topic);
            return (
              <button
                key={topic}
                onClick={() => toggleTopic(topic)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 18px', borderRadius: '12px', cursor: 'pointer', textAlign: 'left',
                  border: `1.5px solid ${sel ? '#b5462f' : 'var(--color-border)'}`,
                  background: sel ? 'rgba(181,70,47,.06)' : 'var(--color-card)',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Mini book spines */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', flexShrink: 0 }}>
                    {[28, 36, 24, 32].map((h, i) => (
                      <div key={i} style={{ width: '8px', height: `${h}px`, borderRadius: '1px 2px 2px 1px', background: sel ? '#b5462f' : '#c8bfb0', opacity: 0.7 + i * 0.08 }} />
                    ))}
                  </div>
                  <span style={{ fontFamily: S.serif, fontWeight: 600, fontSize: '15px', color: sel ? '#b5462f' : 'var(--color-foreground)' }}>
                    {topic}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--color-muted-foreground)', fontFamily: S.font }}>
                    {count} vol{count !== 1 ? 's' : ''}
                  </span>
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '6px', flexShrink: 0,
                    border: `2px solid ${sel ? '#b5462f' : 'var(--color-border)'}`,
                    background: sel ? '#b5462f' : 'transparent',
                    display: 'grid', placeItems: 'center',
                  }}>
                    {sel && <span style={{ color: '#fff', fontSize: '11px', fontWeight: 700 }}>✓</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ── PICK SPECIFIC ── */}
      {mode === 'specific' && (
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search learnings…"
            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--color-border)', background: 'var(--color-card)', color: 'var(--color-foreground)', fontSize: '14px', fontFamily: S.font, marginBottom: '14px', boxSizing: 'border-box', outline: 'none' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Array.from(grouped.entries()).map(([topic, items]) => {
              const allSel = items.every((l) => selectedIds.has(l.id));
              return (
                <div key={topic}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-muted-foreground)', fontFamily: S.font }}>{topic}</span>
                    <button
                      onClick={() => toggleGroupAll(topic, items)}
                      style={{ fontSize: '11px', fontWeight: 600, color: '#b5462f', background: 'none', border: 'none', cursor: 'pointer', fontFamily: S.font }}
                    >
                      {allSel ? 'Deselect all' : 'Select all'}
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {items.map((l) => {
                      const sel = selectedIds.has(l.id);
                      return (
                        <button
                          key={l.id}
                          onClick={() => toggleId(l.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '10px 12px', borderRadius: '9px', cursor: 'pointer', textAlign: 'left',
                            border: `1px solid ${sel ? '#b5462f' : 'var(--color-border)'}`,
                            background: sel ? 'rgba(181,70,47,.05)' : 'var(--color-card)',
                            transition: 'all 0.1s',
                          }}
                        >
                          <div style={{
                            width: '18px', height: '18px', borderRadius: '5px', flexShrink: 0,
                            border: `2px solid ${sel ? '#b5462f' : 'var(--color-border)'}`,
                            background: sel ? '#b5462f' : 'transparent',
                            display: 'grid', placeItems: 'center',
                          }}>
                            {sel && <span style={{ color: '#fff', fontSize: '10px', fontWeight: 700 }}>✓</span>}
                          </div>
                          <span style={{ fontSize: '14px', color: sel ? 'var(--color-foreground)' : 'var(--color-muted-foreground)', fontFamily: S.serif, fontWeight: sel ? 600 : 400 }}>
                            {l.title}
                          </span>
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

      {/* Footer bar */}
      <div style={{ position: 'sticky', bottom: 0, background: 'var(--color-background)', paddingTop: '12px', paddingBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', borderTop: '1px solid var(--color-border)', marginTop: '4px' }}>
        <button
          onClick={onEntireLibrary}
          style={{ fontSize: '13px', color: 'var(--color-muted-foreground)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: S.font, textDecoration: 'underline' }}
        >
          Use entire library
        </button>
        <button
          disabled={!canContinue}
          onClick={() => onConfirm(effectiveIds, label)}
          style={{
            padding: '10px 24px', borderRadius: '10px', border: 'none', cursor: canContinue ? 'pointer' : 'not-allowed',
            background: canContinue ? '#b5462f' : 'var(--color-border)',
            color: canContinue ? '#fff' : 'var(--color-muted-foreground)',
            fontSize: '14px', fontWeight: 700, fontFamily: S.font,
            boxShadow: canContinue ? '0 4px 12px -4px rgba(181,70,47,.5)' : 'none',
            transition: 'all 0.15s',
          }}
        >
          {canContinue ? `Continue with ${count} learning${count !== 1 ? 's' : ''} →` : 'Select at least one'}
        </button>
      </div>
    </div>
  );
}

// ── Step 2: Format picker ─────────────────────────────────────────────────────

interface FormatPickerProps {
  scopeLabel: string;
  count: number;
  onGenerate: (format: string, audience: string) => void;
  onBack: () => void;
}

function FormatPicker({ scopeLabel, count, onGenerate, onBack }: FormatPickerProps) {
  const [audience, setAudience] = useState('');

  return (
    <div>
      {/* Scope badge */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: 'rgba(181,70,47,.1)', border: '1px solid rgba(181,70,47,.25)', marginBottom: '20px' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#b5462f', fontFamily: S.font }}>
          📚 {count} learning{count !== 1 ? 's' : ''} · {scopeLabel}
        </span>
        <button onClick={onBack} style={{ fontSize: '11px', color: '#b5462f', opacity: 0.7, background: 'none', border: 'none', cursor: 'pointer', fontFamily: S.font, padding: 0 }}>
          (change)
        </button>
      </div>

      {/* Audience input */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-muted-foreground)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px', fontFamily: S.font }}>
          Audience / context <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: '12px' }}>(optional)</span>
        </p>
        <input
          type="text"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          placeholder='e.g. "senior product manager role" or "LinkedIn bio"'
          style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--color-border)', background: 'var(--color-card)', color: 'var(--color-foreground)', fontSize: '14px', fontFamily: S.font, outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {/* Format cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {Object.entries(FORMAT_META).map(([id, f]) => (
          <div
            key={id}
            onClick={() => onGenerate(id, audience)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '12px', border: '1px solid var(--color-border)', background: 'var(--color-card)', padding: '16px 18px', cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px -8px rgba(42,38,32,.2)'; (e.currentTarget as HTMLElement).style.borderColor = f.color; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; (e.currentTarget as HTMLElement).style.borderColor = ''; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '44px', height: '44px', background: f.color, borderRadius: '10px', display: 'grid', placeItems: 'center', fontSize: '18px', color: '#fff', flexShrink: 0 }}>
                {f.icon}
              </div>
              <div>
                <h4 style={{ fontFamily: S.serif, fontWeight: 600, fontSize: '16px', color: 'var(--color-foreground)', margin: 0 }}>{f.name}</h4>
                <p style={{ fontSize: '13px', color: 'var(--color-muted-foreground)', margin: '2px 0 0', fontFamily: S.font }}>{f.desc}</p>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onGenerate(id, audience); }}
              style={{ padding: '8px 16px', borderRadius: '8px', border: `1px solid ${f.color}`, background: 'transparent', color: f.color, fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: S.font, whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              Generate →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Result view ───────────────────────────────────────────────────────────────

interface ResultViewProps {
  format: string;
  result: ExpressResult;
  usedCount: number;
  scopeLabel: string;
  audience: string;
  onStartOver: () => void;
}

function ResultView({ format, result, usedCount, scopeLabel, audience, onStartOver }: ResultViewProps) {
  const [copied, setCopied] = useState(false);
  const text = formatOutput(result);
  const meta = FORMAT_META[format];

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
        <div style={{ width: '40px', height: '40px', background: meta?.color ?? '#888', borderRadius: '9px', display: 'grid', placeItems: 'center', fontSize: '17px', color: '#fff', flexShrink: 0 }}>
          {meta?.icon}
        </div>
        <div>
          <h3 style={{ fontFamily: S.serif, fontWeight: 700, fontSize: '18px', color: 'var(--color-foreground)', margin: 0 }}>{meta?.name}</h3>
          <p style={{ fontSize: '12px', color: 'var(--color-muted-foreground)', margin: 0, fontFamily: S.font }}>
            {usedCount} learnings · {scopeLabel}{audience ? ` · ${audience}` : ''}
          </p>
        </div>
      </div>

      <div style={{ borderRadius: '12px', border: '1px solid var(--color-border)', background: 'var(--color-card)', padding: '28px', marginBottom: '14px' }}>
        <pre style={{ fontFamily: S.serif, fontSize: '15px', color: 'var(--color-foreground)', lineHeight: 1.75, whiteSpace: 'pre-wrap', margin: 0 }}>
          {text}
        </pre>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={handleCopy}
          style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1px solid var(--color-border)', background: copied ? 'rgba(111,138,90,.1)' : 'var(--color-card)', color: copied ? '#4f6b3a' : 'var(--color-foreground)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: S.font, transition: 'all 0.15s' }}
        >
          {copied ? '✓ Copied!' : 'Copy'}
        </button>
        <button
          onClick={onStartOver}
          style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1px solid var(--color-border)', background: 'var(--color-card)', color: 'var(--color-foreground)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: S.font }}
        >
          Generate Another
        </button>
      </div>
    </div>
  );
}

// ── History tab ───────────────────────────────────────────────────────────────

function HistoryTab({ history }: { history: ExpressHistoryItem[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (history.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-muted-foreground)', fontFamily: S.font, fontSize: '14px' }}>
        No generations yet. Generate something first!
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {history.map((item) => {
        const meta = FORMAT_META[item.format];
        const isOpen = expanded === item.id;
        const text = formatOutput(item.output as unknown as ExpressResult);
        return (
          <div key={item.id} style={{ borderRadius: '12px', border: '1px solid var(--color-border)', background: 'var(--color-card)', overflow: 'hidden' }}>
            <button
              onClick={() => setExpanded(isOpen ? null : item.id)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              <div style={{ width: '36px', height: '36px', background: meta?.color ?? '#888', borderRadius: '8px', display: 'grid', placeItems: 'center', fontSize: '15px', color: '#fff', flexShrink: 0 }}>
                {meta?.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: S.serif, fontWeight: 600, fontSize: '15px', color: 'var(--color-foreground)', margin: 0 }}>{meta?.name ?? item.format}</p>
                <p style={{ fontSize: '12px', color: 'var(--color-muted-foreground)', margin: '2px 0 0', fontFamily: S.font }}>
                  {fmtDate(item.createdAt)} · {item.usedCount} learnings
                  {item.scopeLabel ? ` · ${item.scopeLabel}` : ''}
                  {item.audience ? ` · ${item.audience}` : ''}
                </p>
              </div>
              <span style={{ fontSize: '18px', color: 'var(--color-muted-foreground)', display: 'inline-block', transition: 'transform 0.2s', transform: isOpen ? 'rotate(90deg)' : 'none', flexShrink: 0 }}>›</span>
            </button>
            {isOpen && (
              <div style={{ borderTop: '1px solid var(--color-border)', padding: '20px' }}>
                <pre style={{ fontFamily: S.serif, fontSize: '14px', color: 'var(--color-foreground)', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: '0 0 14px' }}>
                  {text}
                </pre>
                <button
                  onClick={() => handleCopy(item.id, text)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'transparent', color: copied === item.id ? '#4f6b3a' : 'var(--color-muted-foreground)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: S.font }}
                >
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

// ── Main client component ─────────────────────────────────────────────────────

type Step = 'scope' | 'format' | 'loading' | 'result';

export function ExpressClient({ learnings, history: initialHistory }: Props) {
  const [tab, setTab] = useState<'generate' | 'history'>('generate');
  const [step, setStep] = useState<Step>('scope');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [scopeLabel, setScopeLabel] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [audience, setAudience] = useState('');
  const [result, setResult] = useState<ExpressResult | null>(null);
  const [usedCount, setUsedCount] = useState(0);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<ExpressHistoryItem[]>(initialHistory);

  const handleScopeConfirm = (ids: string[], label: string) => {
    setSelectedIds(ids);
    setScopeLabel(label);
    setStep('format');
  };

  const handleEntireLibrary = () => {
    setSelectedIds([]);
    setScopeLabel('Entire library');
    setStep('format');
  };

  const handleGenerate = async (format: string, aud: string) => {
    setSelectedFormat(format);
    setAudience(aud);
    setStep('loading');
    setError('');
    const start = Date.now();

    try {
      const res = await runExpress({
        format: format as ExpressFormat,
        learningIds: selectedIds.length ? selectedIds : undefined,
        audience: aud.trim() || undefined,
        scopeLabel,
      });

      const wait = Math.max(0, 2500 - (Date.now() - start));
      await new Promise((r) => setTimeout(r, wait));

      if (res.ok && res.result) {
        setResult(res.result);
        setUsedCount(res.usedCount ?? 0);
        setStep('result');
        if (res.savedId) {
          setHistory((prev) => [{
            id: res.savedId!,
            format,
            audience: aud.trim() || null,
            scopeLabel,
            usedCount: res.usedCount ?? 0,
            output: res.result as unknown as Record<string, unknown>,
            createdAt: new Date(),
          }, ...prev]);
        }
      } else {
        setError(res.error ?? 'Generation failed.');
        setStep('format');
      }
    } catch {
      setError('Generation failed. Please try again.');
      setStep('format');
    }
  };

  const handleStartOver = () => {
    setStep('scope');
    setSelectedIds([]);
    setScopeLabel('');
    setResult(null);
    setError('');
  };

  const selectedCount = selectedIds.length || learnings.length;

  return (
    <div style={{ maxWidth: '640px' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '4px', width: 'fit-content' }}>
        {(['generate', 'history'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '7px 18px', borderRadius: '7px', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: 600, fontFamily: S.font,
              background: tab === t ? '#b5462f' : 'transparent',
              color: tab === t ? '#fff' : 'var(--color-muted-foreground)',
              transition: 'all 0.15s',
            }}
          >
            {t === 'generate' ? 'Generate' : `History${history.length ? ` (${history.length})` : ''}`}
          </button>
        ))}
      </div>

      {tab === 'generate' && (
        <>
          {/* Step indicator */}
          {(step === 'scope' || step === 'format') && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              {[['1', 'Choose scope', step === 'scope'], ['2', 'Choose format', step === 'format']].map(([n, label, active], i) => (
                <div key={n as string} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {i > 0 && <div style={{ width: '24px', height: '1px', background: 'var(--color-border)' }} />}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: '11px', fontWeight: 700, fontFamily: S.font, background: active ? '#b5462f' : step === 'format' && n === '1' ? '#6f8a5a' : 'var(--color-border)', color: (active || (step === 'format' && n === '1')) ? '#fff' : 'var(--color-muted-foreground)' }}>
                      {step === 'format' && n === '1' ? '✓' : n as string}
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: active ? 600 : 400, color: active ? 'var(--color-foreground)' : 'var(--color-muted-foreground)', fontFamily: S.font }}>{label as string}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '10px', background: 'rgba(181,70,47,.08)', border: '1px solid rgba(181,70,47,.2)', color: '#b5462f', fontSize: '13px', fontFamily: S.font }}>
              {error}
            </div>
          )}

          {step === 'scope' && (
            <ScopeSelector
              learnings={learnings}
              onConfirm={handleScopeConfirm}
              onEntireLibrary={handleEntireLibrary}
            />
          )}

          {step === 'format' && (
            <FormatPicker
              scopeLabel={scopeLabel}
              count={selectedCount}
              onGenerate={handleGenerate}
              onBack={() => setStep('scope')}
            />
          )}

          {step === 'loading' && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <BookLoader variant="express" />
            </div>
          )}

          {step === 'result' && result && (
            <ResultView
              format={selectedFormat}
              result={result}
              usedCount={usedCount}
              scopeLabel={scopeLabel}
              audience={audience}
              onStartOver={handleStartOver}
            />
          )}
        </>
      )}

      {tab === 'history' && <HistoryTab history={history} />}
    </div>
  );
}
