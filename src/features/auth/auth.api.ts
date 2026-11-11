import { getApiBaseUrl, createApiClient } from '@/src/lib/api/client';
import { normalizeApiError } from '@/src/lib/api/error';
import type { ApiSuccess, User } from '@/src/lib/api/types';

import type {
  LoginValues,
  PasswordChangeValues,
  ProfileValues,
} from './schemas';

let csrfToken: string | null = null;
export const apiClient = createApiClient(getApiBaseUrl(), () => csrfToken);

export async function ensureCsrfToken(): Promise<void> {
  try {
    const response =
      await apiClient.get<ApiSuccess<{ csrfToken: string }>>('/auth/csrf');
    csrfToken = response.data.data.csrfToken;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

async function withCsrf<T>(request: () => Promise<T>): Promise<T> {
  if (!csrfToken) await ensureCsrfToken();
  return request();
}

async function userFrom<T extends { user: User }>(
  request: () => Promise<ApiSuccess<T>>,
): Promise<User> {
  try {
    return (await request()).data.user;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export const authApi = {
  me: () =>
    userFrom(() =>
      apiClient
        .get<ApiSuccess<{ user: User }>>('/auth/me')
        .then((response) => response.data),
    ),
  login: (input: LoginValues) =>
    withCsrf(() =>
      userFrom(() =>
        apiClient
          .post<ApiSuccess<{ user: User }>>('/auth/login', input)
          .then((response) => response.data),
      ),
    ),
  refresh: () =>
    withCsrf(() =>
      userFrom(() =>
        apiClient
          .post<ApiSuccess<{ user: User }>>('/auth/refresh')
          .then((response) => response.data),
      ),
    ),
  logout: () =>
    withCsrf(async () => {
      try {
        await apiClient.post('/auth/logout');
        csrfToken = null;
      } catch (error) {
        throw normalizeApiError(error);
      }
    }),
  updateProfile: (input: ProfileValues) =>
    withCsrf(() =>
      userFrom(() =>
        apiClient
          .patch<ApiSuccess<{ user: User }>>('/auth/profile', input)
          .then((response) => response.data),
      ),
    ),
  changePassword: (input: PasswordChangeValues) =>
    withCsrf(async () => {
      try {
        await apiClient.patch('/auth/password', input);
        csrfToken = null;
      } catch (error) {
        throw normalizeApiError(error);
      }
    }),
};
