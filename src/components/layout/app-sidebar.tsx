'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/src/lib/utils';
import { navigationForRole } from './navigation';
import { useAuth } from '@/src/features/auth/auth-context';

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  if (!user) return null;

  return (
    <aside className="hidden w-64 shrink-0 border-r border-zinc-200 bg-white lg:block dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex h-16 items-center border-b border-zinc-200 px-6 dark:border-zinc-800">
        <span className="text-lg font-semibold tracking-tight">InClass</span>
      </div>
      <nav aria-label="Main navigation" className="space-y-1 p-3">
        {navigationForRole(user.role).map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link key={item.href} href={item.href} className={cn('flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium', active ? 'bg-zinc-100 text-zinc-950 dark:bg-zinc-800 dark:text-zinc-50' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50')}>
              <item.icon aria-hidden="true" className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
