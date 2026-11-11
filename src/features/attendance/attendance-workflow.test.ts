import { describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/src/lib/api/error';
import type { AttendanceSession } from '@/src/lib/api/types';

import { openOrCreateSession, submitAttendanceChanges } from './attendance-workflow';

const session: AttendanceSession = {
  id: 'session-1',
  sectionId: 'section-1',
  date: '2026-11-11T00:00:00.000Z',
  createdById: 'teacher-1',
  createdAt: '2026-11-11T00:00:00.000Z',
  updatedAt: '2026-11-11T00:00:00.000Z',
};

describe('attendance workflow', () => {
  it('uses bulk create only for new records and individual updates for existing records', async () => {
    const createRecords = vi.fn().mockResolvedValue(undefined);
    const updateRecord = vi.fn().mockResolvedValue(undefined);
    const creates = [{ studentId: 'new', status: 'PRESENT' as const }];
    const updates = [{ studentId: 'existing', status: 'LATE' as const }];

    await expect(
      submitAttendanceChanges(creates, updates, { createRecords, updateRecord }),
    ).resolves.toEqual({ failedUpdates: 0 });
    expect(createRecords).toHaveBeenCalledWith(creates);
    expect(updateRecord).toHaveBeenCalledWith(updates[0]);
  });

  it('reports partial individual-update failures without retrying them as creates', async () => {
    const updateRecord = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('failed'));

    await expect(
      submitAttendanceChanges(
        [],
        [
          { studentId: 'one', status: 'PRESENT' },
          { studentId: 'two', status: 'ABSENT' },
        ],
        { createRecords: vi.fn(), updateRecord },
      ),
    ).resolves.toEqual({ failedUpdates: 1 });
  });

  it('refreshes and opens the existing session after a duplicate-date conflict', async () => {
    const create = vi.fn().mockRejectedValue(new ApiError('Duplicate', 409));
    const refresh = vi.fn().mockResolvedValue([session]);

    await expect(openOrCreateSession([], '2026-11-11', create, refresh)).resolves.toBe(session);
    expect(refresh).toHaveBeenCalledOnce();
  });
});
