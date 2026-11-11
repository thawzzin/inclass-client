import { z } from 'zod';

import type { EntityStatus } from '@/src/lib/api/types';

const name = z.string().trim().min(1, 'Name is required.').max(120);
const email = z.string().trim().email('Enter a valid email address.').max(320);
const password = z
  .string()
  .min(12, 'Password must be at least 12 characters.')
  .max(128);

export const createTeacherSchema = z.object({ name, email, password });
export const updateTeacherSchema = z.object({ name, email });
export const teacherPasswordSchema = z
  .object({ newPassword: password, confirmPassword: password })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type CreateTeacherValues = z.infer<typeof createTeacherSchema>;
export type UpdateTeacherValues = z.infer<typeof updateTeacherSchema>;
export type TeacherPasswordValues = z.infer<typeof teacherPasswordSchema>;

export interface TeacherListQuery {
  page: number;
  pageSize: number;
  search: string;
  status?: EntityStatus;
}

export function teacherListParams(query: TeacherListQuery) {
  const search = query.search.trim();
  return {
    page: query.page,
    pageSize: query.pageSize,
    ...(search ? { search } : {}),
    ...(query.status ? { status: query.status } : {}),
  };
}
