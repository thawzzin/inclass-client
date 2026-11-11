'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

import { useAuth } from '@/src/features/auth/auth-context';
import { studentsApi } from '@/src/features/students/students.api';
import { queryKeys } from '@/src/lib/api/query-keys';

import {
  availableStudents,
  toggleStudentSelection,
} from './enrollment-selection';
import { enrollmentsApi } from './enrollments.api';

export function EnrollmentManager({ sectionId }: { sectionId: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const enrollments = useQuery({
    queryKey: queryKeys.sections.enrollments(sectionId),
    queryFn: () => enrollmentsApi.list(sectionId),
  });
  const students = useQuery({
    queryKey: [...queryKeys.students.all, 'enrollment-options', search],
    queryFn: () =>
      studentsApi.list({ page: 1, pageSize: 100, status: 'ACTIVE', search }),
    enabled: open && user?.role === 'ADMIN',
  });
  const refresh = () =>
    queryClient.invalidateQueries({
      queryKey: queryKeys.sections.enrollments(sectionId),
    });
  const bulk = useMutation({
    mutationFn: async () => {
      if (selected.length === 1) {
        await enrollmentsApi.enroll(sectionId, selected[0]);
        return 1;
      }
      return (await enrollmentsApi.bulkEnroll(sectionId, selected)).count;
    },
    onSuccess: (count) => {
      toast.success(`${count} student${count === 1 ? '' : 's'} enrolled.`);
      setSelected([]);
      setOpen(false);
      void refresh();
    },
    onError: () => toast.error('Unable to enroll the selected students.'),
  });
  const remove = useMutation({
    mutationFn: (studentId: string) =>
      enrollmentsApi.remove(sectionId, studentId),
    onSuccess: () => {
      toast.success('Student removed from section.');
      void refresh();
    },
    onError: () => toast.error('Unable to remove this enrollment.'),
  });

  if (enrollments.isLoading)
    return <p className="text-sm text-zinc-500">Loading enrolled students…</p>;
  if (enrollments.isError || !enrollments.data)
    return (
      <button
        type="button"
        onClick={() => void enrollments.refetch()}
        className="text-sm underline"
      >
        Unable to load enrollments. Retry
      </button>
    );
  const options = students.data
    ? availableStudents(students.data.items, enrollments.data)
    : [];

  function confirmRemoval(studentId: string, name: string) {
    if (
      window.confirm(
        `Remove ${name} from this section? Historical attendance will be preserved.`,
      )
    )
      remove.mutate(studentId);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          {enrollments.data.length} enrolled student
          {enrollments.data.length === 1 ? '' : 's'}
        </p>
        {user?.role === 'ADMIN' && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-md bg-zinc-950 px-4 py-2 text-sm text-white dark:bg-zinc-50 dark:text-zinc-950"
          >
            Manage enrollment
          </button>
        )}
      </div>
      {enrollments.data.length ? (
        <ul className="divide-y rounded-lg border border-zinc-200 dark:border-zinc-800">
          {enrollments.data.map((enrollment) => (
            <li
              key={enrollment.id}
              className="flex items-center justify-between gap-3 p-3 text-sm"
            >
              <div>
                <span className="font-medium">
                  {enrollment.student.studentId} · {enrollment.student.fullName}
                </span>
                {enrollment.student.nickname && (
                  <span className="ml-2 text-zinc-500">
                    ({enrollment.student.nickname})
                  </span>
                )}
              </div>
              {user?.role === 'ADMIN' && (
                <button
                  type="button"
                  disabled={remove.isPending}
                  onClick={() =>
                    confirmRemoval(
                      enrollment.studentId,
                      enrollment.student.fullName,
                    )
                  }
                  className="text-red-700 underline dark:text-red-400"
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-zinc-500">
          No students are enrolled.
        </p>
      )}
      {open && (
        <dialog
          open
          aria-labelledby="enrollment-title"
          className="fixed inset-0 z-50 m-auto w-[min(40rem,calc(100%-2rem))] rounded-lg border border-zinc-200 bg-white p-5 text-zinc-950 shadow-xl dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 id="enrollment-title" className="font-semibold">
                Enroll students
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Only active students not already enrolled are shown.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setSelected([]);
              }}
              aria-label="Close enrollment dialog"
              className="rounded px-2 py-1"
            >
              ×
            </button>
          </div>
          <input
            aria-label="Search available students"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by ID, name, or nickname"
            className="mt-4 w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
          />
          <div className="mt-4 max-h-72 overflow-y-auto rounded-md border border-zinc-200 dark:border-zinc-800">
            {students.isLoading ? (
              <p className="p-4 text-sm text-zinc-500">Loading students…</p>
            ) : options.length ? (
              options.map((student) => (
                <label
                  key={student.id}
                  className="flex cursor-pointer items-center gap-3 border-b p-3 text-sm last:border-0 dark:border-zinc-800"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(student.id)}
                    onChange={() =>
                      setSelected((current) =>
                        toggleStudentSelection(current, student.id),
                      )
                    }
                  />
                  <span>
                    {student.studentId} · {student.fullName}
                  </span>
                </label>
              ))
            ) : (
              <p className="p-4 text-sm text-zinc-500">
                No available students match your search.
              </p>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-zinc-500">
              {selected.length} selected
            </span>
            <button
              type="button"
              disabled={!selected.length || bulk.isPending}
              onClick={() => bulk.mutate()}
              className="rounded-md bg-zinc-950 px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950"
            >
              {bulk.isPending ? 'Enrolling…' : 'Enroll selected'}
            </button>
          </div>
        </dialog>
      )}
    </div>
  );
}
