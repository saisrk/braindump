'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { NavLink } from './nav-link';
import { navItems } from './nav-items';

interface SidebarProps {
  dueCount: number;
  userEmail?: string | null;
  userName?: string | null;
}

export function Sidebar({ dueCount, userEmail, userName }: SidebarProps) {
  const router = useRouter();

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push('/');
  }

  const initial = (userName || userEmail || '?').charAt(0).toUpperCase();
  const displayName = userName || userEmail?.split('@')[0] || 'Learner';

  return (
    <aside className="sticky top-0 hidden h-screen w-64 flex-col bg-background border-r border-border md:flex">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-6">
        <div
          className="h-9 w-9 flex-shrink-0 grid place-items-center rounded-lg"
          style={{ background: '#b5462f', boxShadow: '0 5px 12px -5px rgba(181,70,47,.7)' }}
        >
          {/* Journal mark icon */}
          <svg width="18" height="20" viewBox="0 0 18 20" fill="none" aria-hidden="true">
            <rect x="3" y="1" width="12" height="18" rx="1" stroke="white" strokeWidth="2" fill="none" />
            <rect x="1" y="3" width="3" height="14" rx="0.5" fill="white" fillOpacity="0.9" />
            <line x1="6" y1="7" x2="13" y2="7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="6" y1="10" x2="13" y2="10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="6" y1="13" x2="10" y2="13" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <span className="font-display font-bold text-lg text-foreground">Braindump</span>
      </div>

      {/* Capture button */}
      <div className="px-4 pb-5">
        <Link
          href="/capture"
          className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
          style={{
            background: '#b5462f',
            boxShadow: '0 6px 14px -6px rgba(181,70,47,.7)',
          }}
        >
          ✎ Capture
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3">
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

      {/* User footer */}
      <div className="border-t border-border px-4 py-4">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="h-8 w-8 flex-shrink-0 grid place-items-center rounded-lg text-sm font-bold text-white"
            style={{ background: '#46557a' }}
          >
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground font-display">
              {displayName}
            </p>
            {userEmail && (
              <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-danger hover:text-danger"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
