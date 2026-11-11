import { describe, expect, it } from 'vitest';

import type { AttendanceRosterEntry } from '@/src/lib/api/types';

import {
  attendanceSummary,
  createAttendanceDraft,
  findSessionForDate,
  markAllUnmarkedPresent,
  partitionAttendanceChanges,
} from './attendance-state';

function rosterEntry(
  studentId: string,
  status: 'PRESENT' | 'ABSENT' | 'LATE' | null,
): AttendanceRosterEntry {
  return {
    id: `roster-${studentId}`,
    attendanceSessionId: 'session-1',
    studentId,
    student: {
      id: studentId,
      studentId: `S-${studentId}`,
      fullName: `Student ${studentId}`,
      nickname: null,
      status: 'ACTIVE',
      createdAt: '2026-11-11T00:00:00.000Z',
      updatedAt: '2026-11-11T00:00:00.000Z',
    },
    attendanceRecord: status
      ? {
          id: `record-${studentId}`,
          attendanceSessionId: 'session-1',
          studentId,
          status,
          createdAt: '2026-11-11T00:00:00.000Z',
          updatedAt: '2026-11-11T00:00:00.000Z',
        }
      : null,
  };
}

describe('attendance state', () => {
  const roster = [
    rosterEntry('one', 'ABSENT'),
    rosterEntry('two', null),
    rosterEntry('three', 'LATE'),
    rosterEntry('four', null),
  ];

  it('derives existing statuses and leaves students without records unmarked', () => {
    expect(createAttendanceDraft(roster)).toEqual({
      one: 'ABSENT',
      two: undefined,
      three: 'LATE',
      four: undefined,
    });
  });

  it('marks only unmarked students present', () => {
    const draft = { ...createAttendanceDraft(roster), two: 'ABSENT' as const };

    expect(markAllUnmarkedPresent(draft)).toEqual({
      one: 'ABSENT',
      two: 'ABSENT',
      three: 'LATE',
      four: 'PRESENT',
    });
  });

  it('counts statuses and derives the unmarked total', () => {
    expect(attendanceSummary(createAttendanceDraft(roster))).toEqual({
      present: 0,
      absent: 1,
      late: 1,
      unmarked: 2,
      marked: 2,
      total: 4,
    });
  });

  it('partitions new records from changed existing records', () => {
    const draft = {
      ...createAttendanceDraft(roster),
      one: 'PRESENT' as const,
      two: 'ABSENT' as const,
    };

    expect(partitionAttendanceChanges(roster, draft)).toEqual({
      creates: [{ studentId: 'two', status: 'ABSENT' }],
      updates: [{ studentId: 'one', status: 'PRESENT' }],
    });
  });

  it('finds the existing calendar-date session from an ISO timestamp', () => {
    expect(
      findSessionForDate(
        [
          {
            id: 'session-1',
            sectionId: 'section-1',
            date: '2026-11-11T00:00:00.000Z',
            createdById: 'teacher-1',
            createdAt: '2026-11-11T00:00:00.000Z',
            updatedAt: '2026-11-11T00:00:00.000Z',
          },
        ],
        '2026-11-11',
      )?.id,
    ).toBe('session-1');
  });
});
