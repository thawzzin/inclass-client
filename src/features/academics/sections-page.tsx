'use client';

import { Badge } from '@/src/components/ui/badge';
import { Card } from '@/src/components/ui/card';

import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/src/components/ui/native-select';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

import { useAuth } from '@/src/features/auth/auth-context';
import { teachersApi } from '@/src/features/teachers/teachers.api';
import { queryKeys } from '@/src/lib/api/query-keys';
import type { EntityStatus, Section } from '@/src/lib/api/types';

import { SectionForm } from './academic-forms';
import { filterSections } from './academic-filters';
import { academicsApi } from './academics.api';

export function SectionsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [courseId, setCourseId] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Section>();
  const sections = useQuery({
    queryKey: queryKeys.sections.all,
    queryFn: academicsApi.sections,
  });
  const courses = useQuery({
    queryKey: queryKeys.courses.all,
    queryFn: academicsApi.courses,
  });
  const teachers = useQuery({
    queryKey: [...queryKeys.teachers.all, 'active-options'],
    queryFn: () =>
      teachersApi.list({ page: 1, pageSize: 100, status: 'ACTIVE' }),
    enabled: user?.role === 'ADMIN',
  });
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.sections.all });
  const status = useMutation({
    mutationFn: ({ id, value }: { id: string; value: EntityStatus }) =>
      academicsApi.setSectionStatus(id, value),
    onSuccess: () => {
      void invalidate();
      toast.success('Section status updated.');
    },
    onError: () => toast.error('Unable to update section status.'),
  });
  if (sections.isLoading || courses.isLoading)
    return <p className="text-sm text-zinc-500">Loading sections…</p>;
  if (sections.isError || courses.isError || !sections.data || !courses.data)
    return (
      <Button
        type="button"
        onClick={() => {
          void sections.refetch();
          void courses.refetch();
        }}
        variant="link"
        className="text-sm underline"
      >
        Unable to load sections. Retry
      </Button>
    );
  const visible = filterSections(sections.data, { courseId, search });
  return (
    <section className="space-y-6">
      <div className="ic-page-heading">
        <div>
          <div className="ic-eyebrow">ACADEMICS</div>
          <h1 className="text-2xl font-semibold">
            {user?.role === 'TEACHER' ? 'My Sections' : 'Sections'}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Browse courses, teachers, and section status.
          </p>
        </div>
        {user?.role === 'ADMIN' && (
          <Button
            type="button"
            onClick={() => setCreating(true)}
            className="rounded-md bg-zinc-950 px-4 py-2 text-sm text-white dark:bg-zinc-50 dark:text-zinc-950"
          >
            Add section
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        <Input
          aria-label="Search sections"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search section or teacher"
          className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700 max-w-xs"
        />
        <NativeSelect
          aria-label="Filter by course"
          value={courseId}
          onChange={(event) => setCourseId(event.target.value)}
          className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
        >
          <NativeSelectOption value="">All courses</NativeSelectOption>
          {courses.data.map((course) => (
            <NativeSelectOption key={course.id} value={course.id}>
              {course.code}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      {user?.role === 'ADMIN' && (creating || editing) && (
        <SectionForm
          section={editing}
          courses={courses.data.filter((course) => course.status === 'ACTIVE')}
          teachers={teachers.data?.items ?? []}
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
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((section) => (
          <Card
            role="article"
            key={section.id}
            className="ic-section-card rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <div className="flex justify-between items-start gap-3">
              <div>
                <Link
                  href={`/sections/${section.id}`}
                  className="font-semibold underline"
                >
                  {section.course.code} · {section.sectionCode}
                </Link>
                <p className="mt-1 text-sm text-zinc-500">
                  {section.course.name}
                </p>
              </div>
              <Badge
                className={`ic-status ${section.status === 'INACTIVE' ? 'ic-status-inactive' : ''}`}
              >
                {section.status === 'ACTIVE' ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="mt-4 text-sm">Teacher: {section.teacher.name}</p>
            {user?.role === 'ADMIN' && (
              <div className="mt-4 space-x-3 text-sm">
                <Button
                  type="button"
                  onClick={() => setEditing(section)}
                  variant="link"
                  className="underline"
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  disabled={status.isPending}
                  onClick={() =>
                    status.mutate({
                      id: section.id,
                      value:
                        section.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
                    })
                  }
                  variant="link"
                  className="underline"
                >
                  {section.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
      {visible.length === 0 && (
        <p className="text-sm text-zinc-500">
          No sections match these filters.
        </p>
      )}
    </section>
  );
}
