'use client';

import { Badge } from '@/src/components/ui/badge';

import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table';

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
      <Button
        type="button"
        onClick={() => void courses.refetch()}
        variant="link"
        className="text-sm underline"
      >
        Unable to load courses. Retry
      </Button>
    );
  const visible = filterCourses(courses.data, search);
  return (
    <section className="space-y-6">
      <div className="ic-page-heading">
        <div>
          <div className="ic-eyebrow">ACADEMICS</div>
          <h1 className="text-2xl font-semibold">Courses</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage the university course catalog.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setCreating(true)}
          className="rounded-md bg-zinc-950 px-4 py-2 text-sm text-white dark:bg-zinc-50 dark:text-zinc-950"
        >
          Add course
        </Button>
      </div>
      <Input
        aria-label="Search courses"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search code or name"
        className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700 max-w-xs"
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
        <Table className="w-full text-left text-sm">
          <TableHeader className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900">
            <TableRow>
              <TableHead className="p-3">Code</TableHead>
              <TableHead className="p-3">Name</TableHead>
              <TableHead className="p-3">Status</TableHead>
              <TableHead className="p-3">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((course) => (
              <TableRow
                key={course.id}
                className="border-t border-zinc-200 dark:border-zinc-800"
              >
                <TableCell className="p-3 font-medium">
                  <Link href={`/courses/${course.id}`} className="underline">
                    {course.code}
                  </Link>
                </TableCell>
                <TableCell className="p-3">{course.name}</TableCell>
                <TableCell className="p-3">
                  <Badge
                    className={`ic-status ${course.status === 'INACTIVE' ? 'ic-status-inactive' : ''}`}
                  >
                    {course.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="p-3">
                  <Button
                    type="button"
                    onClick={() => setEditing(course)}
                    variant="link"
                    className="mr-3 underline"
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    disabled={status.isPending}
                    onClick={() =>
                      status.mutate({
                        id: course.id,
                        value:
                          course.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
                      })
                    }
                    variant="link"
                    className="underline"
                  >
                    {course.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {visible.length === 0 && (
        <p className="text-sm text-zinc-500">No courses match your search.</p>
      )}
    </section>
  );
}
