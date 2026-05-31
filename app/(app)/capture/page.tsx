import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';

export default function CapturePage() {
  return (
    <div>
      <PageHeader
        title="Capture"
        subtitle="Save new learnings from any source"
      />
      <Card>
        <h3 className="font-medium mb-2">Capture Wizard</h3>
        <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
          Paste a URL, upload a file, or write a note to capture a new learning.
        </p>
      </Card>
    </div>
  );
}
