'use client';

import { NavLink } from './nav-link';

const navItems = [
  { href: '/home', label: 'Home' },
  { href: '/capture', label: 'Capture' },
  { href: '/library', label: 'Library' },
  { href: '/review', label: 'Review' },
  { href: '/express', label: 'Express' },
  { href: '/settings', label: 'Settings' },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden items-center justify-around border-t border-brand-200 bg-surface dark:bg-surface-dark px-2 py-1">
      {navItems.map((item) => (
        <NavLink key={item.href} href={item.href} label={item.label} compact />
      ))}
    </nav>
  );
}
