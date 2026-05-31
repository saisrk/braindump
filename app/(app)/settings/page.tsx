import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Manage your preferences"
      />
      <Card>
        <h3 className="font-medium mb-2">User Preferences</h3>
        <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
          Configure your learning goals, streak targets, theme, and notification settings.
        </p>
      </Card>
    </div>
  );
}
