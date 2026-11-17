import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { academicsApi } from '@/src/features/academics/academics.api';

import { DashboardPage } from './dashboard-page';
import { dashboardApi } from './dashboard.api';

vi.mock('@/src/features/auth/auth-context', () => ({
  useAuth: () => ({
    user: {
      id: 'teacher-1',
      name: 'Ada Teacher',
      email: 'ada@example.edu',
      role: 'TEACHER',
      status: 'ACTIVE',
    },
  }),
}));

vi.mock('@/src/features/academics/academics.api', () => ({
  academicsApi: { sections: vi.fn() },
}));

vi.mock('./dashboard.api', () => ({
  dashboardApi: {
    summary: vi.fn(),
    attendanceStatistics: vi.fn(),
    recentAttendance: vi.fn(),
  },
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.mocked(dashboardApi.summary).mockResolvedValue({
      assignedSections: 2,
      activeStudents: 40,
      attendanceSessions: 5,
    });
    vi.mocked(dashboardApi.attendanceStatistics).mockResolvedValue({
      totalExpected: 40,
      present: 30,
      absent: 5,
      late: 3,
      unmarked: 2,
      attendancePercentage: 86.8421052632,
    });
    vi.mocked(dashboardApi.recentAttendance).mockResolvedValue([]);
  });

  it('shows a recoverable error instead of treating failed assigned sections as empty', async () => {
    vi.mocked(academicsApi.sections).mockRejectedValue(
      new Error('network unavailable'),
    );
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <DashboardPage />
      </QueryClientProvider>,
    );

    expect(
      await screen.findByText('Unable to load assigned sections.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('No sections are assigned.'),
    ).not.toBeInTheDocument();
  });

  it('labels the chart with the recent-session data it actually shows', async () => {
    vi.mocked(academicsApi.sections).mockResolvedValue([]);
    vi.mocked(dashboardApi.recentAttendance).mockResolvedValue([
      {
        id: 'session-1',
        sectionId: 'section-1',
        date: '2026-11-17',
        createdById: 'teacher-1',
        createdAt: '2026-11-17T08:00:00Z',
        updatedAt: '2026-11-17T08:00:00Z',
        section: {
          id: 'section-1',
          courseId: 'course-1',
          sectionCode: '901',
          teacherId: 'teacher-1',
          status: 'ACTIVE',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
          course: {
            id: 'course-1',
            code: 'CSC480',
            name: 'Software Engineering',
            status: 'ACTIVE',
            createdAt: '2026-01-01T00:00:00Z',
            updatedAt: '2026-01-01T00:00:00Z',
          },
        },
        createdBy: { id: 'teacher-1', name: 'Ada Teacher' },
        _count: { roster: 35 },
      },
    ]);
    render(
      <QueryClientProvider
        client={
          new QueryClient({ defaultOptions: { queries: { retry: false } } })
        }
      >
        <DashboardPage />
      </QueryClientProvider>,
    );
    expect(
      await screen.findByRole('heading', { name: 'Recent session sizes' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('img', {
        name: 'Student rosters for 1 recent attendance session',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('35 students')).toBeInTheDocument();
  });
});
