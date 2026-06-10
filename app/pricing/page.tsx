import { getSubscriptionInfo } from '@/lib/actions/billing';
import { PricingClient } from './client';

export default async function PricingPage() {
  const info = await getSubscriptionInfo();
  return <PricingClient isPro={info.isPro} endsAt={info.endsAt} />;
}
