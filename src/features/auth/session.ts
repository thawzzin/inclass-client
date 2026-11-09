import { ApiError } from '@/src/lib/api/error';
import type { User } from '@/src/lib/api/types';

export interface SessionApi {
  me(): Promise<User>;
  refresh(): Promise<User>;
}

export async function restoreSession(api: SessionApi): Promise<User | null> {
  try {
    return await api.me();
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error;
  }

  try {
    return await api.refresh();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}
