import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, userProfiles } from '@/db/schema';
import { and, eq, gt, isNull, lte, sql } from 'drizzle-orm';
import { sendTrialEndedEmail } from '@/lib/emails/trial-ended';
import { sendSequentially } from '@/lib/email';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('authorization');
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let sent = 0;
  let failed = 0;

  try {
    const candidates = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        preferences: userProfiles.preferences,
      })
      .from(userProfiles)
      .innerJoin(users, eq(users.id, userProfiles.userId))
      .where(
        and(
          eq(userProfiles.isPro, false),
          lte(userProfiles.proTrialEndsAt, sql`now()`),
          gt(userProfiles.proTrialEndsAt, sql`now() - interval '2 days'`),
          isNull(userProfiles.trialEndedEmailSentAt)
        )
      );

    await sendSequentially(
      candidates,
      async (user: { id: string; email: string; name: string | null; preferences: unknown }) => {
        try {
          const prefs = (user.preferences ?? {}) as Record<string, unknown>;
          if (prefs.trialEndedEmailEnabled === false) return;

          await sendTrialEndedEmail(user.id, user.email, user.name ?? '');
          await db
            .update(userProfiles)
            .set({ trialEndedEmailSentAt: new Date() })
            .where(eq(userProfiles.userId, user.id));
          sent++;
        } catch (err) {
          console.error('[cron/trial-ended] Failed for user', user.id, err);
          failed++;
        }
      }
    );
  } catch (err) {
    console.error('[cron/trial-ended] Fatal error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  return NextResponse.json({ sent, failed });
}
