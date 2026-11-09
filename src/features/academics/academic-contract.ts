import { z } from 'zod';

export const courseSchema = z.object({
  code: z.string().trim().min(1, 'Course code is required.').max(32),
  name: z.string().trim().min(1, 'Course name is required.').max(120),
});

export const sectionSchema = z.object({
  courseId: z.string().uuid('Select a course.'),
  sectionCode: z.string().trim().min(1, 'Section code is required.').max(32),
  teacherId: z.string().uuid('Select a teacher.'),
});

export type CourseValues = z.infer<typeof courseSchema>;
export type SectionValues = z.infer<typeof sectionSchema>;
