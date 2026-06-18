import type { Metadata } from 'next';
import { getSubscriptionInfo } from '@/lib/actions/billing';
import { PricingClient } from './client';

export const metadata: Metadata = {
  title: 'Pricing — Braindump',
  description: 'Start free with 1 capture a day and 30 learnings. Upgrade to Pro for 10 captures/day, an infinite library, quizzes, and unlimited Express.',
  openGraph: {
    title: 'Braindump Pricing',
    description: 'Free plan to get started. Pro unlocks 10 captures/day, infinite library, quizzes, and unlimited Express generations.',
    url: 'https://brain-dump.co/pricing',
    images: [{ url: '/og', width: 1200, height: 630, alt: 'Braindump Pricing' }],
  },
  alternates: { canonical: 'https://brain-dump.co/pricing' },
};

export default async function PricingPage() {
  const info = await getSubscriptionInfo();
  return <PricingClient isPro={info.isPro} endsAt={info.endsAt} />;
}
