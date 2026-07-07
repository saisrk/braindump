import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublicStreak } from '@/lib/data/streak-share';

const F = "'Inter', system-ui, sans-serif";
const SERIF = "'Spectral', Georgia, serif";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const streak = await getPublicStreak(token);

  if (!streak) {
    return {
      title: 'Streak not found',
      description: 'This learning streak is private or no longer shared.',
      robots: { index: false, follow: false },
    };
  }

  const name = streak.displayName?.split(' ')[0];
  const title = name
    ? `${name}'s ${streak.currentCount}-day learning streak`
    : `A ${streak.currentCount}-day learning streak`;
  const description = `On Braindump — ${streak.currentCount}-day streak, longest ${streak.longest} days, across ${streak.totalLearnings} learnings. Start your own knowledge habit.`;

  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function StreakSharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const streak = await getPublicStreak(token);

  if (!streak) {
    return (
      <main
        style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: '24px',
          background: 'var(--color-background)', textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
        <h1 style={{ fontFamily: SERIF, fontSize: '28px', fontWeight: 700, color: 'var(--color-foreground)', margin: '0 0 8px' }}>
          This streak is private
        </h1>
        <p style={{ fontFamily: F, fontSize: '15px', color: 'var(--color-muted-foreground)', margin: '0 0 24px', maxWidth: '420px' }}>
          The link may have been revoked or never existed. But you can start your own learning streak today.
        </p>
        <Link
          href="/landing"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 24px',
            borderRadius: '12px', background: '#b5462f', color: '#fff', fontFamily: F,
            fontWeight: 700, fontSize: '15px', textDecoration: 'none',
          }}
        >
          Start on Braindump
        </Link>
      </main>
    );
  }

  const name = streak.displayName?.split(' ')[0];
  const stats = [
    { label: 'Longest streak', value: `${streak.longest}` },
    { label: 'Learnings', value: `${streak.totalLearnings}` },
    { label: 'Topics', value: `${streak.topicCount}` },
  ];

  return (
    <main
      style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '24px',
        background: 'var(--color-background)',
      }}
    >
      <div
        style={{
          width: '100%', maxWidth: '460px', borderRadius: '24px', padding: '40px 32px',
          background: 'var(--color-card)', border: '1px solid var(--color-border)',
          boxShadow: '0 24px 60px -24px rgba(42,38,32,0.25)', textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '28px' }}>
          <span style={{ fontSize: '22px' }}>🧠</span>
          <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '18px', color: 'var(--color-foreground)' }}>Braindump</span>
        </div>

        <div style={{ fontSize: '80px', lineHeight: 1, marginBottom: '8px' }}>🔥</div>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '72px', lineHeight: 1, color: 'var(--color-foreground)' }}>
          {streak.currentCount}
        </div>
        <div style={{ fontFamily: F, fontSize: '16px', fontWeight: 600, color: '#b5462f', marginTop: '4px' }}>
          day learning streak
        </div>
        <p style={{ fontFamily: F, fontSize: '14px', color: 'var(--color-muted-foreground)', margin: '12px 0 28px' }}>
          {name ? `${name} is building a knowledge habit on Braindump` : 'Building a knowledge habit on Braindump'}
        </p>

        <div
          style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px',
            padding: '16px 0', borderTop: '1px solid var(--color-border)',
            borderBottom: '1px solid var(--color-border)', marginBottom: '28px',
          }}
        >
          {stats.map((s) => (
            <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '24px', color: 'var(--color-foreground)' }}>{s.value}</span>
              <span style={{ fontFamily: F, fontSize: '11px', color: 'var(--color-muted-foreground)' }}>{s.label}</span>
            </div>
          ))}
        </div>

        <Link
          href="/landing"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            padding: '14px', borderRadius: '12px', background: '#b5462f', color: '#fff',
            fontFamily: F, fontWeight: 700, fontSize: '15px', textDecoration: 'none',
            boxShadow: '0 6px 16px -6px rgba(181,70,47,.55)',
          }}
        >
          Start your own streak
        </Link>
      </div>

      <p style={{ fontFamily: F, fontSize: '12px', color: 'var(--color-muted-foreground)', marginTop: '20px' }}>
        brain-dump.co
      </p>
    </main>
  );
}
