'use client';

import { useState } from 'react';
import { BookLoader } from '@/components/ui/book-loader';
import { runExpress } from '@/lib/actions/express';
import type { ExpressResult, ExpressFormat } from '@/lib/ai/express';
import type { ExpressHistoryItem } from '@/lib/data/express';

const FORMAT_META: Record<string, { name: string; desc: string; color: string; icon: string }> = {
  'talking-points': { name: 'Talking Points', desc: 'Key points for interviews or conversations', color: '#b5462f', icon: '◉' },
  'star':           { name: 'STAR Stories',   desc: 'Situation, Task, Action, Result framework',  color: '#c79a3e', icon: '★' },
  'profile':        { name: 'Profile Summary', desc: 'Professional profile or bio snippet',        color: '#46557a', icon: '◈' },
  'summary':        { name: 'Learning Summary', desc: 'Markdown summary for sharing',              color: '#6f8a5a', icon: '▦' },
};

const DATE_RANGES = [
  { label: 'All time', value: '' },
  { label: 'Last 90 days', value: '90' },
  { label: 'Last 30 days', value: '30' },
  { label: 'Last 7 days', value: '7' },
];

function sinceFromDays(days: string): string | undefined {
  if (!days) return undefined;
  const d = new Date();
  d.setDate(d.getDate() - Number(days));
  return d.toISOString();
}

