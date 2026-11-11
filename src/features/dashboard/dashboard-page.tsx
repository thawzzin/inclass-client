'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowRight, CalendarCheck } from 'lucide-react';
import Link from 'next/link';

import { academicsApi } from '@/src/features/academics/academics.api';
import { AttendanceStatisticsSummary } from '@/src/features/attendance/attendance-statistics-summary';
import { useAuth } from '@/src/features/auth/auth-context';
import { queryKeys } from '@/src/lib/api/query-keys';
import type {
  AttendanceStatistics,
  DashboardRecentAttendance,
} from '@/src/lib/api/types';

import { dashboardCards, dashboardQuickLinks } from './dashboard-contract';
import { dashboardApi } from './dashboard.api';

function DashboardLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
      <div className="h-16 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900"
          />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />
    </div>
  );
}

function AttendanceOverview({
  statistics,
}: {
  statistics: AttendanceStatistics;
}) {
  return (
    <section className="space-y-4" aria-labelledby="attendance-overview-title">
      <div>
        <h2 id="attendance-overview-title" className="font-semibold">
          Attendance overview
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Role-scoped totals across all recorded sessions.
        </p>
      </div>
      <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex items-center justify-between gap-3 text-sm">
          <label htmlFor="attendance-progress" className="font-medium">
            Attendance percentage
          </label>
          <span>
            {statistics.attendancePercentage === null
              ? 'No marked records'
              : `${statistics.attendancePercentage.toFixed(1)}%`}
          </span>
        </div>
        <progress
          id="attendance-progress"
          max={100}
          value={statistics.attendancePercentage ?? 0}
          className="mt-3 h-2 w-full accent-zinc-950 dark:accent-zinc-50"
        />
      </div>
      <AttendanceStatisticsSummary statistics={statistics} />
    </section>
  );
}

function RecentAttendance({
  sessions,
}: {
  sessions: DashboardRecentAttendance[];
}) {
  return (
    <section aria-labelledby="recent-attendance-title">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 id="recent-attendance-title" className="font-semibold">
          Recent attendance activity
        </h2>
        <Link
          href="/attendance"
          className="inline-flex min-h-11 items-center gap-1 text-sm underline"
        >
          View all <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
      {sessions.length ? (
        <ul className="divide-y rounded-lg border border-zinc-200 dark:border-zinc-800">
          {sessions.map((session) => (
            <li key={session.id}>
              <Link
                href={`/attendance/${session.id}`}
                className="grid min-h-16 gap-2 p-4 hover:bg-zinc-50 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center dark:hover:bg-zinc-900"
              >
                <div>
                  <p className="font-medium">
                    {session.section.course.code} · Section{' '}
                    {session.section.sectionCode}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {session.date.slice(0, 10)} · Created by{' '}
                    {session.createdBy.name}
                  </p>
                </div>
                <span className="text-sm text-zinc-500">
                  {session._count.roster} captured student
                  {session._count.roster === 1 ? '' : 's'}
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
    </section>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const summary = useQuery({
    queryKey: queryKeys.dashboard.summary(user?.role),
    queryFn: dashboardApi.summary,
    enabled: Boolean(user),
  });
  const statistics = useQuery({
    queryKey: queryKeys.dashboard.attendanceStats(user?.role),
    queryFn: dashboardApi.attendanceStatistics,
    enabled: Boolean(user),
  });
  const recent = useQuery({
    queryKey: queryKeys.dashboard.recentAttendance(user?.role),
    queryFn: dashboardApi.recentAttendance,
    enabled: Boolean(user),
  });
  const assignedSections = useQuery({
    queryKey: queryKeys.dashboard.assignedSections(user?.role),
    queryFn: academicsApi.sections,
    enabled: user?.role === 'TEACHER',
  });

  if (!user || summary.isLoading || statistics.isLoading || recent.isLoading)
    return <DashboardLoading />;
  if (
    summary.isError ||
    statistics.isError ||
    recent.isError ||
    !summary.data ||
    !statistics.data ||
    !recent.data
  ) {
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-200 p-5 dark:border-red-900"
      >
        <h1 className="font-semibold">Unable to load dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">
          The dashboard data could not be retrieved.
        </p>
        <button
          type="button"
          onClick={() => {
            void summary.refetch();
            void statistics.refetch();
            void recent.refetch();
          }}
          className="mt-4 min-h-11 rounded-md border px-4 text-sm dark:border-zinc-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const cards = dashboardCards(user.role, summary.data);
  const quickLinks = dashboardQuickLinks(user.role);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm text-zinc-500">
          {user.role === 'ADMIN'
            ? 'Administration overview'
            : 'Teaching overview'}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Welcome back, {user.name}
        </h1>
      </header>

      <section
        aria-label="Dashboard summary"
        className={`grid gap-3 sm:grid-cols-2 ${user.role === 'ADMIN' ? 'lg:grid-cols-5' : 'lg:grid-cols-3'}`}
      >
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <p className="text-sm text-zinc-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold">{card.value}</p>
          </div>
        ))}
      </section>

      <nav
        aria-label="Dashboard quick actions"
        className="flex flex-wrap gap-2"
      >
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
          >
            {link.label}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        ))}
      </nav>

      {user.role === 'TEACHER' && (
        <section aria-labelledby="assigned-sections-title">
          <h2 id="assigned-sections-title" className="mb-3 font-semibold">
            Assigned sections
          </h2>
          {assignedSections.isLoading ? (
            <p className="text-sm text-zinc-500">Loading assigned sections…</p>
          ) : assignedSections.isError ? (
            <div
              role="alert"
              className="rounded-lg border border-red-200 p-4 dark:border-red-900"
            >
              <p className="text-sm">Unable to load assigned sections.</p>
              <button
                type="button"
                onClick={() => void assignedSections.refetch()}
                className="mt-3 min-h-11 rounded-md border px-4 text-sm dark:border-zinc-700"
              >
                Retry
              </button>
            </div>
          ) : assignedSections.data?.length ? (
            <ul className="grid gap-3 md:grid-cols-2">
              {assignedSections.data.map((section) => (
                <li key={section.id}>
                  <Link
                    href={`/sections/${section.id}?tab=attendance`}
                    className="flex min-h-20 items-center justify-between rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                  >
                    <span>
                      <span className="block font-medium">
                        {section.course.code} · Section {section.sectionCode}
                      </span>
                      <span className="mt-1 block text-sm text-zinc-500">
                        {section.course.name}
                      </span>
                    </span>
                    <CalendarCheck
                      className="size-5 text-zinc-500"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-lg border border-dashed p-8 text-center text-sm text-zinc-500">
              No sections are assigned.
            </p>
          )}
        </section>
      )}

      <AttendanceOverview statistics={statistics.data} />
      <RecentAttendance sessions={recent.data} />
    </div>
  );
}
