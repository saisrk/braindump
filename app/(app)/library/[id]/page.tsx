import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { getLearning } from '@/lib/data/learnings';
import { requireUserId } from '@/lib/session';
import { LearningDetailClient } from './client';
import { PageHeader } from '@/components/ui/page-header';

export default async function LearningDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const userId = await requireUserId();
    const result = await getLearning(userId, id);
    if (!result) redirect('/library');

    const { learning, reviewItems, teachBacks, confidence } = result;

    return (
      <div className="flex flex-col">
        <PageHeader
          title={learning.title}
          subtitle={learning.topic ?? 'Your learning'}
        />
        <div className="flex-1 overflow-auto px-4 py-6 md:px-8">
          <div className="max-w-2xl space-y-6">
            <LearningDetailClient
              learning={learning}
              reviewItems={reviewItems}
              teachBacks={teachBacks}
              confidence={confidence}
              learningId={id}
            />
          </div>
        </div>
      </div>
    );
  } catch (e) {
    if (isRedirectError(e)) throw e;
    redirect('/library');
  }
}
