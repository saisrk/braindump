'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface NavLinkProps {
  href: string;
  label: string;
  icon?: ReactNode;
  badge?: number;
  compact?: boolean;
}

export function NavLink({ href, label, icon, badge, compact }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + '/');

  if (compact) {
    return (
      <Link
        href={href}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          'relative flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-medium transition-colors',
          isActive
            ? 'text-brand-600 dark:text-brand-400'
            : 'text-muted-foreground'
        )}
      >
        <span className="relative grid h-5 w-5 place-items-center">
          {icon}
          {badge ? (
            <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand-500 px-1 text-[9px] font-bold text-white">
              {badge}
            </span>
          ) : null}
        </span>
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <span className="grid h-5 w-5 place-items-center">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge ? (
        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-500 px-1.5 text-xs font-semibold text-white">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}
