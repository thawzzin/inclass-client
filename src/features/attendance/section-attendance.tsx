'use client';

import { LoadingState } from '@/src/components/ui/loading-state';
import { Label } from '@/src/components/ui/label';

import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { queryKeys } from '@/src/lib/api/query-keys';

import { attendanceApi } from './attendance.api';
import { AttendanceReportPanel } from './attendance-report-panel';
import { openOrCreateSession } from './attendance-workflow';

function localDate(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function displayDate(date: string): string {
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(date));
}

export function SectionAttendance({ sectionId }: { sectionId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [date, setDate] = useState(localDate);
  const sessions = useQuery({
    queryKey: queryKeys.sections.attendanceSessions(sectionId),
    queryFn: () => attendanceApi.sessions(sectionId),
  });
  const openSession = useMutation({
    mutationFn: async () => {
      return openOrCreateSession(
        sessions.data ?? [],
        date,
        () => attendanceApi.createSession(sectionId, date),
        async () => (await sessions.refetch()).data ?? [],
      );
    },
    onSuccess: (session) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.sections.attendanceSessions(sectionId),
      });
      router.push(`/attendance/${session.id}`);
    },
    onError: () => toast.error('Unable to open the attendance session.'),
  });

  if (sessions.isLoading) {
    return <LoadingState label="Loading attendance sessions" compact />;
  }
  if (sessions.isError || !sessions.data) {
    return (
      <Button
        type="button"
        onClick={() => void sessions.refetch()}
        variant="link"
        className="text-sm underline"
      >
        Unable to load attendance sessions. Retry
      </Button>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="font-medium">Create or open a daily session</h2>
        <p className="mt-1 text-sm text-zinc-500">
          A section can have only one attendance session per calendar date.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <Label className="grid gap-1 text-sm">
            <span>Attendance date</span>
            <Input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700"
            />
          </Label>
          <Button
            type="button"
            disabled={!date || openSession.isPending}
            onClick={() => openSession.mutate()}
            className="rounded-md bg-zinc-950 px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950"
          >
            {openSession.isPending ? 'Opening…' : 'Open attendance'}
          </Button>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <CalendarDays className="size-4" aria-hidden="true" />
          <h2 className="font-medium">Recent sessions</h2>
        </div>
        {sessions.data.length ? (
          <ul className="divide-y rounded-lg border border-zinc-200 dark:border-zinc-800">
            {sessions.data.map((session) => (
              <li key={session.id}>
                <Link
                  href={`/attendance/${session.id}`}
                  className="flex min-h-12 items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  <span>{displayDate(session.date)}</span>
                  <span className="flex items-center gap-1 text-zinc-500">
                    Open{' '}
                    <ExternalLink className="size-3.5" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-dashed p-8 text-center text-sm text-zinc-500">
            No attendance sessions have been created.
          </p>
        )}
      </div>
      <AttendanceReportPanel key={sectionId} fixedSectionId={sectionId} />
    </div>
  );
}
