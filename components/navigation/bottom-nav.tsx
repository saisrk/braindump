'use client'

import { navItems } from './nav-items'
import { NavLink } from './nav-link'

export function BottomNav() {
  return (
    <div className="flex items-center justify-around bg-background px-2 py-3">
      {navItems.map((item) => (
        <NavLink key={item.href} {...item} isMobile />
      ))}
    </div>
  )
}
