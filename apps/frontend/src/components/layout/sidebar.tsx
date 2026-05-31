'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Store,
  UtensilsCrossed,
  ShoppingCart,
  ClipboardList,
  CreditCard,
  User,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/restaurants', label: 'Restaurants', icon: Store },
  { href: '/menu', label: 'Menu', icon: UtensilsCrossed },
  { href: '/cart', label: 'Cart', icon: ShoppingCart },
  { href: '/orders', label: 'Orders', icon: ClipboardList },
  { href: '/payment-methods', label: 'Payment Methods', icon: CreditCard },
  { href: '/profile', label: 'Profile', icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-card/50 p-4">
      <div className="mb-8 px-2">
        <h1 className="text-xl font-bold tracking-tight">Slooze Food</h1>
        <p className="text-xs text-muted-foreground">Enterprise Ordering</p>
      </div>

      {user && (
        <div className="mb-6 space-y-2 rounded-lg bg-secondary/50 p-3">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary">{user.role}</Badge>
            <Badge variant="outline">{user.country}</Badge>
          </div>
        </div>
      )}

      <nav className="flex-1 space-y-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent',
              pathname === href || pathname.startsWith(`${href}/`)
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground',
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <Button variant="ghost" className="justify-start gap-2" onClick={logout}>
        <LogOut className="h-4 w-4" />
        Sign out
      </Button>
    </aside>
  );
}
