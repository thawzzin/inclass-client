'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

import { queryKeys } from '@/src/lib/api/query-keys';
import type { AttendanceStatus, Section } from '@/src/lib/api/types';

import {
  type AttendanceHistoryFilters,
  isAttendanceDateRangeValid,
} from './attendance-report';
import { AttendanceStatisticsSummary } from './attendance-statistics-summary';
import { attendanceApi } from './attendance.api';

const statuses: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'LATE'];

function downloadCsv(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'attendance-records.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}

export function AttendanceReportPanel({
  fixedSectionId,
  sections = [],
}: {
  fixedSectionId?: string;
  sections?: Section[];
}) {
  const [filters, setFilters] = useState<AttendanceHistoryFilters>({
    sectionId: fixedSectionId ?? '',
    dateFrom: '',
    dateTo: '',
    status: '',
    page: 1,
    pageSize: 20,
  });
  const validRange = isAttendanceDateRangeValid(filters.dateFrom, filters.dateTo);
  const history = useQuery({
    queryKey: queryKeys.attendance.history(filters),
    queryFn: () => attendanceApi.history(filters),
    enabled: validRange,
  });
  const statistics = useQuery({
    queryKey: queryKeys.attendance.statistics(filters.sectionId, {
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    }),
    queryFn: () => attendanceApi.statistics(filters.sectionId, filters),
    enabled: Boolean(filters.sectionId) && validRange,
  });
  const exportCsv = useMutation({
    mutationFn: () => attendanceApi.exportCsv(filters),
    onSuccess: downloadCsv,
    onError: () => toast.error('Unable to export attendance records.'),
  });

  function updateFilter<Key extends keyof AttendanceHistoryFilters>(
    key: Key,
    value: AttendanceHistoryFilters[Key],
  ) {
    setFilters((current) => ({ ...current, [key]: value, page: 1 }));
  }

  return (
    <section className="space-y-4" aria-labelledby="attendance-history-title">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 id="attendance-history-title" className="font-semibold">Attendance records</h2>
          <p className="mt-1 text-sm text-zinc-500">
            History contains submitted records. Unmarked students remain visible in session and student details.
          </p>
        </div>
        <button
          type="button"
          disabled={!validRange || exportCsv.isPending}
          onClick={() => exportCsv.mutate()}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-zinc-300 px-4 py-2 text-sm disabled:opacity-50 dark:border-zinc-700"
        >
          <Download className="size-4" aria-hidden="true" />
          {exportCsv.isPending ? 'Exporting…' : 'Export CSV'}
        </button>
      </div>

      <div className="grid gap-3 rounded-lg border border-zinc-200 p-4 sm:grid-cols-2 lg:grid-cols-4 dark:border-zinc-800">
        {!fixedSectionId && (
          <label className="grid gap-1 text-sm">
            <span>Section</span>
            <select
              value={filters.sectionId}
              onChange={(event) => updateFilter('sectionId', event.target.value)}
              className="min-h-11 rounded-md border border-zinc-300 bg-transparent px-3 dark:border-zinc-700"
            >
              <option value="">All sections</option>
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.course.code} · {section.sectionCode}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="grid gap-1 text-sm">
          <span>From</span>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(event) => updateFilter('dateFrom', event.target.value)}
            className="min-h-11 rounded-md border border-zinc-300 bg-transparent px-3 dark:border-zinc-700"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span>To</span>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(event) => updateFilter('dateTo', event.target.value)}
            className="min-h-11 rounded-md border border-zinc-300 bg-transparent px-3 dark:border-zinc-700"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span>Status</span>
          <select
            value={filters.status}
            onChange={(event) => updateFilter('status', event.target.value as AttendanceHistoryFilters['status'])}
            className="min-h-11 rounded-md border border-zinc-300 bg-transparent px-3 dark:border-zinc-700"
          >
            <option value="">All submitted statuses</option>
            {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>
      </div>
      {!validRange && <p role="alert" className="text-sm text-red-700 dark:text-red-400">The start date must be on or before the end date.</p>}

      {filters.sectionId && statistics.data && <AttendanceStatisticsSummary statistics={statistics.data} />}
      {statistics.isError && <button type="button" onClick={() => void statistics.refetch()} className="text-sm underline">Unable to load statistics. Retry</button>}

      {history.isLoading ? (
        <p className="text-sm text-zinc-500" aria-busy="true">Loading attendance records…</p>
      ) : history.isError ? (
        <button type="button" onClick={() => void history.refetch()} className="text-sm underline">Unable to load attendance records. Retry</button>
      ) : history.data?.items.length ? (
        <>
          <ul className="divide-y rounded-lg border border-zinc-200 dark:border-zinc-800">
            {history.data.items.map((record) => {
              const captured = record.attendanceSessionStudent;
              const session = captured.attendanceSession;
              return (
                <li key={record.id} className="grid gap-2 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div>
                    <p className="font-medium">{captured.student.studentId} · {captured.student.fullName}</p>
                    <p className="mt-1 text-sm text-zinc-500">{session.section.course.code} · Section {session.section.sectionCode} · {session.date.slice(0, 10)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full border border-zinc-300 px-2 py-1 text-xs font-medium dark:border-zinc-700">{record.status}</span>
                    <Link href={`/attendance/${session.id}`} className="inline-flex min-h-11 items-center text-sm underline">Session</Link>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-zinc-500">Page {history.data.page} of {Math.max(history.data.totalPages, 1)} · {history.data.total} records</span>
            <div className="flex gap-2">
              <button type="button" disabled={filters.page <= 1} onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))} className="min-h-11 rounded-md border px-3 disabled:opacity-50 dark:border-zinc-700">Previous</button>
              <button type="button" disabled={filters.page >= history.data.totalPages} onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))} className="min-h-11 rounded-md border px-3 disabled:opacity-50 dark:border-zinc-700">Next</button>
            </div>
          </div>
        </>
      ) : validRange ? (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-zinc-500">No submitted attendance records match these filters.</p>
      ) : null}
    </section>
  );
}
