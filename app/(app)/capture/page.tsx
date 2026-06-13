'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link2 } from 'lucide-react';
import { saveSkeleton } from '@/lib/actions/capture';

export default function CapturePage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const hasContent = url.trim() || note.trim();

  async function handleCapture() {
    if (!hasContent) return;
    setError('');
    setLoading(true);

    // Combine: prefer URL as primary input, note as additional context
    const isUrl = url.trim().startsWith('http://') || url.trim().startsWith('https://');
    const rawContent = isUrl
      ? note.trim() || url.trim()
      : note.trim() || url.trim();

    try {
      const result = await saveSkeleton({
        sourceType: isUrl ? 'url' : 'text',
        sourceRef: isUrl ? url.trim() : null,
        rawContent,
      });

      if (!result.ok || !result.learningId) {
        setError(result.error ?? 'Failed to save. Please try again.');
        return;
      }

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

      router.push('/library');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleCapture();
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-8 md:px-8">

        {/* Header */}
        <div className="mb-7">
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#b5462f', marginBottom: '8px', fontFamily: "'Inter', system-ui, sans-serif" }}>
            Capture
          </p>
          <h1 style={{ fontFamily: "'Spectral', Georgia, serif", fontWeight: 700, fontSize: '28px', color: 'var(--color-foreground)', marginBottom: '6px' }}>
            Add to your library
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-muted-foreground)', lineHeight: 1.5, fontFamily: "'Inter', system-ui, sans-serif" }}>
            Paste a link or write a note — AI extracts the key ideas automatically
          </p>
        </div>

        {/* Form card */}
        <div
          className="max-w-xl rounded-2xl border border-border bg-card p-7"
          style={{ boxShadow: '0 20px 50px -38px rgba(42,38,32,.5)' }}
        >
          {/* URL field */}
          <label style={{ display: 'block', fontFamily: "'Spectral', Georgia, serif", fontWeight: 600, fontSize: '15px', color: 'var(--color-foreground)', marginBottom: '8px' }}>
            Source <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 400, color: 'var(--color-muted-foreground)', fontSize: '13px' }}>(optional)</span>
          </label>
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <Link2 style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: 'var(--color-muted-foreground)' }} />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste a URL or article link…"
              style={{ width: '100%', padding: '11px 14px 11px 36px', border: '1px solid var(--color-border)', borderRadius: '10px', fontSize: '14px', fontFamily: "'Inter', system-ui, sans-serif", background: 'var(--color-background)', color: 'var(--color-foreground)', outline: 'none' }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#b5462f'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
            />
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-muted-foreground)', fontFamily: "'Inter', system-ui, sans-serif" }}>and / or</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
          </div>

          {/* Note field */}
          <label style={{ display: 'block', fontFamily: "'Spectral', Georgia, serif", fontWeight: 600, fontSize: '15px', color: 'var(--color-foreground)', marginBottom: '8px' }}>
            What&apos;s worth remembering?
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What's the one thing from this worth keeping? Writing in your own words helps AI build better flashcards."
            rows={5}
            style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--color-border)', borderRadius: '10px', fontSize: '14px', fontFamily: "'Spectral', Georgia, serif", background: 'var(--color-background)', color: 'var(--color-foreground)', outline: 'none', resize: 'none', lineHeight: 1.65, marginBottom: '6px' }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#b5462f'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
          />

          {error && <p style={{ fontSize: '13px', color: '#b5462f', marginBottom: '12px', fontFamily: "'Inter', system-ui, sans-serif" }}>{error}</p>}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              onClick={handleCapture}
              disabled={loading || !hasContent}
              style={{
                flex: 1, padding: '13px 20px', borderRadius: '10px', border: 'none',
                background: !hasContent || loading ? 'rgba(181,70,47,.5)' : '#b5462f',
                color: '#fff', fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 700, fontSize: '15px',
                cursor: loading || !hasContent ? 'not-allowed' : 'pointer',
                boxShadow: hasContent && !loading ? '0 6px 16px -6px rgba(181,70,47,.55)' : 'none',
                transition: 'transform 0.1s ease',
              }}
              onMouseEnter={(e) => { if (hasContent && !loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {loading ? 'Saving…' : 'Save to library →'}
            </button>
            <button
              onClick={() => router.back()}
              style={{ padding: '13px 18px', borderRadius: '10px', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-muted-foreground)', fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
            >
              ← Back
            </button>
          </div>

          {/* AI helper line */}
          <p style={{ fontSize: '12px', color: 'var(--color-muted-foreground)', marginTop: '12px', fontFamily: "'Inter', system-ui, sans-serif", lineHeight: 1.5 }}>
            AI will extract key ideas and build flashcards automatically.
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="max-w-xl mt-5 rounded-2xl border border-border bg-card p-8" style={{ boxShadow: '0 16px 40px -32px rgba(42,38,32,.5)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '280px', margin: '0 auto 16px' }}>
              {['100%', '88%', '94%', '70%'].map((w, i) => (
                <div key={i} style={{ position: 'relative', height: '10px', borderRadius: '4px', background: 'var(--color-muted)', overflow: 'hidden', width: w }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(199,154,62,.5)', animation: `scan-highlight 2.6s ease-in-out ${i * 0.5}s infinite` }} />
                </div>
              ))}
            </div>
            <p style={{ fontFamily: "'Spectral', Georgia, serif", fontSize: '15px', color: 'var(--color-muted-foreground)', textAlign: 'center', fontStyle: 'italic' }}>
              Extracting key ideas — building your flashcards…
            </p>
          </div>
        )}

        {/* Keyboard hint */}
        <p style={{ fontSize: '12px', color: 'var(--color-muted-foreground)', marginTop: '14px', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'Inter', system-ui, sans-serif" }}>
          <kbd style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '2px 6px', fontSize: '11px', fontFamily: 'monospace' }}>⌘</kbd>
          <kbd style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '2px 6px', fontSize: '11px', fontFamily: 'monospace' }}>↵</kbd>
          to save
        </p>

      </div>
    </div>
  );
}
