import Razorpay from 'razorpay';
import { createHmac } from 'crypto';

let _razorpay: Razorpay | null = null;
export function getRazorpay(): Razorpay {
  if (!_razorpay) {
    _razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }
  return _razorpay;
}

export const razorpay = new Proxy({} as Razorpay, {
  get(_target, prop) {
    return (getRazorpay() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const PLANS = {
  monthly: {
    planId: process.env.RAZORPAY_MONTHLY_PLAN_ID!,
    amount: 100000, // in paise (₹1000/month) — update to match your Razorpay plan
    interval: 'monthly' as const,
    label: '₹1000 / month',
  },
  annual: {
    planId: process.env.RAZORPAY_ANNUAL_PLAN_ID!,
    amount: 800000, // ₹8000/year
    interval: 'yearly' as const,
    label: '₹8000 / year',
    monthlyEquivalent: '₹667 / month',
    saving: 'Save ₹4000',
  },
} as const;

export type PlanKey = keyof typeof PLANS;

/** Verify Razorpay payment signature (HMAC-SHA256). */
export function verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
): boolean {
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expected = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex');
  return expected === razorpaySignature;
}

/** Verify Razorpay subscription payment signature. */
export function verifySubscriptionSignature(
  razorpayPaymentId: string,
  razorpaySubscriptionId: string,
  razorpaySignature: string,
): boolean {
  const body = `${razorpayPaymentId}|${razorpaySubscriptionId}`;
  const expected = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex');
  return expected === razorpaySignature;
}

/** Verify Razorpay webhook signature. */
export function verifyWebhookSignature(body: string, signature: string): boolean {
  const expected = createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex');
  return expected === signature;
}
