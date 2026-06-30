import { getSettings } from '@/lib/actions/settings';
import { getSubscriptionInfo } from '@/lib/actions/billing';
import { SettingsClient } from './client';

export default async function SettingsPage() {
  const [settings, subscription] = await Promise.all([
    getSettings(),
    getSubscriptionInfo(),
  ]);
  return (
    <SettingsClient
      initialSettings={settings}
      isPro={subscription.isPro}
      subscriptionEndsAt={subscription.endsAt}
      entitlement={subscription.entitlement}
      trialDaysLeft={subscription.trialDaysLeft}
    />
  );
}
