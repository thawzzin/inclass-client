import { apiClient, ensureCsrfToken } from '@/src/features/auth/auth.api';
import { normalizeApiError } from '@/src/lib/api/error';
import type { ApiSuccess, Enrollment } from '@/src/lib/api/types';

async function request<T>(action: () => Promise<{ data: ApiSuccess<T> }>): Promise<T> {
  try { return (await action()).data.data; } catch (error) { throw normalizeApiError(error); }
}

export const enrollmentsApi = {
  list: (sectionId: string) => request(() => apiClient.get<ApiSuccess<Enrollment[]>>(`/sections/${sectionId}/enrollments`)),
  enroll: async (sectionId: string, studentId: string) => { await ensureCsrfToken(); return request(() => apiClient.post<ApiSuccess<Enrollment>>(`/sections/${sectionId}/enrollments`, { studentId })); },
  bulkEnroll: async (sectionId: string, studentIds: string[]) => { await ensureCsrfToken(); return request(() => apiClient.post<ApiSuccess<{ count: number }>>(`/sections/${sectionId}/enrollments/bulk`, { studentIds })); },
  remove: async (sectionId: string, studentId: string) => { await ensureCsrfToken(); await request(() => apiClient.delete<ApiSuccess<Record<string, never>>>(`/sections/${sectionId}/enrollments/${studentId}`)); },
};
