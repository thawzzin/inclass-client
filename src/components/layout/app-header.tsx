'use client';

import { Menu, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/src/features/auth/auth-context';
import { navigationForRole } from './navigation';

export function AppHeader() {
  const router = useRouter();
  const { logout, user } = useAuth();
  if (!user) return null;

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 sm:px-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-3">
        <details className="relative lg:hidden">
          <summary
            aria-label="Open navigation"
            className="cursor-pointer list-none rounded-md p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <Menu aria-hidden="true" className="size-5" />
          </summary>
          <nav
            aria-label="Mobile navigation"
            className="absolute left-0 top-11 z-20 w-56 rounded-md border border-zinc-200 bg-white p-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            {navigationForRole(user.role).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <item.icon aria-hidden="true" className="size-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </details>
        <nav aria-label="Breadcrumb" className="text-sm text-zinc-500">
          <span>InClass</span>
          <span aria-hidden="true" className="mx-2">
            /
          </span>
          <span>Workspace</span>
        </nav>
      </div>
      <details className="relative">
        <summary className="cursor-pointer list-none rounded-md px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800">
          {user.name}
        </summary>
        <div className="absolute right-0 z-10 mt-2 w-52 rounded-md border border-zinc-200 bg-white p-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="px-2 py-1 text-xs text-zinc-500">{user.email}</p>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <LogOut aria-hidden="true" className="size-4" /> Sign out
          </button>
        </div>
      </details>
    </header>
  );
}
