import { describe, it, expect } from 'vitest';
import { resolveEntitlement, entitlementInfo, TRIAL_DAYS } from './entitlements';

const NOW = new Date('2026-06-30T12:00:00Z');
const future = (days: number) => new Date(NOW.getTime() + days * 86_400_000);
const past = (days: number) => new Date(NOW.getTime() - days * 86_400_000);

describe('resolveEntitlement', () => {
  it('returns "pro" for an active subscription with no end date', () => {
    expect(
      resolveEntitlement({ isPro: true, proSubscriptionEndsAt: null, proTrialEndsAt: null }, NOW),
    ).toBe('pro');
  });

  it('returns "pro" for a subscription that ends in the future', () => {
    expect(
      resolveEntitlement({ isPro: true, proSubscriptionEndsAt: future(10), proTrialEndsAt: null }, NOW),
    ).toBe('pro');
  });

  it('returns "expired" when a subscription has lapsed and no trial remains', () => {
    expect(
      resolveEntitlement({ isPro: true, proSubscriptionEndsAt: past(1), proTrialEndsAt: past(5) }, NOW),
    ).toBe('expired');
  });

  it('returns "trial" while the trial window is open', () => {
    expect(
      resolveEntitlement({ isPro: false, proSubscriptionEndsAt: null, proTrialEndsAt: future(3) }, NOW),
    ).toBe('trial');
  });

  it('returns "expired" once the trial has ended', () => {
    expect(
      resolveEntitlement({ isPro: false, proSubscriptionEndsAt: null, proTrialEndsAt: past(1) }, NOW),
    ).toBe('expired');
  });

  it('prefers an active subscription over the trial state', () => {
    expect(
      resolveEntitlement({ isPro: true, proSubscriptionEndsAt: future(30), proTrialEndsAt: future(3) }, NOW),
    ).toBe('pro');
  });
});

describe('entitlementInfo', () => {
  it('grants access during the trial and rounds days left up', () => {
    const info = entitlementInfo(
      { isPro: false, proSubscriptionEndsAt: null, proTrialEndsAt: future(2.5) },
      NOW,
    );
    expect(info.entitlement).toBe('trial');
    expect(info.hasAccess).toBe(true);
    expect(info.trialDaysLeft).toBe(3);
  });

  it('blocks access and reports no trial days when expired', () => {
    const info = entitlementInfo(
      { isPro: false, proSubscriptionEndsAt: null, proTrialEndsAt: past(1) },
      NOW,
    );
    expect(info.entitlement).toBe('expired');
    expect(info.hasAccess).toBe(false);
    expect(info.trialDaysLeft).toBeNull();
  });

  it('reports no trial days for Pro users', () => {
    const info = entitlementInfo(
      { isPro: true, proSubscriptionEndsAt: null, proTrialEndsAt: future(3) },
      NOW,
    );
    expect(info.entitlement).toBe('pro');
    expect(info.trialDaysLeft).toBeNull();
  });

  it('keeps the trial length constant', () => {
    expect(TRIAL_DAYS).toBe(7);
  });
});
