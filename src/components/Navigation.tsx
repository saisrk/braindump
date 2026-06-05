'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Today', icon: '🏠' },
  { href: '/capture', label: 'Capture', icon: '✚' },
  { href: '/library', label: 'Library', icon: '📚' },
  { href: '/review', label: 'Review', icon: '🔁' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-50">
      <div className="max-w-2xl mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-3 px-5 text-xs font-medium transition-colors ${
                isActive
                  ? 'text-violet-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
