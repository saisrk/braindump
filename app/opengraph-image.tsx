import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        background: '#0f0f0f',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px 90px',
        fontFamily: 'sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Left accent bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 8, height: 630, background: '#b5462f', display: 'flex' }} />

      {/* Subtle grid texture */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 20%, rgba(181,70,47,0.12) 0%, transparent 60%)', display: 'flex' }} />

      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40 }}>
        <div style={{ fontSize: 56, lineHeight: 1, display: 'flex' }}>🧠</div>
        <div style={{ fontSize: 48, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-1px', display: 'flex' }}>Braindump</div>
      </div>

      {/* Tagline */}
      <div style={{ fontSize: 52, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.15, marginBottom: 28, display: 'flex' }}>
        Remember everything<br />you learn
      </div>

      {/* Sub-copy */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        {['Capture', 'AI flashcards', 'Spaced repetition', 'Teach-back'].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {i > 0 && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#475569', display: 'flex' }} />}
            <div style={{ fontSize: 22, color: '#94a3b8', display: 'flex' }}>{item}</div>
          </div>
        ))}
      </div>

      {/* URL */}
      <div style={{ position: 'absolute', bottom: 56, right: 90, fontSize: 20, color: '#475569', display: 'flex' }}>
        brain-dump.co
      </div>
    </div>
  );
}
