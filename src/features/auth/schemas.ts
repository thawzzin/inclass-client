import { z } from 'zod';

const password = z
  .string()
  .min(12, 'Password must be at least 12 characters.')
  .max(128);

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.').max(320),
  password,
});

export const profileSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  email: z
    .string()
    .trim()
    .email('Enter a valid email address.')
    .max(320)
    .optional(),
});

export const passwordChangeSchema = z.object({
  currentPassword: password,
  newPassword: password,
});

export type LoginValues = z.infer<typeof loginSchema>;
export type ProfileValues = z.infer<typeof profileSchema>;
export type PasswordChangeValues = z.infer<typeof passwordChangeSchema>;
