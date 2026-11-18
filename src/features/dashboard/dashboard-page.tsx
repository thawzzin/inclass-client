'use client';

import { LoadingState } from '@/src/components/ui/loading-state';
import { Badge } from '@/src/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/src/components/ui/alert';
import { Card } from '@/src/components/ui/card';
import { Skeleton } from '@/src/components/ui/skeleton';

import { Button } from '@/src/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table';

import { useQuery } from '@tanstack/react-query';
import { BookOpen, CalendarCheck, GraduationCap, Users } from 'lucide-react';
import Link from 'next/link';

import { academicsApi } from '@/src/features/academics/academics.api';
import { useAuth } from '@/src/features/auth/auth-context';
import { queryKeys } from '@/src/lib/api/query-keys';
import type { DashboardRecentAttendance } from '@/src/lib/api/types';

import { dashboardCards } from './dashboard-contract';
import { dashboardApi } from './dashboard.api';

const icons = [GraduationCap, Users, BookOpen, CalendarCheck, CalendarCheck];

function RecentSessions({
  sessions,
}: {
  sessions: DashboardRecentAttendance[];
}) {
  return (
    <section className="ic-panel ic-recent" aria-labelledby="recent-title">
      <div className="ic-panel-head">
        <h2 id="recent-title">Recent attendance sessions</h2>
        <Link href="/history" className="ic-link">
          View all →
        </Link>
      </div>
      {sessions.length ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course / Section</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Recorded by</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.slice(0, 5).map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <Link href={`/attendance/${session.id}`}>
                      {session.section.course.code} · Section{' '}
                      {session.section.sectionCode}
                    </Link>
                  </TableCell>
                  <TableCell>{session.date.slice(0, 10)}</TableCell>
                  <TableCell>{session._count.roster} students</TableCell>
                  <TableCell>{session.createdBy.name}</TableCell>
                  <TableCell>
                    <Badge className="ic-status">Recorded</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-zinc-500">
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
    return (
      <div
        aria-busy="true"
        aria-label="Loading dashboard"
        className="space-y-5"
      >
        <Skeleton className="h-16 rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
      </div>
    );
  if (
    summary.isError ||
    statistics.isError ||
    recent.isError ||
    !summary.data ||
    !statistics.data ||
    !recent.data
  )
    return (
      <Alert variant="destructive" className="ic-panel">
        <AlertTitle>
          <h1>Unable to load dashboard</h1>
        </AlertTitle>
        <AlertDescription>
          Dashboard data could not be retrieved.
        </AlertDescription>
        <Button
          type="button"
          onClick={() => {
            void summary.refetch();
            void statistics.refetch();
            void recent.refetch();
          }}
        >
          Retry
        </Button>
      </Alert>
    );

  const cards = dashboardCards(user.role, summary.data).slice(0, 4);
  const stats = statistics.data;
  const total = stats.present + stats.late + stats.absent;
  const presentEnd = total ? (stats.present / total) * 100 : 0;
  const lateEnd = total ? ((stats.present + stats.late) / total) * 100 : 0;
  const plotted = [...recent.data].reverse().slice(-7);
  const maxRoster = Math.max(1, ...plotted.map((item) => item._count.roster));

  return (
    <div>
      <div className="ic-page-heading">
        <div>
          <div className="ic-eyebrow">
            {new Intl.DateTimeFormat('en', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }).format(new Date())}
          </div>
          <h1>Good to see you, {user.name.split(' ')[0]} 👋</h1>
          <p>Here&apos;s what&apos;s happening across your classes.</p>
        </div>
        <Link href="/attendance" className="ic-link">
          View attendance ↗
        </Link>
      </div>
      <section className="ic-metrics" aria-label="Dashboard summary">
        {cards.map((card, index) => {
          const Icon = icons[index];
          return (
            <Card className="ic-metric-card" key={card.label}>
              <div className="ic-metric-top">
                <span>{card.label}</span>
                <span className="ic-metric-icon">
                  <Icon size={19} aria-hidden="true" />
                </span>
              </div>
              <div className="ic-metric-value">
                {card.value.toLocaleString()}
              </div>
            </Card>
          );
        })}
      </section>
      <div className="ic-dashboard-grid">
        <section className="ic-panel" aria-labelledby="chart-title">
          <div className="ic-panel-head">
            <h2 id="chart-title">Recent session sizes</h2>
            <span className="text-zinc-500">
              Last {plotted.length} sessions
            </span>
          </div>
          {plotted.length ? (
            <>
              <div
                className="ic-chart"
                role="img"
                aria-label={`Student rosters for ${plotted.length} recent attendance session${plotted.length === 1 ? '' : 's'}`}
              >
                {plotted.map((item) => (
                  <div
                    key={item.id}
                    className="ic-chart-bar"
                    title={`${item.section.course.code} section ${item.section.sectionCode}: ${item._count.roster} students`}
                    style={{
                      height: `${Math.max(2, (item._count.roster / maxRoster) * 100)}%`,
                    }}
                  />
                ))}
              </div>
              <div className="ic-chart-labels">
                {plotted.map((item) => (
                  <span key={item.id}>{item.section.sectionCode}</span>
                ))}
              </div>
            </>
          ) : (
            <p className="py-20 text-center text-zinc-500">
              No recent sessions to chart.
            </p>
          )}
        </section>
        <section className="ic-panel" aria-labelledby="breakdown-title">
          <div className="ic-panel-head">
            <h2 id="breakdown-title">Attendance breakdown</h2>
            <span className="text-zinc-500">All recorded sessions</span>
          </div>
          <div
            className="ic-donut"
            style={
              total
                ? ({
                    '--present-end': `${presentEnd}%`,
                    '--late-end': `${lateEnd}%`,
                  } as React.CSSProperties)
                : { background: 'var(--line)' }
            }
          >
            <div className="ic-donut-inner">
              <span>
                <strong>
                  {stats.attendancePercentage === null
                    ? '—'
                    : `${stats.attendancePercentage.toFixed(0)}%`}
                </strong>
                <small className="block">attendance</small>
              </span>
            </div>
          </div>
          <div className="ic-legend">
            <span>
              <i style={{ background: 'var(--primary)' }} />
              Present {stats.present}
            </span>
            <span>
              <i style={{ background: '#55c8a9' }} />
              Late {stats.late}
            </span>
            <span>
              <i style={{ background: '#f6bb62' }} />
              Absent {stats.absent}
            </span>
          </div>
        </section>
      </div>
      <RecentSessions sessions={recent.data} />
      {user.role === 'TEACHER' && (
        <section
          className="ic-panel ic-recent"
          aria-labelledby="assigned-title"
        >
          <div className="ic-panel-head">
            <h2 id="assigned-title">Assigned sections</h2>
            <Link href="/sections" className="ic-link">
              View all →
            </Link>
          </div>
          {assignedSections.isLoading ? (
            <LoadingState label="Loading assigned sections" compact />
          ) : assignedSections.isError ? (
            <div role="alert">
              <p>Unable to load assigned sections.</p>
              <Button
                type="button"
                onClick={() => void assignedSections.refetch()}
              >
                Retry
              </Button>
            </div>
          ) : assignedSections.data?.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {assignedSections.data.map((section) => (
                <Link
                  href={`/sections/${section.id}?tab=attendance`}
                  key={section.id}
                  className="ic-panel"
                >
                  <strong>
                    {section.course.code} · Section {section.sectionCode}
                  </strong>
                  <span className="block text-zinc-500">
                    {section.course.name}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500">No sections are assigned.</p>
          )}
        </section>
      )}
    </div>
  );
}
