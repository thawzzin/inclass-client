'use client';

import { Label } from '@/src/components/ui/label';

import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { ApiError } from '@/src/lib/api/error';
import type { Teacher } from '@/src/lib/api/types';

import {
  createTeacherSchema,
  teacherPasswordSchema,
  updateTeacherSchema,
  type CreateTeacherValues,
  type TeacherPasswordValues,
  type UpdateTeacherValues,
} from './teacher-contract';
import { teachersApi } from './teachers.api';

const fieldClass =
  'rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700';

export function TeacherForm({
  teacher,
  onClose,
  onSaved,
}: {
  teacher?: Teacher;
  onClose(): void;
  onSaved(): void;
}) {
  const form = useForm<CreateTeacherValues | UpdateTeacherValues>({
    resolver: zodResolver(teacher ? updateTeacherSchema : createTeacherSchema),
    defaultValues: teacher
      ? { name: teacher.name, email: teacher.email }
      : { name: '', email: '', password: '' },
  });

  async function submit(values: CreateTeacherValues | UpdateTeacherValues) {
    try {
      if (teacher)
        await teachersApi.update(teacher.id, values as UpdateTeacherValues);
      else await teachersApi.create(values as CreateTeacherValues);
      toast.success(teacher ? 'Teacher updated.' : 'Teacher created.');
      onSaved();
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : 'Unable to save teacher.',
      );
    }
  }

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(submit)}
      className="grid gap-4 rounded-lg border border-zinc-200 p-5 dark:border-zinc-800"
    >
      <h2 className="font-semibold">
        {teacher ? 'Edit teacher' : 'Add teacher'}
      </h2>
      <Label className="grid gap-2 text-sm font-medium">
        Name
        <Input className={fieldClass} {...form.register('name')} />
        {form.formState.errors.name && (
          <span className="text-red-600">
            {form.formState.errors.name.message}
          </span>
        )}
      </Label>
      <Label className="grid gap-2 text-sm font-medium">
        Email
        <Input
          type="email"
          className={fieldClass}
          {...form.register('email')}
        />
        {form.formState.errors.email && (
          <span className="text-red-600">
            {form.formState.errors.email.message}
          </span>
        )}
      </Label>
      {!teacher && (
        <Label className="grid gap-2 text-sm font-medium">
          Password
          <Input
            type="password"
            autoComplete="new-password"
            className={fieldClass}
            {...form.register('password')}
          />
          {'password' in form.formState.errors && (
            <span className="text-red-600">
              {form.formState.errors.password?.message}
            </span>
          )}
        </Label>
      )}
      <div className="flex gap-2">
        <Button
          disabled={form.formState.isSubmitting}
          className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950"
        >
          Save
        </Button>
        <Button
          type="button"
          onClick={onClose}
          variant="outline"
          className="rounded-md border px-4 py-2 text-sm"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function TeacherPasswordForm({
  teacher,
  onClose,
}: {
  teacher: Teacher;
  onClose(): void;
}) {
  const form = useForm<TeacherPasswordValues>({
    resolver: zodResolver(teacherPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });
  async function submit(values: TeacherPasswordValues) {
    try {
      await teachersApi.changePassword(teacher.id, values.newPassword);
      toast.success('Teacher password changed and active sessions revoked.');
      onClose();
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : 'Unable to change password.',
      );
    }
  }
  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(submit)}
      className="grid gap-4 rounded-lg border border-zinc-200 p-5 dark:border-zinc-800"
    >
      <div>
        <h2 className="font-semibold">Change password</h2>
        <p className="text-sm text-zinc-500">
          Set a new password for {teacher.name}.
        </p>
      </div>
      <Label className="grid gap-2 text-sm font-medium">
        New password
        <Input
          type="password"
          autoComplete="new-password"
          className={fieldClass}
          {...form.register('newPassword')}
        />
      </Label>
      <Label className="grid gap-2 text-sm font-medium">
        Confirm password
        <Input
          type="password"
          autoComplete="new-password"
          className={fieldClass}
          {...form.register('confirmPassword')}
        />
        {form.formState.errors.confirmPassword && (
          <span className="text-red-600">
            {form.formState.errors.confirmPassword.message}
          </span>
        )}
      </Label>
      <div className="flex gap-2">
        <Button
          disabled={form.formState.isSubmitting}
          className="rounded-md bg-zinc-950 px-4 py-2 text-sm text-white dark:bg-zinc-50 dark:text-zinc-950"
        >
          Change password
        </Button>
        <Button
          type="button"
          onClick={onClose}
          variant="outline"
          className="rounded-md border px-4 py-2 text-sm"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
