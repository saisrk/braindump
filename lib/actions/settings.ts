'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
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
    await db
      .update(users)
      .set({
        name: input.name?.trim() || null,
        goals: input.goals ?? [],
        streakTarget: input.streakTarget ?? 1,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    revalidatePath('/settings');
    revalidatePath('/home');
    return { ok: true };
  } catch (err) {
    console.log('[v0] updateProfile error:', (err as Error).message);
    return { ok: false, error: 'Could not save your settings.' };
  }
}
