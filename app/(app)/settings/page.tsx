import { getSettings } from '@/lib/actions/settings';
import { SettingsClient } from './client';

export default async function SettingsPage() {
  const settings = await getSettings();
  return <SettingsClient initialSettings={settings} />;
}
