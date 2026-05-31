import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';

export default function ReviewPage() {
  return (
    <div>
      <PageHeader
        title="Review"
        subtitle="Strengthen your memory with spaced repetition"
      />
      <Card>
        <h3 className="font-medium mb-2">Review Session</h3>
        <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
          Practice recall on items due for review using spaced-repetition scheduling.
        </p>
      </Card>
    </div>
  );
}
