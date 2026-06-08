import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { getLearning } from '@/lib/data/learnings';
import { requireUserId } from '@/lib/session';
import { getLatestQuizAttempt } from '@/lib/data/quiz';
import { getTeachBackHistory, getQuizHistory, getReviewCardHistory } from '@/lib/data/history';
import { LearningDetailClient } from './client';
import { CTABar } from './cta-bar';

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

    const [latestQuiz, teachBackHistory, quizHistory, reviewCardHistory] = await Promise.all([
      getLatestQuizAttempt(userId, id),
      getTeachBackHistory(userId, id),
      getQuizHistory(userId, id),
      getReviewCardHistory(userId, id),
    ]);

    return (
      <div className="flex flex-col h-full">
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 pt-6 pb-4 md:px-8">
          <LearningDetailClient
            learning={learning}
            reviewItems={reviewItems}
            teachBacks={teachBacks}
            confidence={confidence}
            learningId={id}
            latestQuizScore={latestQuiz?.score ?? null}
            teachBackHistory={teachBackHistory}
            quizHistory={quizHistory}
            reviewCardHistory={reviewCardHistory}
          />
        </div>

        {/* CTA bar — sibling to scroll area, contained within content column */}
        <CTABar
          learningId={id}
          latestQuizScore={latestQuiz?.score ?? null}
          teachBackCount={teachBackHistory.length}
        />
      </div>
    );
  } catch (e) {
    if (isRedirectError(e)) throw e;
    redirect('/library');
  }
}
