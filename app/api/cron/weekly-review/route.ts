import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, userProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { resolveEntitlement } from '@/lib/entitlements';
import { getDueCount } from '@/lib/data/reviews';
import { sendWeeklyReviewEmail } from '@/lib/emails/weekly-review';
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
          if (prefs.weeklyReviewEmailEnabled === false) return;

          const dueCount = await getDueCount(user.id);
          if (dueCount === 0) return;

          await sendWeeklyReviewEmail(user.id, user.email, user.name ?? '', dueCount);
          await db
            .update(userProfiles)
            .set({ lastReviewReminderSentAt: new Date() })
            .where(eq(userProfiles.userId, user.id));
          sent++;
        } catch (err) {
          console.error('[cron/weekly-review] Failed for user', user.id, err);
          failed++;
        }
      }
    );
  } catch (err) {
    console.error('[cron/weekly-review] Fatal error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  return NextResponse.json({ sent, failed });
}
