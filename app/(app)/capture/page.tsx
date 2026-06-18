'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Link2 } from 'lucide-react';
import { saveSkeleton } from '@/lib/actions/capture';

type Phase = 'form' | 'saving' | 'success';
type LimitReason = 'daily_limit' | 'library_full';

export default function CapturePage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [phase, setPhase] = useState<Phase>('form');
  const [error, setError] = useState('');
  const [limitReason, setLimitReason] = useState<LimitReason | null>(null);
  const [newId, setNewId] = useState<string | null>(null);

  const hasContent = url.trim() || note.trim();

  async function handleCapture() {
    if (!hasContent) return;
    setError('');
    setLimitReason(null);
    setPhase('saving');

    const isUrl = url.trim().startsWith('http://') || url.trim().startsWith('https://');
    const rawContent = note.trim() || url.trim();

    try {
      const result = await saveSkeleton({
        sourceType: isUrl ? 'url' : 'text',
        sourceRef: isUrl ? url.trim() : null,
        rawContent,
      });

      if (!result.ok || !result.learningId) {
        if (result.errorCode === 'daily_limit' || result.errorCode === 'library_full') {
          setLimitReason(result.errorCode);
        } else {
          setError(result.error ?? 'Failed to save. Please try again.');
        }
        setPhase('form');
        return;
      }

      setNewId(result.learningId);

      // Fire-and-forget enrichment
      fetch('/api/capture/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learningId: result.learningId,
          content: rawContent,
          sourceType: isUrl ? 'url' : 'text',
          sourceRef: isUrl ? url.trim() : undefined,
          userNote: note.trim() || undefined,
        }),
        keepalive: true,
      }).catch(() => {});

      setPhase('success');

      // Auto-redirect after 2.5s
      setTimeout(() => {
        router.push(`/library?new=${result.learningId}`);
      }, 2500);
    } catch {
      setError('Something went wrong. Please try again.');
      setPhase('form');
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleCapture();
  }

  const F = "'Inter', system-ui, sans-serif";
  const SERIF = "'Spectral', Georgia, serif";

  // ── Success screen ──────────────────────────────────────────────
  if (phase === 'success') {
    return (
      <div className="flex flex-col h-full">
        <style>{`
          @keyframes scan-highlight {
            0%   { left: -100%; width: 60%; }
            100% { left: 200%; width: 60%; }
          }
          @keyframes success-pop {
            0%   { opacity: 0; transform: scale(0.85) translateY(8px); }
            60%  { transform: scale(1.04) translateY(-2px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
          .success-card { animation: success-pop 0.45s cubic-bezier(0.34,1.56,0.64,1) both; }
        `}</style>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="success-card max-w-md w-full">
            {/* Check icon */}
            <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(111,138,90,.14)', border: '1.5px solid rgba(111,138,90,.3)', display: 'grid', placeItems: 'center', margin: '0 auto 24px', fontSize: '28px' }}>
              ✓
            </div>

            <h2 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '26px', color: 'var(--color-foreground)', textAlign: 'center', marginBottom: '10px' }}>
              Saved to your library
            </h2>
            <p style={{ fontFamily: F, fontSize: '14px', color: 'var(--color-muted-foreground)', textAlign: 'center', lineHeight: 1.6, marginBottom: '28px' }}>
              AI is extracting key ideas and building your flashcards.
            </p>

            {/* Scanning animation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '280px', margin: '0 auto 28px' }}>
              {['92%', '100%', '76%', '86%'].map((w, i) => (
                <div key={i} style={{ position: 'relative', height: '9px', borderRadius: '4px', background: 'var(--color-muted)', overflow: 'hidden', width: w }}>
                  <div style={{ position: 'absolute', top: 0, bottom: 0, width: '60%', background: 'rgba(199,154,62,.5)', borderRadius: '4px', animation: `scan-highlight 1.8s ease-in-out ${i * 0.35}s infinite` }} />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => router.push(`/library?new=${newId}`)}
                style={{ flex: 1, padding: '13px 20px', borderRadius: '10px', border: 'none', background: '#b5462f', color: '#fff', fontFamily: F, fontWeight: 700, fontSize: '15px', cursor: 'pointer', boxShadow: '0 6px 16px -6px rgba(181,70,47,.55)' }}
              >
                Go to library →
              </button>
              <button
                onClick={() => { setUrl(''); setNote(''); setPhase('form'); setNewId(null); }}
                style={{ padding: '13px 18px', borderRadius: '10px', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-muted-foreground)', fontFamily: F, fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
              >
                + Capture another
              </button>
            </div>

            <p style={{ fontFamily: F, fontSize: '12px', color: 'var(--color-muted-foreground)', textAlign: 'center', marginTop: '16px' }}>
              Redirecting to library in a moment…
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Upgrade prompt (free-tier limit reached) ────────────────────
  if (limitReason) {
    const isDaily = limitReason === 'daily_limit';
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full">
            <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(181,70,47,.12)', border: '1.5px solid rgba(181,70,47,.3)', display: 'grid', placeItems: 'center', margin: '0 auto 24px', fontSize: '28px' }}>
              {isDaily ? '⏳' : '📚'}
            </div>

            <h2 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '26px', color: 'var(--color-foreground)', textAlign: 'center', marginBottom: '10px' }}>
              {isDaily ? "That's your 3 captures for today" : "Your free library is full"}
            </h2>
            <p style={{ fontFamily: F, fontSize: '14px', color: 'var(--color-muted-foreground)', textAlign: 'center', lineHeight: 1.6, marginBottom: '28px' }}>
              {isDaily
                ? 'The free plan includes 3 captures per day. Upgrade to Pro for unlimited captures — or come back tomorrow.'
                : 'The free plan holds up to 30 learnings. Upgrade to Pro for an unlimited library and keep building.'}
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <Link
                href="/pricing"
                style={{ flex: 1, padding: '13px 20px', borderRadius: '10px', background: '#b5462f', color: '#fff', fontFamily: F, fontWeight: 700, fontSize: '15px', textAlign: 'center', textDecoration: 'none', boxShadow: '0 6px 16px -6px rgba(181,70,47,.55)' }}
              >
                Upgrade to Pro →
              </Link>
              <button
                onClick={() => { setLimitReason(null); }}
                style={{ padding: '13px 18px', borderRadius: '10px', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-muted-foreground)', fontFamily: F, fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
              >
                ← Back
              </button>
            </div>

            <button
              onClick={() => router.push('/library')}
              style={{ display: 'block', margin: '16px auto 0', background: 'transparent', border: 'none', color: 'var(--color-muted-foreground)', fontFamily: F, fontSize: '13px', cursor: 'pointer' }}
            >
              Go to library
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      <style>{`
        @keyframes scan-highlight {
          0%   { left: -100%; width: 60%; }
          100% { left: 200%; width: 60%; }
        }
      `}</style>
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-8 md:px-8">

        {/* Header */}
        <div className="mb-7">
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#b5462f', marginBottom: '8px', fontFamily: F }}>
            Capture
          </p>
          <h1 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '28px', color: 'var(--color-foreground)', marginBottom: '6px' }}>
            Add to your library
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-muted-foreground)', lineHeight: 1.5, fontFamily: F }}>
            Paste a link or write a note — AI extracts the key ideas automatically
          </p>
        </div>

        {/* Form card */}
        <div className="max-w-xl rounded-2xl border border-border bg-card p-7" style={{ boxShadow: '0 20px 50px -38px rgba(42,38,32,.5)' }}>

          {/* URL field */}
          <label style={{ display: 'block', fontFamily: SERIF, fontWeight: 600, fontSize: '15px', color: 'var(--color-foreground)', marginBottom: '8px' }}>
            Source <span style={{ fontFamily: F, fontWeight: 400, color: 'var(--color-muted-foreground)', fontSize: '13px' }}>(optional)</span>
          </label>
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <Link2 style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: 'var(--color-muted-foreground)' }} />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste a URL or article link…"
              style={{ width: '100%', padding: '11px 14px 11px 36px', border: '1px solid var(--color-border)', borderRadius: '10px', fontSize: '14px', fontFamily: F, background: 'var(--color-background)', color: 'var(--color-foreground)', outline: 'none' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#b5462f'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
            />
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-muted-foreground)', fontFamily: F }}>and / or</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
          </div>

          {/* Note field */}
          <label style={{ display: 'block', fontFamily: SERIF, fontWeight: 600, fontSize: '15px', color: 'var(--color-foreground)', marginBottom: '8px' }}>
            What&apos;s worth remembering?
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What's the one thing from this worth keeping? Writing in your own words helps AI build better flashcards."
            rows={5}
            style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--color-border)', borderRadius: '10px', fontSize: '14px', fontFamily: SERIF, background: 'var(--color-background)', color: 'var(--color-foreground)', outline: 'none', resize: 'none', lineHeight: 1.65, marginBottom: '6px' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#b5462f'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
          />

          {error && <p style={{ fontSize: '13px', color: '#b5462f', marginBottom: '12px', fontFamily: F }}>{error}</p>}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              onClick={handleCapture}
              disabled={phase === 'saving' || !hasContent}
              style={{
                flex: 1, padding: '13px 20px', borderRadius: '10px', border: 'none',
                background: !hasContent || phase === 'saving' ? 'rgba(181,70,47,.5)' : '#b5462f',
                color: '#fff', fontFamily: F, fontWeight: 700, fontSize: '15px',
                cursor: phase === 'saving' || !hasContent ? 'not-allowed' : 'pointer',
                boxShadow: hasContent && phase !== 'saving' ? '0 6px 16px -6px rgba(181,70,47,.55)' : 'none',
                transition: 'transform 0.1s ease',
              }}
              onMouseEnter={(e) => { if (hasContent && phase !== 'saving') e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {phase === 'saving' ? 'Saving…' : 'Save to library →'}
            </button>
            <button
              onClick={() => router.back()}
              style={{ padding: '13px 18px', borderRadius: '10px', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-muted-foreground)', fontFamily: F, fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
            >
              ← Back
            </button>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--color-muted-foreground)', marginTop: '12px', fontFamily: F, lineHeight: 1.5 }}>
            AI will extract key ideas and build flashcards automatically.
          </p>
        </div>

        {/* Keyboard hint */}
        <p style={{ fontSize: '12px', color: 'var(--color-muted-foreground)', marginTop: '14px', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: F }}>
          <kbd style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '2px 6px', fontSize: '11px', fontFamily: 'monospace' }}>⌘</kbd>
          <kbd style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '2px 6px', fontSize: '11px', fontFamily: 'monospace' }}>↵</kbd>
          to save
        </p>

      </div>
    </div>
  );
}
