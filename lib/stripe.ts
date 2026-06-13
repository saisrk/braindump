import Stripe from 'stripe';

// Lazy singleton — avoids crashing at build time when env vars aren't set
let _stripe: Stripe | null = null;
export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-02-24.acacia',
    });
  }
  return _stripe;
}

// Keep named export for convenience in server actions (always runtime)
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const PLANS = {
  monthly: {
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID!,
    amount: 1200,
    interval: 'month' as const,
    label: '$12 / month',
  },
  annual: {
    priceId: process.env.STRIPE_ANNUAL_PRICE_ID!,
    amount: 9600,
    interval: 'year' as const,
    label: '$96 / year',
    monthlyEquivalent: '$8 / month',
    saving: 'Save $48',
  },
} as const;

export type PlanKey = keyof typeof PLANS;
