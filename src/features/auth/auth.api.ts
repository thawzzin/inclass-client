import { getApiBaseUrl, createApiClient } from '@/src/lib/api/client';
import { normalizeApiError } from '@/src/lib/api/error';
import type { ApiSuccess, User } from '@/src/lib/api/types';

import type { LoginValues, PasswordChangeValues, ProfileValues } from './schemas';

let csrfToken: string | null = null;
const api = createApiClient(getApiBaseUrl(), () => csrfToken);

async function requestCsrfToken(): Promise<void> {
  try {
    const response = await api.get<ApiSuccess<{ csrfToken: string }>>('/auth/csrf');
    csrfToken = response.data.data.csrfToken;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

async function withCsrf<T>(request: () => Promise<T>): Promise<T> {
  if (!csrfToken) await requestCsrfToken();
  return request();
}

async function userFrom<T extends { user: User }>(request: () => Promise<ApiSuccess<T>>): Promise<User> {
  try {
    return (await request()).data.user;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export const authApi = {
  me: () => userFrom(() => api.get<ApiSuccess<{ user: User }>>('/auth/me').then((response) => response.data)),
  login: (input: LoginValues) =>
    withCsrf(() => userFrom(() => api.post<ApiSuccess<{ user: User }>>('/auth/login', input).then((response) => response.data))),
  refresh: () =>
    withCsrf(() => userFrom(() => api.post<ApiSuccess<{ user: User }>>('/auth/refresh').then((response) => response.data))),
  logout: () =>
    withCsrf(async () => {
      try {
        await api.post('/auth/logout');
        csrfToken = null;
      } catch (error) {
        throw normalizeApiError(error);
      }
    }),
  updateProfile: (input: ProfileValues) =>
    withCsrf(() => userFrom(() => api.patch<ApiSuccess<{ user: User }>>('/auth/profile', input).then((response) => response.data))),
  changePassword: (input: PasswordChangeValues) =>
    withCsrf(async () => {
      try {
        await api.patch('/auth/password', input);
        csrfToken = null;
      } catch (error) {
        throw normalizeApiError(error);
      }
    }),
};
