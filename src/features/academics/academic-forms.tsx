'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { ApiError } from '@/src/lib/api/error';
import type { Course, Section, Teacher } from '@/src/lib/api/types';

import { courseSchema, sectionSchema, type CourseValues, type SectionValues } from './academic-contract';
import { academicsApi } from './academics.api';

const fieldClass = 'rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700';

export function CourseForm({ course, onClose, onSaved }: { course?: Course; onClose(): void; onSaved(): void }) {
  const form = useForm<CourseValues>({ resolver: zodResolver(courseSchema), defaultValues: { code: course?.code ?? '', name: course?.name ?? '' } });
  async function submit(values: CourseValues) {
    try { if (course) await academicsApi.updateCourse(course.id, values); else await academicsApi.createCourse(values); toast.success(course ? 'Course updated.' : 'Course created.'); onSaved(); }
    catch (error) { toast.error(error instanceof ApiError ? error.message : 'Unable to save course.'); }
  }
  return <form onSubmit={form.handleSubmit(submit)} className="grid gap-4 rounded-lg border border-zinc-200 p-5 dark:border-zinc-800"><h2 className="font-semibold">{course ? 'Edit course' : 'Add course'}</h2><label className="grid gap-2 text-sm font-medium">Course code<input className={fieldClass} {...form.register('code')} />{form.formState.errors.code && <span className="text-red-600">{form.formState.errors.code.message}</span>}</label><label className="grid gap-2 text-sm font-medium">Course name<input className={fieldClass} {...form.register('name')} />{form.formState.errors.name && <span className="text-red-600">{form.formState.errors.name.message}</span>}</label><div className="flex gap-2"><button disabled={form.formState.isSubmitting} className="rounded-md bg-zinc-950 px-4 py-2 text-sm text-white dark:bg-zinc-50 dark:text-zinc-950">Save</button><button type="button" onClick={onClose} className="rounded-md border px-4 py-2 text-sm">Cancel</button></div></form>;
}

export function SectionForm({ section, courses, teachers, onClose, onSaved }: { section?: Section; courses: Course[]; teachers: Teacher[]; onClose(): void; onSaved(): void }) {
  const form = useForm<SectionValues>({ resolver: zodResolver(sectionSchema), defaultValues: { courseId: section?.courseId ?? '', sectionCode: section?.sectionCode ?? '', teacherId: section?.teacherId ?? '' } });
  async function submit(values: SectionValues) {
    try {
      if (section) { if (values.sectionCode !== section.sectionCode) await academicsApi.updateSection(section.id, values.sectionCode); if (values.teacherId !== section.teacherId) await academicsApi.assignTeacher(section.id, values.teacherId); }
      else await academicsApi.createSection(values);
      toast.success(section ? 'Section updated.' : 'Section created.'); onSaved();
    } catch (error) { toast.error(error instanceof ApiError ? error.message : 'Unable to save section.'); }
  }
  return <form onSubmit={form.handleSubmit(submit)} className="grid gap-4 rounded-lg border border-zinc-200 p-5 dark:border-zinc-800"><h2 className="font-semibold">{section ? 'Edit section' : 'Add section'}</h2><label className="grid gap-2 text-sm font-medium">Course<select disabled={Boolean(section)} className={fieldClass} {...form.register('courseId')}><option value="">Select course</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.code} — {course.name}</option>)}</select></label><label className="grid gap-2 text-sm font-medium">Section code<input className={fieldClass} {...form.register('sectionCode')} /></label><label className="grid gap-2 text-sm font-medium">Teacher<select className={fieldClass} {...form.register('teacherId')}><option value="">Select teacher</option>{teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}</select></label><div className="flex gap-2"><button disabled={form.formState.isSubmitting} className="rounded-md bg-zinc-950 px-4 py-2 text-sm text-white dark:bg-zinc-50 dark:text-zinc-950">Save</button><button type="button" onClick={onClose} className="rounded-md border px-4 py-2 text-sm">Cancel</button></div></form>;
}
