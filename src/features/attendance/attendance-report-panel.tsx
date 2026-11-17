'use client';

import { Badge } from '@/src/components/ui/badge';

import { Label } from '@/src/components/ui/label';

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
  const validRange = isAttendanceDateRangeValid(
    filters.dateFrom,
    filters.dateTo,
  );
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
    <section
      className="ic-panel space-y-4"
      aria-labelledby="attendance-history-title"
    >
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 id="attendance-history-title" className="font-semibold">
            Attendance records
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            History contains submitted records. Unmarked students remain visible
            in session and student details.
          </p>
        </div>
        <Button
          type="button"
          disabled={!validRange || exportCsv.isPending}
          onClick={() => exportCsv.mutate()}
          variant="outline"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-zinc-300 px-4 py-2 text-sm disabled:opacity-50 dark:border-zinc-700"
        >
          <Download className="size-4" aria-hidden="true" />
          {exportCsv.isPending ? 'Exporting…' : 'Export CSV'}
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {!fixedSectionId && (
          <Label className="grid gap-1 text-sm">
            <span>Section</span>
            <NativeSelect
              value={filters.sectionId}
              onChange={(event) =>
                updateFilter('sectionId', event.target.value)
              }
              className="min-h-11 rounded-md border border-zinc-300 bg-transparent px-3 dark:border-zinc-700"
            >
              <NativeSelectOption value="">All sections</NativeSelectOption>
              {sections.map((section) => (
                <NativeSelectOption key={section.id} value={section.id}>
                  {section.course.code} · {section.sectionCode}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Label>
        )}
        <Label className="grid gap-1 text-sm">
          <span>From</span>
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(event) => updateFilter('dateFrom', event.target.value)}
            className="min-h-11 rounded-md border border-zinc-300 bg-transparent px-3 dark:border-zinc-700"
          />
        </Label>
        <Label className="grid gap-1 text-sm">
          <span>To</span>
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(event) => updateFilter('dateTo', event.target.value)}
            className="min-h-11 rounded-md border border-zinc-300 bg-transparent px-3 dark:border-zinc-700"
          />
        </Label>
        <Label className="grid gap-1 text-sm">
          <span>Status</span>
          <NativeSelect
            value={filters.status}
            onChange={(event) =>
              updateFilter(
                'status',
                event.target.value as AttendanceHistoryFilters['status'],
              )
            }
            className="min-h-11 rounded-md border border-zinc-300 bg-transparent px-3 dark:border-zinc-700"
          >
            <NativeSelectOption value="">
              All submitted statuses
            </NativeSelectOption>
            {statuses.map((status) => (
              <NativeSelectOption key={status} value={status}>
                {status}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Label>
      </div>
      {!validRange && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          The start date must be on or before the end date.
        </p>
      )}

      {filters.sectionId && statistics.data && (
        <AttendanceStatisticsSummary statistics={statistics.data} />
      )}
      {statistics.isError && (
        <Button
          type="button"
          onClick={() => void statistics.refetch()}
          variant="link"
          className="text-sm underline"
        >
          Unable to load statistics. Retry
        </Button>
      )}

      {history.isLoading ? (
        <p className="text-sm text-zinc-500" aria-busy="true">
          Loading attendance records…
        </p>
      ) : history.isError ? (
        <Button
          type="button"
          onClick={() => void history.refetch()}
          variant="link"
          className="text-sm underline"
        >
          Unable to load attendance records. Retry
        </Button>
      ) : history.data?.items.length ? (
        <>
          <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course / Section</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.data.items.map((record) => {
                  const captured = record.attendanceSessionStudent;
                  const session = captured.attendanceSession;
                  return (
                    <TableRow key={record.id}>
                      <TableCell>
                        <strong>{captured.student.fullName}</strong>
                        <span className="block">
                          {captured.student.studentId}
                        </span>
                      </TableCell>
                      <TableCell>
                        {session.section.course.code} · Section{' '}
                        {session.section.sectionCode}
                      </TableCell>
                      <TableCell>{session.date.slice(0, 10)}</TableCell>
                      <TableCell>
                        <Badge
                          className={`ic-status ic-status-${record.status.toLowerCase()}`}
                        >
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/attendance/${session.id}`}
                          className="ic-link"
                        >
                          Open →
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-zinc-500">
              Page {history.data.page} of {Math.max(history.data.totalPages, 1)}{' '}
              · {history.data.total} records
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                disabled={filters.page <= 1}
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    page: current.page - 1,
                  }))
                }
                variant="outline"
                className="min-h-11 rounded-md border px-3 disabled:opacity-50 dark:border-zinc-700"
              >
                Previous
              </Button>
              <Button
                type="button"
                disabled={filters.page >= history.data.totalPages}
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    page: current.page + 1,
                  }))
                }
                variant="outline"
                className="min-h-11 rounded-md border px-3 disabled:opacity-50 dark:border-zinc-700"
              >
                Next
              </Button>
            </div>
          </div>
        </>
      ) : validRange ? (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-zinc-500">
          No submitted attendance records match these filters.
        </p>
      ) : null}
    </section>
  );
}
