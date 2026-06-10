'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Zap, ArrowLeft } from 'lucide-react';
import { createCheckoutSession, createPortalSession } from '@/lib/actions/billing';

const F = "'Inter', system-ui, sans-serif";
const SERIF = "'Spectral', Georgia, serif";
const TERRACOTTA = '#b5462f';
const INK = '#2a2620';
const INK2 = '#7c7361';
const FAINT = '#aaa190';
const RULE = '#e6e0d4';
const BG = '#f5f2ec';
const CARD = '#ffffff';

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
    setLoading('monthly');
    try {
      await createPortalSession();
    } catch {
      setLoading(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: BG, color: INK }}>
      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: '60px', borderBottom: `1px solid ${RULE}`, background: BG, position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href="/home" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: F, fontSize: '14px', fontWeight: 600, color: INK2, textDecoration: 'none' }}>
          <ArrowLeft style={{ width: '16px', height: '16px' }} />
          Back to home
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: TERRACOTTA, display: 'grid', placeItems: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
              <rect x="3" y="4" width="2" height="10" rx="1" fill="white" opacity="0.9" />
              <rect x="7" y="2" width="2" height="14" rx="1" fill="white" />
              <rect x="11" y="5" width="2" height="9" rx="1" fill="white" opacity="0.75" />
              <rect x="15" y="3" width="1.5" height="12" rx="0.75" fill="white" opacity="0.6" />
            </svg>
          </div>
          <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '17px', color: INK }}>Braindump</span>
        </div>
      </nav>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px 80px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p style={{ fontFamily: F, fontSize: '11px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: TERRACOTTA, marginBottom: '10px' }}>
            Plans
          </p>
          <h1 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '40px', color: INK, marginBottom: '12px', lineHeight: 1.1 }}>
            Invest in your knowledge
          </h1>
          <p style={{ fontFamily: F, fontSize: '16px', color: INK2, lineHeight: 1.6 }}>
            Free gets you started. Pro removes every limit.
          </p>
        </div>

        {/* Billing toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '36px' }}>
          <div style={{ display: 'inline-flex', background: CARD, border: `1px solid ${RULE}`, borderRadius: '10px', padding: '4px', gap: '4px' }}>
            {(['monthly', 'annual'] as const).map((i) => (
              <button
                key={i}
                onClick={() => setInterval(i)}
                style={{
                  padding: '7px 20px', borderRadius: '7px', border: 'none', cursor: 'pointer',
                  fontFamily: F, fontWeight: 600, fontSize: '13px',
                  background: interval === i ? BG : 'transparent',
                  color: interval === i ? INK : INK2,
                  boxShadow: interval === i ? '0 1px 4px rgba(42,38,32,.12)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {i === 'monthly' ? 'Monthly' : 'Annual'}
                {i === 'annual' && (
                  <span style={{ marginLeft: '6px', fontSize: '10px', background: TERRACOTTA, color: '#fff', borderRadius: '4px', padding: '2px 5px' }}>
                    Save 33%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Plan cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>

          {/* Free card */}
          <div style={{ background: BG, border: `1px solid ${RULE}`, borderRadius: '16px', padding: '28px' }}>
            <p style={{ fontFamily: F, fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', color: INK2, marginBottom: '12px' }}>Free</p>
            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '40px', color: INK }}>$0</span>
              <span style={{ fontFamily: F, fontSize: '14px', color: INK2, marginLeft: '6px' }}>forever</span>
            </div>
            <div style={{ height: '1px', background: RULE, marginBottom: '20px' }} />
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {FREE_FEATURES.map((f) => (
                <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontFamily: F, fontSize: '14px', color: INK2 }}>
                  <Check style={{ width: '15px', height: '15px', color: '#6f8a5a', flexShrink: 0, marginTop: '2px' }} />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/home"
              style={{ display: 'block', width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${RULE}`, background: CARD, color: INK2, fontFamily: F, fontWeight: 600, fontSize: '14px', textDecoration: 'none', textAlign: 'center' }}
            >
              {isPro ? 'Go to home' : 'Continue free'}
            </Link>
          </div>

          {/* Pro card */}
          <div style={{ background: CARD, border: `2px solid ${TERRACOTTA}`, borderRadius: '16px', padding: '28px', position: 'relative', boxShadow: '0 12px 32px -12px rgba(181,70,47,.25)' }}>
            <div style={{ position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)', background: TERRACOTTA, color: '#fff', fontFamily: F, fontWeight: 700, fontSize: '11px', letterSpacing: '1px', padding: '4px 14px', borderRadius: '99px', whiteSpace: 'nowrap' }}>
              BEST VALUE
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Zap style={{ width: '16px', height: '16px', color: TERRACOTTA }} />
              <p style={{ fontFamily: F, fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', color: TERRACOTTA }}>Pro</p>
            </div>
            <div style={{ marginBottom: '20px' }}>
              {interval === 'annual' ? (
                <>
                  <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '40px', color: INK }}>$8</span>
                  <span style={{ fontFamily: F, fontSize: '14px', color: INK2, marginLeft: '6px' }}>/ month</span>
                  <p style={{ fontFamily: F, fontSize: '12px', color: FAINT, marginTop: '4px' }}>Billed $96/year · save $48</p>
                </>
              ) : (
                <>
                  <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '40px', color: INK }}>$12</span>
                  <span style={{ fontFamily: F, fontSize: '14px', color: INK2, marginLeft: '6px' }}>/ month</span>
                </>
              )}
            </div>
            <div style={{ height: '1px', background: 'rgba(181,70,47,.2)', marginBottom: '20px' }} />
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {PRO_FEATURES.map((f) => (
                <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontFamily: F, fontSize: '14px', color: INK }}>
                  <Check style={{ width: '15px', height: '15px', color: TERRACOTTA, flexShrink: 0, marginTop: '2px' }} />
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
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${RULE}`, background: 'transparent', color: INK, fontFamily: F, fontWeight: 600, fontSize: '14px', cursor: 'pointer', opacity: loading !== null ? 0.6 : 1 }}
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
                  background: loading !== null ? '#933827' : TERRACOTTA,
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

        <p style={{ textAlign: 'center', marginTop: '28px', fontFamily: F, fontSize: '12px', color: FAINT }}>
          Cancel anytime. No questions asked. Payments secured by Stripe.
        </p>
      </div>
    </div>
  );
}
