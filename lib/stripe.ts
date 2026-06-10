import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia',
});

export const PLANS = {
  monthly: {
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID!,
    amount: 1200, // $12.00
    interval: 'month' as const,
    label: '$12 / month',
  },
  annual: {
    priceId: process.env.STRIPE_ANNUAL_PRICE_ID!,
    amount: 9600, // $96.00 ($8/mo)
    interval: 'year' as const,
    label: '$96 / year',
    monthlyEquivalent: '$8 / month',
    saving: 'Save $48',
  },
} as const;

export type PlanKey = keyof typeof PLANS;
