import { apiClient, ensureCsrfToken } from '@/src/features/auth/auth.api';
import { normalizeApiError } from '@/src/lib/api/error';
import type {
  ApiSuccess,
  AttendanceSession,
  AttendanceSessionDetail,
  AttendanceHistoryRecord,
  AttendanceStatistics,
  AttendanceStatus,
  PaginatedResponse,
} from '@/src/lib/api/types';

import { buildAttendanceDateParams, buildAttendanceHistoryParams, type AttendanceHistoryFilters } from './attendance-report';
import type { AttendanceRecordChange } from './attendance-state';

async function request<T>(action: () => Promise<{ data: ApiSuccess<T> }>): Promise<T> {
  try {
    return (await action()).data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export const attendanceApi = {
  sessions: (sectionId: string) =>
    request(() =>
      apiClient.get<ApiSuccess<AttendanceSession[]>>(
        `/sections/${sectionId}/attendance-sessions`,
      ),
    ),
  createSession: async (sectionId: string, date: string) => {
    await ensureCsrfToken();
    return request(() =>
      apiClient.post<ApiSuccess<AttendanceSession>>(
        `/sections/${sectionId}/attendance-sessions`,
        { date },
      ),
    );
  },
  session: (id: string) =>
    request(() =>
      apiClient.get<ApiSuccess<AttendanceSessionDetail>>(`/attendance-sessions/${id}`),
    ),
  createRecords: async (id: string, records: AttendanceRecordChange[]) => {
    await ensureCsrfToken();
    return request(() =>
      apiClient.post<ApiSuccess<AttendanceSessionDetail>>(
        `/attendance-sessions/${id}/records/bulk`,
        { records },
      ),
    );
  },
  updateRecord: async (id: string, studentId: string, status: AttendanceStatus) => {
    await ensureCsrfToken();
    await request(() =>
      apiClient.patch<ApiSuccess<Record<string, never>>>(
        `/attendance-sessions/${id}/records/${studentId}`,
        { status },
      ),
    );
  },
  history: (filters: AttendanceHistoryFilters) =>
    request(() =>
      apiClient.get<ApiSuccess<PaginatedResponse<AttendanceHistoryRecord>>>(
        '/attendance-records',
        { params: buildAttendanceHistoryParams(filters) },
      ),
    ),
  statistics: (sectionId: string, filters: Pick<AttendanceHistoryFilters, 'dateFrom' | 'dateTo'>) =>
    request(() =>
      apiClient.get<ApiSuccess<AttendanceStatistics>>(
        `/sections/${sectionId}/attendance-statistics`,
        {
          params: buildAttendanceDateParams(filters.dateFrom, filters.dateTo),
        },
      ),
    ),
  exportCsv: async (filters: AttendanceHistoryFilters) => {
    try {
      const response = await apiClient.get<Blob>('/attendance-records', {
        params: { ...buildAttendanceHistoryParams(filters), format: 'csv' },
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
};
