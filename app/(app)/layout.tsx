import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { requireUserId } from '@/lib/session';
import { db } from '@/db';
import { reviewItems, learnings } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { Sidebar } from '@/components/navigation/sidebar';
import { BottomNav } from '@/components/navigation/bottom-nav';
import { todayISO } from '@/lib/utils';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Get due count
  const userId = await requireUserId();
  const today = todayISO();
  const dueReviews = await db
    .select()
    .from(reviewItems)
    .innerJoin(learnings, eq(learnings.id, reviewItems.learningId))
    .where(
      and(
        eq(learnings.userId, userId),
        eq(reviewItems.dueDate, today)
      )
    );

  return (
    <div className="flex h-screen flex-col bg-background md:flex-row">
      {/* Sidebar for desktop */}
      <aside className="hidden border-r border-border md:flex md:w-64 md:flex-col">
        <Sidebar 
          dueCount={dueReviews.length}
          userEmail={session.user.email}
          userName={session.user.name}
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
