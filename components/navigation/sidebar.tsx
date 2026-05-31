'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { NavLink } from './nav-link';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/home', label: 'Home' },
  { href: '/capture', label: 'Capture' },
  { href: '/library', label: 'Library' },
  { href: '/review', label: 'Review' },
  { href: '/express', label: 'Express' },
  { href: '/settings', label: 'Settings' },
];

export function Sidebar() {
  const router = useRouter();

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push('/login');
  }

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-brand-200 bg-surface dark:bg-surface-dark h-screen sticky top-0">
      <div className="flex items-center gap-2 px-6 py-5">
        <span className="text-xl font-bold text-brand-600 dark:text-brand-400">
          Braindump
        </span>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map((item) => (
          <NavLink key={item.href} href={item.href} label={item.label} />
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-brand-200">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={handleSignOut}
        >
          Sign out
        </Button>
      </div>
    </aside>
  );
}
