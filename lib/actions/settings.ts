'use server';

import { db } from '@/db';
import { users, userProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireUserId } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signOut } from '@/lib/auth';

export type ReviewDifficulty = 'relaxed' | 'standard' | 'intensive';

export interface UserPreferences {
  reviewDifficulty: ReviewDifficulty;
  dailyDigestEnabled: boolean;
  trialEndedEmailEnabled: boolean;
  weeklyReviewEmailEnabled: boolean;
  featureNudgeEmailEnabled: boolean;
}

export interface UpdateProfileResult {
  ok: boolean;
  error?: string;
}

export async function updateProfile(input: {
  name?: string;
  goals?: string[];
  streakTarget?: number;
}): Promise<UpdateProfileResult> {
  const userId = await requireUserId();

  try {
    if (input.name !== undefined) {
      await db
        .update(users)
        .set({ name: input.name.trim() || null, updatedAt: new Date() })
        .where(eq(users.id, userId));
    }

    await db
      .insert(userProfiles)
      .values({ userId, goals: input.goals ?? [], streakTarget: input.streakTarget ?? 1 })
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: { goals: input.goals ?? [], streakTarget: input.streakTarget ?? 1, updatedAt: new Date() },
      });

    revalidatePath('/settings');
    revalidatePath('/home');
    return { ok: true };
  } catch (err) {
    console.log('[v0] updateProfile error:', (err as Error).message);
    return { ok: false, error: 'Could not save your settings.' };
  }
}

export async function getSettings(): Promise<UserPreferences> {
  const userId = await requireUserId();
  const [profile] = await db
    .select({ preferences: userProfiles.preferences })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId));

  const prefs = (profile?.preferences ?? {}) as Record<string, unknown>;
  return {
    reviewDifficulty: (prefs.reviewDifficulty as ReviewDifficulty) ?? 'standard',
    dailyDigestEnabled: (prefs.dailyDigestEnabled as boolean) ?? false,
    trialEndedEmailEnabled: (prefs.trialEndedEmailEnabled as boolean) ?? true,
    weeklyReviewEmailEnabled: (prefs.weeklyReviewEmailEnabled as boolean) ?? true,
    featureNudgeEmailEnabled: (prefs.featureNudgeEmailEnabled as boolean) ?? true,
  };
}

export async function savePreferences(input: Partial<UserPreferences>): Promise<UpdateProfileResult> {
  const userId = await requireUserId();

  try {
    const [profile] = await db
      .select({ preferences: userProfiles.preferences })
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));

    const current = (profile?.preferences ?? {}) as Record<string, unknown>;
    const merged = { ...current, ...input };

    await db
      .update(userProfiles)
      .set({ preferences: merged, updatedAt: new Date() })
      .where(eq(userProfiles.userId, userId));

    revalidatePath('/settings');
    return { ok: true };
  } catch (err) {
    console.log('[v0] savePreferences error:', (err as Error).message);
    return { ok: false, error: 'Could not save preferences.' };
  }
}

export async function deleteAccount(): Promise<void> {
  const userId = await requireUserId();
  await db.delete(users).where(eq(users.id, userId));
  await signOut({ redirect: false });
  redirect('/login');
}
