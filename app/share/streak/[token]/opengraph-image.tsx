import { ImageResponse } from 'next/og';
import { getPublicStreak } from '@/lib/data/streak-share';

// Node runtime (not edge): the share lookup uses the postgres.js driver, which
// is not edge-compatible.
export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Learning streak on Braindump';

export default async function Image({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const streak = await getPublicStreak(token);

  const current = streak?.currentCount ?? 0;
  const longest = streak?.longest ?? 0;
  const total = streak?.totalLearnings ?? 0;
  const topics = streak?.topicCount ?? 0;
  const name = streak?.displayName?.split(' ')[0] ?? null;

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#0f0f0f',
          display: 'flex',
          flexDirection: 'column',
          padding: '72px 90px',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, width: 8, height: 630, background: '#b5462f', display: 'flex' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 20%, rgba(181,70,47,0.15) 0%, transparent 60%)', display: 'flex' }} />

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 48 }}>
          <div style={{ fontSize: 46, lineHeight: 1, display: 'flex' }}>🧠</div>
          <div style={{ fontSize: 40, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-1px', display: 'flex' }}>Braindump</div>
        </div>

        {/* Streak headline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28, marginBottom: 20 }}>
          <div style={{ fontSize: 130, lineHeight: 1, display: 'flex' }}>🔥</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 150, fontWeight: 800, color: '#fff', lineHeight: 0.95, display: 'flex' }}>{current}</div>
            <div style={{ fontSize: 34, color: '#f5b78f', fontWeight: 600, display: 'flex' }}>day learning streak</div>
          </div>
        </div>

        <div style={{ fontSize: 30, color: '#cbd5e1', marginBottom: 40, display: 'flex' }}>
          {name ? `${name} is building a knowledge habit` : 'Building a knowledge habit'}
        </div>

        {/* Stats footer */}
        <div style={{ display: 'flex', gap: 40, alignItems: 'center', marginTop: 'auto' }}>
          {[
            { label: 'Longest streak', value: `${longest} days` },
            { label: 'Learnings', value: `${total}` },
            { label: 'Topics', value: `${topics}` },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
              {i > 0 && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#475569', display: 'flex' }} />}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 40, fontWeight: 700, color: '#f1f5f9', display: 'flex' }}>{s.value}</div>
                <div style={{ fontSize: 20, color: '#94a3b8', display: 'flex' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ position: 'absolute', bottom: 56, right: 90, fontSize: 20, color: '#475569', display: 'flex' }}>
          brain-dump.co
        </div>
      </div>
    ),
    size
  );
}
