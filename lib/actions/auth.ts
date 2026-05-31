'use server';

import { auth } from '@/lib/auth';

export async function logout() {
  await auth.signOut({ redirect: false });
}
