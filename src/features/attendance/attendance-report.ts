import type { AttendanceStatus } from '@/src/lib/api/types';

export type AttendanceHistoryStatus = AttendanceStatus | '';
export type StudentAttendanceStatus = AttendanceStatus | 'UNMARKED' | '';

export interface AttendanceHistoryFilters {
  sectionId: string;
  dateFrom: string;
  dateTo: string;
  status: AttendanceHistoryStatus;
  page: number;
  pageSize: number;
}

export function buildAttendanceDateParams(dateFrom: string, dateTo: string) {
  return {
    ...(dateFrom ? { dateFrom } : {}),
    ...(dateTo ? { dateTo } : {}),
  };
}

export function buildAttendanceHistoryParams(filters: AttendanceHistoryFilters) {
  return {
    ...(filters.sectionId ? { sectionId: filters.sectionId } : {}),
    ...buildAttendanceDateParams(filters.dateFrom, filters.dateTo),
    ...(filters.status ? { status: filters.status } : {}),
    page: filters.page,
    pageSize: filters.pageSize,
  };
}

export function attendancePercentageLabel(value: number | null): string {
  return value === null ? '—' : `${value.toFixed(1)}%`;
}

export function attendanceStatusLabel(
  record: { status: AttendanceStatus } | null,
): AttendanceStatus | 'UNMARKED' {
  return record?.status ?? 'UNMARKED';
}

export function filterStudentAttendance<
  T extends { attendanceRecord: { status: AttendanceStatus } | null },
>(items: T[], status: StudentAttendanceStatus): T[] {
  if (!status) return items;
  return items.filter((item) => attendanceStatusLabel(item.attendanceRecord) === status);
}

export function isAttendanceDateRangeValid(dateFrom: string, dateTo: string): boolean {
  return !dateFrom || !dateTo || dateFrom <= dateTo;
}
