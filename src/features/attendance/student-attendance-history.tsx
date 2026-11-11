'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';

import { studentsApi } from '@/src/features/students/students.api';
import { queryKeys } from '@/src/lib/api/query-keys';

import {
  attendanceStatusLabel,
  buildAttendanceDateParams,
  filterStudentAttendance,
  isAttendanceDateRangeValid,
  type StudentAttendanceStatus,
} from './attendance-report';
import { AttendanceStatisticsSummary } from './attendance-statistics-summary';

const statusOptions: StudentAttendanceStatus[] = [
  '',
  'PRESENT',
  'ABSENT',
  'LATE',
  'UNMARKED',
];

export function StudentAttendanceHistory({ studentId }: { studentId: string }) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [status, setStatus] = useState<StudentAttendanceStatus>('');
  const validRange = isAttendanceDateRangeValid(dateFrom, dateTo);
  const dateParams = buildAttendanceDateParams(dateFrom, dateTo);
  const history = useQuery({
    queryKey: queryKeys.students.attendance(studentId, dateParams),
    queryFn: () => studentsApi.attendance(studentId, dateParams),
    enabled: validRange,
  });
  const items = history.data
    ? filterStudentAttendance(history.data.items, status)
    : [];

  return (
    <section className="space-y-4" aria-labelledby="student-attendance-title">
      <div>
        <h2 id="student-attendance-title" className="font-semibold">
          Attendance history
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Late attendance counts toward the backend-calculated attendance
          percentage.
        </p>
      </div>
      <div className="grid gap-3 rounded-lg border border-zinc-200 p-4 sm:grid-cols-3 dark:border-zinc-800">
        <label className="grid gap-1 text-sm">
          <span>From</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            className="min-h-11 rounded-md border border-zinc-300 bg-transparent px-3 dark:border-zinc-700"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span>To</span>
          <input
            type="date"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
            className="min-h-11 rounded-md border border-zinc-300 bg-transparent px-3 dark:border-zinc-700"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span>Status</span>
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as StudentAttendanceStatus)
            }
            className="min-h-11 rounded-md border border-zinc-300 bg-transparent px-3 dark:border-zinc-700"
          >
            {statusOptions.map((option) => (
              <option key={option || 'all'} value={option}>
                {option || 'All statuses'}
              </option>
            ))}
          </select>
        </label>
      </div>
      {!validRange && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          The start date must be on or before the end date.
        </p>
      )}

      {history.data && (
        <AttendanceStatisticsSummary statistics={history.data.statistics} />
      )}
      {history.isLoading ? (
        <p className="text-sm text-zinc-500" aria-busy="true">
          Loading attendance history…
        </p>
      ) : history.isError ? (
        <button
          type="button"
          onClick={() => void history.refetch()}
          className="text-sm underline"
        >
          Unable to load attendance history. Retry
        </button>
      ) : items.length ? (
        <ul className="divide-y rounded-lg border border-zinc-200 dark:border-zinc-800">
          {items.map((item) => {
            const session = item.attendanceSession;
            return (
              <li
                key={item.id}
                className="flex flex-col justify-between gap-2 p-4 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="font-medium">
                    {session.section.course.code} · Section{' '}
                    {session.section.sectionCode}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {session.date.slice(0, 10)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full border border-zinc-300 px-2 py-1 text-xs font-medium dark:border-zinc-700">
                    {attendanceStatusLabel(item.attendanceRecord)}
                  </span>
                  <Link
                    href={`/attendance/${session.id}`}
                    className="inline-flex min-h-11 items-center text-sm underline"
                  >
                    Session
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      ) : validRange && history.data ? (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-zinc-500">
          No attendance entries match these filters.
        </p>
      ) : null}
    </section>
  );
}
