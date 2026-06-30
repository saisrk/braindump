'use client';

import Link from 'next/link';
import { logout } from '@/lib/actions/auth';
import { useRouter } from 'next/navigation';

const SERIF = 'Spectral, Georgia, serif';
const F = 'Inter, system-ui, sans-serif';

/**
 * Full-screen hard paywall shown to users whose 7-day free trial has ended and
 * who have no active subscription. Rendered by the (app) layout in place of the
 * app shell, so every authenticated route is blocked until they subscribe.
 */
export function Paywall() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center">
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '18px',
            background: 'rgba(181,70,47,.12)',
            border: '1.5px solid rgba(181,70,47,.3)',
            display: 'grid',
            placeItems: 'center',
            margin: '0 auto 24px',
            fontSize: '28px',
          }}
        >
          🔒
        </div>

        <h1
          style={{
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: '28px',
            color: 'var(--color-foreground)',
            marginBottom: '10px',
          }}
        >
          Your free trial has ended
        </h1>
        <p
          style={{
            fontFamily: F,
            fontSize: '14px',
            color: 'var(--color-muted-foreground)',
            lineHeight: 1.6,
            marginBottom: '28px',
          }}
        >
          Your 7-day free trial is over. Subscribe to Braindump Pro to keep capturing,
          reviewing, and turning what you learn into content — your library is safe and
          waiting for you.
        </p>

        <Link
          href="/pricing"
          style={{
            display: 'block',
            padding: '14px 20px',
            borderRadius: '10px',
            background: '#b5462f',
            color: '#fff',
            fontFamily: F,
            fontWeight: 700,
            fontSize: '15px',
            textAlign: 'center',
            textDecoration: 'none',
            boxShadow: '0 6px 16px -6px rgba(181,70,47,.55)',
          }}
        >
          See plans &amp; subscribe →
        </Link>

        <div className="mt-4 flex items-center justify-center gap-4">
          <Link
            href="/contact"
            style={{ fontFamily: F, fontSize: '13px', color: 'var(--color-muted-foreground)' }}
          >
            Contact us
          </Link>
          <span style={{ color: 'var(--color-border)' }}>·</span>
          <button
            onClick={async () => {
              await logout();
              router.push('/login');
              router.refresh();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-muted-foreground)',
              fontFamily: F,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
