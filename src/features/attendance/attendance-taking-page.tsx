'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check, Clock3, Save, UserX } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { academicsApi } from '@/src/features/academics/academics.api';
import { queryKeys } from '@/src/lib/api/query-keys';
import type {
  AttendanceSessionDetail,
  AttendanceStatus,
  Section,
} from '@/src/lib/api/types';

import {
  attendanceSummary,
  createAttendanceDraft,
  markAllUnmarkedPresent,
  partitionAttendanceChanges,
} from './attendance-state';
import { attendanceApi } from './attendance.api';
import { submitAttendanceChanges } from './attendance-workflow';

const statuses: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'LATE'];

const statusStyles: Record<AttendanceStatus, string> = {
  PRESENT: 'border-emerald-600 bg-emerald-600 text-white',
  ABSENT: 'border-red-600 bg-red-600 text-white',
  LATE: 'border-amber-500 bg-amber-500 text-zinc-950',
};

function displayDate(date: string): string {
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(date));
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-center justify-between text-sm text-zinc-500">
        <span>{label}</span>
        {icon}
      </div>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function AttendanceEditor({
  detail,
  section,
}: {
  detail: AttendanceSessionDetail;
  section: Section;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState(() => createAttendanceDraft(detail.roster));
  const [baseline, setBaseline] = useState(() => createAttendanceDraft(detail.roster));
  const summary = attendanceSummary(draft);
  const dirty = useMemo(
    () => detail.roster.some((entry) => draft[entry.studentId] !== baseline[entry.studentId]),
    [baseline, detail.roster, draft],
  );

  useEffect(() => {
    function warnBeforeUnload(event: BeforeUnloadEvent) {
      if (!dirty) return;
      event.preventDefault();
    }
    window.addEventListener('beforeunload', warnBeforeUnload);
    return () => window.removeEventListener('beforeunload', warnBeforeUnload);
  }, [dirty]);

  const save = useMutation({
    mutationFn: async () => {
      const changes = partitionAttendanceChanges(detail.roster, draft);
      const result = await submitAttendanceChanges(changes.creates, changes.updates, {
        createRecords: (records) => attendanceApi.createRecords(detail.id, records),
        updateRecord: (record) =>
          attendanceApi.updateRecord(detail.id, record.studentId, record.status),
      });
      if (result.failedUpdates) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.attendanceSessions.detail(detail.id),
        });
        throw new Error('Some existing attendance records could not be updated.');
      }

      await queryClient.invalidateQueries({
        queryKey: queryKeys.attendanceSessions.detail(detail.id),
      });
      return attendanceApi.session(detail.id);
    },
    onSuccess: (refreshed) => {
      queryClient.setQueryData(queryKeys.attendanceSessions.detail(detail.id), refreshed);
      const savedDraft = createAttendanceDraft(refreshed.roster);
      setDraft(savedDraft);
      setBaseline(savedDraft);
      toast.success('Attendance saved.');
    },
    onError: () => {
      toast.error('Attendance was not fully saved. Your selections are still shown; please retry.');
    },
  });

  function leaveForSection() {
    if (dirty && !window.confirm('You have unsaved attendance changes. Leave without saving?')) {
      return;
    }
    router.push(`/sections/${section.id}`);
  }

  return (
    <section className="space-y-6">
      <button
        type="button"
        onClick={leaveForSection}
        className="inline-flex min-h-10 items-center gap-2 text-sm underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> Back to section
      </button>

      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm text-zinc-500">{section.course.name}</p>
          <h1 className="mt-1 text-2xl font-semibold">
            {section.course.code} · Section {section.sectionCode}
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            {displayDate(detail.date)} · {summary.total} captured student
            {summary.total === 1 ? '' : 's'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!summary.unmarked || save.isPending}
            onClick={() => setDraft((current) => markAllUnmarkedPresent(current))}
            className="min-h-10 rounded-md border border-zinc-300 px-4 py-2 text-sm disabled:opacity-50 dark:border-zinc-700"
          >
            Mark all unmarked present
          </button>
          <button
            type="button"
            disabled={!dirty || save.isPending}
            onClick={() => save.mutate()}
            className="inline-flex min-h-10 items-center gap-2 rounded-md bg-zinc-950 px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950"
          >
            <Save className="size-4" aria-hidden="true" />
            {save.isPending ? 'Saving…' : 'Save attendance'}
          </button>
        </div>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800" aria-hidden="true">
        <div
          className="h-full bg-zinc-950 transition-[width] dark:bg-zinc-50"
          style={{ width: summary.total ? `${(summary.marked / summary.total) * 100}%` : '0%' }}
        />
      </div>
      <p className="sr-only" aria-live="polite">
        {summary.marked} of {summary.total} students marked.
      </p>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard label="Present" value={summary.present} icon={<Check className="size-4" />} />
        <SummaryCard label="Absent" value={summary.absent} icon={<UserX className="size-4" />} />
        <SummaryCard label="Late" value={summary.late} icon={<Clock3 className="size-4" />} />
        <SummaryCard label="Unmarked" value={summary.unmarked} icon={<span aria-hidden="true">—</span>} />
      </div>

      {detail.roster.length ? (
        <ul className="divide-y rounded-lg border border-zinc-200 dark:border-zinc-800">
          {detail.roster.map((entry) => (
            <li key={entry.id} className="grid gap-3 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div className="min-w-0">
                <p className="font-medium">{entry.student.fullName}</p>
                <p className="text-sm text-zinc-500">
                  {entry.student.studentId}
                  {entry.student.nickname ? ` · ${entry.student.nickname}` : ''}
                </p>
              </div>
              <div
                role="radiogroup"
                aria-label={`Attendance status for ${entry.student.fullName}`}
                className="grid grid-cols-3 gap-2"
              >
                {statuses.map((status) => {
                  const selected = draft[entry.studentId] === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      disabled={save.isPending}
                      onClick={() =>
                        setDraft((current) => ({ ...current, [entry.studentId]: status }))
                      }
                      className={`min-h-10 rounded-md border px-3 py-2 text-xs font-medium sm:text-sm ${
                        selected
                          ? statusStyles[status]
                          : 'border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900'
                      }`}
                    >
                      {status[0] + status.slice(1).toLowerCase()}
                    </button>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-zinc-500">
          This session captured no active enrolled students.
        </p>
      )}
    </section>
  );
}

export function AttendanceTakingPage({ id }: { id: string }) {
  const session = useQuery({
    queryKey: queryKeys.attendanceSessions.detail(id),
    queryFn: () => attendanceApi.session(id),
  });
  const sectionId = session.data?.sectionId;
  const section = useQuery({
    queryKey: queryKeys.sections.detail(sectionId ?? ''),
    queryFn: () => academicsApi.section(sectionId ?? ''),
    enabled: Boolean(sectionId),
  });

  if (session.isLoading || (sectionId && section.isLoading)) {
    return <p className="text-sm text-zinc-500">Loading attendance roster…</p>;
  }
  if (session.isError || section.isError || !session.data || !section.data) {
    return (
      <button
        type="button"
        onClick={() => {
          void session.refetch();
          if (sectionId) void section.refetch();
        }}
        className="text-sm underline"
      >
        Unable to load this attendance session. Retry
      </button>
    );
  }

  return <AttendanceEditor detail={session.data} section={section.data} />;
}
