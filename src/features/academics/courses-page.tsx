'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

import { useAuth } from '@/src/features/auth/auth-context';
import { queryKeys } from '@/src/lib/api/query-keys';
import type { Course, EntityStatus } from '@/src/lib/api/types';

import { CourseForm } from './academic-forms';
import { filterCourses } from './academic-filters';
import { academicsApi } from './academics.api';

export function CoursesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Course>();
  const courses = useQuery({
    queryKey: queryKeys.courses.all,
    queryFn: academicsApi.courses,
    enabled: user?.role === 'ADMIN',
  });
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
  const status = useMutation({
    mutationFn: ({ id, value }: { id: string; value: EntityStatus }) =>
      academicsApi.setCourseStatus(id, value),
    onSuccess: () => {
      void invalidate();
      toast.success('Course status updated.');
    },
    onError: () => toast.error('Unable to update course status.'),
  });
  if (user?.role !== 'ADMIN')
    return (
      <p className="text-sm text-zinc-500">
        You are not authorized to manage courses.
      </p>
    );
  if (courses.isLoading)
    return <p className="text-sm text-zinc-500">Loading courses…</p>;
  if (courses.isError || !courses.data)
    return (
      <button
        type="button"
        onClick={() => void courses.refetch()}
        className="text-sm underline"
      >
        Unable to load courses. Retry
      </button>
    );
  const visible = filterCourses(courses.data, search);
  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Courses</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage the university course catalog.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="rounded-md bg-zinc-950 px-4 py-2 text-sm text-white dark:bg-zinc-50 dark:text-zinc-950"
        >
          Add course
        </button>
      </div>
      <input
        aria-label="Search courses"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search code or name"
        className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
      />
      {(creating || editing) && (
        <CourseForm
          course={editing}
          onClose={() => {
            setCreating(false);
            setEditing(undefined);
          }}
          onSaved={() => {
            void invalidate();
            setCreating(false);
            setEditing(undefined);
          }}
        />
      )}
      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900">
            <tr>
              <th className="p-3">Code</th>
              <th className="p-3">Name</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((course) => (
              <tr
                key={course.id}
                className="border-t border-zinc-200 dark:border-zinc-800"
              >
                <td className="p-3 font-medium">
                  <Link href={`/courses/${course.id}`} className="underline">
                    {course.code}
                  </Link>
                </td>
                <td className="p-3">{course.name}</td>
                <td className="p-3">{course.status}</td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => setEditing(course)}
                    className="mr-3 underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={status.isPending}
                    onClick={() =>
                      status.mutate({
                        id: course.id,
                        value:
                          course.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
                      })
                    }
                    className="underline"
                  >
                    {course.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {visible.length === 0 && (
        <p className="text-sm text-zinc-500">No courses match your search.</p>
      )}
    </section>
  );
}
