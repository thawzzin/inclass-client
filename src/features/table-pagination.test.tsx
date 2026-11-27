import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CoursesPage } from './academics/courses-page';
import { academicsApi } from './academics/academics.api';
import { AttendanceReportPanel } from './attendance/attendance-report-panel';
import { attendanceApi } from './attendance/attendance.api';
import { StudentsPage } from './students/students-page';
import { studentsApi } from './students/students.api';
import { TeachersPage } from './teachers/teachers-page';
import { teachersApi } from './teachers/teachers.api';

vi.mock('./auth/auth-context', () => ({
  useAuth: () => ({ user: { id: 'admin', role: 'ADMIN' } }),
}));
vi.mock('./academics/academics.api', () => ({
  academicsApi: { courses: vi.fn() },
}));
vi.mock('./students/students.api', () => ({
  studentsApi: { list: vi.fn() },
}));
vi.mock('./teachers/teachers.api', () => ({
  teachersApi: { list: vi.fn() },
}));
vi.mock('./attendance/attendance.api', () => ({
  attendanceApi: { history: vi.fn(), statistics: vi.fn(), exportCsv: vi.fn() },
}));

function renderPage(page: React.ReactNode) {
  return render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      {page}
    </QueryClientProvider>,
  );
}

describe('table pagination', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows ten courses, then the remaining courses, and resets after search', async () => {
    vi.mocked(academicsApi.courses).mockResolvedValue(
      Array.from({ length: 12 }, (_, index) => ({
        id: String(index + 1),
        code: `COURSE${index + 1}`,
        name: `Course ${index + 1}`,
        status: 'ACTIVE',
        createdAt: '',
        updatedAt: '',
      })),
    );
    renderPage(<CoursesPage />);

    expect(
      await screen.findByText('12 courses · Page 1 of 2'),
    ).toBeInTheDocument();
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(
      11,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(
      3,
    );
    expect(screen.getByText('12 courses · Page 2 of 2')).toBeInTheDocument();

    fireEvent.change(screen.getByRole('textbox', { name: 'Search courses' }), {
      target: { value: 'COURSE12' },
    });
    expect(screen.getByText('1 course · Page 1 of 1')).toBeInTheDocument();
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(
      2,
    );
  });

  it.each([
    ['students', () => <StudentsPage />, studentsApi.list],
    ['teachers', () => <TeachersPage />, teachersApi.list],
  ])('requests ten %s per page and advances', async (_, component, list) => {
    vi.mocked(list).mockImplementation(async (params) => ({
      items: [],
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      total: 12,
      totalPages: 2,
    }));
    renderPage(component());
    expect(await screen.findByText(/Page 1 of 2/)).toBeInTheDocument();
    expect(list).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, pageSize: 10 }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(await screen.findByText(/Page 2 of 2/)).toBeInTheDocument();
    expect(list).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, pageSize: 10 }),
    );
  });

  it('requests ten attendance records per page', async () => {
    vi.mocked(attendanceApi.history).mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0,
    });
    renderPage(<AttendanceReportPanel />);
    await screen.findByText(
      'No submitted attendance records match these filters.',
    );
    expect(attendanceApi.history).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, pageSize: 10 }),
    );
  });
});
