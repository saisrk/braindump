import {
  Home,
  PlusCircle,
  Library,
  Brain,
  Sparkles,
  Settings,
} from 'lucide-react';
import { type ReactNode } from 'react';

export interface NavItemConfig {
  href: string;
  label: string;
  icon: ReactNode;
  /** key into a counts map for an optional badge */
  badgeKey?: 'due';
}

export const navItems: NavItemConfig[] = [
  { href: '/home', label: 'Home', icon: <Home className="h-full w-full" /> },
  {
    href: '/capture',
    label: 'Capture',
    icon: <PlusCircle className="h-full w-full" />,
  },
  {
    href: '/library',
    label: 'Library',
    icon: <Library className="h-full w-full" />,
  },
  {
    href: '/review',
    label: 'Review',
    icon: <Brain className="h-full w-full" />,
    badgeKey: 'due',
  },
  {
    href: '/express',
    label: 'Express',
    icon: <Sparkles className="h-full w-full" />,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: <Settings className="h-full w-full" />,
  },
];
