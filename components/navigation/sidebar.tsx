'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Brain, LogOut, PlusCircle } from 'lucide-react';
import { NavLink } from './nav-link';
import { navItems } from './nav-items';
import { ThemeToggle } from '@/components/theme-toggle';

interface SidebarProps {
  dueCount: number;
  userEmail?: string | null;
  userName?: string | null;
}

export function Sidebar({ dueCount, userEmail, userName }: SidebarProps) {
  const router = useRouter();

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push('/landing');
  }

  const initial = (userName || userEmail || '?').charAt(0).toUpperCase();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-border bg-card md:flex">
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500 text-white">
          <Brain className="h-5 w-5" />
        </span>
        <span className="text-lg font-bold tracking-tight text-foreground">
          Braindump
        </span>
      </div>

      <div className="px-3 pb-2">
        <Link
          href="/capture"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-600"
        >
          <PlusCircle className="h-4 w-4" />
          Capture
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            badge={item.badgeKey === 'due' ? dueCount : undefined}
          />
        ))}
      </nav>

      <div className="border-t border-border px-3 py-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {userName || 'Learner'}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {userEmail}
            </p>
          </div>
          <ThemeToggle />
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
