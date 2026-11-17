'use client';

import { Label } from '@/src/components/ui/label';

import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Checkbox } from '@/src/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog';

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
  const [studentToRemove, setStudentToRemove] = useState<{
    id: string;
    name: string;
  } | null>(null);
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
      setStudentToRemove(null);
      toast.success('Student removed from section.');
      void refresh();
    },
    onError: () => toast.error('Unable to remove this enrollment.'),
  });

  if (enrollments.isLoading)
    return <p className="text-sm text-zinc-500">Loading enrolled students…</p>;
  if (enrollments.isError || !enrollments.data)
    return (
      <Button
        type="button"
        onClick={() => void enrollments.refetch()}
        variant="link"
        className="text-sm underline"
      >
        Unable to load enrollments. Retry
      </Button>
    );
  const options = students.data
    ? availableStudents(students.data.items, enrollments.data)
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          {enrollments.data.length} enrolled student
          {enrollments.data.length === 1 ? '' : 's'}
        </p>
        {user?.role === 'ADMIN' && (
          <Button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-md bg-zinc-950 px-4 py-2 text-sm text-white dark:bg-zinc-50 dark:text-zinc-950"
          >
            Manage enrollment
          </Button>
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
                <Button
                  type="button"
                  disabled={remove.isPending}
                  onClick={() =>
                    setStudentToRemove({
                      id: enrollment.studentId,
                      name: enrollment.student.fullName,
                    })
                  }
                  variant="link"
                  className="text-red-700 underline dark:text-red-400"
                >
                  Remove
                </Button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-zinc-500">
          No students are enrolled.
        </p>
      )}
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setSelected([]);
        }}
      >
        <DialogContent className="max-w-2xl border-border bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle>Enroll students</DialogTitle>
            <DialogDescription>
              Only active students not already enrolled are shown.
            </DialogDescription>
          </DialogHeader>
          <Input
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
                <div
                  key={student.id}
                  className="flex cursor-pointer items-center gap-3 border-b p-3 text-sm last:border-0 dark:border-zinc-800"
                >
                  <Checkbox
                    id={`enroll-${student.id}`}
                    checked={selected.includes(student.id)}
                    onCheckedChange={() =>
                      setSelected((current) =>
                        toggleStudentSelection(current, student.id),
                      )
                    }
                  />
                  <Label htmlFor={`enroll-${student.id}`}>
                    {student.studentId} · {student.fullName}
                  </Label>
                </div>
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
            <Button
              type="button"
              disabled={!selected.length || bulk.isPending}
              onClick={() => bulk.mutate()}
              className="rounded-md bg-zinc-950 px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950"
            >
              {bulk.isPending ? 'Enrolling…' : 'Enroll selected'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(studentToRemove)}
        onOpenChange={(next) => {
          if (!next) setStudentToRemove(null);
        }}
      >
        <DialogContent className="border-border bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle>Remove student from section?</DialogTitle>
            <DialogDescription>
              {studentToRemove?.name} will leave this section. Historical
              attendance will be preserved.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStudentToRemove(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={remove.isPending}
              onClick={() => {
                if (studentToRemove) remove.mutate(studentToRemove.id);
              }}
            >
              {remove.isPending ? 'Removing…' : 'Remove student'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
