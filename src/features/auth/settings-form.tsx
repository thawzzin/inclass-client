'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { ApiError } from '@/src/lib/api/error';

import { authApi } from './auth.api';
import { useAuth } from './auth-context';
import { passwordChangeSchema, profileSchema, type PasswordChangeValues, type ProfileValues } from './schemas';

export function SettingsForm() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const profile = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '', email: user?.email ?? '' },
  });
  const password = useForm<PasswordChangeValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: { currentPassword: '', newPassword: '' },
  });

  async function saveProfile(values: ProfileValues) {
    try {
      setUser(await authApi.updateProfile(values));
      toast.success('Profile updated.');
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Unable to update profile.');
    }
  }

  async function changePassword(values: PasswordChangeValues) {
    try {
      await authApi.changePassword(values);
      setUser(null);
      toast.success('Password changed. Please sign in again.');
      router.replace('/login');
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Unable to change password.');
    }
  }

  return (
    <div className="grid max-w-2xl gap-8">
      <form onSubmit={profile.handleSubmit(saveProfile)} className="space-y-4 rounded-lg border border-zinc-200 p-5 dark:border-zinc-800">
        <div><h2 className="font-semibold">Profile</h2><p className="mt-1 text-sm text-zinc-500">Update your name or email address.</p></div>
        <label className="grid gap-2 text-sm font-medium">Name<input {...profile.register('name')} className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700" /></label>
        <label className="grid gap-2 text-sm font-medium">Email<input type="email" {...profile.register('email')} className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700" /></label>
        <button type="submit" disabled={profile.formState.isSubmitting} className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950">Save profile</button>
      </form>
      <form onSubmit={password.handleSubmit(changePassword)} className="space-y-4 rounded-lg border border-zinc-200 p-5 dark:border-zinc-800">
        <div><h2 className="font-semibold">Change password</h2><p className="mt-1 text-sm text-zinc-500">You will need to sign in again after changing your password.</p></div>
        <label className="grid gap-2 text-sm font-medium">Current password<input type="password" autoComplete="current-password" {...password.register('currentPassword')} className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700" /></label>
        <label className="grid gap-2 text-sm font-medium">New password<input type="password" autoComplete="new-password" {...password.register('newPassword')} className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700" /></label>
        <button type="submit" disabled={password.formState.isSubmitting} className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:hover:bg-zinc-800">Change password</button>
      </form>
    </div>
  );
}
