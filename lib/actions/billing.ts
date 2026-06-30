'use server';

import { db } from '@/db';
import { users, userProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireUserId } from '@/lib/session';
import { razorpay, verifySubscriptionSignature, PLANS, type PlanKey } from '@/lib/razorpay';
import { entitlementInfo, type Entitlement } from '@/lib/entitlements';

export async function createSubscription(plan: PlanKey): Promise<{
  subscriptionId: string;
  keyId: string;
  userName: string;
  userEmail: string;
}> {
  const userId = await requireUserId();

  const [user] = await db.select({ email: users.email, name: users.name }).from(users).where(eq(users.id, userId));
  if (!user) throw new Error('User not found');

  const selectedPlan = PLANS[plan];

  const subscription = await (razorpay.subscriptions as unknown as {
    create: (opts: Record<string, unknown>) => Promise<{ id: string }>;
  }).create({
    plan_id: selectedPlan.planId,
    customer_notify: 1,
    quantity: 1,
    total_count: plan === 'annual' ? 12 : 120,
    notes: { userId },
  });

  return {
    subscriptionId: subscription.id,
    keyId: process.env.RAZORPAY_KEY_ID!,
    userName: user.name ?? '',
    userEmail: user.email,
  };
}

export async function verifyAndActivate(
  razorpayPaymentId: string,
  razorpaySubscriptionId: string,
  razorpaySignature: string,
): Promise<{ ok: boolean; error?: string }> {
  const userId = await requireUserId();

  if (!verifySubscriptionSignature(razorpayPaymentId, razorpaySubscriptionId, razorpaySignature)) {
    return { ok: false, error: 'Invalid payment signature' };
  }

  const sub = await (razorpay.subscriptions as {
    fetch: (id: string) => Promise<{ id: string; current_end: number | null; status: string }>;
  }).fetch(razorpaySubscriptionId);

  const endsAt = sub.current_end ? new Date(sub.current_end * 1000) : null;

  await db
    .update(userProfiles)
    .set({
      isPro: true,
      stripeSubscriptionId: razorpaySubscriptionId,
      proSubscriptionEndsAt: endsAt,
      updatedAt: new Date(),
    })
    .where(eq(userProfiles.userId, userId));

  return { ok: true };
}

export async function cancelSubscription(): Promise<{ ok: boolean; error?: string }> {
  const userId = await requireUserId();

  const [profile] = await db
    .select({ stripeSubscriptionId: userProfiles.stripeSubscriptionId })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId));

  if (!profile?.stripeSubscriptionId) return { ok: false, error: 'No active subscription found.' };

  await (razorpay.subscriptions as {
    cancel: (id: string, cancelAtCycleEnd: boolean) => Promise<unknown>;
  }).cancel(profile.stripeSubscriptionId, true);

  return { ok: true };
}

export async function getSubscriptionInfo(): Promise<{
  isPro: boolean;
  endsAt: Date | null;
  subscriptionId: string | null;
  entitlement: Entitlement;
  trialEndsAt: Date | null;
  trialDaysLeft: number | null;
}> {
  const userId = await requireUserId();

  const [profile] = await db
    .select({
      isPro: userProfiles.isPro,
      proSubscriptionEndsAt: userProfiles.proSubscriptionEndsAt,
      proTrialEndsAt: userProfiles.proTrialEndsAt,
      stripeSubscriptionId: userProfiles.stripeSubscriptionId,
    })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId));

  const info = entitlementInfo({
    isPro: profile?.isPro ?? false,
    proSubscriptionEndsAt: profile?.proSubscriptionEndsAt ?? null,
    proTrialEndsAt: profile?.proTrialEndsAt ?? null,
  });

  return {
    isPro: profile?.isPro ?? false,
    endsAt: profile?.proSubscriptionEndsAt ?? null,
    subscriptionId: profile?.stripeSubscriptionId ?? null,
    entitlement: info.entitlement,
    trialEndsAt: info.trialEndsAt,
    trialDaysLeft: info.trialDaysLeft,
  };
}
