'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ReactNode } from 'react';

interface NavLinkProps {
  href: string;
  label: string;
  icon?: ReactNode;
  compact?: boolean;
}

export function NavLink({ href, label, icon, compact }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href);

  if (compact) {
    return (
      <Link
        href={href}
        className={`flex flex-col items-center justify-center px-2 py-1.5 text-xs font-medium transition-colors ${
          isActive
            ? 'text-brand-600 dark:text-brand-400'
            : 'text-text-secondary dark:text-text-dark-secondary'
        }`}
      >
        {icon && <span className="h-4 w-4">{icon}</span>}
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400'
          : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary dark:text-text-dark-secondary dark:hover:bg-surface-dark-secondary dark:hover:text-text-dark-primary'
      }`}
    >
      {icon && <span className="h-5 w-5">{icon}</span>}
      {label}
    </Link>
  );
}
