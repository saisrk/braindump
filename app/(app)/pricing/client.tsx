'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Zap } from 'lucide-react';
import { createCheckoutSession, createPortalSession } from '@/lib/actions/billing';

const F = "'Inter', system-ui, sans-serif";
const SERIF = "'Spectral', Georgia, serif";

const FREE_FEATURES = [
  '5 captures per day',
  'AI summaries & key points',
  'Spaced repetition reviews',
  'Teach-back loop',
  '1 free Express generation',
];

const PRO_FEATURES = [
  'Unlimited captures',
  'Everything in Free',
  'Unlimited Express generations',
  'Priority AI processing',
  'Early access to new features',
];

type BillingInterval = 'monthly' | 'annual';

interface PricingClientProps {
  isPro: boolean;
  endsAt: Date | null;
}

export function PricingClient({ isPro, endsAt }: PricingClientProps) {
  const router = useRouter();
  const [interval, setInterval] = useState<BillingInterval>('annual');
  const [loading, setLoading] = useState<BillingInterval | null>(null);

  const handleSubscribe = async (plan: BillingInterval) => {
    setLoading(plan);
    try {
      await createCheckoutSession(plan);
    } catch {
      setLoading(null);
    }
  };

  const handleManage = async () => {
    setLoading('monthly'); // reuse state as "any loading"
    try {
      await createPortalSession();
    } catch {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 pt-8 pb-12 md:px-8">

        {/* Header */}
        <div className="text-center mb-10 max-w-xl mx-auto">
          <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#b5462f', fontFamily: F, fontWeight: 600, marginBottom: '10px' }}>
            Plans
          </p>
          <h1 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '36px', color: 'var(--color-foreground)', marginBottom: '12px', lineHeight: 1.1 }}>
            Invest in your knowledge
          </h1>
          <p style={{ fontFamily: F, fontSize: '15px', color: 'var(--color-muted-foreground)', lineHeight: 1.6 }}>
            Free gets you started. Pro removes every limit.
          </p>
        </div>

        {/* Billing toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '36px' }}>
          <div style={{ display: 'inline-flex', background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '4px', gap: '4px' }}>
            {(['monthly', 'annual'] as const).map((i) => (
              <button
                key={i}
                onClick={() => setInterval(i)}
                style={{
                  padding: '7px 18px', borderRadius: '7px', border: 'none', cursor: 'pointer',
                  fontFamily: F, fontWeight: 600, fontSize: '13px',
                  background: interval === i ? 'var(--color-card)' : 'transparent',
                  color: interval === i ? 'var(--color-foreground)' : 'var(--color-muted-foreground)',
                  boxShadow: interval === i ? '0 1px 4px rgba(42,38,32,.12)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {i === 'monthly' ? 'Monthly' : 'Annual'}
                {i === 'annual' && (
                  <span style={{ marginLeft: '6px', fontSize: '10px', background: '#b5462f', color: '#fff', borderRadius: '4px', padding: '2px 5px' }}>
                    Save 33%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Plan cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', maxWidth: '720px', margin: '0 auto' }}>

          {/* Free card */}
          <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '28px' }}>
            <p style={{ fontFamily: F, fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--color-muted-foreground)', marginBottom: '12px' }}>Free</p>
            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '40px', color: 'var(--color-foreground)' }}>$0</span>
              <span style={{ fontFamily: F, fontSize: '14px', color: 'var(--color-muted-foreground)', marginLeft: '6px' }}>forever</span>
            </div>
            <div style={{ height: '1px', background: 'var(--color-border)', marginBottom: '20px' }} />
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {FREE_FEATURES.map((f) => (
                <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontFamily: F, fontSize: '14px', color: 'var(--color-foreground)' }}>
                  <Check style={{ width: '15px', height: '15px', color: '#6f8a5a', flexShrink: 0, marginTop: '2px' }} />
                  {f}
                </li>
              ))}
            </ul>
            <button
              disabled
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-muted-foreground)', fontFamily: F, fontWeight: 600, fontSize: '14px', cursor: 'default' }}
            >
              Current plan
            </button>
          </div>

          {/* Pro card */}
          <div style={{ background: 'var(--color-card)', border: '2px solid #b5462f', borderRadius: '16px', padding: '28px', position: 'relative', boxShadow: '0 12px 32px -12px rgba(181,70,47,.25)' }}>
            {/* Best value badge */}
            <div style={{ position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)', background: '#b5462f', color: '#fff', fontFamily: F, fontWeight: 700, fontSize: '11px', letterSpacing: '1px', padding: '4px 14px', borderRadius: '99px', whiteSpace: 'nowrap' }}>
              BEST VALUE
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Zap style={{ width: '16px', height: '16px', color: '#b5462f' }} />
              <p style={{ fontFamily: F, fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', color: '#b5462f' }}>Pro</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              {interval === 'annual' ? (
                <>
                  <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '40px', color: 'var(--color-foreground)' }}>$8</span>
                  <span style={{ fontFamily: F, fontSize: '14px', color: 'var(--color-muted-foreground)', marginLeft: '6px' }}>/ month</span>
                  <p style={{ fontFamily: F, fontSize: '12px', color: 'var(--color-muted-foreground)', marginTop: '4px' }}>Billed $96/year · save $48</p>
                </>
              ) : (
                <>
                  <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '40px', color: 'var(--color-foreground)' }}>$12</span>
                  <span style={{ fontFamily: F, fontSize: '14px', color: 'var(--color-muted-foreground)', marginLeft: '6px' }}>/ month</span>
                </>
              )}
            </div>

            <div style={{ height: '1px', background: 'rgba(181,70,47,.2)', marginBottom: '20px' }} />

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {PRO_FEATURES.map((f) => (
                <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontFamily: F, fontSize: '14px', color: 'var(--color-foreground)' }}>
                  <Check style={{ width: '15px', height: '15px', color: '#b5462f', flexShrink: 0, marginTop: '2px' }} />
                  {f}
                </li>
              ))}
            </ul>

            {isPro ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ background: 'rgba(111,138,90,0.12)', border: '1px solid rgba(111,138,90,0.3)', borderRadius: '10px', padding: '10px 14px', textAlign: 'center', fontFamily: F, fontSize: '13px', color: '#6f8a5a', fontWeight: 600 }}>
                  ✓ You&apos;re on Pro{endsAt && ` · renews ${endsAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                </div>
                <button
                  onClick={handleManage}
                  disabled={loading !== null}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-foreground)', fontFamily: F, fontWeight: 600, fontSize: '14px', cursor: 'pointer', opacity: loading !== null ? 0.6 : 1 }}
                >
                  {loading !== null ? 'Loading…' : 'Manage subscription'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleSubscribe(interval)}
                disabled={loading !== null}
                style={{
                  width: '100%', padding: '13px', borderRadius: '10px', border: 'none',
                  background: loading !== null ? '#933827' : '#b5462f',
                  color: '#fff', fontFamily: F, fontWeight: 700, fontSize: '15px',
                  cursor: loading !== null ? 'not-allowed' : 'pointer',
                  opacity: loading !== null ? 0.85 : 1,
                  boxShadow: '0 8px 20px -8px rgba(181,70,47,.6)',
                  transition: 'transform 0.1s ease',
                }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {loading === interval ? 'Redirecting…' : `Get Pro ${interval === 'annual' ? 'Annual' : 'Monthly'} →`}
              </button>
            )}
          </div>
        </div>

        {/* Footer note */}
        <p style={{ textAlign: 'center', marginTop: '28px', fontFamily: F, fontSize: '12px', color: 'var(--color-muted-foreground)' }}>
          Cancel anytime. No questions asked. Payments secured by Stripe.
        </p>
      </div>
    </div>
  );
}
