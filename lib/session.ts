import 'server-only';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

/**
 * Returns the authenticated user's id, redirecting to /login if absent.
 * Use in Server Components, Route Handlers, and Server Actions.
 */
export async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }
  return session.user.id;
}

export async function getOptionalUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}
