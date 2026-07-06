import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, userProfiles } from '@/db/schema';
import { and, eq, isNotNull, isNull } from 'drizzle-orm';
import { entitlementInfo, TRIAL_DAYS } from '@/lib/entitlements';
import { sendStreakAnnouncementEmail } from '@/lib/emails/streak-announcement';
import { sendSequentially } from '@/lib/email';

export const runtime = 'nodejs';
export const maxDuration = 300;

/**
 * One-off broadcast announcing sharable learning streaks to everyone who has
 * used the product (onboarded). Not scheduled — trigger once manually via curl:
 *
 *   curl -H "Authorization: Bearer $CRON_SECRET" https://brain-dump.co/api/admin/announce-streaks
 *
 * Safe to re-run: `streakAnnouncementSentAt` makes each send idempotent.
 */
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
        isPro: userProfiles.isPro,
        proSubscriptionEndsAt: userProfiles.proSubscriptionEndsAt,
        proTrialEndsAt: userProfiles.proTrialEndsAt,
      })
      .from(userProfiles)
      .innerJoin(users, eq(users.id, userProfiles.userId))
      .where(
        and(
          isNotNull(userProfiles.onboardedAt),
          isNull(userProfiles.streakAnnouncementSentAt)
        )
      );

    await sendSequentially(
      candidates,
      async (user: {
        id: string;
        email: string;
        name: string | null;
        isPro: boolean | null;
        proSubscriptionEndsAt: Date | null;
        proTrialEndsAt: Date | null;
      }) => {
        try {
          const info = entitlementInfo({
            isPro: user.isPro ?? false,
            proSubscriptionEndsAt: user.proSubscriptionEndsAt,
            proTrialEndsAt: user.proTrialEndsAt,
          });

          // 1-based day within the trial window (day 1 on the first day).
          const trialDayNumber =
            info.entitlement === 'trial' && info.trialDaysLeft != null
              ? Math.min(TRIAL_DAYS, Math.max(1, TRIAL_DAYS - info.trialDaysLeft + 1))
              : null;

          await sendStreakAnnouncementEmail(user.id, user.email, user.name ?? '', {
            entitlement: info.entitlement,
            trialDayNumber,
            trialDaysLeft: info.trialDaysLeft,
          });

          await db
            .update(userProfiles)
            .set({ streakAnnouncementSentAt: new Date() })
            .where(eq(userProfiles.userId, user.id));
          sent++;
        } catch (err) {
          console.error('[admin/announce-streaks] Failed for user', user.id, err);
          failed++;
        }
      }
    );
  } catch (err) {
    console.error('[admin/announce-streaks] Fatal error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  return NextResponse.json({ sent, failed });
}
