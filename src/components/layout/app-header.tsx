'use client';

import { Button } from '@/src/components/ui/button';
import { Avatar, AvatarFallback } from '@/src/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/src/components/ui/sheet';

import { LogOut, Menu, Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

import { useAuth } from '@/src/features/auth/auth-context';
import { Brand } from './brand';
import { navigationForRole } from './navigation';

export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  if (!user) return null;

  const current = navigationForRole(user.role).find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  return (
    <header className="ic-topbar">
      <div className="ic-topbar-left">
        <div className="ic-mobile-nav">
          <Sheet>
            <SheetTrigger
              className="ic-menu-trigger"
              aria-label="Open navigation"
            >
              <Menu aria-hidden="true" size={21} />
            </SheetTrigger>
            <SheetContent side="left" className="ic-mobile-sheet">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <Brand />
              <nav aria-label="Mobile navigation">
                {navigationForRole(user.role).map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link href={item.href} className="ic-nav-item">
                      <item.icon aria-hidden="true" size={19} />
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
        <nav aria-label="Breadcrumb" className="ic-crumb">
          Workspace <span aria-hidden="true"> / </span>
          <strong>{current?.label ?? 'Overview'}</strong>
        </nav>
      </div>
      <div className="ic-topbar-right">
        <span className="ic-role">
          {user.role === 'ADMIN' ? 'Admin view' : 'Teacher view'}
        </span>
        <Button
          type="button"
          variant="outline"
          className="ic-icon-button"
          aria-label={
            resolvedTheme === 'dark' ? 'Use light theme' : 'Use dark theme'
          }
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        >
          {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            className="ic-account-trigger"
            aria-label={`Account menu for ${user.name}`}
          >
            <Avatar className="ic-avatar">
              <AvatarFallback>
                {user.name
                  .split(/\s+/)
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-52 p-2">
            <DropdownMenuLabel>
              <strong>{user.name}</strong>
              <small className="block font-normal text-muted-foreground">
                {user.email}
              </small>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">Account settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => void handleLogout()}>
              <LogOut size={15} aria-hidden="true" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
