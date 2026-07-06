import { getSettings } from '@/lib/actions/settings';
import { getSubscriptionInfo } from '@/lib/actions/billing';
import { getStreakShareToken } from '@/lib/actions/streak-share';
import { SettingsClient } from './client';

export default async function SettingsPage() {
  const [settings, subscription, shareToken] = await Promise.all([
    getSettings(),
    getSubscriptionInfo(),
    getStreakShareToken(),
  ]);
  return (
    <SettingsClient
      initialSettings={settings}
      isPro={subscription.isPro}
      subscriptionEndsAt={subscription.endsAt}
      entitlement={subscription.entitlement}
      trialDaysLeft={subscription.trialDaysLeft}
      initialShareToken={shareToken}
    />
  );
}
