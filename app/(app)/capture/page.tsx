'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link2, FileText } from 'lucide-react';
import { saveSkeleton } from '@/lib/actions/capture';

export default function CapturePage() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isUrl = input.trim().startsWith('http://') || input.trim().startsWith('https://');

  async function handleCapture() {
    const value = input.trim();
    if (!value) return;
    setError('');
    setLoading(true);

    try {
      const sourceType = isUrl ? 'url' : 'text';
      const result = await saveSkeleton({
        sourceType,
        sourceRef: isUrl ? value : null,
        rawContent: value,
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
          content: value,
          sourceType,
          sourceRef: isUrl ? value : undefined,
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
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">New Volume</p>
          <h1 className="font-display font-bold text-foreground" style={{ fontSize: '28px' }}>
            Capture a learning
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Write it down — we'll bind it into your library</p>
        </div>

        <div
          className="max-w-xl rounded-2xl border border-border bg-card p-7"
          style={{ boxShadow: '0 20px 50px -38px rgba(42,38,32,.5)' }}
        >
          <label className="block font-display font-semibold text-foreground mb-2">
            Source <span className="font-sans font-normal text-muted-foreground text-sm">(optional)</span>
          </label>
          <div className="relative mb-5">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={isUrl ? input : ''}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste a URL…"
              className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground">or write a note</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <label className="block font-display font-semibold text-foreground mb-2">What did you learn?</label>
          <div className="relative mb-6">
            {!isUrl && <FileText className="absolute left-3 top-4 h-4 w-4 text-muted-foreground pointer-events-none" />}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Today I learned…"
              rows={5}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 font-display text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none leading-relaxed"
            />
          </div>

          {error && <p className="text-sm text-danger mb-4">{error}</p>}

          <div className="flex gap-3">
            <button
              onClick={handleCapture}
              disabled={loading || !input.trim()}
              className="flex-1 rounded-lg py-3 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
              style={{ background: '#b5462f', boxShadow: '0 6px 14px -6px rgba(181,70,47,.6)' }}
            >
              {loading ? 'Binding…' : 'Bind it →'}
            </button>
            <button
              onClick={() => router.push('/library')}
              className="flex-1 rounded-lg border border-border py-3 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              Skip
            </button>
          </div>
        </div>

        {loading && (
          <div className="max-w-xl mt-5 rounded-2xl border border-border bg-card p-8" style={{ boxShadow: '0 16px 40px -32px rgba(42,38,32,.5)' }}>
            <div className="space-y-3 max-w-xs mx-auto mb-4">
              {['100%', '88%', '94%', '70%'].map((w, i) => (
                <div key={i} className="relative h-3 rounded bg-muted overflow-hidden" style={{ width: w }}>
                  <div
                    className="absolute inset-y-0 left-0 rounded"
                    style={{ background: 'rgba(199,154,62,.5)', animation: `scan-highlight 2.6s ease-in-out ${i * 0.5}s infinite` }}
                  />
                </div>
              ))}
            </div>
            <p className="font-display text-base text-muted-foreground text-center italic">
              Annotating your notes — highlighting what matters…
            </p>
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-4">⌘↵ to capture</p>
      </div>
    </div>
  );
}
