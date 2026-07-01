import { db } from '@/db';
import { userProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

/** Length of the no-card free trial granted to every new account. */
export const TRIAL_DAYS = 7;

/**
 * A user's access state, derived purely from timestamps on every read so that
 * trials expire automatically without any cron/background job.
 *  - 'pro'     → active paid subscription
 *  - 'trial'   → within the 7-day free trial window
 *  - 'expired' → trial ended and no active subscription (hard paywall)
 */
export type Entitlement = 'pro' | 'trial' | 'expired';

export interface EntitlementInfo {
  entitlement: Entitlement;
  /** trial || pro — i.e. the user may use the product. */
  hasAccess: boolean;
  trialEndsAt: Date | null;
  /** Whole days remaining in the trial (rounded up), or null when not on trial. */
  trialDaysLeft: number | null;
}

type ProfileFlags = {
  isPro: boolean | null;
  proSubscriptionEndsAt: Date | null;
  proTrialEndsAt: Date | null;
};

/** Pure resolver — easy to unit test and reuse on already-fetched profiles. */
export function resolveEntitlement(p: ProfileFlags, now = new Date()): Entitlement {
  if (p.isPro && (!p.proSubscriptionEndsAt || p.proSubscriptionEndsAt > now)) {
    return 'pro';
  }
  if (p.proTrialEndsAt && p.proTrialEndsAt > now) {
    return 'trial';
  }
  return 'expired';
}

export function entitlementInfo(p: ProfileFlags, now = new Date()): EntitlementInfo {
  const entitlement = resolveEntitlement(p, now);
  const trialEndsAt = p.proTrialEndsAt ?? null;
  let trialDaysLeft: number | null = null;
  if (entitlement === 'trial' && trialEndsAt) {
    const ms = trialEndsAt.getTime() - now.getTime();
    trialDaysLeft = Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
  }
  return {
    entitlement,
    hasAccess: entitlement !== 'expired',
    trialEndsAt,
    trialDaysLeft,
  };
}

/** Fetches a user's profile flags and resolves their current entitlement. */
export async function getEntitlement(userId: string): Promise<EntitlementInfo> {
  const [profile] = await db
    .select({
      isPro: userProfiles.isPro,
      proSubscriptionEndsAt: userProfiles.proSubscriptionEndsAt,
      proTrialEndsAt: userProfiles.proTrialEndsAt,
    })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId));

  return entitlementInfo({
    isPro: profile?.isPro ?? false,
    proSubscriptionEndsAt: profile?.proSubscriptionEndsAt ?? null,
    proTrialEndsAt: profile?.proTrialEndsAt ?? null,
  });
}
