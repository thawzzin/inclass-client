import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { studentsApi } from '@/src/features/students/students.api';

import StudentDetailPage from './page';

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'student-1' }),
}));

vi.mock('@/src/features/auth/auth-context', () => ({
  useAuth: () => ({
    user: {
      id: 'teacher-1',
      name: 'Teacher User',
      email: 'teacher@example.edu',
      role: 'TEACHER',
      status: 'ACTIVE',
    },
  }),
}));

vi.mock('@/src/features/students/students.api', () => ({
  studentsApi: { detail: vi.fn() },
}));

vi.mock('@/src/features/attendance/student-attendance-history', () => ({
  StudentAttendanceHistory: () => <p>Attendance history</p>,
}));

describe('StudentDetailPage authorization', () => {
  beforeEach(() => {
    vi.mocked(studentsApi.detail).mockResolvedValue({
      id: 'student-1',
      studentId: 'S001',
      fullName: 'Restricted Student',
      nickname: null,
      status: 'ACTIVE',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
  });

  it('blocks teachers from opening the admin-only student detail route', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <StudentDetailPage />
      </QueryClientProvider>,
    );

    expect(
      screen.getByText('You are not authorized to view student details.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Restricted Student')).not.toBeInTheDocument();
  });
});
