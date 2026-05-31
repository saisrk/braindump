import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';

export default function LibraryPage() {
  return (
    <div>
      <PageHeader
        title="Library"
        subtitle="Browse and search your learnings"
      />
      <Card>
        <h3 className="font-medium mb-2">Learnings List</h3>
        <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
          Search, filter, and browse all your captured learnings in one place.
        </p>
      </Card>
    </div>
  );
}
