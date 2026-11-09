export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  students: {
    all: ['students'] as const,
    detail: (id: string) => ['students', id] as const,
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
  dashboard: {
    summary: ['dashboard', 'summary'] as const,
    attendanceStats: ['dashboard', 'attendance-stats'] as const,
    recentAttendance: ['dashboard', 'recent-attendance'] as const,
  },
};
