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
            ? 'text-primary'
            : 'text-muted-foreground'
        )}
      >
        <span className="relative grid h-5 w-5 place-items-center">
          {icon}
          {badge ? (
            <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
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
        'group relative flex items-center gap-3 px-3 py-2 text-xs font-semibold transition-all rounded-none',
        isActive
          ? 'text-primary bg-primary/5'
          : 'text-muted-foreground hover:bg-primary/5 hover:text-foreground'
      )}
      style={isActive ? {
        borderLeft: '2px solid #00f0ff',
        boxShadow: 'inset -10px 0 15px -8px rgba(0, 240, 255, 0.1), 0 0 12px rgba(0, 240, 255, 0.15)',
        paddingLeft: '14px',
      } : {}}
    >
      <span className="grid h-4 w-4 place-items-center text-sm">{icon}</span>
      <span className="flex-1 tracking-wide" style={{ fontFamily: 'Rajdhani' }}>{label}</span>
      {badge ? (
        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-success px-1.5 text-xs font-semibold text-primary-foreground" style={{ fontFamily: 'Share Tech Mono' }}>
          {badge}
        </span>
      ) : null}
    </Link>
  );
}
