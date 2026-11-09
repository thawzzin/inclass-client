import { apiClient, ensureCsrfToken } from '@/src/features/auth/auth.api';
import { normalizeApiError } from '@/src/lib/api/error';
import type { ApiSuccess, EntityStatus, PaginatedResponse, Section, Teacher } from '@/src/lib/api/types';

import type { CreateTeacherValues, TeacherListQuery, UpdateTeacherValues } from './teacher-contract';

async function request<T>(action: () => Promise<{ data: ApiSuccess<T> }>): Promise<T> {
  try {
    return (await action()).data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export const teachersApi = {
  list: (params: Partial<TeacherListQuery>) =>
    request(() => apiClient.get<ApiSuccess<PaginatedResponse<Teacher>>>('/users', { params })),
  detail: (id: string) => request(() => apiClient.get<ApiSuccess<Teacher>>(`/users/${id}`)),
  assignedSections: async (teacherId: string) => {
    const sections = await request(() => apiClient.get<ApiSuccess<Section[]>>('/sections'));
    return sections.filter((section) => section.teacherId === teacherId);
  },
  create: async (input: CreateTeacherValues) => {
    await ensureCsrfToken();
    return request(() => apiClient.post<ApiSuccess<Teacher>>('/users', input));
  },
  update: async (id: string, input: UpdateTeacherValues) => {
    await ensureCsrfToken();
    return request(() => apiClient.patch<ApiSuccess<Teacher>>(`/users/${id}`, input));
  },
  setStatus: async (id: string, status: EntityStatus) => {
    await ensureCsrfToken();
    return request(() => apiClient.patch<ApiSuccess<Teacher>>(`/users/${id}/status`, { status }));
  },
  changePassword: async (id: string, password: string) => {
    await ensureCsrfToken();
    await request(() => apiClient.patch<ApiSuccess<Record<string, never>>>(`/users/${id}/password`, { password }));
  },
};
