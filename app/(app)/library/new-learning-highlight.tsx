'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  newId: string;
  isProcessing: boolean;
}

export function NewLearningHighlight({ newId, isProcessing: initialProcessing }: Props) {
  const router = useRouter();
  const [processing, setProcessing] = useState(initialProcessing);
  const [done, setDone] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const attemptsRef = useRef(0);
  const MAX_ATTEMPTS = 20; // 20 × 3s = 60s max

  // Scroll the new book into view
  useEffect(() => {
    const el = document.querySelector(`[data-learning-id="${newId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [newId]);

  // Poll until enrichment is done
  useEffect(() => {
    if (!initialProcessing) return;

    pollRef.current = setInterval(async () => {
      attemptsRef.current += 1;
      try {
        const res = await fetch(`/api/learning-status?id=${newId}`);
        if (!res.ok) return;
        const data = await res.json() as { status: string };
        if (data.status === 'ready' || data.status === 'failed') {
          clearInterval(pollRef.current!);
          setProcessing(false);
          setDone(true);
          // Refresh server component to show enriched data
          router.refresh();
        }
      } catch { /* ignore */ }

      if (attemptsRef.current >= MAX_ATTEMPTS) {
        clearInterval(pollRef.current!);
        setProcessing(false);
      }
    }, 3000);

    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [newId, initialProcessing, router]);

  if (!processing && !done) return null;

  return (
    <div
      style={{
        position: 'fixed', bottom: '28px', left: '50%', transform: 'translateX(-50%)',
        zIndex: 100, pointerEvents: 'none',
        animation: done ? 'toast-out 0.4s ease 1.8s both' : 'toast-in 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
      }}
    >
      <style>{`
        @keyframes toast-in  { from { opacity: 0; transform: translateX(-50%) translateY(12px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        @keyframes toast-out { from { opacity: 1; } to { opacity: 0; transform: translateX(-50%) translateY(8px); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        background: '#2a2620', color: '#f5f2ec',
        padding: '11px 18px', borderRadius: '12px',
        boxShadow: '0 8px 32px -8px rgba(42,38,32,.5)',
        fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13px', fontWeight: 500,
        whiteSpace: 'nowrap',
      }}>
        {done ? (
          <>
            <span style={{ color: '#7a9e68', fontSize: '15px' }}>✓</span>
            Flashcards ready — shelf updated
          </>
        ) : (
          <>
            <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid rgba(245,242,236,.25)', borderTopColor: '#c79a3e', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
            AI is reading this — building your flashcards…
          </>
        )}
      </div>
    </div>
  );
}
