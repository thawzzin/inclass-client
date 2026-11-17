import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { studentsApi } from '@/src/features/students/students.api';
import { EnrollmentManager } from './enrollment-manager';
import { enrollmentsApi } from './enrollments.api';

vi.mock('@/src/features/auth/auth-context', () => ({
  useAuth: () => ({ user: { role: 'ADMIN' } }),
}));
vi.mock('@/src/features/students/students.api', () => ({
  studentsApi: { list: vi.fn() },
}));
vi.mock('./enrollments.api', () => ({
  enrollmentsApi: {
    list: vi.fn(),
    enroll: vi.fn(),
    bulkEnroll: vi.fn(),
    remove: vi.fn(),
  },
}));

describe('EnrollmentManager', () => {
  it('opens the shadcn enrollment dialog and lists available students', async () => {
    vi.mocked(enrollmentsApi.list).mockResolvedValue([]);
    vi.mocked(studentsApi.list).mockResolvedValue({
      items: [
        {
          id: 'student-1',
          studentId: '6702883',
          fullName: 'Hein Htet',
          nickname: null,
          status: 'ACTIVE',
          createdAt: '',
          updatedAt: '',
        },
      ],
      page: 1,
      pageSize: 100,
      total: 1,
      totalPages: 1,
    });
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={client}>
        <EnrollmentManager sectionId="section-1" />
      </QueryClientProvider>,
    );

    await userEvent.click(
      await screen.findByRole('button', { name: 'Manage enrollment' }),
    );
    expect(
      await screen.findByRole('dialog', { name: 'Enroll students' }),
    ).toBeInTheDocument();
    expect(await screen.findByText('6702883 · Hein Htet')).toBeInTheDocument();
  });
});
