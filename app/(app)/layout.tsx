import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Sidebar } from '@/components/navigation/sidebar';
import { BottomNav } from '@/components/navigation/bottom-nav';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen flex-col bg-background md:flex-row">
      {/* Sidebar for desktop */}
      <aside className="hidden border-r border-border md:flex md:w-64 md:flex-col">
        <Sidebar />
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
