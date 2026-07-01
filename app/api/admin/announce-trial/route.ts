import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, userProfiles } from '@/db/schema';
import { and, eq, isNotNull, isNull } from 'drizzle-orm';
import { resolveEntitlement } from '@/lib/entitlements';
import { sendTrialAnnouncementEmail } from '@/lib/emails/trial-announcement';
import { sendSequentially } from '@/lib/email';

export const runtime = 'nodejs';
export const maxDuration = 300;

/**
 * One-off broadcast: tells accounts that existed before the 7-day trial
 * launched (migration 0014 already backfilled their `proTrialEndsAt`) that
 * full access is unlocked. Not on a schedule — trigger once manually via
 * curl, safe to re-run since `welcomeEmailSentAt` makes it idempotent.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('authorization');
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let sent = 0;
  let skippedExpired = 0;
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
          eq(userProfiles.isPro, false),
          isNotNull(userProfiles.onboardedAt),
          isNull(userProfiles.welcomeEmailSentAt)
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
          const entitlement = resolveEntitlement(user);
          if (entitlement === 'expired' || !user.proTrialEndsAt) {
            skippedExpired++;
            return;
          }

          const daysLeft = Math.max(
            1,
            Math.ceil((user.proTrialEndsAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
          );

          await sendTrialAnnouncementEmail(user.id, user.email, user.name ?? '', daysLeft);
          await db
            .update(userProfiles)
            .set({ welcomeEmailSentAt: new Date() })
            .where(eq(userProfiles.userId, user.id));
          sent++;
        } catch (err) {
          console.error('[admin/announce-trial] Failed for user', user.id, err);
          failed++;
        }
      }
    );
  } catch (err) {
    console.error('[admin/announce-trial] Fatal error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  return NextResponse.json({ sent, skippedExpired, failed });
}
