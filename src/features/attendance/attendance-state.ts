import type {
  AttendanceRosterEntry,
  AttendanceSession,
  AttendanceStatus,
} from '@/src/lib/api/types';

export type AttendanceDraft = Record<string, AttendanceStatus | undefined>;

export interface AttendanceRecordChange {
  studentId: string;
  status: AttendanceStatus;
}

export function createAttendanceDraft(roster: AttendanceRosterEntry[]): AttendanceDraft {
  return Object.fromEntries(
    roster.map((entry) => [entry.studentId, entry.attendanceRecord?.status]),
  );
}

export function markAllUnmarkedPresent(draft: AttendanceDraft): AttendanceDraft {
  return Object.fromEntries(
    Object.entries(draft).map(([studentId, status]) => [
      studentId,
      status ?? 'PRESENT',
    ]),
  );
}

export function attendanceSummary(draft: AttendanceDraft) {
  const statuses = Object.values(draft);
  const present = statuses.filter((status) => status === 'PRESENT').length;
  const absent = statuses.filter((status) => status === 'ABSENT').length;
  const late = statuses.filter((status) => status === 'LATE').length;
  const marked = present + absent + late;

  return {
    present,
    absent,
    late,
    unmarked: statuses.length - marked,
    marked,
    total: statuses.length,
  };
}

export function partitionAttendanceChanges(
  roster: AttendanceRosterEntry[],
  draft: AttendanceDraft,
): { creates: AttendanceRecordChange[]; updates: AttendanceRecordChange[] } {
  const creates: AttendanceRecordChange[] = [];
  const updates: AttendanceRecordChange[] = [];

  for (const entry of roster) {
    const status = draft[entry.studentId];
    if (!status) continue;

    if (!entry.attendanceRecord) creates.push({ studentId: entry.studentId, status });
    else if (entry.attendanceRecord.status !== status) {
      updates.push({ studentId: entry.studentId, status });
    }
  }

  return { creates, updates };
}

export function findSessionForDate(
  sessions: AttendanceSession[],
  date: string,
): AttendanceSession | undefined {
  return sessions.find((session) => session.date.slice(0, 10) === date);
}
