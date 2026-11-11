import { describe, expect, it } from 'vitest';

import {
  attendancePercentageLabel,
  attendanceStatusLabel,
  buildAttendanceDateParams,
  buildAttendanceHistoryParams,
  filterStudentAttendance,
  isAttendanceDateRangeValid,
} from './attendance-report';

describe('attendance report contract', () => {
  it('omits empty optional filters while retaining pagination', () => {
    expect(
      buildAttendanceHistoryParams({
        sectionId: '',
        dateFrom: '',
        dateTo: '2026-11-11',
        status: '',
        page: 2,
        pageSize: 20,
      }),
    ).toEqual({ dateTo: '2026-11-11', page: 2, pageSize: 20 });
  });

  it('does not send empty date strings to date-filtered endpoints', () => {
    expect(buildAttendanceDateParams('', '2026-11-11')).toEqual({ dateTo: '2026-11-11' });
  });

  it('formats backend percentages without recalculating unmarked students', () => {
    expect(attendancePercentageLabel(87.456)).toBe('87.5%');
    expect(attendancePercentageLabel(null)).toBe('—');
  });

  it('derives UNMARKED only when an attendance record is missing', () => {
    expect(attendanceStatusLabel({ status: 'LATE' })).toBe('LATE');
    expect(attendanceStatusLabel(null)).toBe('UNMARKED');
  });

  it('filters student history including derived UNMARKED entries', () => {
    const items = [
      { id: 'marked', attendanceRecord: { status: 'PRESENT' as const } },
      { id: 'unmarked', attendanceRecord: null },
    ];

    expect(filterStudentAttendance(items, 'UNMARKED')).toEqual([items[1]]);
    expect(filterStudentAttendance(items, '')).toEqual(items);
  });

  it('rejects a date range whose start is after its end', () => {
    expect(isAttendanceDateRangeValid('2026-11-12', '2026-11-11')).toBe(false);
    expect(isAttendanceDateRangeValid('', '2026-11-11')).toBe(true);
  });
});
