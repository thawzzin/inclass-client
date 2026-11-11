import type { Role } from './types';

export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  students: {
    all: ['students'] as const,
    detail: (id: string) => ['students', id] as const,
    attendance: (id: string, filters: object) => ['students', id, 'attendance', filters] as const,
  },
  teachers: {
    all: ['teachers'] as const,
    detail: (id: string) => ['teachers', id] as const,
  },
  courses: {
    all: ['courses'] as const,
    detail: (id: string) => ['courses', id] as const,
  },
  sections: {
    all: ['sections'] as const,
    detail: (id: string) => ['sections', id] as const,
    enrollments: (id: string) => ['sections', id, 'enrollments'] as const,
    attendanceSessions: (id: string) => ['sections', id, 'attendance-sessions'] as const,
  },
  attendanceSessions: {
    detail: (id: string) => ['attendance-sessions', id] as const,
  },
  attendance: {
    history: (filters: object) => ['attendance-records', filters] as const,
    statistics: (sectionId: string, filters: object) =>
      ['sections', sectionId, 'attendance-statistics', filters] as const,
  },
  dashboard: {
    summary: (role: Role | undefined) => ['dashboard', role, 'summary'] as const,
    attendanceStats: (role: Role | undefined) => ['dashboard', role, 'attendance-stats'] as const,
    recentAttendance: (role: Role | undefined) => ['dashboard', role, 'recent-attendance'] as const,
    assignedSections: (role: Role | undefined) => ['dashboard', role, 'assigned-sections'] as const,
  },
};
