import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyUnsubscribeToken } from '@/lib/email';

export const runtime = 'nodejs';

const PREF_KEY: Record<string, string> = {
  trialEnded: 'trialEndedEmailEnabled',
  weeklyReview: 'weeklyReviewEmailEnabled',
  featureNudge: 'featureNudgeEmailEnabled',
};

function page(message: string): NextResponse {
  return new NextResponse(
    `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#0f0f0f;color:#f1f5f9;display:grid;place-items:center;height:100vh;margin:0;">
      <p style="max-width:400px;text-align:center;">${message}</p>
    </body></html>`,
    { headers: { 'content-type': 'text/html' } }
  );
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('u');
  const verified = token ? verifyUnsubscribeToken(token) : null;

  if (!verified) {
    return NextResponse.json({ error: 'Invalid or expired unsubscribe link' }, { status: 400 });
  }

  const prefKey = PREF_KEY[verified.type];
  const [profile] = await db
    .select({ preferences: userProfiles.preferences })
    .from(userProfiles)
    .where(eq(userProfiles.userId, verified.userId));

  const current = (profile?.preferences ?? {}) as Record<string, unknown>;
  const merged = { ...current, [prefKey]: false };

  await db
    .update(userProfiles)
    .set({ preferences: merged, updatedAt: new Date() })
    .where(eq(userProfiles.userId, verified.userId));

  return page("You're unsubscribed. You can re-enable this in Settings any time.");
}
