'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useAuth } from '@/src/features/auth/auth-context';
import { Avatar, AvatarFallback } from '@/src/components/ui/avatar';
import { Brand } from './brand';
import { navigationForRole } from './navigation';

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  if (!user) return null;

  const items = navigationForRole(user.role);
  return (
    <aside className="ic-sidebar">
      <Brand />
      <nav aria-label="Main navigation" className="ic-sidebar-nav">
        <p className="ic-nav-label">WORKSPACE</p>
        {items
          .filter((item) => item.href !== '/settings')
          .map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`ic-nav-item${active ? ' is-active' : ''}`}
              >
                <item.icon aria-hidden="true" size={19} strokeWidth={1.8} />
                {item.label}
              </Link>
            );
          })}
      </nav>
      <div className="ic-sidebar-bottom">
        <p className="ic-nav-label">PREFERENCES</p>
        {items
          .filter((item) => item.href === '/settings')
          .map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? 'page' : undefined}
              className={`ic-nav-item${pathname === item.href ? ' is-active' : ''}`}
            >
              <item.icon aria-hidden="true" size={19} strokeWidth={1.8} />
              {item.label}
            </Link>
          ))}
        <div className="ic-profile">
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
          <span>
            <strong>{user.name}</strong>
            <small>{user.role === 'ADMIN' ? 'Administrator' : 'Teacher'}</small>
          </span>
        </div>
      </div>
    </aside>
  );
}
