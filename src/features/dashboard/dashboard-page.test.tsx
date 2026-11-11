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
    vi.mocked(academicsApi.sections).mockRejectedValue(new Error('network unavailable'));
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={queryClient}>
        <DashboardPage />
      </QueryClientProvider>,
    );

    expect(await screen.findByText('Unable to load assigned sections.')).toBeInTheDocument();
    expect(screen.queryByText('No sections are assigned.')).not.toBeInTheDocument();
  });
});
