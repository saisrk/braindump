import type { Metadata } from 'next';
import { getSubscriptionInfo } from '@/lib/actions/billing';
import { PricingClient } from './client';

export const metadata: Metadata = {
  title: 'Pricing — Braindump',
  description: 'Try Braindump free for 7 days — full access, no card required. Then go Pro for 10 captures/day, an infinite library, quizzes, and unlimited Express.',
  openGraph: {
    title: 'Braindump Pricing',
    description: '7-day free trial with full access, no card required. Then Pro unlocks 10 captures/day, infinite library, quizzes, and unlimited Express.',
    url: 'https://brain-dump.co/pricing',
    images: [{ url: '/og', width: 1200, height: 630, alt: 'Braindump Pricing' }],
  },
  alternates: { canonical: 'https://brain-dump.co/pricing' },
};

export default async function PricingPage() {
  const info = await getSubscriptionInfo();
  return (
    <PricingClient
      isPro={info.isPro}
      endsAt={info.endsAt}
      entitlement={info.entitlement}
      trialDaysLeft={info.trialDaysLeft}
    />
  );
}
