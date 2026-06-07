'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Link2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { saveSkeleton } from '@/lib/actions/capture';
import { isValidUrl } from '@/lib/extract';

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

      // Fire enrichment in the background. keepalive ensures it survives navigation.
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
      }).catch(() => {}); // fire-and-forget

      router.push('/library');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleCapture();
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-8 md:px-8">
        <PageHeader
          title="Capture"
          subtitle="Paste a URL or write what you learned"
          className="mb-4"
        />
        <div className="max-w-xl mx-auto space-y-4">
          <div className="relative">
            <div className="absolute left-4 top-4 text-muted-foreground">
              {isUrl ? <Link2 className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste a URL or write a note…"
              autoFocus
              rows={6}
              className="w-full rounded-2xl border border-border bg-card px-5 py-4 pl-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm leading-relaxed"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">⌘↵ to capture</p>
            <Button
              onClick={handleCapture}
              disabled={loading || !input.trim()}
              className="px-6"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                'Capture'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
