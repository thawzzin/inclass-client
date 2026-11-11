import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { User } from '@/src/lib/api/types';

import { authApi } from './auth.api';
import { AuthProvider, useAuth } from './auth-context';
import { restoreSession } from './session';

vi.mock('./auth.api', () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn(),
  },
}));

vi.mock('./session', () => ({
  restoreSession: vi.fn(),
}));

const admin: User = {
  id: 'admin-1',
  name: 'Admin User',
  email: 'admin@example.edu',
  role: 'ADMIN',
  status: 'ACTIVE',
};

const teacher: User = {
  id: 'teacher-1',
  name: 'Teacher User',
  email: 'teacher@example.edu',
  role: 'TEACHER',
  status: 'ACTIVE',
};

function SessionControls() {
  const { login, logout, setUser, status, user } = useAuth();

  return (
    <div>
      <p>{status}</p>
      <p>{user?.email ?? 'No user'}</p>
      <button type="button" onClick={() => void logout()}>
        Log out
      </button>
      <button
        type="button"
        onClick={() =>
          void login({ email: teacher.email, password: 'valid-password' })
        }
      >
        Log in
      </button>
      <button type="button" onClick={() => setUser(null)}>
        Clear session
      </button>
    </div>
  );
}

function renderAuth(
  queryClient: QueryClient,
  children: ReactNode = <SessionControls />,
) {
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>,
  );
}

describe('AuthProvider session boundaries', () => {
  beforeEach(() => {
    vi.mocked(authApi.login).mockReset();
    vi.mocked(authApi.logout).mockReset();
    vi.mocked(restoreSession).mockReset();
  });

  it('removes cached account data when the user logs out', async () => {
    vi.mocked(restoreSession).mockResolvedValue(admin);
    vi.mocked(authApi.logout).mockResolvedValue(undefined);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    queryClient.setQueryData(['students'], [{ id: 'student-1' }]);
    renderAuth(queryClient);

    expect(await screen.findByText(admin.email)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Log out' }));

    expect(await screen.findByText('unauthenticated')).toBeInTheDocument();
    expect(screen.getByText('No user')).toBeInTheDocument();
    expect(queryClient.getQueryData(['students'])).toBeUndefined();
  });

  it('removes cached data from a previous account when a user logs in', async () => {
    vi.mocked(restoreSession).mockResolvedValue(null);
    vi.mocked(authApi.login).mockResolvedValue(teacher);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    queryClient.setQueryData(
      ['teachers'],
      [{ id: 'teacher-from-old-session' }],
    );
    renderAuth(queryClient);

    expect(await screen.findByText('unauthenticated')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }));

    expect(await screen.findByText(teacher.email)).toBeInTheDocument();
    expect(screen.getByText('authenticated')).toBeInTheDocument();
    expect(queryClient.getQueryData(['teachers'])).toBeUndefined();
  });

  it('synchronizes the auth status and cache when the session is cleared directly', async () => {
    vi.mocked(restoreSession).mockResolvedValue(admin);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    queryClient.setQueryData(['courses'], [{ id: 'course-1' }]);
    renderAuth(queryClient);

    expect(await screen.findByText(admin.email)).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Clear session' }),
    );

    expect(screen.getByText('unauthenticated')).toBeInTheDocument();
    expect(screen.getByText('No user')).toBeInTheDocument();
    expect(queryClient.getQueryData(['courses'])).toBeUndefined();
  });
});
