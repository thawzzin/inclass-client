import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  CalendarCheck,
  GraduationCap,
  History,
  LayoutDashboard,
  Settings,
  Users,
} from 'lucide-react';

import type { Role } from '@/src/lib/api/types';

export interface NavigationItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const common: NavigationItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/sections', label: 'My Sections', icon: BookOpen },
  { href: '/attendance', label: 'Attendance', icon: CalendarCheck },
  { href: '/history', label: 'History', icon: History },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function navigationForRole(role: Role): NavigationItem[] {
  if (role === 'TEACHER') return common;

  return [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/students', label: 'Students', icon: GraduationCap },
    { href: '/teachers', label: 'Teachers', icon: Users },
    { href: '/courses', label: 'Courses', icon: BookOpen },
    { href: '/sections', label: 'Sections', icon: BookOpen },
    { href: '/attendance', label: 'Attendance', icon: CalendarCheck },
    { href: '/history', label: 'History', icon: History },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];
}
