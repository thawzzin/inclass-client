import { ApiError } from '@/src/lib/api/error';
import type { AttendanceSession } from '@/src/lib/api/types';

import type { AttendanceRecordChange } from './attendance-state';
import { findSessionForDate } from './attendance-state';

interface AttendanceSubmissionApi {
  createRecords: (records: AttendanceRecordChange[]) => Promise<unknown>;
  updateRecord: (record: AttendanceRecordChange) => Promise<unknown>;
}

export async function submitAttendanceChanges(
  creates: AttendanceRecordChange[],
  updates: AttendanceRecordChange[],
  api: AttendanceSubmissionApi,
): Promise<{ failedUpdates: number }> {
  if (creates.length) await api.createRecords(creates);
  const results = await Promise.allSettled(
    updates.map((record) => api.updateRecord(record)),
  );
  return {
    failedUpdates: results.filter((result) => result.status === 'rejected').length,
  };
}

export async function openOrCreateSession(
  sessions: AttendanceSession[],
  date: string,
  create: () => Promise<AttendanceSession>,
  refresh: () => Promise<AttendanceSession[]>,
): Promise<AttendanceSession> {
  const existing = findSessionForDate(sessions, date);
  if (existing) return existing;

  try {
    return await create();
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 409) throw error;
    const duplicate = findSessionForDate(await refresh(), date);
    if (!duplicate) throw error;
    return duplicate;
  }
}
