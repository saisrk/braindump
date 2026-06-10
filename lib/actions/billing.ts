'use server';

import { db } from '@/db';
import { users, userProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireUserId } from '@/lib/session';
import { stripe, PLANS, type PlanKey } from '@/lib/stripe';
import { redirect } from 'next/navigation';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export async function createCheckoutSession(plan: PlanKey): Promise<void> {
  const userId = await requireUserId();

  const [[user], [profile]] = await Promise.all([
    db.select({ email: users.email, name: users.name }).from(users).where(eq(users.id, userId)),
    db.select({ stripeCustomerId: userProfiles.stripeCustomerId }).from(userProfiles).where(eq(userProfiles.userId, userId)),
  ]);

  if (!user) throw new Error('User not found');

  // Reuse existing Stripe customer or create a new one
  let customerId = profile?.stripeCustomerId ?? null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name ?? undefined,
      metadata: { userId },
    });
    customerId = customer.id;
    await db
      .update(userProfiles)
      .set({ stripeCustomerId: customerId, updatedAt: new Date() })
      .where(eq(userProfiles.userId, userId));
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: PLANS[plan].priceId, quantity: 1 }],
    success_url: `${APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${APP_URL}/pricing`,
    subscription_data: {
      metadata: { userId },
    },
    allow_promotion_codes: true,
  });

  redirect(session.url!);
}

export async function createPortalSession(): Promise<void> {
  const userId = await requireUserId();

  const [profile] = await db
    .select({ stripeCustomerId: userProfiles.stripeCustomerId })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId));

  if (!profile?.stripeCustomerId) throw new Error('No billing record found.');

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripeCustomerId,
    return_url: `${APP_URL}/settings`,
  });

  redirect(session.url);
}

export async function getSubscriptionInfo(): Promise<{
  isPro: boolean;
  endsAt: Date | null;
  stripeCustomerId: string | null;
}> {
  const userId = await requireUserId();

  const [profile] = await db
    .select({
      isPro: userProfiles.isPro,
      proSubscriptionEndsAt: userProfiles.proSubscriptionEndsAt,
      stripeCustomerId: userProfiles.stripeCustomerId,
    })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId));

  return {
    isPro: profile?.isPro ?? false,
    endsAt: profile?.proSubscriptionEndsAt ?? null,
    stripeCustomerId: profile?.stripeCustomerId ?? null,
  };
}
