import type {
  AdminDashboardSummary,
  Role,
  TeacherDashboardSummary,
} from '@/src/lib/api/types';

export interface DashboardCard {
  label: string;
  value: number;
}

export interface DashboardQuickLink {
  label: string;
  href: string;
}

export function dashboardCards(
  role: Role,
  summary: AdminDashboardSummary | TeacherDashboardSummary,
): DashboardCard[] {
  if (role === 'ADMIN' && 'activeTeachers' in summary) {
    return [
      { label: 'Active students', value: summary.activeStudents },
      { label: 'Active teachers', value: summary.activeTeachers },
      { label: 'Active courses', value: summary.activeCourses },
      { label: 'Active sections', value: summary.activeSections },
      { label: 'Attendance sessions', value: summary.attendanceSessions },
    ];
  }
  if (role === 'TEACHER' && 'assignedSections' in summary) {
    return [
      { label: 'Assigned sections', value: summary.assignedSections },
      { label: 'Distinct active students', value: summary.activeStudents },
      { label: 'Attendance sessions', value: summary.attendanceSessions },
    ];
  }
  return [];
}

export function dashboardQuickLinks(role: Role): DashboardQuickLink[] {
  return role === 'ADMIN'
    ? [
        { label: 'Manage students', href: '/students' },
        { label: 'Manage sections', href: '/sections' },
        { label: 'View attendance', href: '/attendance' },
      ]
    : [
        { label: 'My sections', href: '/sections' },
        { label: 'Take attendance', href: '/attendance' },
      ];
}
