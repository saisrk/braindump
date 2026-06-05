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
    router.push('/landing');
  }

  const initial = (userName || userEmail || '?').charAt(0).toUpperCase();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-border bg-gradient-to-b from-primary/5 to-transparent md:flex" style={{ borderRightColor: 'rgba(0, 240, 255, 0.18)' }}>
      {/* Logo/Branding */}
      <div className="flex items-center gap-3 px-4 py-5">
        <div 
          className="h-8 w-8 flex-shrink-0 grid place-items-center border-2 border-primary"
          style={{
            transform: 'rotate(45deg)',
            boxShadow: '0 0 16px rgba(0, 240, 255, 0.3), inset 0 0 10px rgba(0, 240, 255, 0.1)',
          }}
        >
          <div 
            className="w-2 h-2 bg-primary"
            style={{
              boxShadow: '0 0 8px rgba(0, 240, 255, 0.6)',
              transform: 'rotate(-45deg)',
            }}
          />
        </div>
        <span className="text-sm font-bold tracking-widest text-foreground" style={{ fontFamily: 'Chakra Petch' }}>
          BRAINDUMP
        </span>
      </div>

      {/* Capture Button - Glowing */}
      <div className="px-3 pb-4">
        <Link
          href="/capture"
          className="flex w-full items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-primary-foreground transition-all duration-200 hover:-translate-y-0.5"
          style={{
            background: 'linear-gradient(135deg, #00f0ff, #6af0ff)',
            boxShadow: '0 0 22px rgba(0, 240, 255, 0.4)',
            letterSpacing: '2px',
            fontFamily: 'Chakra Petch',
          }}
        >
          ⊕ CAPTURE
        </Link>
      </div>

      {/* Navigation Items */}
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

      {/* User Footer */}
      <div className="border-t border-border px-3 py-4" style={{ borderTopColor: 'rgba(0, 240, 255, 0.18)' }}>
        <div className="flex items-center gap-2 px-2 py-2">
          <div 
            className="h-8 w-8 flex-shrink-0 grid place-items-center rounded-full border-2 border-primary text-xs font-bold text-primary"
            style={{ 
              background: 'rgba(0, 240, 255, 0.08)',
              boxShadow: '0 0 12px rgba(0, 240, 255, 0.2)',
            }}
          >
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-foreground" style={{ fontFamily: 'Chakra Petch' }}>
              {userName || 'Learner'}
            </p>
            <p className="truncate text-xs text-muted-foreground" style={{ fontFamily: 'Share Tech Mono' }}>
              LVL 08 · 2480 XP
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="mt-3 flex w-full items-center justify-center gap-2 px-3 py-2 text-xs font-semibold transition-all duration-200 border border-danger text-danger hover:bg-danger/10 hover:shadow-md hover:shadow-danger/20"
          style={{ letterSpacing: '1px', fontFamily: 'Chakra Petch' }}
        >
          <LogOut className="h-3 w-3" />
          LOGOUT
        </button>
      </div>
    </aside>
  );
}
