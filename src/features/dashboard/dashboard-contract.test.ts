import { describe, expect, it } from 'vitest';

import { queryKeys } from '@/src/lib/api/query-keys';

import { dashboardCards, dashboardQuickLinks } from './dashboard-contract';

describe('dashboard role contract', () => {
  it('maps every backend admin summary field to an admin metric', () => {
    expect(
      dashboardCards('ADMIN', {
        activeStudents: 120,
        activeTeachers: 8,
        activeCourses: 6,
        activeSections: 12,
        attendanceSessions: 34,
      }),
    ).toEqual([
      { label: 'Active students', value: 120 },
      { label: 'Active teachers', value: 8 },
      { label: 'Active courses', value: 6 },
      { label: 'Active sections', value: 12 },
      { label: 'Attendance sessions', value: 34 },
    ]);
  });

  it('does not expose admin-only metrics or links on the teacher dashboard', () => {
    expect(
      dashboardCards('TEACHER', {
        assignedSections: 3,
        activeStudents: 75,
        attendanceSessions: 9,
      }),
    ).toEqual([
      { label: 'Assigned sections', value: 3 },
      { label: 'Distinct active students', value: 75 },
      { label: 'Attendance sessions', value: 9 },
    ]);
    expect(dashboardQuickLinks('TEACHER')).toEqual([
      { label: 'My sections', href: '/sections' },
      { label: 'Take attendance', href: '/attendance' },
    ]);
  });

  it('keeps role-scoped dashboard responses in separate query caches', () => {
    expect(queryKeys.dashboard.summary('ADMIN')).not.toEqual(
      queryKeys.dashboard.summary('TEACHER'),
    );
    expect(queryKeys.dashboard.attendanceStats('ADMIN')).not.toEqual(
      queryKeys.dashboard.attendanceStats('TEACHER'),
    );
    expect(queryKeys.dashboard.recentAttendance('ADMIN')).not.toEqual(
      queryKeys.dashboard.recentAttendance('TEACHER'),
    );
    expect(queryKeys.dashboard.assignedSections('TEACHER')).toEqual([
      'dashboard',
      'TEACHER',
      'assigned-sections',
    ]);
  });
});
