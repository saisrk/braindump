import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div>
      <PageHeader
        title="Home"
        subtitle="Your learning dashboard"
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h3 className="font-medium mb-2">Quick Capture</h3>
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
            Paste a URL or note to capture a learning.
          </p>
        </Card>
        <Card>
          <h3 className="font-medium mb-2">Due Reviews</h3>
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
            See how many items are due for review today.
          </p>
        </Card>
        <Card>
          <h3 className="font-medium mb-2">Streak</h3>
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
            Track your daily learning streak and stay consistent.
          </p>
        </Card>
        <Card>
          <h3 className="font-medium mb-2">Daily Summary</h3>
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
            A snapshot of what you captured and reviewed today.
          </p>
        </Card>
      </div>
    </div>
  );
}
