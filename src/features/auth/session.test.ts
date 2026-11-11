import { ApiError } from '@/src/lib/api/error';
import type { User } from '@/src/lib/api/types';

import { restoreSession, type SessionApi } from './session';

const teacher: User = {
  id: 'teacher-id',
  name: 'Ari Teacher',
  email: 'ari@example.edu',
  role: 'TEACHER',
  status: 'ACTIVE',
};

describe('restoreSession', () => {
  it('returns the current user when the access session is valid', async () => {
    const api: SessionApi = {
      me: vi.fn().mockResolvedValue(teacher),
      refresh: vi.fn(),
    };

    await expect(restoreSession(api)).resolves.toEqual(teacher);
    expect(api.refresh).not.toHaveBeenCalled();
  });

  it('refreshes once after an expired access session', async () => {
    const api: SessionApi = {
      me: vi
        .fn()
        .mockRejectedValue(new ApiError('Authentication is required', 401)),
      refresh: vi.fn().mockResolvedValue(teacher),
    };

    await expect(restoreSession(api)).resolves.toEqual(teacher);
    expect(api.refresh).toHaveBeenCalledTimes(1);
  });

  it('returns no session when refresh is rejected', async () => {
    const api: SessionApi = {
      me: vi
        .fn()
        .mockRejectedValue(new ApiError('Authentication is required', 401)),
      refresh: vi
        .fn()
        .mockRejectedValue(new ApiError('Refresh session is required', 401)),
    };

    await expect(restoreSession(api)).resolves.toBeNull();
    expect(api.refresh).toHaveBeenCalledTimes(1);
  });
});
