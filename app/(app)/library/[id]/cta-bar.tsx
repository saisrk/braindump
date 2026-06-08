'use client';

import { useRouter } from 'next/navigation';
import { RotateCcw, Zap, Brain } from 'lucide-react';

interface Props {
  learningId: string;
  latestQuizScore: number | null;
  teachBackCount: number;
}

export function CTABar({ learningId, latestQuizScore, teachBackCount }: Props) {
  const router = useRouter();

  const btn = (primary: boolean) => ({
    flex: 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
    background: primary ? '#b5462f' : 'var(--color-card)',
    color: primary ? '#fff' : 'var(--color-foreground)',
    border: primary ? 'none' : '1px solid var(--color-border)',
    borderRadius: '9px',
    padding: '11px 0',
    fontSize: '13px', fontWeight: primary ? 700 : 600,
    cursor: 'pointer',
    fontFamily: "'Inter', system-ui, sans-serif",
    boxShadow: primary ? '0 4px 12px -4px rgba(181,70,47,.45)' : 'none',
  } as React.CSSProperties);

  return (
    <div style={{
      flexShrink: 0,
      display: 'flex', gap: '10px', alignItems: 'center',
      padding: '10px 24px 14px',
      background: 'var(--color-background)',
      borderTop: '1px solid var(--color-border)',
    }}>
      <button style={btn(true)} onClick={() => router.push('/review')}>
        <RotateCcw style={{ width: 14, height: 14 }} />
        Review
      </button>
      <button style={btn(false)} onClick={() => router.push(`/library/${learningId}/quiz`)}>
        <Zap style={{ width: 14, height: 14 }} />
        Test Yourself
        {latestQuizScore !== null && (
          <span style={{ fontSize: '11px', color: 'var(--color-muted-foreground)' }}>
            {latestQuizScore}%
          </span>
        )}
      </button>
      <button style={btn(false)} onClick={() => router.push(`/teachback?learningId=${learningId}`)}>
        <Brain style={{ width: 14, height: 14 }} />
        Teach Back
        {teachBackCount > 0 && (
          <span style={{ fontSize: '11px', color: 'var(--color-muted-foreground)' }}>
            {teachBackCount}×
          </span>
        )}
      </button>
    </div>
  );
}
