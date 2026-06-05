import { db } from '@/db';
import { reviewItems, learnings, users } from '@/db/schema';
import { eq, and, lte } from 'drizzle-orm';
import { Sidebar } from '@/components/navigation/sidebar';
import { BottomNav } from '@/components/navigation/bottom-nav';
import { todayISO } from '@/lib/utils';
import { getOptionalUserId } from '@/lib/session';
import { redirect } from 'next/navigation';

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
      // Check if user has completed onboarding; redirect if not.
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (user && !user.onboardedAt) {
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
  } catch {
    // db may not be available in all environments
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
