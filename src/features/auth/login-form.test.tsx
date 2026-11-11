import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { LoginForm } from './login-form';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock('./auth-context', () => ({
  useAuth: () => ({ login: vi.fn() }),
}));

describe('LoginForm accessibility', () => {
  it('associates validation feedback with each invalid field', async () => {
    render(<LoginForm />);

    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    const email = screen.getByLabelText('Email');
    const password = screen.getByLabelText('Password');
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAccessibleDescription('Enter a valid email address.');
    expect(password).toHaveAttribute('aria-invalid', 'true');
    expect(password).toHaveAccessibleDescription(
      'Password must be at least 12 characters.',
    );
  });
});
