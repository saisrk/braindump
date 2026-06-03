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
  // Auth is temporarily disabled — load due reviews without a user filter
  let dueCount = 0;
  try {
    const today = todayISO();
    const dueReviews = await db
      .select()
      .from(reviewItems)
      .innerJoin(learnings, eq(learnings.id, reviewItems.learningId))
      .where(eq(reviewItems.dueDate, today));
    dueCount = dueReviews.length;
  } catch {
    // db may not be available in all environments
  }

  return (
    <div className="flex h-screen flex-col bg-background md:flex-row">
      {/* Sidebar for desktop */}
      <aside className="hidden border-r border-border md:flex md:w-64 md:flex-col">
        <Sidebar
          dueCount={dueCount}
          userEmail={undefined}
          userName={undefined}
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
