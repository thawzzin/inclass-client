import { apiClient, ensureCsrfToken } from '@/src/features/auth/auth.api';
import { normalizeApiError } from '@/src/lib/api/error';
import type { ApiSuccess, Course, EntityStatus, Section } from '@/src/lib/api/types';

import type { CourseValues, SectionValues } from './academic-contract';

async function request<T>(action: () => Promise<{ data: ApiSuccess<T> }>): Promise<T> {
  try { return (await action()).data.data; } catch (error) { throw normalizeApiError(error); }
}

export const academicsApi = {
  courses: () => request(() => apiClient.get<ApiSuccess<Course[]>>('/courses')),
  course: (id: string) => request(() => apiClient.get<ApiSuccess<Course>>(`/courses/${id}`)),
  createCourse: async (input: CourseValues) => { await ensureCsrfToken(); return request(() => apiClient.post<ApiSuccess<Course>>('/courses', input)); },
  updateCourse: async (id: string, input: CourseValues) => { await ensureCsrfToken(); return request(() => apiClient.patch<ApiSuccess<Course>>(`/courses/${id}`, input)); },
  setCourseStatus: async (id: string, status: EntityStatus) => { await ensureCsrfToken(); return request(() => apiClient.patch<ApiSuccess<Course>>(`/courses/${id}/status`, { status })); },
  sections: () => request(() => apiClient.get<ApiSuccess<Section[]>>('/sections')),
  section: (id: string) => request(() => apiClient.get<ApiSuccess<Section>>(`/sections/${id}`)),
  createSection: async (input: SectionValues) => { await ensureCsrfToken(); return request(() => apiClient.post<ApiSuccess<Section>>('/sections', input)); },
  updateSection: async (id: string, sectionCode: string) => { await ensureCsrfToken(); return request(() => apiClient.patch<ApiSuccess<Section>>(`/sections/${id}`, { sectionCode })); },
  setSectionStatus: async (id: string, status: EntityStatus) => { await ensureCsrfToken(); return request(() => apiClient.patch<ApiSuccess<Section>>(`/sections/${id}/status`, { status })); },
  assignTeacher: async (id: string, teacherId: string) => { await ensureCsrfToken(); return request(() => apiClient.patch<ApiSuccess<Section>>(`/sections/${id}/teacher`, { teacherId })); },
};
