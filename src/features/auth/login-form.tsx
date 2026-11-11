'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { ApiError } from '@/src/lib/api/error';

import { useAuth } from './auth-context';
import { loginSchema, type LoginValues } from './schemas';

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function submit(values: LoginValues) {
    try {
      await login(values);
      toast.success('Signed in successfully.');
      router.replace('/dashboard');
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : 'Unable to sign in.',
      );
    }
  }

  return (
    <form onSubmit={form.handleSubmit(submit)} className="space-y-5" noValidate>
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(form.formState.errors.email)}
          aria-describedby={
            form.formState.errors.email ? 'email-error' : undefined
          }
          {...form.register('email')}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-50"
        />
        {form.formState.errors.email && (
          <p id="email-error" className="text-sm text-red-600">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(form.formState.errors.password)}
          aria-describedby={
            form.formState.errors.password ? 'password-error' : undefined
          }
          {...form.register('password')}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-50"
        />
        {form.formState.errors.password && (
          <p id="password-error" className="text-sm text-red-600">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="w-full rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950"
      >
        {form.formState.isSubmitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
