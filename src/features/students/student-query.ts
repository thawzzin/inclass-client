import type { EntityStatus } from '@/src/lib/api/types';

export interface StudentQuery {
  page: number;
  pageSize: number;
  search: string;
  status?: EntityStatus;
}

export function toStudentQuery(
  query: StudentQuery,
): Omit<StudentQuery, 'search'> & { search?: string } {
  const search = query.search.trim();
  return {
    page: query.page,
    pageSize: query.pageSize,
    ...(search ? { search } : {}),
    ...(query.status ? { status: query.status } : {}),
  };
}
