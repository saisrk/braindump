import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { getLearning } from '@/lib/data/learnings';
import { requireUserId } from '@/lib/session';
import { db } from '@/db';
import { userProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getLatestQuizAttempt } from '@/lib/data/quiz';
import { getTeachBackHistory, getQuizHistory, getReviewCardHistory } from '@/lib/data/history';
import { LearningDetailClient } from './client';

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

    const [latestQuiz, teachBackHistory, quizHistory, reviewCardHistory, profileRows] = await Promise.all([
      getLatestQuizAttempt(userId, id),
      getTeachBackHistory(userId, id),
      getQuizHistory(userId, id),
      getReviewCardHistory(userId, id),
      db.select({ isPro: userProfiles.isPro }).from(userProfiles).where(eq(userProfiles.userId, userId)),
    ]);

    const isPro = profileRows[0]?.isPro ?? false;

    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto px-4 pt-6 pb-8 md:px-8">
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
            isPro={isPro}
          />
        </div>
      </div>
    );
  } catch (e) {
    if (isRedirectError(e)) throw e;
    redirect('/library');
  }
}
