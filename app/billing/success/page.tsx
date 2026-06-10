'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';

const F = "'Inter', system-ui, sans-serif";
const SERIF = "'Spectral', Georgia, serif";

export default function BillingSuccessPage() {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown((n) => {
        if (n <= 1) {
          clearInterval(t);
          window.location.href = '/home';
          return 0;
        }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#f5f2ec', padding: '40px 20px', textAlign: 'center',
    }}>
      <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'rgba(181,70,47,0.12)', display: 'grid', placeItems: 'center', marginBottom: '24px' }}>
        <Zap style={{ width: '32px', height: '32px', color: '#b5462f' }} />
      </div>
      <h1 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '36px', color: '#2a2620', marginBottom: '12px' }}>
        You&apos;re on Pro!
      </h1>
      <p style={{ fontFamily: F, fontSize: '16px', color: '#7c7361', maxWidth: '360px', lineHeight: 1.6, marginBottom: '32px' }}>
        Unlimited captures, unlimited Express, and everything else — unlocked. Welcome to the full experience.
      </p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/home">
          <button style={{ padding: '13px 28px', borderRadius: '10px', border: 'none', background: '#b5462f', color: '#fff', fontFamily: F, fontWeight: 700, fontSize: '15px', cursor: 'pointer', boxShadow: '0 8px 20px -8px rgba(181,70,47,.6)' }}>
            Go to Home →
          </button>
        </Link>
        <Link href="/capture">
          <button style={{ padding: '13px 28px', borderRadius: '10px', border: '1px solid #e6e0d4', background: '#fff', color: '#2a2620', fontFamily: F, fontWeight: 600, fontSize: '15px', cursor: 'pointer' }}>
            Capture something
          </button>
        </Link>
      </div>
      <p style={{ marginTop: '24px', fontFamily: F, fontSize: '12px', color: '#aaa190' }}>
        Redirecting to library in {countdown}s…
      </p>
    </div>
  );
}
