import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, userProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getDueCount } from '@/lib/data/reviews';
import { getStreak } from '@/lib/data/activity';
import { sendDigestEmail, sendSequentially } from '@/lib/email';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  // Runs weekly (see vercel.json) — was daily, changed to cut down on email
  // volume now that /api/cron/weekly-review also sends a due-items reminder.
  // Verify cron secret to prevent unauthorised triggers.
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
      })
      .from(users)
      .leftJoin(userProfiles, eq(userProfiles.userId, users.id));

    await sendSequentially(
      allUsers,
      async (user: { id: string; email: string; name: string | null; preferences: unknown }) => {
        try {
          // Respect the user's email preference — opt-in model (default false).
          const prefs = (user.preferences ?? {}) as Record<string, unknown>;
          if (!prefs.dailyDigestEnabled) return;

          const [dueCount, streak] = await Promise.all([
            getDueCount(user.id),
            getStreak(user.id),
          ]);

          // Skip users with nothing interesting to report.
          if (dueCount === 0 && streak.currentCount === 0) return;

          await sendDigestEmail(user.email, user.name ?? '', dueCount, streak.currentCount ?? 0);
          sent++;
        } catch (err) {
          console.error('[cron/daily-digest] Failed for user', user.id, err);
          failed++;
        }
      }
    );
  } catch (err) {
    console.error('[cron/daily-digest] Fatal error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  return NextResponse.json({ sent, failed });
}
