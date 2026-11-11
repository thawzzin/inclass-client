import { apiClient } from '@/src/features/auth/auth.api';
import { normalizeApiError } from '@/src/lib/api/error';
import type {
  AdminDashboardSummary,
  ApiSuccess,
  AttendanceStatistics,
  DashboardRecentAttendance,
  TeacherDashboardSummary,
} from '@/src/lib/api/types';

async function request<T>(action: () => Promise<{ data: ApiSuccess<T> }>): Promise<T> {
  try {
    return (await action()).data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export const dashboardApi = {
  summary: () =>
    request(() =>
      apiClient.get<ApiSuccess<AdminDashboardSummary | TeacherDashboardSummary>>(
        '/dashboard/summary',
      ),
    ),
  attendanceStatistics: () =>
    request(() =>
      apiClient.get<ApiSuccess<AttendanceStatistics>>('/dashboard/attendance-stats'),
    ),
  recentAttendance: () =>
    request(() =>
      apiClient.get<ApiSuccess<DashboardRecentAttendance[]>>(
        '/dashboard/recent-attendance',
      ),
    ),
};