function formatOutput(res: ExpressResult): string {
  if (res.talkingPoints) return res.talkingPoints.map((p) => `• ${p.headline}\n  ${p.detail}`).join('\n\n');
  if (res.starAnswers) return res.starAnswers.map((a) => `Q: ${a.prompt}\n\nS: ${a.situation}\nT: ${a.task}\nA: ${a.action}\nR: ${a.result}`).join('\n\n---\n\n');
  if (res.profileBullets) return res.profileBullets.map((b) => `• ${b}`).join('\n');
  if (res.narrative) return res.narrative;
  return '';
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface Props {
  topics: string[];
  history: ExpressHistoryItem[];
}

export function ExpressClient({ topics, history: initialHistory }: Props) {
  const [tab, setTab] = useState<'generate' | 'history'>('generate');
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [topicFilter, setTopicFilter] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [audience, setAudience] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExpressResult | null>(null);
  const [usedCount, setUsedCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<ExpressHistoryItem[]>(initialHistory);
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);

  const handleGenerate = async (formatId: string) => {
    setSelectedFormat(formatId);
    setLoading(true);
    setError('');
    setResult(null);
    const start = Date.now();
    try {
      const res = await runExpress({
        format: formatId as ExpressFormat,
        topic: topicFilter || undefined,
        since: sinceFromDays(dateRange),
        audience: audience.trim() || undefined,
      });
      const elapsed = Date.now() - start;
      const wait = Math.max(0, 2500 - elapsed);
      await new Promise((r) => setTimeout(r, wait));
      if (res.ok && res.result) {
        setResult(res.result);
        setUsedCount(res.usedCount ?? 0);
        // Prepend to local history
        if (res.savedId) {
          setHistory((prev) => [{
            id: res.savedId!,
            format: formatId,
            audience: audience.trim() || null,
            topicFilter: topicFilter || null,
            sinceFilter: sinceFromDays(dateRange) ?? null,
            usedCount: res.usedCount ?? 0,
            output: res.result!,
            createdAt: new Date(),
          }, ...prev]);
        }
      } else {
        setError(res.error ?? 'Generation failed');
        setLoading(false);
        return;
      }
    } catch {
      setError('Generation failed. Please try again.');
    }
    setLoading(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const S = { font: "'Inter', system-ui, sans-serif", serif: "'Spectral', Georgia, serif" };

  return (
    <div style={{ maxWidth: '680px' }}>
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

      {/* ── GENERATE TAB ─────────────────────────────────────────────────── */}
      {tab === 'generate' && !loading && !result && (
        <div>
          {/* Filters row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px', alignItems: 'flex-end' }}>
            {/* Topic chips */}
            {topics.length > 0 && (
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-muted-foreground)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px', fontFamily: S.font }}>Topic</p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setTopicFilter('')}
                    style={{ padding: '4px 12px', borderRadius: '20px', border: `1px solid ${!topicFilter ? '#b5462f' : 'var(--color-border)'}`, background: !topicFilter ? 'rgba(181,70,47,.1)' : 'transparent', color: !topicFilter ? '#b5462f' : 'var(--color-muted-foreground)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: S.font }}
                  >
                    All
                  </button>
                  {topics.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTopicFilter(topicFilter === t ? '' : t)}
                      style={{ padding: '4px 12px', borderRadius: '20px', border: `1px solid ${topicFilter === t ? '#b5462f' : 'var(--color-border)'}`, background: topicFilter === t ? 'rgba(181,70,47,.1)' : 'transparent', color: topicFilter === t ? '#b5462f' : 'var(--color-muted-foreground)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: S.font }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Date range */}
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-muted-foreground)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px', fontFamily: S.font }}>Date range</p>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-card)', color: 'var(--color-foreground)', fontSize: '13px', fontFamily: S.font, cursor: 'pointer' }}
              >
                {DATE_RANGES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Audience input */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-muted-foreground)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px', fontFamily: S.font }}>Audience / context <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></p>
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
                onClick={() => handleGenerate(id)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '12px', border: '1px solid var(--color-border)', background: 'var(--color-card)', padding: '16px 20px', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px -8px rgba(42,38,32,.2)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
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
                  onClick={(e) => { e.stopPropagation(); handleGenerate(id); }}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: `1px solid ${f.color}`, background: 'transparent', color: f.color, fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: S.font, whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                  Generate →
                </button>
              </div>
            ))}
          </div>

          {error && (
            <div style={{ marginTop: '16px', padding: '12px 16px', borderRadius: '10px', background: 'rgba(181,70,47,.08)', border: '1px solid rgba(181,70,47,.2)', color: '#b5462f', fontSize: '13px', fontFamily: S.font }}>
              {error}
            </div>
          )}
        </div>
      )}

      {/* ── LOADER ───────────────────────────────────────────────────────── */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '320px' }}>
          <BookLoader variant="express" />
        </div>
      )}

      {/* ── RESULT ───────────────────────────────────────────────────────── */}
      {!loading && result && (
        <div>
          {/* Result header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', background: FORMAT_META[selectedFormat!]?.color ?? '#b5462f', borderRadius: '8px', display: 'grid', placeItems: 'center', fontSize: '16px', color: '#fff', flexShrink: 0 }}>
                {FORMAT_META[selectedFormat!]?.icon}
              </div>
              <div>
                <h3 style={{ fontFamily: S.serif, fontWeight: 700, fontSize: '18px', color: 'var(--color-foreground)', margin: 0 }}>{FORMAT_META[selectedFormat!]?.name}</h3>
                <p style={{ fontSize: '12px', color: 'var(--color-muted-foreground)', margin: 0, fontFamily: S.font }}>
                  Based on {usedCount} learning{usedCount !== 1 ? 's' : ''}
                  {topicFilter ? ` · ${topicFilter}` : ''}
                  {audience ? ` · ${audience}` : ''}
                </p>
              </div>
            </div>
          </div>

          <div style={{ borderRadius: '12px', border: '1px solid var(--color-border)', background: 'var(--color-card)', padding: '28px', marginBottom: '14px' }}>
            <pre style={{ fontFamily: S.serif, fontSize: '15px', color: 'var(--color-foreground)', lineHeight: 1.75, whiteSpace: 'pre-wrap', margin: 0 }}>
              {formatOutput(result)}
            </pre>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => handleCopy(formatOutput(result))}
              style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1px solid var(--color-border)', background: copied ? 'rgba(111,138,90,.1)' : 'var(--color-card)', color: copied ? '#4f6b3a' : 'var(--color-foreground)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: S.font, transition: 'all 0.15s' }}
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
            <button
              onClick={() => { setResult(null); setSelectedFormat(null); }}
              style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1px solid var(--color-border)', background: 'var(--color-card)', color: 'var(--color-foreground)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: S.font }}
            >
              Generate Another
            </button>
          </div>
        </div>
      )}

      {/* ── HISTORY TAB ──────────────────────────────────────────────────── */}
      {tab === 'history' && (
        <div>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-muted-foreground)', fontFamily: S.font, fontSize: '14px' }}>
              No generations yet. Generate something first!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {history.map((item) => {
                const meta = FORMAT_META[item.format];
                const isOpen = expandedHistory === item.id;
                const text = formatOutput(item.output);
                return (
                  <div key={item.id} style={{ borderRadius: '12px', border: '1px solid var(--color-border)', background: 'var(--color-card)', overflow: 'hidden' }}>
                    <button
                      onClick={() => setExpandedHistory(isOpen ? null : item.id)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                    >
                      <div style={{ width: '36px', height: '36px', background: meta?.color ?? '#888', borderRadius: '8px', display: 'grid', placeItems: 'center', fontSize: '15px', color: '#fff', flexShrink: 0 }}>
                        {meta?.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: S.serif, fontWeight: 600, fontSize: '15px', color: 'var(--color-foreground)', margin: 0 }}>{meta?.name ?? item.format}</p>
                        <p style={{ fontSize: '12px', color: 'var(--color-muted-foreground)', margin: '2px 0 0', fontFamily: S.font }}>
                          {formatDate(item.createdAt)} · {item.usedCount} learnings
                          {item.topicFilter ? ` · ${item.topicFilter}` : ''}
                          {item.audience ? ` · ${item.audience}` : ''}
                        </p>
                      </div>
                      <span style={{ fontSize: '16px', color: 'var(--color-muted-foreground)', transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>›</span>
                    </button>
                    {isOpen && (
                      <div style={{ borderTop: '1px solid var(--color-border)', padding: '20px' }}>
                        <pre style={{ fontFamily: S.serif, fontSize: '14px', color: 'var(--color-foreground)', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: '0 0 14px' }}>
                          {text}
                        </pre>
                        <button
                          onClick={() => handleCopy(text)}
                          style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-muted-foreground)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: S.font }}
                        >
                          Copy
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
