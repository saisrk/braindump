import { db } from '@/db';
import { reviewItems, learnings, users, userProfiles } from '@/db/schema';
import { eq, and, lte } from 'drizzle-orm';
import { Sidebar } from '@/components/navigation/sidebar';
import { BottomNav } from '@/components/navigation/bottom-nav';
import { todayISO } from '@/lib/utils';
import { getOptionalUserId } from '@/lib/session';
import { redirect, RedirectType } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let dueCount = 0;
  let userEmail: string | undefined;
  let userName: string | undefined;

  try {
    const userId = await getOptionalUserId();

    if (userId) {
      // Fetch auth record (email/name) and profile (onboarding status) in parallel.
      const [[user], [profile]] = await Promise.all([
        db.select({ email: users.email, name: users.name }).from(users).where(eq(users.id, userId)),
        db.select({ onboardedAt: userProfiles.onboardedAt }).from(userProfiles).where(eq(userProfiles.userId, userId)),
      ]);

      if (!profile?.onboardedAt) {
        redirect('/onboarding');
      }
      userEmail = user?.email ?? undefined;
      userName = user?.name ?? undefined;

      const today = todayISO();
      const dueReviews = await db
        .select()
        .from(reviewItems)
        .innerJoin(learnings, eq(learnings.id, reviewItems.learningId))
        .where(and(eq(learnings.userId, userId), lte(reviewItems.dueDate, today)));
      dueCount = dueReviews.length;
    } else {
      // Fallback for environments without auth — count all due items.
      const today = todayISO();
      const dueReviews = await db
        .select()
        .from(reviewItems)
        .innerJoin(learnings, eq(learnings.id, reviewItems.learningId))
        .where(eq(reviewItems.dueDate, today));
      dueCount = dueReviews.length;
    }
  } catch (e) {
    // Re-throw Next.js navigation signals (redirect/notFound) — never swallow these.
    if (isRedirectError(e)) throw e;
    // Suppress genuine db errors (e.g. missing env vars at build time).
  }

  return (
    <div className="flex h-screen flex-col bg-background md:flex-row">
      {/* Sidebar for desktop */}
      <aside className="hidden border-r border-border md:flex md:w-64 md:flex-col">
        <Sidebar
          dueCount={dueCount}
          userEmail={userEmail}
          userName={userName}
        />
      </aside>

      {/* Main content */}
      <main className="flex flex-1 flex-col overflow-hidden pb-20 md:pb-0">
        {children}
      </main>

      {/* Bottom nav for mobile */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-border md:hidden">
        <BottomNav />
      </nav>
    </div>
  );
}
