'use client';

import { Label } from '@/src/components/ui/label';

import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/src/components/ui/native-select';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { ApiError } from '@/src/lib/api/error';
import type { Course, Section, Teacher } from '@/src/lib/api/types';

import {
  courseSchema,
  sectionSchema,
  type CourseValues,
  type SectionValues,
} from './academic-contract';
import { academicsApi } from './academics.api';

const fieldClass =
  'rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700';

export function CourseForm({
  course,
  onClose,
  onSaved,
}: {
  course?: Course;
  onClose(): void;
  onSaved(): void;
}) {
  const form = useForm<CourseValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: { code: course?.code ?? '', name: course?.name ?? '' },
  });
  async function submit(values: CourseValues) {
    try {
      if (course) await academicsApi.updateCourse(course.id, values);
      else await academicsApi.createCourse(values);
      toast.success(course ? 'Course updated.' : 'Course created.');
      onSaved();
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : 'Unable to save course.',
      );
    }
  }
  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(submit)}
      className="grid gap-4 rounded-lg border border-zinc-200 p-5 dark:border-zinc-800"
    >
      <h2 className="font-semibold">{course ? 'Edit course' : 'Add course'}</h2>
      <Label className="grid gap-2 text-sm font-medium">
        Course code
        <Input className={fieldClass} {...form.register('code')} />
        {form.formState.errors.code && (
          <span className="text-red-600">
            {form.formState.errors.code.message}
          </span>
        )}
      </Label>
      <Label className="grid gap-2 text-sm font-medium">
        Course name
        <Input className={fieldClass} {...form.register('name')} />
        {form.formState.errors.name && (
          <span className="text-red-600">
            {form.formState.errors.name.message}
          </span>
        )}
      </Label>
      <div className="flex gap-2">
        <Button
          disabled={form.formState.isSubmitting}
          className="rounded-md bg-zinc-950 px-4 py-2 text-sm text-white dark:bg-zinc-50 dark:text-zinc-950"
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

export function SectionForm({
  section,
  courses,
  teachers,
  onClose,
  onSaved,
}: {
  section?: Section;
  courses: Course[];
  teachers: Teacher[];
  onClose(): void;
  onSaved(): void;
}) {
  const form = useForm<SectionValues>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      courseId: section?.courseId ?? '',
      sectionCode: section?.sectionCode ?? '',
      teacherId: section?.teacherId ?? '',
    },
  });
  async function submit(values: SectionValues) {
    try {
      if (section) {
        if (values.sectionCode !== section.sectionCode)
          await academicsApi.updateSection(section.id, values.sectionCode);
        if (values.teacherId !== section.teacherId)
          await academicsApi.assignTeacher(section.id, values.teacherId);
      } else await academicsApi.createSection(values);
      toast.success(section ? 'Section updated.' : 'Section created.');
      onSaved();
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : 'Unable to save section.',
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
        {section ? 'Edit section' : 'Add section'}
      </h2>
      <Label className="grid gap-2 text-sm font-medium">
        Course
        <NativeSelect
          disabled={Boolean(section)}
          className={fieldClass}
          {...form.register('courseId')}
        >
          <NativeSelectOption value="">Select course</NativeSelectOption>
          {courses.map((course) => (
            <NativeSelectOption key={course.id} value={course.id}>
              {course.code} — {course.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </Label>
      <Label className="grid gap-2 text-sm font-medium">
        Section code
        <Input className={fieldClass} {...form.register('sectionCode')} />
      </Label>
      <Label className="grid gap-2 text-sm font-medium">
        Teacher
        <NativeSelect className={fieldClass} {...form.register('teacherId')}>
          <NativeSelectOption value="">Select teacher</NativeSelectOption>
          {teachers.map((teacher) => (
            <NativeSelectOption key={teacher.id} value={teacher.id}>
              {teacher.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </Label>
      <div className="flex gap-2">
        <Button
          disabled={form.formState.isSubmitting}
          className="rounded-md bg-zinc-950 px-4 py-2 text-sm text-white dark:bg-zinc-50 dark:text-zinc-950"
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
