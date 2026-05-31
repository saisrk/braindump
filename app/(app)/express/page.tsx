import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';

export default function ExpressPage() {
  return (
    <div>
      <PageHeader
        title="Express"
        subtitle="Teach back what you've learned"
      />
      <Card>
        <h3 className="font-medium mb-2">Interview &amp; Profile Generation</h3>
        <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
          Practice explaining concepts in your own words and generate learning profiles.
        </p>
      </Card>
    </div>
  );
}
