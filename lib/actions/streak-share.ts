'use server';

import { db } from '@/db';
import { streaks } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { requireUserId } from '@/lib/session';
import { getStreak } from '@/lib/data/activity';
import { revalidatePath } from 'next/cache';

/**
 * Ensures the share_token column exists. The migration adds it, but this keeps
 * sharing resilient if a deploy runs ahead of migrations (matches the
 * ensureExpressResultsTable pattern used elsewhere).
 */
async function ensureShareTokenColumn() {
  await db.execute(
    sql`ALTER TABLE "streaks" ADD COLUMN IF NOT EXISTS "share_token" text`
  );
}

export interface ShareTokenResult {
  ok: boolean;
  token?: string | null;
  error?: string;
}

/** Read the user's current share token (null if sharing is off). */
export async function getStreakShareToken(): Promise<string | null> {
  const userId = await requireUserId();
  try {
    await ensureShareTokenColumn();
    const streak = await getStreak(userId);
    return streak.shareToken ?? null;
  } catch (err) {
    console.error('[streak-share] read error:', (err as Error).message);
    return null;
  }
}

/** Mint (or return the existing) opt-in public share token for the user's streak. */
export async function enableStreakSharing(): Promise<ShareTokenResult> {
  const userId = await requireUserId();
  try {
    await ensureShareTokenColumn();
    // Guarantee a streak row exists before we update it.
    const streak = await getStreak(userId);
    if (streak.shareToken) {
      return { ok: true, token: streak.shareToken };
    }

    const token = nanoid(16);
    await db
      .update(streaks)
      .set({ shareToken: token })
      .where(eq(streaks.userId, userId));

    revalidatePath('/home');
    revalidatePath('/settings');
    return { ok: true, token };
  } catch (err) {
    console.error('[streak-share] enable error:', (err as Error).message);
    return { ok: false, error: 'Could not enable sharing. Please try again.' };
  }
}

/** Revoke the share token, making the streak private again. */
export async function disableStreakSharing(): Promise<ShareTokenResult> {
  const userId = await requireUserId();
  try {
    await ensureShareTokenColumn();
    await db
      .update(streaks)
      .set({ shareToken: null })
      .where(eq(streaks.userId, userId));

    revalidatePath('/home');
    revalidatePath('/settings');
    return { ok: true, token: null };
  } catch (err) {
    console.error('[streak-share] disable error:', (err as Error).message);
    return { ok: false, error: 'Could not disable sharing. Please try again.' };
  }
}
