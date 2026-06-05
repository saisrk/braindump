import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { getDueCount } from '@/lib/data/reviews';
import { getStreak } from '@/lib/data/activity';
import { sendDigestEmail } from '@/lib/email';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorised triggers.
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('authorization');
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let sent = 0;
  let failed = 0;

  try {
    const allUsers = await db.select({ id: users.id, email: users.email, name: users.name }).from(users);

    await Promise.all(
      allUsers.map(async (user: { id: string; email: string; name: string | null }) => {
        try {
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
      })
    );
  } catch (err) {
    console.error('[cron/daily-digest] Fatal error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  return NextResponse.json({ sent, failed });
}
