import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, userProfiles, learnings, quizAttempts, teachBacks, expressResults } from '@/db/schema';
import { and, eq, inArray, asc, ne } from 'drizzle-orm';
import { resolveEntitlement } from '@/lib/entitlements';
import { sendFeatureNudgeEmail, type NudgeFeature } from '@/lib/emails/feature-nudge';
import { sendSequentially } from '@/lib/email';

export const runtime = 'nodejs';
export const maxDuration = 300;

const INACTIVITY_THRESHOLD_MS = 4 * 24 * 60 * 60 * 1000;

async function pickRecommendation(
  userId: string
): Promise<{ feature: NudgeFeature; learningTitle: string | null; deepLink: string } | null> {
  const userLearnings = await db
    .select({ id: learnings.id, title: learnings.title })
    .from(learnings)
    // Exclude onboarding's seeded sample learnings — nudging the user to
    // teach back / quiz content they never actually captured is confusing.
    .where(and(eq(learnings.userId, userId), ne(learnings.sourceType, 'sample')))
    .orderBy(asc(learnings.createdAt));

  if (userLearnings.length === 0) return null;

  const learningIds = userLearnings.map((l: { id: string; title: string }) => l.id);

  const [teachBackRows, quizRows] = await Promise.all([
    db.select({ learningId: teachBacks.learningId }).from(teachBacks).where(inArray(teachBacks.learningId, learningIds)),
    db.select({ learningId: quizAttempts.learningId }).from(quizAttempts).where(inArray(quizAttempts.learningId, learningIds)),
  ]);

  const taughtBack = new Set(teachBackRows.map((r: { learningId: string }) => r.learningId));
  const quizzed = new Set(quizRows.map((r: { learningId: string }) => r.learningId));

  const untaught = userLearnings.find((l: { id: string; title: string }) => !taughtBack.has(l.id));
  if (untaught) {
    return { feature: 'teachback', learningTitle: untaught.title, deepLink: `/teachback?learningId=${untaught.id}` };
  }

  const unquizzed = userLearnings.find((l: { id: string; title: string }) => !quizzed.has(l.id));
  if (unquizzed) {
    return { feature: 'quiz', learningTitle: unquizzed.title, deepLink: `/library/${unquizzed.id}/quiz` };
  }

  return { feature: 'express', learningTitle: null, deepLink: '/express' };
}

async function lastActivityAt(userId: string): Promise<Date | null> {
  const [quiz, teachback, express] = await Promise.all([
    db.select({ createdAt: quizAttempts.createdAt }).from(quizAttempts).where(eq(quizAttempts.userId, userId)).orderBy(asc(quizAttempts.createdAt)),
    db.select({ createdAt: teachBacks.createdAt }).from(teachBacks).where(eq(teachBacks.userId, userId)).orderBy(asc(teachBacks.createdAt)),
    db.select({ createdAt: expressResults.createdAt }).from(expressResults).where(eq(expressResults.userId, userId)).orderBy(asc(expressResults.createdAt)),
  ]);

  const all = [...quiz, ...teachback, ...express].map((r: { createdAt: Date }) => r.createdAt.getTime());
  if (all.length === 0) return null;
  return new Date(Math.max(...all));
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('authorization');
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let sent = 0;
  let failed = 0;

  try {
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        preferences: userProfiles.preferences,
        isPro: userProfiles.isPro,
        proSubscriptionEndsAt: userProfiles.proSubscriptionEndsAt,
        proTrialEndsAt: userProfiles.proTrialEndsAt,
      })
      .from(users)
      .innerJoin(userProfiles, eq(userProfiles.userId, users.id));

    await sendSequentially(
      allUsers,
      async (user: {
        id: string;
        email: string;
        name: string | null;
        preferences: unknown;
        isPro: boolean | null;
        proSubscriptionEndsAt: Date | null;
        proTrialEndsAt: Date | null;
      }) => {
        try {
          const entitlement = resolveEntitlement(user);
          if (entitlement === 'expired') return;

          const prefs = (user.preferences ?? {}) as Record<string, unknown>;
          if (prefs.featureNudgeEmailEnabled === false) return;

          const lastActive = await lastActivityAt(user.id);
          if (lastActive && Date.now() - lastActive.getTime() < INACTIVITY_THRESHOLD_MS) return;

          const recommendation = await pickRecommendation(user.id);
          if (!recommendation) return;

          await sendFeatureNudgeEmail(
            user.id,
            user.email,
            user.name ?? '',
            recommendation.feature,
            recommendation.learningTitle,
            recommendation.deepLink
          );
          await db
            .update(userProfiles)
            .set({ lastReengagementEmailSentAt: new Date() })
            .where(eq(userProfiles.userId, user.id));
          sent++;
        } catch (err) {
          console.error('[cron/feature-nudge] Failed for user', user.id, err);
          failed++;
        }
      }
    );
  } catch (err) {
    console.error('[cron/feature-nudge] Fatal error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  return NextResponse.json({ sent, failed });
}
