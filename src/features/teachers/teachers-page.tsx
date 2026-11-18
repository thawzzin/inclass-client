'use client';

import { LoadingState } from '@/src/components/ui/loading-state';
import { Badge } from '@/src/components/ui/badge';

import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/src/components/ui/native-select';
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
import type { EntityStatus, Teacher } from '@/src/lib/api/types';

import { TeacherForm, TeacherPasswordForm } from './teacher-forms';
import { teacherListParams } from './teacher-contract';
import { teachersApi } from './teachers.api';

export function TeachersPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<EntityStatus>();
  const [editing, setEditing] = useState<Teacher>();
  const [passwordTeacher, setPasswordTeacher] = useState<Teacher>();
  const [creating, setCreating] = useState(false);
  const params = teacherListParams({ page, pageSize: 20, search, status });
  const teachers = useQuery({
    queryKey: [...queryKeys.teachers.all, params],
    queryFn: () => teachersApi.list(params),
    enabled: user?.role === 'ADMIN',
  });
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.teachers.all });
  const statusMutation = useMutation({
    mutationFn: ({
      id,
      nextStatus,
    }: {
      id: string;
      nextStatus: EntityStatus;
    }) => teachersApi.setStatus(id, nextStatus),
    onSuccess: () => {
      void invalidate();
      toast.success('Teacher status updated and active sessions revoked.');
    },
    onError: () => toast.error('Unable to update teacher status.'),
  });

  if (user?.role !== 'ADMIN')
    return (
      <p className="text-sm text-zinc-500">
        You are not authorized to manage teachers.
      </p>
    );
  if (teachers.isLoading) return <LoadingState label="Loading teachers" />;
  if (teachers.isError)
    return (
      <Button
        type="button"
        onClick={() => void teachers.refetch()}
        variant="link"
        className="text-sm underline"
      >
        Unable to load teachers. Retry
      </Button>
    );
  if (!teachers.data) return null;

  return (
    <section className="space-y-6">
      <div className="ic-page-heading">
        <div>
          <div className="ic-eyebrow">PEOPLE</div>
          <h1 className="text-2xl font-semibold">Teachers</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage teacher accounts and access.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setCreating(true)}
          className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-950"
        >
          Add teacher
        </Button>
      </div>
      <div className="flex flex-wrap gap-3">
        <Input
          aria-label="Search teachers"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search name or email"
          className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700 max-w-xs"
        />
        <NativeSelect
          aria-label="Filter by status"
          value={status ?? ''}
          onChange={(event) => {
            setStatus(
              (event.target.value || undefined) as EntityStatus | undefined,
            );
            setPage(1);
          }}
          className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
        >
          <NativeSelectOption value="">All statuses</NativeSelectOption>
          <NativeSelectOption value="ACTIVE">Active</NativeSelectOption>
          <NativeSelectOption value="INACTIVE">Inactive</NativeSelectOption>
        </NativeSelect>
      </div>
      {(creating || editing) && (
        <TeacherForm
          teacher={editing}
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
      {passwordTeacher && (
        <TeacherPasswordForm
          teacher={passwordTeacher}
          onClose={() => setPasswordTeacher(undefined)}
        />
      )}
      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <Table className="w-full text-left text-sm">
          <TableHeader className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900">
            <TableRow>
              <TableHead className="p-3">Name</TableHead>
              <TableHead className="p-3">Email</TableHead>
              <TableHead className="p-3">Status</TableHead>
              <TableHead className="p-3">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teachers.data.items.map((teacher) => (
              <TableRow
                key={teacher.id}
                className="border-t border-zinc-200 dark:border-zinc-800"
              >
                <TableCell className="p-3 font-medium">
                  <Link href={`/teachers/${teacher.id}`} className="underline">
                    {teacher.name}
                  </Link>
                </TableCell>
                <TableCell className="p-3">{teacher.email}</TableCell>
                <TableCell className="p-3">
                  <Badge
                    className={`ic-status ${teacher.status === 'INACTIVE' ? 'ic-status-inactive' : ''}`}
                  >
                    {teacher.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="p-3">
                  <Button
                    type="button"
                    onClick={() => setEditing(teacher)}
                    variant="link"
                    className="mr-3 underline"
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setPasswordTeacher(teacher)}
                    variant="link"
                    className="mr-3 underline"
                  >
                    Password
                  </Button>
                  <Button
                    type="button"
                    disabled={statusMutation.isPending}
                    onClick={() =>
                      statusMutation.mutate({
                        id: teacher.id,
                        nextStatus:
                          teacher.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
                      })
                    }
                    variant="link"
                    className="underline"
                  >
                    {teacher.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span>{teachers.data.total} teachers</span>
        <div className="space-x-2">
          <Button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((value) => value - 1)}
            variant="outline"
            className="rounded border px-3 py-1 disabled:opacity-50"
          >
            Previous
          </Button>
          <Button
            type="button"
            disabled={page >= teachers.data.totalPages}
            onClick={() => setPage((value) => value + 1)}
            variant="outline"
            className="rounded border px-3 py-1 disabled:opacity-50"
          >
            Next
          </Button>
        </div>
      </div>
    </section>
  );
}
