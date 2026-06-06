'use server';

import { db } from '@/db';
import { users, userProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireUserId } from '@/lib/session';
import { revalidatePath } from 'next/cache';

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
    // Name lives on the auth record; preferences live on the profile.
    if (input.name !== undefined) {
      await db
        .update(users)
        .set({ name: input.name.trim() || null, updatedAt: new Date() })
        .where(eq(users.id, userId));
    }

    await db
      .insert(userProfiles)
      .values({
        userId,
        goals: input.goals ?? [],
        streakTarget: input.streakTarget ?? 1,
      })
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: {
          goals: input.goals ?? [],
          streakTarget: input.streakTarget ?? 1,
          updatedAt: new Date(),
        },
      });

    revalidatePath('/settings');
    revalidatePath('/home');
    return { ok: true };
  } catch (err) {
    console.log('[v0] updateProfile error:', (err as Error).message);
    return { ok: false, error: 'Could not save your settings.' };
  }
}
