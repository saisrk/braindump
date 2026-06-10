'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap } from 'lucide-react';

const F = "'Inter', system-ui, sans-serif";
const SERIF = "'Spectral', Georgia, serif";

export default function BillingSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown((n) => {
        if (n <= 1) {
          clearInterval(t);
          router.push('/library');
          return 0;
        }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [router]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px 20px', textAlign: 'center' }}>
      <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'rgba(181,70,47,0.12)', display: 'grid', placeItems: 'center', marginBottom: '24px' }}>
        <Zap style={{ width: '32px', height: '32px', color: '#b5462f' }} />
      </div>
      <h1 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '32px', color: 'var(--color-foreground)', marginBottom: '12px' }}>
        Welcome to Pro!
      </h1>
      <p style={{ fontFamily: F, fontSize: '16px', color: 'var(--color-muted-foreground)', maxWidth: '360px', lineHeight: 1.6, marginBottom: '32px' }}>
        Unlimited captures, unlimited Express, and everything else — unlocked.
      </p>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => router.push('/library')}
          style={{ padding: '12px 28px', borderRadius: '10px', border: 'none', background: '#b5462f', color: '#fff', fontFamily: F, fontWeight: 600, fontSize: '14px', cursor: 'pointer', boxShadow: '0 6px 16px -6px rgba(181,70,47,.5)' }}
        >
          Go to Library
        </button>
        <button
          onClick={() => router.push('/capture')}
          style={{ padding: '12px 28px', borderRadius: '10px', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-foreground)', fontFamily: F, fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
        >
          Capture something
        </button>
      </div>
      <p style={{ marginTop: '20px', fontFamily: F, fontSize: '12px', color: 'var(--color-muted-foreground)' }}>
        Redirecting to library in {countdown}s…
      </p>
    </div>
  );
}
