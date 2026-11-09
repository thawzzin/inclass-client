import { ensureCsrfToken, apiClient } from '@/src/features/auth/auth.api';
import { normalizeApiError } from '@/src/lib/api/error';
import type { ApiSuccess, EntityStatus, PaginatedResponse, Student } from '@/src/lib/api/types';

import type { StudentQuery } from './student-query';

async function request<T>(action: () => Promise<{ data: ApiSuccess<T> }>): Promise<T> {
  try { return (await action()).data.data; } catch (error) { throw normalizeApiError(error); }
}

export const studentsApi = {
  list: (params: Partial<StudentQuery>) => request(() => apiClient.get<ApiSuccess<PaginatedResponse<Student>>>('/students', { params })),
  create: async (input: Pick<Student, 'studentId' | 'fullName' | 'nickname'>) => { await ensureCsrfToken(); return request(() => apiClient.post<ApiSuccess<Student>>('/students', input)); },
  update: async (id: string, input: Pick<Student, 'studentId' | 'fullName' | 'nickname'>) => { await ensureCsrfToken(); return request(() => apiClient.patch<ApiSuccess<Student>>(`/students/${id}`, input)); },
  setStatus: async (id: string, status: EntityStatus) => { await ensureCsrfToken(); return request(() => apiClient.patch<ApiSuccess<Student>>(`/students/${id}/status`, { status })); },
};
